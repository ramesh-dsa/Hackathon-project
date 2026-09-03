const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  const { data, error } = await supabase.rpc('get_policies', {});
  if (error) {
    console.error("RPC Error:", error.message);
    // Let's just query pg_policies
    const { data: policies, error: polErr } = await supabase.from('pg_policies').select('*').eq('schemaname', 'public');
    if (polErr) {
      console.error("Pg_policies Error:", polErr.message);
    } else {
      console.log("Policies:", policies);
    }
  }
}
check();
