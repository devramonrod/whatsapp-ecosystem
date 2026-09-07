const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres.ffkmltxjflbcbufbtfpe:rbVQXfWwd5EtcWAO@aws-0-us-west-2.pooler.supabase.com:6543/postgres'
});
async function run() {
  await client.connect();
  const tables = await client.query("SELECT table_schema, table_name FROM information_schema.tables WHERE table_schema = 'public'");
  console.log('Tables:', tables.rows);
  const configs = await client.query('SELECT * FROM tenant_configs');
  console.log('tenant_configs:', configs.rows);
  const msgs = await client.query('SELECT * FROM messagelog ORDER BY timestamp DESC LIMIT 5');
  console.log('messagelog:', msgs.rows);
  await client.end();
}
run().catch(console.error);