const { Client } = require('pg');
async function run() {
  const connectionString = 'postgresql://postgres.ffkmltxjflbcbufbtfpe:rbVQXfWwd5EtcWAO@aws-0-us-west-2.pooler.supabase.com:6543/postgres';
  const client = new Client({ connectionString });
  await client.connect();
  
  await client.query("ALTER TABLE tenantconfig ALTER COLUMN systemprompt TYPE TEXT");
  await client.query("ALTER TABLE tenantconfig ALTER COLUMN aiapikey TYPE TEXT");

  console.log("Columns altered successfully!");
  await client.end();
}
run();
