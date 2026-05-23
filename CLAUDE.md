# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands below assume the working directory is the repo root unless noted.

### Setup (one-time)
```bash
cd ui && yarn               # install dependencies
cp ui/.env.local.default ui/.env.local  # configure env
```

### Running locally
```bash
# In ui/ — start the PostgreSQL database
docker-compose up

# In ui/ — run migrations after first db start or after pulling new ones
yarn migrate

# In ui/ — start the dev server (runs on http://localhost:3000)
yarn dev
```

### Linting & type checking
```bash
yarn lint        # prettier check + eslint + typecheck (from root)
yarn fix         # auto-fix prettier + eslint + typecheck (from root)
cd ui && yarn typecheck   # TypeScript only
```

### Database migrations
```bash
cd ui && yarn migrate      # prisma migrate dev (creates + applies migration)
cd ui && yarn generate     # regenerate Prisma client after schema changes
```

### E2E tests (Cypress)
```bash
# Terminal 1 — start the app with test env
cd ui && yarn test:run

# Terminal 2 — run or open tests (from root)
yarn test:run    # headless
yarn test:open   # interactive
```

### i18n
```bash
cd ui && yarn extract              # extract messages → lang/en.json
cd ui && yarn crowdin:upload       # push en.json to Crowdin
cd ui && yarn crowdin:download     # pull translations from Crowdin
```

## Architecture

This is a **Next.js 12** monorepo. All application code lives in `ui/`. The root directory contains ESLint config, Cypress e2e tests, and build scripts.

### Domain model

The app is a collaborative budgeting platform with three nesting levels:

```
Group (org)  →  Round (funding campaign)  →  Bucket (individual funding proposal)
```

> **Note**: The Prisma schema uses legacy table names via `@@map`: `Group` → `Organization`, `Round` → `Collection`, `GroupMember` → `OrgMember`, `RoundMember` → `CollectionMember`. Many variables in older code still say `coll` or `org`.

Financial flow: admins create `Allocation` records to give members tokens → members convert tokens into `Contribution` records on buckets → `Transaction`/`Account` records track the ledger.

### Request lifecycle

1. Browser sends GraphQL requests via **urql** (`next-urql`) to `/api`.
2. `ui/pages/api/index.ts` wires up **Apollo Server** (`apollo-server-micro`) behind a `next-connect` handler chain: `cookieSession → passport → Apollo`.
3. The `GraphQLContext` passed to every resolver contains `{ user, prisma, eventHub, request, response }`.
4. Resolvers are organized under `ui/server/graphql/resolvers/` into `queries/`, `mutations/`, and `types/` subdirectories (one file per domain: `bucket.ts`, `round.ts`, `group.ts`, `user.ts`).
5. The GraphQL SDL lives in `ui/server/graphql/schema/index.js`.

### Event-driven side effects

Mutations publish events to `EventHub` (a static pub/sub class in `ui/server/services/eventHub.service.js`). Subscribers in `ui/server/subscribers/` react to those events:

- `email.subscriber.ts` — transactional emails via Postmark/Nodemailer
- `discourse.subscriber.ts` — Discourse forum integration
- `loomio.subscriber.js` — Loomio integration
- `prisma.subscriber.js` — cascading DB writes

### Authentication

Handled by **Passport.js** (`ui/server/passport/`):
- `magicLink.ts` — passwordless email login (primary method, login link printed to terminal in dev)
- `googleStrategy.ts` / `facebookStrategy.ts` — OAuth (optional, requires env vars)

Auth routes live in `ui/pages/api/auth/`. Sessions are cookie-based (`cookie-session`).

### Frontend data fetching

- **urql** is the primary GraphQL client for React components (`withUrqlClient` HOC in `_app.tsx`)
- `@apollo/client` is used in a few places alongside urql (legacy)
- Client-side mutations are colocated: shared ones in `graphql/client.ts`, component-local ones inline

### Key env variables (see `ui/.env.local.default`)
| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `COOKIE_SECRET` | Session signing key |
| `MAGIC_LINK_SECRET` | Token signing for passwordless auth |
| `POSTMARK_API_TOKEN` | Email sending |
| `STRIPE_API_KEY` | Stripe payments (optional) |
| `STRIPE_WEBHOOK_SECRET` | Required for local Stripe webhook forwarding |

For local Stripe webhook testing: run `./scripts/forward-stripe-webhooks.sh` (requires Stripe CLI) and set `STRIPE_WEBHOOK_SECRET` to the `whsec_...` value it prints.

### Branches & deployment
- `main` → auto-deploys to staging.cobudget.com
- `production` → auto-deploys to cobudget.com
- Feature branches merge into `main`; hotfixes go `feature → production → main`
