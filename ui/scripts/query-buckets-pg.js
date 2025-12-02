const { Client } = require('pg');

async function main() {
  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    console.error('Error: DATABASE_URL environment variable is not set');
    console.error('Please set DATABASE_URL to connect to the production database');
    console.error('Example: export DATABASE_URL="postgres://user:password@host:port/database"');
    process.exit(1);
  }

  console.log('Connecting to database using DATABASE_URL environment variable...');
  console.log('Connection string (masked): ' + process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@'));

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected successfully!\n');

    // Query 5 rows from the Bucket table (note: Prisma uses "Bucket" but PostgreSQL table name might be different)
    const result = await client.query(`
      SELECT
        id,
        title,
        LEFT(description, 100) as description,
        "collectionId" as "roundId",
        "createdAt",
        "publishedAt",
        "fundedAt",
        deleted
      FROM "Bucket"
      LIMIT 5
    `);

    console.log('=== 5 Rows from Bucket Table ===\n');

    if (result.rows.length === 0) {
      console.log('No buckets found in the database.');
    } else {
      result.rows.forEach((bucket, index) => {
        console.log(`--- Bucket ${index + 1} ---`);
        console.log(`ID: ${bucket.id}`);
        console.log(`Title: ${bucket.title}`);
        console.log(`Description: ${bucket.description || 'N/A'}${bucket.description && bucket.description.length >= 100 ? '...' : ''}`);
        console.log(`Round ID: ${bucket.roundId}`);
        console.log(`Created: ${bucket.createdAt}`);
        console.log(`Published: ${bucket.publishedAt || 'Not published'}`);
        console.log(`Funded: ${bucket.fundedAt || 'Not funded'}`);
        console.log(`Deleted: ${bucket.deleted}`);
        console.log('');
      });
    }

    console.log(`Total buckets retrieved: ${result.rows.length}`);

  } catch (error) {
    console.error('Error querying database:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
