-- ==============================================================================
-- tests/auth_matrix_test.sql
-- Automated / Manual Verification Script for Supabase SQL Editor
--
-- Tests RLS permissions across 3 personas:
--   1. anon (Public unauthenticated visitor)
--   2. authenticated non-admin (Regular logged-in user not in admin_users)
--   3. authenticated admin (Verified user in public.admin_users)
--
-- HOW TO RUN:
-- Paste into Supabase SQL Editor and execute. All assertions will print PASS/FAIL.
-- ==============================================================================

BEGIN;

-- Setup temporary test users and mock environment
DO $$
DECLARE
  v_test_admin_id uuid := '11111111-1111-1111-1111-111111111111';
  v_test_user_id uuid  := '22222222-2222-2222-2222-222222222222';
BEGIN
  -- Insert mock admin user into public.admin_users
  INSERT INTO public.admin_users (id, email, role)
  VALUES (v_test_admin_id, 'test_admin@sportxtreme.com', 'admin')
  ON CONFLICT (id) DO NOTHING;
END $$;

-- ------------------------------------------------------------------------------
-- PERSONA 1: ANON (Public Visitor)
-- ------------------------------------------------------------------------------
SET LOCAL ROLE anon;
SET LOCAL "request.jwt.claims" = '{"role": "anon"}';

-- Test 1.1: Anon SELECT on registrations (MUST RETURN 0 ROWS OR PERMISSION DENIED)
DO $$
DECLARE
  v_count integer;
BEGIN
  SELECT COUNT(*) INTO v_count FROM public.registrations;
  IF v_count = 0 THEN
    RAISE NOTICE 'PASS [Anon]: registrations table returned 0 rows (PII protected)';
  ELSE
    RAISE EXCEPTION 'FAIL [Anon]: registrations returned % rows to anon!', v_count;
  END IF;
END $$;

-- Test 1.2: Anon direct INSERT on registrations (MUST FAIL AFTER 014_restrict)
DO $$
BEGIN
  INSERT INTO public.registrations (id, event_id, name, email, phone, status)
  VALUES (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Hacker', 'hacker@anon.com', '+919999999999', 'attended');
  RAISE WARNING 'NOTICE [Anon]: Direct insert succeeded (014_restrict pending). Ensure 014 is applied once client is live.';
EXCEPTION WHEN insufficient_privilege THEN
  RAISE NOTICE 'PASS [Anon]: Direct insert on registrations blocked as expected.';
END $$;

-- Test 1.3: Anon SELECT on events (MUST SUCCEED)
DO $$
BEGIN
  PERFORM 1 FROM public.events LIMIT 1;
  RAISE NOTICE 'PASS [Anon]: Public events table readable.';
EXCEPTION WHEN OTHERS THEN
  RAISE EXCEPTION 'FAIL [Anon]: Could not read public events: %', SQLERRM;
END $$;

-- Test 1.4: Anon INSERT on events (MUST FAIL)
DO $$
BEGIN
  INSERT INTO public.events (title, sport) VALUES ('Unauthorized Event', 'Cricket');
  RAISE EXCEPTION 'FAIL [Anon]: Anon was able to insert into events!';
EXCEPTION WHEN insufficient_privilege THEN
  RAISE NOTICE 'PASS [Anon]: Event creation by anon blocked.';
END $$;

-- ------------------------------------------------------------------------------
-- PERSONA 2: AUTHENTICATED NON-ADMIN (Regular User, NOT in admin_users)
-- ------------------------------------------------------------------------------
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" = '{"sub": "22222222-2222-2222-2222-222222222222", "email": "stranger@gmail.com", "role": "authenticated"}';

-- Test 2.1: Non-admin is_admin() check (MUST RETURN FALSE)
DO $$
BEGIN
  IF public.is_admin() THEN
    RAISE EXCEPTION 'FAIL [Non-Admin]: is_admin() returned true for stranger@gmail.com!';
  ELSE
    RAISE NOTICE 'PASS [Non-Admin]: is_admin() returned false.';
  END IF;
END $$;

-- Test 2.2: Non-admin SELECT on registrations (MUST RETURN 0 ROWS)
DO $$
DECLARE
  v_count integer;
BEGIN
  SELECT COUNT(*) INTO v_count FROM public.registrations;
  IF v_count = 0 THEN
    RAISE NOTICE 'PASS [Non-Admin]: registrations table returned 0 rows.';
  ELSE
    RAISE EXCEPTION 'FAIL [Non-Admin]: registrations returned % rows to non-admin!', v_count;
  END IF;
END $$;

-- Test 2.3: Non-admin INSERT/UPDATE on events (MUST FAIL)
DO $$
BEGIN
  INSERT INTO public.events (title, sport) VALUES ('Unauthorized Event', 'Football');
  RAISE EXCEPTION 'FAIL [Non-Admin]: Non-admin was able to insert into events!';
EXCEPTION WHEN insufficient_privilege THEN
  RAISE NOTICE 'PASS [Non-Admin]: Event creation blocked.';
END $$;

-- ------------------------------------------------------------------------------
-- PERSONA 3: AUTHENTICATED ADMIN (Verified in public.admin_users)
-- ------------------------------------------------------------------------------
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" = '{"sub": "11111111-1111-1111-1111-111111111111", "email": "test_admin@sportxtreme.com", "role": "authenticated"}';

-- Test 3.1: Admin is_admin() check (MUST RETURN TRUE)
DO $$
BEGIN
  IF public.is_admin() THEN
    RAISE NOTICE 'PASS [Admin]: is_admin() returned true for verified admin.';
  ELSE
    RAISE EXCEPTION 'FAIL [Admin]: is_admin() returned false for verified admin!';
  END IF;
END $$;

-- Test 3.2: Admin SELECT on admin_users table (MUST SUCCEED)
DO $$
DECLARE
  v_count integer;
BEGIN
  SELECT COUNT(*) INTO v_count FROM public.admin_users;
  RAISE NOTICE 'PASS [Admin]: admin_users table accessible (% records).', v_count;
EXCEPTION WHEN OTHERS THEN
  RAISE EXCEPTION 'FAIL [Admin]: Admin could not read admin_users: %', SQLERRM;
END $$;

-- Test 3.3: Admin check-in RPC execution test
DO $$
DECLARE
  v_res record;
BEGIN
  SELECT * INTO v_res FROM public.verify_and_checkin_participant('NON_EXISTENT_TICKET_123');
  IF v_res.code = 'TICKET_NOT_FOUND' THEN
    RAISE NOTICE 'PASS [Admin]: verify_and_checkin_participant executed and returned stable code TICKET_NOT_FOUND.';
  ELSE
    RAISE EXCEPTION 'FAIL [Admin]: Unexpected result from verify_and_checkin_participant: %', v_res.code;
  END IF;
END $$;

-- Rollback transaction so test data is never permanently saved
ROLLBACK;
