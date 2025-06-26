-- Créer les buckets de stockage Supabase
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('originals', 'originals', false, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]),
  ('web-previews', 'web-previews', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']::text[])
ON CONFLICT (id) DO NOTHING;

-- Supprimer les anciennes politiques si elles existent (ignore les erreurs)
DROP POLICY IF EXISTS "Admin can upload to originals" ON storage.objects;
DROP POLICY IF EXISTS "Admin can read from originals" ON storage.objects;
DROP POLICY IF EXISTS "Admin can upload to web-previews" ON storage.objects;
DROP POLICY IF EXISTS "Public can read web-previews" ON storage.objects;

-- Politiques pour le bucket originals (privé)
CREATE POLICY "Admin can upload to originals" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'originals' AND auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin can read from originals" ON storage.objects
  FOR SELECT USING (bucket_id = 'originals' AND auth.jwt() ->> 'role' = 'admin');

-- Politiques pour le bucket web-previews (public en lecture)
CREATE POLICY "Admin can upload to web-previews" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'web-previews' AND auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Public can read web-previews" ON storage.objects
  FOR SELECT USING (bucket_id = 'web-previews');
