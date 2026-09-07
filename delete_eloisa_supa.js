const { Client } = require('pg');
async function run() {
  const connectionString = 'postgresql://postgres.ffkmltxjflbcbufbtfpe:rbVQXfWwd5EtcWAO@aws-0-us-west-2.pooler.supabase.com:6543/postgres';
  const client = new Client({ connectionString });
  await client.connect();
  
  const res = await client.query("DELETE FROM tenantconfig WHERE phonenumberid = 'ELOISA'");
  console.log("Deleted from Supabase: " + res.rowCount);

  await client.end();
}
run();
