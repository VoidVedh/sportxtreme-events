-- ============================================================
-- 003_verify_schema.sql
-- SportXtreme Events — Verify/Create Tables & Columns
-- ============================================================

-- Create trigger function if not exists
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ language 'plpgsql';

-- Create gallery table if not exists
CREATE TABLE IF NOT EXISTS public.gallery (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  url text,
  caption text,
  category text DEFAULT 'General',
  event_name text,
  storage_path text,
  created_at timestamptz DEFAULT timezone('utc', now()) NOT NULL,
  updated_at timestamptz DEFAULT timezone('utc', now()) NOT NULL
);

-- Register trigger on gallery if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_gallery_modtime') THEN
    CREATE TRIGGER update_gallery_modtime
      BEFORE UPDATE ON public.gallery
      FOR EACH ROW EXECUTE FUNCTION update_modified_column();
  END IF;
END $$;

-- Create testimonials table if not exists
CREATE TABLE IF NOT EXISTS public.testimonials (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  role text,
  text text NOT NULL,
  stars integer DEFAULT 5 CHECK (stars >= 1 AND stars <= 5),
  created_at timestamptz DEFAULT timezone('utc', now()) NOT NULL,
  updated_at timestamptz DEFAULT timezone('utc', now()) NOT NULL
);

-- Register trigger on testimonials if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_testimonials_modtime') THEN
    CREATE TRIGGER update_testimonials_modtime
      BEFORE UPDATE ON public.testimonials
      FOR EACH ROW EXECUTE FUNCTION update_modified_column();
  END IF;
END $$;

-- Verification Query (Run this to verify success)
-- SELECT 
--   EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'gallery') as gallery_table_ok,
--   EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'testimonials') as testimonials_table_ok,
--   EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'gallery' AND column_name = 'storage_path') as gallery_storage_path_ok;
