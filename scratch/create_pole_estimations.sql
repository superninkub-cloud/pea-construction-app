CREATE TABLE IF NOT EXISTS public.pole_estimations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  pole_name text NOT NULL,
  assembly_type text NOT NULL,
  items jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.pole_estimations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous select pole_estimations" ON public.pole_estimations FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert pole_estimations" ON public.pole_estimations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update pole_estimations" ON public.pole_estimations FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete pole_estimations" ON public.pole_estimations FOR DELETE USING (true);
