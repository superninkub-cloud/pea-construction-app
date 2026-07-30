-- Create the projects table
CREATE TABLE public.projects (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  wbs text UNIQUE NOT NULL,
  name text,
  supervisor text,
  remarks text,
  status text,
  project_type text,
  value numeric DEFAULT 0,
  year_criteria text,
  open_year text,
  p_tracking text,
  check1 boolean DEFAULT false,
  check2 boolean DEFAULT false,
  check3 boolean DEFAULT false,
  check4 boolean DEFAULT false,
  check5 boolean DEFAULT false,
  check6 boolean DEFAULT false,
  check7 boolean DEFAULT false,
  check8 boolean DEFAULT false,
  image_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Setup RLS (Row Level Security)
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read/write for now (can be restricted later if auth is added)
CREATE POLICY "Allow anonymous select" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert" ON public.projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update" ON public.projects FOR UPDATE USING (true);

-- Create a storage bucket for project images
INSERT INTO storage.buckets (id, name, public) VALUES ('project_images', 'project_images', true);

-- Allow anonymous access to the storage bucket
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'project_images');
CREATE POLICY "Public Insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'project_images');
