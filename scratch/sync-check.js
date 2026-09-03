const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSync() {
  // 1. Fetch auth.users
  const { data: { users: authUsers }, error: authErr } = await supabase.auth.admin.listUsers();
  if (authErr) {
    console.error("Auth error:", authErr);
    return;
  }
  
  // 2. Fetch public.users
  const { data: publicUsers, error: pubErr } = await supabase.from('users').select('*');
  if (pubErr) {
    console.error("Public error:", pubErr);
    return;
  }
  
  console.log(`Auth users count: ${authUsers.length}`);
  console.log(`Public users count: ${publicUsers.length}`);
  
  const authIds = authUsers.map(u => u.id);
  const pubIds = publicUsers.map(u => u.id);
  
  const missingInPublic = authUsers.filter(u => !pubIds.includes(u.id));
  if (missingInPublic.length > 0) {
    console.log("Users missing in public.users:");
    console.log(missingInPublic.map(u => u.email));
  } else {
    console.log("All auth users exist in public.users!");
  }
}

checkSync();
