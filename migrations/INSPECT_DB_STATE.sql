-- ============================================================
-- INSPECT CURRENT DATABASE STATE
-- Run in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/bwgmsjyouvnswftmrnkm/sql/new
-- Copy results back to compare with 004_fix_rls.sql expectations.
-- ============================================================

-- 1. RLS enabled on target tables
SELECT schemaname, tablename, rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('contacts','proposals','events','gallery','testimonials')
ORDER BY tablename;

-- 2. Existing RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('contacts','proposals','events','gallery','testimonials')
ORDER BY tablename, policyname;

-- 3. Table grants for anon / authenticated
SELECT grantee, table_schema, table_name, privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND table_name IN ('contacts','proposals','events','gallery','testimonials')
  AND grantee IN ('anon', 'authenticated', 'public')
ORDER BY table_name, grantee, privilege_type;

-- 4. Storage buckets
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
ORDER BY id;

-- 5. Storage policies on storage.objects
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects'
ORDER BY policyname;

-- 6. Row counts (confirms seed state)
SELECT 'contacts' AS tbl, count(*) FROM public.contacts
UNION ALL SELECT 'proposals', count(*) FROM public.proposals
UNION ALL SELECT 'events', count(*) FROM public.events
UNION ALL SELECT 'gallery', count(*) FROM public.gallery
UNION ALL SELECT 'testimonials', count(*) FROM public.testimonials;
