#!/bin/bash
#
# Mirror Production Database to Local Development
#
# This script downloads a dump from the production database and restores it
# to your local Docker PostgreSQL instance.
#
# Prerequisites:
#   - Docker must be running with postgres container (docker-compose up)
#   - PROD_DATABASE must be set in .env.local
#
# Usage:
#   cd ui && ./scripts/mirror-prod-db.sh
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
UI_DIR="$(dirname "$SCRIPT_DIR")"

# Local database configuration (from docker-compose.yml)
LOCAL_HOST="localhost"
LOCAL_PORT="35432"
LOCAL_USER="postgres"
LOCAL_PASSWORD="postgres"
LOCAL_DB="borderland_dreams_prod"
LOCAL_CONTAINER="ui-postgres-1"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=============================================="
echo "  Production Database Mirror Script"
echo "=============================================="

# Load environment variables from .env.local
ENV_FILE="$UI_DIR/.env.local"
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}Error: .env.local not found at $ENV_FILE${NC}"
    exit 1
fi

# Extract PROD_DATABASE from .env.local
PROD_DATABASE=$(grep "^PROD_DATABASE=" "$ENV_FILE" | cut -d '=' -f2- | tr -d '"')

if [ -z "$PROD_DATABASE" ]; then
    echo -e "${RED}Error: PROD_DATABASE not found in .env.local${NC}"
    exit 1
fi

# Parse the production database URL for display (hide password)
PROD_HOST=$(echo "$PROD_DATABASE" | sed -n 's/.*@\([^:\/]*\).*/\1/p')
PROD_DB=$(echo "$PROD_DATABASE" | sed -n 's/.*\/\([^?]*\).*/\1/p')

echo ""
echo "Source (Production):"
echo "  Host: $PROD_HOST"
echo "  Database: $PROD_DB"
echo ""
echo "Target (Local Docker):"
echo "  Host: $LOCAL_HOST:$LOCAL_PORT"
echo "  Database: $LOCAL_DB"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Error: Docker is not running.${NC}"
    exit 1
fi

# Find the postgres container name
CONTAINER_NAME=$(docker ps --format '{{.Names}}' | grep -E 'postgres' | head -1)
if [ -z "$CONTAINER_NAME" ]; then
    echo -e "${RED}Error: PostgreSQL Docker container is not running.${NC}"
    echo "Please start it with: cd ui && docker-compose up -d"
    exit 1
fi

echo "Using Docker container: $CONTAINER_NAME"
echo ""

echo -e "${YELLOW}Warning: This will DESTROY all data in the local database!${NC}"
echo ""
read -p "Type 'yes' to continue: " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "Aborted."
    exit 1
fi

echo ""
echo "[1/4] Dumping production database (using postgres:17 Docker image)..."
echo "      This may take a few minutes..."

# Use Docker with postgres:17 image to run pg_dump (avoids version mismatch)
DUMP_FILE="/tmp/prod_dump.sql"
if docker run --rm \
    postgres:17 \
    pg_dump "$PROD_DATABASE" \
    --no-owner \
    --no-acl \
    > "$DUMP_FILE" 2>&1; then
    DUMP_SIZE=$(du -h "$DUMP_FILE" | cut -f1)
    echo -e "      ${GREEN}Done!${NC} Dump size: $DUMP_SIZE"
else
    echo -e "${RED}Error: Failed to dump production database${NC}"
    cat "$DUMP_FILE"
    rm -f "$DUMP_FILE"
    exit 1
fi

echo ""
echo "[2/4] Terminating existing connections to local database..."

docker exec "$CONTAINER_NAME" psql -U $LOCAL_USER -d postgres -c "
SELECT pg_terminate_backend(pg_stat_activity.pid)
FROM pg_stat_activity
WHERE pg_stat_activity.datname = '$LOCAL_DB'
AND pid <> pg_backend_pid();
" > /dev/null 2>&1 || true

echo ""
echo "[3/4] Dropping and recreating local database..."

docker exec "$CONTAINER_NAME" psql -U $LOCAL_USER -d postgres -c "DROP DATABASE IF EXISTS $LOCAL_DB;"
docker exec "$CONTAINER_NAME" psql -U $LOCAL_USER -d postgres -c "CREATE DATABASE $LOCAL_DB;"

echo -e "      ${GREEN}Done!${NC}"

echo ""
echo "[4/4] Restoring dump to local database..."

# Copy dump file into container and restore
docker cp "$DUMP_FILE" "$CONTAINER_NAME:/tmp/prod_dump.sql"
if docker exec "$CONTAINER_NAME" psql -U $LOCAL_USER -d $LOCAL_DB -f /tmp/prod_dump.sql > /dev/null 2>&1; then
    echo -e "      ${GREEN}Done!${NC}"
else
    echo -e "${YELLOW}Warning: Some errors occurred during restore (this is often normal)${NC}"
fi

# Cleanup
docker exec "$CONTAINER_NAME" rm -f /tmp/prod_dump.sql
rm -f "$DUMP_FILE"

echo ""
echo "=============================================="
echo -e "  ${GREEN}Database mirror complete!${NC}"
echo "=============================================="
echo ""
echo "Local database connection string:"
echo "  postgresql://$LOCAL_USER:$LOCAL_PASSWORD@$LOCAL_HOST:$LOCAL_PORT/$LOCAL_DB"
echo ""
echo "You may need to run Prisma migrations:"
echo "  cd ui && npx prisma migrate dev"
echo ""
