const { Client } = require('pg');
async function testConnection(host) {
  const connectionString = 'postgresql://postgres.ffkmltxjflbcbufbtfpe:rbVQXfWwd5EtcWAO@' + host + ':6543/postgres';
  const client = new Client({ connectionString, connectionTimeoutMillis: 3000 });
  try {
    await client.connect();
    console.log('SUCCESS: ' + host);
    await client.end();
    return true;
  } catch (e) {
    if (!e.message.includes('not found')) console.log('FAILED: ' + host + ' - ' + e.message);
    return false;
  }
}
async function run() {
  const hosts = [
    'aws-0-us-east-2.pooler.supabase.com',
    'aws-0-us-west-1.pooler.supabase.com',
    'aws-0-us-west-2.pooler.supabase.com',
    'aws-0-eu-west-1.pooler.supabase.com',
    'aws-0-eu-west-2.pooler.supabase.com',
    'aws-0-eu-west-3.pooler.supabase.com',
    'aws-0-eu-central-1.pooler.supabase.com',
    'aws-0-ap-southeast-1.pooler.supabase.com',
    'aws-0-ap-southeast-2.pooler.supabase.com',
    'aws-0-ap-northeast-1.pooler.supabase.com',
    'aws-0-ap-northeast-2.pooler.supabase.com',
    'aws-0-ap-south-1.pooler.supabase.com',
    'aws-0-ca-central-1.pooler.supabase.com'
  ];
  for (const host of hosts) {
    if (await testConnection(host)) return;
  }
}
run();
