CREATE TABLE IF NOT EXISTS public.material_images (
    item_name TEXT PRIMARY KEY,
    image_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.material_images ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public select on material_images" ON public.material_images
    FOR SELECT
    USING (true);

-- Allow public insert/update (since there's no auth system for inserting yet, or restrict as needed)
CREATE POLICY "Allow public insert on material_images" ON public.material_images
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow public update on material_images" ON public.material_images
    FOR UPDATE
    USING (true)
    WITH CHECK (true);
