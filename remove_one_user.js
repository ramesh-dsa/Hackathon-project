require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const usersToDelete = [
  'rameshsenthil2007'
];

async function run() {
  const { data: users, error } = await supabase.from('users').select('*');
  if (error) {
    console.error('Error fetching users:', error);
    return;
  }
  
  const fakeUsers = users.filter(u => usersToDelete.includes(u.name));

  console.log(`Found ${fakeUsers.length} users out of ${users.length} total users.`);
  
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
