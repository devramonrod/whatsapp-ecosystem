const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("Missing URL or Key in .env");
  process.exit(1);
}

const supabase = createClient(url, key);

async function signUpUser() {
  const { data, error } = await supabase.auth.signUp({
    email: 'ramonrodsouza@gmail.com',
    password: '123ramon',
  });

  if (error) {
    console.error("Error creating user:", error.message);
  } else {
    console.log("User created successfully!");
    console.log(data);
  }
}

signUpUser();
