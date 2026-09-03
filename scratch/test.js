const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role to bypass RLS and see raw DB errors
);

async function test() {
  // Get a user
  const { data: users, error: usersErr } = await supabase.from('users').select('id').limit(2);
  if (usersErr || users.length < 2) {
    console.error("Need at least 2 users", usersErr);
    return;
  }
  
  const sender_id = users[0].id;
  const receiver_id = users[1].id;
  
  const newRequest = {
    sender_id,
    receiver_id,
    offering: 'Test Offering',
    wanting: 'Test Wanting',
    status: 'pending',
    date_display: 'Just now'
  };
  
  console.log("Inserting:", newRequest);
  const { data, error } = await supabase.from('requests').insert([newRequest]).select().single();
  
  if (error) {
    console.error("ERROR:", JSON.stringify(error, null, 2));
  } else {
    console.log("SUCCESS:", data);
  }
}

test();
