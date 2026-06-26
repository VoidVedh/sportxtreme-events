-- ============================================================
-- RUN ALL IN SUPABASE SQL EDITOR (in order, one paste)
-- Project: bwgmsjyouvnswftmrnkm
-- Dashboard: https://supabase.com/dashboard/project/bwgmsjyouvnswftmrnkm/sql/new
-- ============================================================
-- Step 1: 003_verify_schema.sql
-- Step 2: 004_fix_rls.sql
-- Step 3: 005_storage.sql
-- Step 4: 006_seed_demo.sql (optional demo data)
-- ============================================================

-- ========== 003_verify_schema.sql ==========

CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ language 'plpgsql';

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

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_gallery_modtime') THEN
    CREATE TRIGGER update_gallery_modtime
      BEFORE UPDATE ON public.gallery
      FOR EACH ROW EXECUTE FUNCTION update_modified_column();
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.testimonials (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  role text,
  text text NOT NULL,
  stars integer DEFAULT 5 CHECK (stars >= 1 AND stars <= 5),
  created_at timestamptz DEFAULT timezone('utc', now()) NOT NULL,
  updated_at timestamptz DEFAULT timezone('utc', now()) NOT NULL
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_testimonials_modtime') THEN
    CREATE TRIGGER update_testimonials_modtime
      BEFORE UPDATE ON public.testimonials
      FOR EACH ROW EXECUTE FUNCTION update_modified_column();
  END IF;
END $$;

-- ========== 004_fix_rls.sql ==========

ALTER TABLE public.contacts     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

DO $$ DECLARE r record;
BEGIN
  FOR r IN
    SELECT policyname, tablename FROM pg_policies
    WHERE tablename IN ('contacts','proposals','events','gallery','testimonials')
      AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
  END LOOP;
END $$;

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

CREATE POLICY "public_insert_contacts" ON public.contacts
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "admin_all_contacts" ON public.contacts
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'email' = 'sportxtremeevents@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'sportxtremeevents@gmail.com');

CREATE POLICY "public_insert_proposals" ON public.proposals
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "admin_all_proposals" ON public.proposals
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'email' = 'sportxtremeevents@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'sportxtremeevents@gmail.com');

CREATE POLICY "public_select_events" ON public.events
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "admin_all_events" ON public.events
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'email' = 'sportxtremeevents@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'sportxtremeevents@gmail.com');

CREATE POLICY "public_select_gallery" ON public.gallery
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "admin_all_gallery" ON public.gallery
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'email' = 'sportxtremeevents@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'sportxtremeevents@gmail.com');

CREATE POLICY "public_select_testimonials" ON public.testimonials
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "admin_all_testimonials" ON public.testimonials
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'email' = 'sportxtremeevents@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'sportxtremeevents@gmail.com');

-- ========== 005_storage.sql ==========

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('gallery', 'gallery', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DO $$ DECLARE r record;
BEGIN
  FOR r IN
    SELECT policyname FROM pg_policies
    WHERE tablename = 'objects'
      AND schemaname = 'storage'
      AND policyname IN ('public_read_gallery_storage', 'admin_insert_gallery_storage', 'admin_delete_gallery_storage')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', r.policyname);
  END LOOP;
END $$;

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_gallery_storage" ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'gallery');

CREATE POLICY "admin_insert_gallery_storage" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'gallery' AND auth.jwt() ->> 'email' = 'sportxtremeevents@gmail.com');

CREATE POLICY "admin_delete_gallery_storage" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'gallery' AND auth.jwt() ->> 'email' = 'sportxtremeevents@gmail.com');

-- ========== 006_seed_demo.sql ==========

