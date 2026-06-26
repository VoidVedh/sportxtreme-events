-- ============================================================
-- 005_storage.sql
-- SportXtreme Events — Configure Storage Bucket & Policies (Corrected)
-- ============================================================

-- Ensure the gallery bucket exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('gallery', 'gallery', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO UPDATE SET 
  public = EXCLUDED.public, 
  file_size_limit = EXCLUDED.file_size_limit, 
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Explicitly drop all previous storage policies to prevent conflicts
DROP POLICY IF EXISTS "public_read_gallery_storage" ON storage.objects;
DROP POLICY IF EXISTS "admin_insert_gallery_storage" ON storage.objects;
DROP POLICY IF EXISTS "admin_delete_gallery_storage" ON storage.objects;

-- Create Storage policies
CREATE POLICY "public_read_gallery_storage"
ON storage.objects
AS PERMISSIVE
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'gallery');

CREATE POLICY "admin_insert_gallery_storage"
ON storage.objects
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'gallery' AND auth.jwt() ->> 'email' = 'sportxtremeevents@gmail.com');

CREATE POLICY "admin_delete_gallery_storage"
ON storage.objects
AS PERMISSIVE
FOR DELETE
TO authenticated
USING (bucket_id = 'gallery' AND auth.jwt() ->> 'email' = 'sportxtremeevents@gmail.com');
