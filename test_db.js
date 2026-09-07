const { Client } = require('pg');

async function run() {
  const connectionString = 'postgresql://postgres.ffkmltxjflbcbufbtfpe:rbVQXfWwd5EtcWAO@aws-0-us-west-2.pooler.supabase.com:6543/postgres';
  const client = new Client({ connectionString });
  await client.connect();
  
  const tables = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'");
  console.log("TABLES:");
  console.table(tables.rows);

  const cols = await client.query("SELECT column_name, table_name FROM information_schema.columns WHERE table_schema='public' AND table_name LIKE '%user%'");
  console.log("\nCOLUMNS:");
  console.table(cols.rows);

  await client.end();
}

run().catch(console.error);
