require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing env vars");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Testing users fetch...");
  const { data, error } = await supabase
    .from('users')
    .select(`
      *,
      skills(type, skill_name),
      user_languages(language),
      reviews(id, author_name, author_avatar, rating, text, date_display)
    `);

  if (error) {
    console.error("Supabase Error:", error);
  } else {
    console.log("Success! Users count:", data.length);
  }
}

test();
