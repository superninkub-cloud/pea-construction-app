-- Migration: Add material tracking columns to projects table
-- This allows sharing material tracking data (extracted from ZPSR018) across the team

ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS material_tracking_data JSONB DEFAULT '[]'::jsonb;

ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS material_last_pulled_at TEXT;
