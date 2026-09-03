require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const { data: users, error } = await supabase.from('users').select('*');
  if (error) {
    console.error('Error fetching users:', error);
    return;
  }
  
  const fakeUsers = users.filter(u => 
    u.name.startsWith('test') || 
    u.name.endsWith('.cse') || 
    ['Doe', 'g'].includes(u.name)
  );

  console.log(`Found ${fakeUsers.length} fake users out of ${users.length} total users.`);
  
  for (const user of fakeUsers) {
    console.log(`Deleting user: ${user.name} (${user.id})`);
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
    if (deleteError) {
      console.error(`Failed to delete ${user.name}:`, deleteError);
    } else {
      console.log(`Successfully deleted ${user.name}`);
    }
  }
}

run();
