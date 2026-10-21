-- Migration: Create emergency_jobs table for Emergency Planning Module
-- This table stores data about vehicle hitting poles and emergency works

DROP TABLE IF EXISTS public.emergency_jobs;

CREATE TABLE public.emergency_jobs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    points JSONB DEFAULT '[]'::jsonb, -- Array of points { id, lat, lng, image_data, damage_details, pole_details, team_required }
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fix Row-Level Security (RLS) issue
-- Disable RLS for this table so that anyone can read/write data 
-- (since this is an internal tool and we don't have authentication setup right now)
ALTER TABLE public.emergency_jobs DISABLE ROW LEVEL SECURITY;

-- If you prefer to keep RLS enabled, you can run this instead:
-- ALTER TABLE public.emergency_jobs ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow public all operations" ON public.emergency_jobs FOR ALL USING (true) WITH CHECK (true);
