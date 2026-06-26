-- ============================================================
-- 004_fix_rls.sql
-- SportXtreme Events — Enable RLS & Configure Policies (Validated Syntax)
-- ============================================================

-- Ensure RLS is enabled on all tables
ALTER TABLE public.contacts     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Explicitly drop all known previous policies to prevent conflicts
DROP POLICY IF EXISTS "public_insert_contacts" ON public.contacts;
DROP POLICY IF EXISTS "admin_all_contacts" ON public.contacts;
DROP POLICY IF EXISTS "Allow public insert contacts" ON public.contacts;
DROP POLICY IF EXISTS "Admins can select contacts" ON public.contacts;
DROP POLICY IF EXISTS "Admins can update contacts" ON public.contacts;
DROP POLICY IF EXISTS "Admins can delete contacts" ON public.contacts;

DROP POLICY IF EXISTS "public_insert_proposals" ON public.proposals;
DROP POLICY IF EXISTS "admin_all_proposals" ON public.proposals;
DROP POLICY IF EXISTS "Allow public insert proposals" ON public.proposals;
DROP POLICY IF EXISTS "Admins can select proposals" ON public.proposals;
DROP POLICY IF EXISTS "Admins can update proposals" ON public.proposals;
DROP POLICY IF EXISTS "Admins can delete proposals" ON public.proposals;

DROP POLICY IF EXISTS "public_select_events" ON public.events;
DROP POLICY IF EXISTS "admin_all_events" ON public.events;
DROP POLICY IF EXISTS "Allow public read events" ON public.events;
DROP POLICY IF EXISTS "Admins can insert events" ON public.events;
DROP POLICY IF EXISTS "Admins can update events" ON public.events;
DROP POLICY IF EXISTS "Admins can delete events" ON public.events;

DROP POLICY IF EXISTS "public_select_gallery" ON public.gallery;
DROP POLICY IF EXISTS "admin_all_gallery" ON public.gallery;
DROP POLICY IF EXISTS "Allow public read gallery" ON public.gallery;
DROP POLICY IF EXISTS "Admins can insert gallery" ON public.gallery;
DROP POLICY IF EXISTS "Admins can update gallery" ON public.gallery;
DROP POLICY IF EXISTS "Admins can delete gallery" ON public.gallery;

DROP POLICY IF EXISTS "public_select_testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "admin_all_testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Allow public read testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Admins can insert testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Admins can update testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Admins can delete testimonials" ON public.testimonials;

-- 1. Contacts Policies
CREATE POLICY "public_insert_contacts"
ON public.contacts
AS PERMISSIVE
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "admin_all_contacts"
ON public.contacts
AS PERMISSIVE
FOR ALL
TO authenticated
USING (auth.jwt() ->> 'email' = 'sportxtremeevents@gmail.com')
WITH CHECK (auth.jwt() ->> 'email' = 'sportxtremeevents@gmail.com');

-- 2. Proposals Policies
CREATE POLICY "public_insert_proposals"
ON public.proposals
AS PERMISSIVE
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "admin_all_proposals"
ON public.proposals
AS PERMISSIVE
FOR ALL
TO authenticated
USING (auth.jwt() ->> 'email' = 'sportxtremeevents@gmail.com')
WITH CHECK (auth.jwt() ->> 'email' = 'sportxtremeevents@gmail.com');

-- 3. Events Policies
CREATE POLICY "public_select_events"
ON public.events
AS PERMISSIVE
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "admin_all_events"
ON public.events
AS PERMISSIVE
FOR ALL
TO authenticated
USING (auth.jwt() ->> 'email' = 'sportxtremeevents@gmail.com')
WITH CHECK (auth.jwt() ->> 'email' = 'sportxtremeevents@gmail.com');

-- 4. Gallery Policies
CREATE POLICY "public_select_gallery"
ON public.gallery
AS PERMISSIVE
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "admin_all_gallery"
ON public.gallery
AS PERMISSIVE
FOR ALL
TO authenticated
USING (auth.jwt() ->> 'email' = 'sportxtremeevents@gmail.com')
WITH CHECK (auth.jwt() ->> 'email' = 'sportxtremeevents@gmail.com');

-- 5. Testimonials Policies
CREATE POLICY "public_select_testimonials"
ON public.testimonials
AS PERMISSIVE
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "admin_all_testimonials"
ON public.testimonials
AS PERMISSIVE
FOR ALL
TO authenticated
USING (auth.jwt() ->> 'email' = 'sportxtremeevents@gmail.com')
WITH CHECK (auth.jwt() ->> 'email' = 'sportxtremeevents@gmail.com');
