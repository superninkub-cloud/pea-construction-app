ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS contractor text,
ADD COLUMN IF NOT EXISTS committee text,
ADD COLUMN IF NOT EXISTS duration text;
