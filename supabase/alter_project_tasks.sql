-- Add actual date columns to project_tasks table
ALTER TABLE public.project_tasks 
ADD COLUMN IF NOT EXISTS actual_start_date date,
ADD COLUMN IF NOT EXISTS actual_end_date date;
