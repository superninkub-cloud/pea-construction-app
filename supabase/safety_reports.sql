-- Create the safety_reports table
CREATE TABLE public.safety_reports (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  report_date date NOT NULL,
  date_str text NOT NULL,
  project_name text,
  location text,
  supervisor text,
  report_text text NOT NULL,
  image_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.safety_reports ENABLE ROW LEVEL SECURITY;

-- Allow anonymous access
CREATE POLICY "Allow anonymous select safety_reports" ON public.safety_reports FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert safety_reports" ON public.safety_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update safety_reports" ON public.safety_reports FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete safety_reports" ON public.safety_reports FOR DELETE USING (true);
