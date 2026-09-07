const { Client } = require('pg');
async function run() {
  const connectionString = 'postgresql://postgres.ffkmltxjflbcbufbtfpe:rbVQXfWwd5EtcWAO@aws-0-us-west-2.pooler.supabase.com:6543/postgres';
  const client = new Client({ connectionString });
  await client.connect();
  
  const res = await client.query("UPDATE tenantconfig SET userid = '83eec852-a665-45cf-bafd-c022526257b8' WHERE phonenumberid = 'ELOISA'");
  console.log("Updated rows: " + res.rowCount);

  await client.end();
}
run();
