-- Add step_order and weight columns to project_tasks table
ALTER TABLE public.project_tasks 
ADD COLUMN IF NOT EXISTS step_order integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS weight numeric DEFAULT 0;
