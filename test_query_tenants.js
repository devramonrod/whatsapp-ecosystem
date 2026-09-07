const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres.ffkmltxjflbcbufbtfpe:rbVQXfWwd5EtcWAO@aws-0-us-west-2.pooler.supabase.com:6543/postgres'
});
async function run() {
  await client.connect();
  const configs = await client.query('SELECT id, "phoneNumberId", "userId", "businessType" FROM tenantconfig');
  console.log('tenantconfig rows:', configs.rows);
  const msgs = await client.query('SELECT count(*), "instanceName" FROM messagelog GROUP BY "instanceName"');
  console.log('messagelog counts:', msgs.rows);
  const recentMsgs = await client.query('SELECT id, "instanceName", "remoteJid", text, timestamp FROM messagelog ORDER BY timestamp DESC LIMIT 10');
  console.log('recent messagelog:', recentMsgs.rows);
  await client.end();
}
run().catch(console.error);