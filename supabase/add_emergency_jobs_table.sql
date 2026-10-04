-- Migration: Create emergency_jobs table for Emergency Planning Module
-- This table stores data about vehicle hitting poles and emergency works

CREATE TABLE IF NOT EXISTS public.emergency_jobs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    damage_details TEXT,
    pole_details TEXT,
    team_required INTEGER DEFAULT 1,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Note: In a real Supabase environment you may want to set up RLS policies.
