const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres.ffkmltxjflbcbufbtfpe:rbVQXfWwd5EtcWAO@aws-0-us-west-2.pooler.supabase.com:6543/postgres'
});
async function run() {
  await client.connect();
  const configs = await client.query('SELECT id, phonenumberid, userid, businesstype FROM tenantconfig');
  console.log('tenantconfig rows:', configs.rows);
  const msgs = await client.query('SELECT count(*), instancename FROM messagelog GROUP BY instancename');
  console.log('messagelog counts:', msgs.rows);
  const recentMsgs = await client.query('SELECT id, instancename, remotejid, text, timestamp FROM messagelog ORDER BY timestamp DESC LIMIT 5');
  console.log('recent messagelog:', recentMsgs.rows);
  await client.end();
}
run().catch(console.error);