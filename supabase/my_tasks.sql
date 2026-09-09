-- Create the my_tasks table
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
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Setup RLS (Row Level Security)
ALTER TABLE public.my_tasks ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read/write for now
CREATE POLICY "Allow anonymous select my_tasks" ON public.my_tasks FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert my_tasks" ON public.my_tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update my_tasks" ON public.my_tasks FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete my_tasks" ON public.my_tasks FOR DELETE USING (true);
