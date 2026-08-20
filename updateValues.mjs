import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const wbs = 'I-67-I-KCI68.HB.1118';
  console.log('Updating project:', wbs);
  
  const { data, error } = await supabase
    .from('projects')
    .update({ 
      est_site_expense: 701873,
      allocated_site_budget: 0,
      disbursed_site_expense: 1279841.44
    })
    .eq('wbs', wbs);
    
  if (error) {
    console.error('Error updating project:', error);
  } else {
    console.log('Successfully updated values for:', wbs);
  }
}

run();
