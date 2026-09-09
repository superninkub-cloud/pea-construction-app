const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function setup() {
  console.log('Creating my_tasks table...');
  
  // Create table using SQL via a REST call or we can just use the provided sql script
  const { error: sqlError } = await supabase.rpc('exec_sql', {
    query: `
      CREATE TABLE IF NOT EXISTS public.my_tasks (
        id text PRIMARY KEY,
        title text NOT NULL,
        location text,
        time text,
        status text,
        priority text,
        is_tracked boolean DEFAULT false,
        type text,
        assignee_name text,
        note text,
        created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
      );
      
      ALTER TABLE public.my_tasks ENABLE ROW LEVEL SECURITY;
      
      DO $$ BEGIN
        CREATE POLICY "Allow anonymous select my_tasks" ON public.my_tasks FOR SELECT USING (true);
      EXCEPTION WHEN duplicate_object THEN null; END $$;
      
      DO $$ BEGIN
        CREATE POLICY "Allow anonymous insert my_tasks" ON public.my_tasks FOR INSERT WITH CHECK (true);
      EXCEPTION WHEN duplicate_object THEN null; END $$;
      
      DO $$ BEGIN
        CREATE POLICY "Allow anonymous update my_tasks" ON public.my_tasks FOR UPDATE USING (true);
      EXCEPTION WHEN duplicate_object THEN null; END $$;
      
      DO $$ BEGIN
        CREATE POLICY "Allow anonymous delete my_tasks" ON public.my_tasks FOR DELETE USING (true);
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `
  });

  if (sqlError && sqlError.message && !sqlError.message.includes('Could not find the function')) {
    console.error('SQL execution error (safe to ignore if using local pg tool):', sqlError);
  }

  console.log('Inserting initial tasks from Image 2...');
  
  const initialTasks = [
    {
      id: 'T-IMG2-001',
      title: 'ทำเอกสารจ้างโมโนโพล ประกาศจัดจ้าง',
      location: 'วันที่มอบหมาย 7 ก.ย. 69',
      time: '11 ก.ย. 69',
      status: 'in_progress',
      priority: 'normal',
      is_tracked: true,
      type: 'other',
      assignee_name: 'กิตติพิชญ์ ประกอบทรัพย์ พชง.5'
    },
    {
      id: 'T-IMG2-002',
      title: 'จัดซื้อกรวยยาง กระบองไฟ เสื้อสะท้อนแสง ใบสั่งซื้อ',
      location: 'วันที่มอบหมาย 7 ก.ย. 69',
      time: '11 ก.ย. 69',
      status: 'in_progress',
      priority: 'normal',
      is_tracked: true,
      type: 'other',
      assignee_name: 'กิตติพิชญ์ พุ่มกำพล พนง.Office'
    },
    {
      id: 'T-IMG2-003',
      title: 'จัดทำเอกสารปิดงานลาดหญ้า 2 งาน',
      location: 'วันที่มอบหมาย 8 ก.ย. 69',
      time: '11 ก.ย. 69',
      status: 'in_progress',
      priority: 'normal',
      is_tracked: true,
      type: 'other',
      assignee_name: 'สิริวัชญ์ ภิรมย์มาก พนง.Office'
    }
  ];

  // Try to insert
  for (const task of initialTasks) {
    const { error } = await supabase.from('my_tasks').upsert(task, { onConflict: 'id' });
    if (error) {
      console.error('Failed to insert task:', task.title, error.message);
    } else {
      console.log('Inserted:', task.title);
    }
  }
  
  console.log('Done setup!');
}

setup();
