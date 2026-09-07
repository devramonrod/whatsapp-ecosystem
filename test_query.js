const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres.ffkmltxjflbcbufbtfpe:rbVQXfWwd5EtcWAO@aws-0-us-west-2.pooler.supabase.com:6543/postgres'
});
async function run() {
  await client.connect();
  const tenants = await client.query('SELECT id, "phoneNumberId", "userId", "businessType" FROM "TenantConfig"');
  console.log('Tenants:', tenants.rows);
  const msgs = await client.query('SELECT count(*), "instanceName" FROM "MessageLog" GROUP BY "instanceName"');
  console.log('Message counts:', msgs.rows);
  const recent = await client.query('SELECT id, "instanceName", "remoteJid", text, timestamp FROM "MessageLog" ORDER BY timestamp DESC LIMIT 5');
  console.log('Recent messages:', recent.rows);
  await client.end();
}
run().catch(console.error);