import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
  console.log("Testing insert...");
  const { data, error } = await supabase.from('skills').insert([{ user_id: 'u1', type: 'offer', skill_name: 'TestSkill123' }]).select();
  if (error) {
    console.error("Insert error:", error);
  } else {
    console.log("Insert success:", data);
    
    // Clean up
    await supabase.from('skills').delete().match({ user_id: 'u1', type: 'offer', skill_name: 'TestSkill123' });
  }
}

testInsert();
