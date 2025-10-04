-- Add Siargao as a new surf school location

-- First, ensure La Torche has the correct name and slug
UPDATE public.surf_schools 
SET name = 'La Torche', slug = 'la-torche' 
WHERE slug = 'la-torche-surf-school';

-- Insert Siargao if it doesn't exist
INSERT INTO public.surf_schools (name, slug)
SELECT 'Siargao', 'siargao'
WHERE NOT EXISTS (SELECT 1 FROM public.surf_schools WHERE slug = 'siargao');