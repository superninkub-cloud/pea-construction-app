-- Create the project_tasks table
CREATE TABLE public.project_tasks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_wbs text REFERENCES public.projects(wbs) ON DELETE CASCADE,
  task_name text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  progress numeric DEFAULT 0,
  assignee text,
  dependencies text[] DEFAULT '{}',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Setup RLS (Row Level Security)
ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read/write for now (can be restricted later if auth is added)
CREATE POLICY "Allow anonymous select project_tasks" ON public.project_tasks FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert project_tasks" ON public.project_tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update project_tasks" ON public.project_tasks FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete project_tasks" ON public.project_tasks FOR DELETE USING (true);
