-- Fix schema issues for photo upload functionality

-- Create surf_schools table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.surf_schools (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add school_id to galleries table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'galleries' 
                   AND column_name = 'school_id') THEN
        ALTER TABLE public.galleries 
        ADD COLUMN school_id INTEGER REFERENCES public.surf_schools(id);
    END IF;
END $$;

-- Insert a default surf school if none exists
INSERT INTO public.surf_schools (name, slug)
SELECT 'La Torche Surf School', 'la-torche-surf-school'
WHERE NOT EXISTS (SELECT 1 FROM public.surf_schools);

-- Enable RLS on surf_schools (if not already enabled)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'surf_schools' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE public.surf_schools ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access to surf schools" ON public.surf_schools;
DROP POLICY IF EXISTS "Allow authenticated users to manage surf schools" ON public.surf_schools;

-- Add RLS policies for surf_schools
CREATE POLICY "Allow public read access to surf schools" ON public.surf_schools
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to manage surf schools" ON public.surf_schools
    FOR ALL USING (auth.uid() IS NOT NULL);