INSERT INTO public.events (title, category, sport, description, location, participants, event_date, status)
SELECT * FROM (VALUES
  ('Mumbai Corporate Cricket League','CORPORATE','Cricket','Annual corporate cricket tournament featuring 32 companies','Mumbai, Maharashtra','500+','2025-03-15'::date,'upcoming'),
  ('SportXtreme City Marathon 2025','MARATHON','Running','City-wide marathon with 21K and 42K categories','Mumbai, Maharashtra','2,500+','2025-04-20'::date,'upcoming'),
  ('Inter-School Sports Championship','SCHOOL','Multi-Sport','Multi-sport championship for schools across Mumbai','Mumbai, Maharashtra','1,200+','2025-02-10'::date,'upcoming'),
  ('Football Super League Mumbai','LEAGUE','Football','Competitive football league with 16 teams','Mumbai, Maharashtra','800+','2025-05-01'::date,'upcoming'),
  ('Western Mumbai Cyclothon','CYCLING','Cycling','Inaugural cycling event across Western Mumbai','Mumbai, Maharashtra','3,000+','2025-06-15'::date,'upcoming'),
  ('Corporate Swim Challenge','AQUATIC','Swimming','Corporate swimming competition with relay and individual events','Mumbai, Maharashtra','400+','2025-07-20'::date,'upcoming'),
  ('TechCorp Basketball Tournament','CORPORATE','Basketball','Inter-company basketball championship for tech companies','Pune, Maharashtra','250+','2025-03-25'::date,'upcoming'),
  ('Half Marathon for Charity','MARATHON','Running','Charity half marathon supporting underprivileged children','Mumbai, Maharashtra','1,800+','2025-04-05'::date,'upcoming'),
  ('School Badminton Championship','SCHOOL','Badminton','Inter-school badminton tournament for U-14 and U-17','Mumbai, Maharashtra','300+','2025-02-25'::date,'upcoming')
) AS v(title,category,sport,description,location,participants,event_date,status)
WHERE NOT EXISTS (SELECT 1 FROM public.events LIMIT 1);

INSERT INTO public.gallery (caption, category, event_name)
SELECT * FROM (VALUES
  ('Mumbai Corporate Cricket League Finals','Corporate','Cricket'),
  ('City Marathon 2025 Start Line','Marathon','Running'),
  ('Inter-School Championship Awards','School','Multi-Sport'),
  ('Football Super League Match','League','Football'),
  ('Western Mumbai Cyclothon Route','Cycling','Cycling'),
  ('Corporate Swim Challenge','Aquatic','Swimming'),
  ('Basketball Tournament Finals','Corporate','Basketball'),
  ('Charity Half Marathon','Marathon','Running'),
  ('School Badminton Championship','School','Badminton')
) AS v(caption,category,event_name)
WHERE NOT EXISTS (SELECT 1 FROM public.gallery LIMIT 1);

INSERT INTO public.testimonials (name, role, text, stars)
SELECT * FROM (VALUES
  ('Vikram Mehta','VP Operations, TechCorp India','SportXtreme transformed our annual corporate games into a world-class event. Their execution was flawless — every single detail accounted for.',5),
  ('Priya Sharma','Sports Director, Mumbai Schools Association','The school championship they organized was the most professionally run youth sporting event we have ever witnessed in the city.',5),
  ('Rahul Nair','Marathon Participant & Running Club Lead','From registration to the finish line, every detail was perfect. This is what world-class event management looks like in India.',5)
) AS v(name,role,text,stars)
WHERE NOT EXISTS (SELECT 1 FROM public.testimonials LIMIT 1);

-- ========== POST-RUN VERIFICATION (run separately after the above succeeds) ==========
-- SELECT tablename, policyname, cmd FROM pg_policies WHERE schemaname = 'public' AND tablename IN ('contacts','proposals','events','gallery','testimonials') ORDER BY tablename, policyname;
-- SELECT id, name, public FROM storage.buckets WHERE id = 'gallery';
-- SELECT (SELECT count(*) FROM public.events) as events_count, (SELECT count(*) FROM public.gallery) as gallery_count, (SELECT count(*) FROM public.testimonials) as testimonials_count;
