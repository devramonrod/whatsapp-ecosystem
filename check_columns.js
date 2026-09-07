const { Client } = require('pg');
async function run() {
  const connectionString = 'postgresql://postgres.ffkmltxjflbcbufbtfpe:rbVQXfWwd5EtcWAO@aws-0-us-west-2.pooler.supabase.com:6543/postgres';
  const client = new Client({ connectionString });
  await client.connect();
  
  const res = await client.query("SELECT column_name, data_type, character_maximum_length FROM information_schema.columns WHERE table_name = 'tenantconfig'");
  console.table(res.rows);

  await client.end();
}
run();
