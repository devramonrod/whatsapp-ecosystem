const { Client } = require('pg');
async function run() {
  const connectionString = 'postgresql://postgres.ffkmltxjflbcbufbtfpe:rbVQXfWwd5EtcWAO@aws-0-us-west-2.pooler.supabase.com:5432/postgres';
  const client = new Client({ connectionString });
  try {
    await client.connect();
    const res = await client.query('SELECT 1 as test');
    console.log(res.rows);
    await client.end();
  } catch(e) {
    console.error(e);
  }
}
run();
