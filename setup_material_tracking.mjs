import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function setup() {
  console.log('Creating material_tracking table...');
  
  const { error: sqlError } = await supabase.rpc('exec_sql', {
    query: `
      CREATE TABLE IF NOT EXISTS public.material_tracking (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        wbs text,
        technician_name text,
        material_code text,
        material_name text,
        quantity numeric,
        unit text,
        part text,
        status text,
        note text,
        zpsr018_source text,
        created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
      );
      
      ALTER TABLE public.material_tracking ENABLE ROW LEVEL SECURITY;
      
      DO $$ BEGIN
        CREATE POLICY "Allow anonymous select material_tracking" ON public.material_tracking FOR SELECT USING (true);
      EXCEPTION WHEN duplicate_object THEN null; END $$;
      
      DO $$ BEGIN
        CREATE POLICY "Allow anonymous insert material_tracking" ON public.material_tracking FOR INSERT WITH CHECK (true);
      EXCEPTION WHEN duplicate_object THEN null; END $$;
      
      DO $$ BEGIN
        CREATE POLICY "Allow anonymous update material_tracking" ON public.material_tracking FOR UPDATE USING (true);
      EXCEPTION WHEN duplicate_object THEN null; END $$;
      
      DO $$ BEGIN
        CREATE POLICY "Allow anonymous delete material_tracking" ON public.material_tracking FOR DELETE USING (true);
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `
  });

  if (sqlError) {
    console.error('SQL execution error:', sqlError);
  } else {
    console.log('Successfully created material_tracking table and policies.');
  }
}

setup();
