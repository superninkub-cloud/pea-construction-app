-- Migration: Create emergency_jobs table for Emergency Planning Module
-- This table stores data about vehicle hitting poles and emergency works

DROP TABLE IF EXISTS public.emergency_jobs;

CREATE TABLE public.emergency_jobs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    points JSONB DEFAULT '[]'::jsonb, -- Array of points { id, lat, lng, image_data, damage_details, pole_details, team_required }
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Note: In a real Supabase environment you may want to set up RLS policies.
