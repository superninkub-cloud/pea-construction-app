import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fix() {
  console.log("Fetching projects with 'ปิดงาน (TECO)' status...");
  const { data: projects, error } = await supabase.from('projects').select('*').eq('status', 'ปิดงาน (TECO)');
  
  if (error) {
    console.error(error);
    return;
  }
  
  if (!projects || projects.length === 0) {
    console.log("No projects found with status 'ปิดงาน (TECO)'.");
  } else {
    console.log(`Found ${projects.length} projects. Fixing them...`);
    const today = new Date().toISOString().split('T')[0];
    
    for (const p of projects) {
      console.log(`Updating project: ${p.wbs}`);
      await supabase.from('projects').update({ status: 'ก่อสร้างแล้วเสร็จ' }).eq('id', p.id);
      
      const { data: tasks } = await supabase.from('project_tasks').select('id').eq('project_wbs', p.wbs);
      if (tasks && tasks.length > 0) {
        for (const t of tasks) {
          await supabase.from('project_tasks').update({
            start_date: today,
            end_date: today,
            progress: 100,
            target_qty: 1,
            done_qty: 1,
            actual_start_date: today,
            actual_end_date: today
          }).eq('id', t.id);
        }
      }
    }
    console.log("Done fixing legacy projects.");
  }
}

fix();
