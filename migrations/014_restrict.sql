-- ==============================================================================
-- 014_restrict.sql
-- SportXtreme Events — RLS Restriction & Role-Based Access Lockdown
--
-- APPLICATION ORDER:
-- Step 2 of 2.
-- CRITICAL WARNING:
-- Apply this migration ONLY AFTER:
--   1. Migration 013_additive.sql has been successfully applied to the database.
--   2. The new client code (which calls the register_participant RPC instead
--      of direct table INSERT) is fully deployed and verified live.
--
-- PURPOSE:
--   - Drops all direct anon SELECT policies on public.registrations to close PII leakage.
--   - Drops all direct anon INSERT policies on public.registrations (forcing all
--     registrations through the hardened register_participant RPC).
--   - Replaces any hardcoded emails or loose "any authenticated user" checks across
--     all tables with public.is_admin() referencing public.admin_users.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. ROW LEVEL SECURITY ENFORCEMENT
-- ------------------------------------------------------------------------------

ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 2. REGISTRATIONS TABLE LOCKDOWN (Zero Public PII Read / Zero Direct Anon Insert)
-- ------------------------------------------------------------------------------

-- Drop all historical permissive policies on registrations
DROP POLICY IF EXISTS "public_select_registrations" ON public.registrations;
DROP POLICY IF EXISTS "public_insert_registrations" ON public.registrations;
DROP POLICY IF EXISTS "Allow public read" ON public.registrations;
DROP POLICY IF EXISTS "Allow public insert" ON public.registrations;
DROP POLICY IF EXISTS "admin_all_registrations" ON public.registrations;
DROP POLICY IF EXISTS "anon_insert_registrations_pending_only" ON public.registrations;

-- Authenticated verified administrators have full access to view, update, delete registrations
CREATE POLICY "admin_all_registrations"
ON public.registrations
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- NOTICE: No SELECT, INSERT, UPDATE, or DELETE policy is created for anon on registrations.
-- Direct table access by anon is 100% blocked. All registrations run via register_participant().

-- ------------------------------------------------------------------------------
-- 3. EVENTS TABLE PERMISSIONS
-- ------------------------------------------------------------------------------

DROP POLICY IF EXISTS "public_select_events" ON public.events;
DROP POLICY IF EXISTS "Allow public read" ON public.events;
DROP POLICY IF EXISTS "admin_manage_events" ON public.events;
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.events;
DROP POLICY IF EXISTS "Allow authenticated update" ON public.events;
DROP POLICY IF EXISTS "Allow authenticated delete" ON public.events;
DROP POLICY IF EXISTS "admin_all_events" ON public.events;

-- Anyone can read active/public events
CREATE POLICY "public_select_events"
ON public.events
FOR SELECT
TO anon, authenticated
USING (true);

-- Only verified admins can create, edit, or delete events
CREATE POLICY "admin_manage_events"
ON public.events
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- 4. GALLERY TABLE PERMISSIONS
-- ------------------------------------------------------------------------------

DROP POLICY IF EXISTS "public_select_gallery" ON public.gallery;
DROP POLICY IF EXISTS "Allow public read" ON public.gallery;
DROP POLICY IF EXISTS "admin_manage_gallery" ON public.gallery;
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.gallery;
DROP POLICY IF EXISTS "Allow authenticated update" ON public.gallery;
DROP POLICY IF EXISTS "Allow authenticated delete" ON public.gallery;
DROP POLICY IF EXISTS "admin_all_gallery" ON public.gallery;

-- Anyone can read gallery photos
CREATE POLICY "public_select_gallery"
ON public.gallery
FOR SELECT
TO anon, authenticated
USING (true);

-- Only verified admins can manage gallery rows
CREATE POLICY "admin_manage_gallery"
ON public.gallery
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- 5. TESTIMONIALS TABLE PERMISSIONS
-- ------------------------------------------------------------------------------

DROP POLICY IF EXISTS "public_select_testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Allow public read" ON public.testimonials;
DROP POLICY IF EXISTS "admin_manage_testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.testimonials;
DROP POLICY IF EXISTS "Allow authenticated update" ON public.testimonials;
DROP POLICY IF EXISTS "Allow authenticated delete" ON public.testimonials;
DROP POLICY IF EXISTS "admin_all_testimonials" ON public.testimonials;

CREATE POLICY "public_select_testimonials"
ON public.testimonials
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "admin_manage_testimonials"
ON public.testimonials
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- 6. CONTACTS & PROPOSALS (Inquiries / Leads)
-- ------------------------------------------------------------------------------

DROP POLICY IF EXISTS "public_insert_contacts" ON public.contacts;
DROP POLICY IF EXISTS "Allow public insert" ON public.contacts;
DROP POLICY IF EXISTS "admin_manage_contacts" ON public.contacts;
DROP POLICY IF EXISTS "admin_all_contacts" ON public.contacts;

-- Anyone can submit a contact inquiry (with length validation)
CREATE POLICY "public_insert_contacts"
ON public.contacts
FOR INSERT
TO anon, authenticated
WITH CHECK (char_length(name) >= 2 AND char_length(email) >= 5);

-- Only verified admins can view, update, or delete customer inquiries
CREATE POLICY "admin_manage_contacts"
ON public.contacts
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "public_insert_proposals" ON public.proposals;
DROP POLICY IF EXISTS "Allow public insert" ON public.proposals;
DROP POLICY IF EXISTS "admin_manage_proposals" ON public.proposals;
DROP POLICY IF EXISTS "admin_all_proposals" ON public.proposals;

-- Anyone can submit a proposal
CREATE POLICY "public_insert_proposals"
ON public.proposals
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Only verified admins can view or manage proposals
CREATE POLICY "admin_manage_proposals"
ON public.proposals
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- 7. STORAGE BUCKET POLICIES (Gallery Bucket)
-- ------------------------------------------------------------------------------

-- Ensure storage policies protect the gallery bucket from unauthorized writes
DO $$
BEGIN
  -- Public Read on gallery bucket
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public Access Gallery'
  ) THEN
    CREATE POLICY "Public Access Gallery"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'gallery');
  END IF;

  -- Admin Upload on gallery bucket
  DROP POLICY IF EXISTS "Admin Upload Gallery" ON storage.objects;
  CREATE POLICY "Admin Upload Gallery"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'gallery' AND public.is_admin());

  -- Admin Update on gallery bucket
  DROP POLICY IF EXISTS "Admin Update Gallery" ON storage.objects;
  CREATE POLICY "Admin Update Gallery"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'gallery' AND public.is_admin())
  WITH CHECK (bucket_id = 'gallery' AND public.is_admin());

  -- Admin Delete on gallery bucket
  DROP POLICY IF EXISTS "Admin Delete Gallery" ON storage.objects;
  CREATE POLICY "Admin Delete Gallery"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'gallery' AND public.is_admin());
END $$;
