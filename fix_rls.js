const { Client } = require('pg');
async function run() {
  const connectionString = 'postgresql://postgres.ffkmltxjflbcbufbtfpe:rbVQXfWwd5EtcWAO@aws-0-us-west-2.pooler.supabase.com:6543/postgres';
  const client = new Client({ connectionString });
  await client.connect();
  
  await client.query(`
    CREATE POLICY "Allow read access" ON public.userprofile FOR SELECT TO authenticated USING (true);
    CREATE POLICY "Allow read access anon" ON public.userprofile FOR SELECT TO anon USING (true);
  `);
  
  console.log("Policies created!");
  await client.end();
}
run();
