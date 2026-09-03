const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

// We will use raw fetch to postgrest to bypass supabase-js which might hide things
async function test() {
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/users?select=id&limit=1`;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  console.log("Testing with ANON key...");
  let res = await fetch(url, { headers: { 'apikey': anonKey, 'Authorization': `Bearer ${anonKey}` } });
  console.log("Anon status:", res.status, await res.text());
  
  console.log("Testing with SERVICE key...");
  res = await fetch(url, { headers: { 'apikey': serviceKey, 'Authorization': `Bearer ${serviceKey}` } });
  console.log("Service status:", res.status, await res.text());
}

test();
