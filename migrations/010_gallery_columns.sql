-- ============================================================
-- 010_gallery_columns.sql
-- Add missing columns to gallery table for storage/category support
-- Run in: Supabase SQL Editor
-- ============================================================

-- Add category column if it doesn't exist
ALTER TABLE public.gallery
  ADD COLUMN IF NOT EXISTS category text DEFAULT 'General';

-- Add event_name column if it doesn't exist
ALTER TABLE public.gallery
  ADD COLUMN IF NOT EXISTS event_name text;

-- Add storage_path column if it doesn't exist (needed for file deletion)
ALTER TABLE public.gallery
  ADD COLUMN IF NOT EXISTS storage_path text;

-- Ensure storage DELETE policy exists for authenticated admin
DROP POLICY IF EXISTS "Admin can delete gallery storage" ON storage.objects;

-- Storage bucket policies (run these if not already present)
-- Allow public to read gallery bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery', 'gallery', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Allow authenticated admin to upload
DROP POLICY IF EXISTS "Admin gallery upload" ON storage.objects;
CREATE POLICY "Admin gallery upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'gallery'
    AND auth.jwt() ->> 'email' = 'sportxtremeevents@gmail.com'
  );

-- Allow authenticated admin to delete
DROP POLICY IF EXISTS "Admin gallery delete" ON storage.objects;
CREATE POLICY "Admin gallery delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'gallery'
    AND auth.jwt() ->> 'email' = 'sportxtremeevents@gmail.com'
  );

-- Allow public to read gallery files
DROP POLICY IF EXISTS "Public gallery read" ON storage.objects;
CREATE POLICY "Public gallery read" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'gallery');
