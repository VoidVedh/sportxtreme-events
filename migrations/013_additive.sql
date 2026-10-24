-- ==============================================================================
-- 013_additive.sql
-- SportXtreme Events — Additive Schema, Constraints, Admin Roles & RPCs
--
-- APPLICATION ORDER:
-- Step 1 of 2. Apply this migration FIRST.
-- This migration is completely additive and non-breaking:
--   - It adds new columns, constraints, tables, and RPC functions.
--   - It DOES NOT drop or modify any existing RLS policies.
--   - It is safe to run while any existing client version is live.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. SCHEMA ALIGNMENT: Events, Gallery & Registrations Columns
-- ------------------------------------------------------------------------------

-- Ensure registration_deadline and max_participants exist on events
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS registration_deadline timestamptz,
  ADD COLUMN IF NOT EXISTS max_participants integer;

-- Ensure thumbnail_url exists on gallery for responsive grid performance
ALTER TABLE public.gallery
  ADD COLUMN IF NOT EXISTS thumbnail_url text;

-- Ensure checkin_token column exists on registrations for opaque ticket verification
ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS checkin_token text;

-- Add unique index for checkin_token where token is not null
CREATE UNIQUE INDEX IF NOT EXISTS idx_registrations_checkin_token_unique
  ON public.registrations(checkin_token)
  WHERE checkin_token IS NOT NULL;

-- Add composite unique index to registrations to block concurrent duplicate submissions (excluding cancelled)
CREATE UNIQUE INDEX IF NOT EXISTS idx_registrations_event_email_unique 
  ON public.registrations(event_id, lower(trim(email)))
  WHERE status != 'cancelled';

CREATE UNIQUE INDEX IF NOT EXISTS idx_registrations_event_phone_unique 
  ON public.registrations(event_id, regexp_replace(phone, '[^0-9]', '', 'g'))
  WHERE status != 'cancelled';

-- ------------------------------------------------------------------------------
-- 2. DATA INTEGRITY: Constraints on Contacts & Proposals
-- ------------------------------------------------------------------------------

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_contacts_name_len') THEN
    ALTER TABLE public.contacts ADD CONSTRAINT chk_contacts_name_len 
      CHECK (char_length(name) >= 2 AND char_length(name) <= 100);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_contacts_email_len') THEN
    ALTER TABLE public.contacts ADD CONSTRAINT chk_contacts_email_len 
      CHECK (char_length(email) >= 5 AND char_length(email) <= 120);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_contacts_phone_len') THEN
    ALTER TABLE public.contacts ADD CONSTRAINT chk_contacts_phone_len 
      CHECK (phone IS NULL OR char_length(phone) <= 30);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_contacts_message_len') THEN
    ALTER TABLE public.contacts ADD CONSTRAINT chk_contacts_message_len 
      CHECK (message IS NULL OR char_length(message) <= 3000);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_proposals_company_len') THEN
    ALTER TABLE public.proposals ADD CONSTRAINT chk_proposals_company_len 
      CHECK (company_name IS NULL OR char_length(company_name) <= 150);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_proposals_desc_len') THEN
    ALTER TABLE public.proposals ADD CONSTRAINT chk_proposals_desc_len 
      CHECK (description IS NULL OR char_length(description) <= 3000);
  END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 3. ADMIN AUTHORIZATION INFRASTRUCTURE: admin_users Table & is_admin() Function
-- ------------------------------------------------------------------------------

-- Create dedicated admin_users table to eliminate hardcoded emails and loose auth checks
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Helper function to verify admin status safely within policies and RPCs
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE id = auth.uid()
       OR lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

-- Authenticated admins can view admin user records
DROP POLICY IF EXISTS "admin_users_select_policy" ON public.admin_users;
CREATE POLICY "admin_users_select_policy"
ON public.admin_users
FOR SELECT
TO authenticated
USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- 4. SECURE REGISTRATION RPC: register_participant
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.register_participant(
  p_event_id uuid,
  p_name text,
  p_email text,
  p_phone text,
  p_age integer DEFAULT NULL,
  p_tshirt_size text DEFAULT 'M'
)
RETURNS TABLE (
  success boolean,
  code text,
  message text,
  registration_id uuid,
  registration_number text,
  check_in_token text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_clean_name text;
  v_clean_email text;
  v_clean_phone text;
  v_clean_tshirt text;
  v_event record;
  v_reg_count integer;
  v_duplicate_exists boolean;
  v_reg_id uuid;
  v_reg_num text;
  v_token text;
  v_now timestamptz;
BEGIN
  v_now := timezone('utc'::text, now());

  -- 1. Input sanitization & normalization
  v_clean_name := trim(regexp_replace(coalesce(p_name, ''), '\s+', ' ', 'g'));
  v_clean_email := lower(trim(coalesce(p_email, '')));
  v_clean_phone := trim(coalesce(p_phone, ''));
  v_clean_tshirt := upper(trim(coalesce(p_tshirt_size, 'M')));

  -- 2. Input validation
  IF char_length(v_clean_name) < 2 OR char_length(v_clean_name) > 100 THEN
    RETURN QUERY SELECT false, 'INVALID_NAME'::text, 'Participant full name must be between 2 and 100 characters.'::text, NULL::uuid, NULL::text, NULL::text;
    RETURN;
  END IF;

  IF char_length(v_clean_email) < 5 OR char_length(v_clean_email) > 120 OR v_clean_email !~ '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$' THEN
    RETURN QUERY SELECT false, 'INVALID_EMAIL'::text, 'Please provide a valid email address.'::text, NULL::uuid, NULL::text, NULL::text;
    RETURN;
  END IF;

  IF char_length(v_clean_phone) < 7 OR char_length(v_clean_phone) > 25 OR v_clean_phone !~ '^[+0-9\s\-()]+$' THEN
    RETURN QUERY SELECT false, 'INVALID_PHONE'::text, 'Please provide a valid contact phone number.'::text, NULL::uuid, NULL::text, NULL::text;
    RETURN;
  END IF;

  IF p_age IS NOT NULL AND (p_age < 1 OR p_age > 120) THEN
    RETURN QUERY SELECT false, 'INVALID_AGE'::text, 'Participant age must be between 1 and 120.'::text, NULL::uuid, NULL::text, NULL::text;
    RETURN;
  END IF;

  IF v_clean_tshirt NOT IN ('S', 'M', 'L', 'XL', 'XXL') THEN
    v_clean_tshirt := 'M';
  END IF;

  -- 3. Verify event existence, status, and deadlines
  SELECT id, title, status, event_date, registration_deadline, max_participants
  INTO v_event
  FROM public.events
  WHERE id = p_event_id;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'EVENT_NOT_FOUND'::text, 'The selected event could not be found.'::text, NULL::uuid, NULL::text, NULL::text;
    RETURN;
  END IF;

  IF v_event.status IS NOT NULL AND v_event.status NOT IN ('open', 'active') THEN
    RETURN QUERY SELECT false, 'EVENT_NOT_OPEN'::text, 'Registration for this event is currently closed.'::text, NULL::uuid, NULL::text, NULL::text;
    RETURN;
  END IF;

  IF v_event.event_date IS NOT NULL AND v_event.event_date < v_now THEN
    RETURN QUERY SELECT false, 'EVENT_EXPIRED'::text, 'This event has already taken place.'::text, NULL::uuid, NULL::text, NULL::text;
    RETURN;
  END IF;

  IF v_event.registration_deadline IS NOT NULL AND v_event.registration_deadline < v_now THEN
    RETURN QUERY SELECT false, 'REGISTRATION_CLOSED'::text, 'The registration deadline for this event has passed.'::text, NULL::uuid, NULL::text, NULL::text;
    RETURN;
  END IF;

  -- 4. Check capacity (max_participants)
  IF v_event.max_participants IS NOT NULL AND v_event.max_participants > 0 THEN
    SELECT count(*)::integer INTO v_reg_count
    FROM public.registrations
    WHERE event_id = p_event_id AND status != 'cancelled';

    IF v_reg_count >= v_event.max_participants THEN
      RETURN QUERY SELECT false, 'EVENT_FULL'::text, 'This event has reached full participant capacity.'::text, NULL::uuid, NULL::text, NULL::text;
      RETURN;
    END IF;
  END IF;

  -- 5. Duplicate submission check
  SELECT EXISTS (
    SELECT 1 FROM public.registrations
    WHERE event_id = p_event_id 
      AND status != 'cancelled'
      AND (
        lower(trim(email)) = v_clean_email
        OR regexp_replace(phone, '[^0-9]', '', 'g') = regexp_replace(v_clean_phone, '[^0-9]', '', 'g')
      )
  ) INTO v_duplicate_exists;

  IF v_duplicate_exists THEN
    RETURN QUERY SELECT false, 'DUPLICATE_REGISTRATION'::text, 'A participant with this email or phone is already registered for this event.'::text, NULL::uuid, NULL::text, NULL::text;
    RETURN;
  END IF;

  -- 6. Generate cryptographically strong opaque check-in token & registration number
  v_reg_id := gen_random_uuid();
  v_reg_num := 'SX-' || lpad(floor(random() * 900000 + 100000)::text, 6, '0');
  v_token := encode(gen_random_bytes(16), 'hex');

  -- 7. Insert record with safe defaults
  INSERT INTO public.registrations (
    id,
    event_id,
    registration_number,
    name,
    email,
    phone,
    age,
    tshirt_size,
    status,
    checkin_token,
    created_at,
    updated_at
  ) VALUES (
    v_reg_id,
    p_event_id,
    v_reg_num,
    v_clean_name,
    v_clean_email,
    v_clean_phone,
    p_age,
    v_clean_tshirt,
    'pending',
    v_token,
    v_now,
    v_now
  );

  RETURN QUERY SELECT true, 'SUCCESS'::text, 'Registration confirmed successfully!'::text, v_reg_id, v_reg_num, v_token;
END;
$$;

-- ------------------------------------------------------------------------------
-- 5. IDEMPOTENT CHECK-IN RPC: verify_and_checkin_participant
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.verify_and_checkin_participant(
  p_ticket_identifier text
)
RETURNS TABLE (
  success boolean,
  code text,
  message text,
  participant_name text,
  event_title text,
  registration_number text,
  status text,
  already_checked_in boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_clean_id text;
  v_reg_record record;
  v_admin_email text;
  v_now timestamptz;
BEGIN
  -- Strict administrator check via public.is_admin()
  IF NOT public.is_admin() THEN
    RETURN QUERY SELECT false, 'UNAUTHORIZED'::text, 'UNAUTHORIZED: Only verified administrators can check in participants.'::text, NULL::text, NULL::text, NULL::text, 'unauthorized'::text, false::boolean;
    RETURN;
  END IF;

  v_admin_email := coalesce(auth.jwt() ->> 'email', 'admin');
  v_clean_id := trim(coalesce(p_ticket_identifier, ''));
  v_now := timezone('utc'::text, now());

  -- Locate registration by checkin_token, registration_number, or UUID id
  SELECT r.id, r.registration_number, r.name, r.status, r.approved_at, e.title as event_title
  INTO v_reg_record
  FROM public.registrations r
  LEFT JOIN public.events e ON e.id = r.event_id
  WHERE r.checkin_token = v_clean_id
     OR r.registration_number = v_clean_id
     OR (v_clean_id ~* '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' AND r.id = v_clean_id::uuid);

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'TICKET_NOT_FOUND'::text, 'Ticket not found. Invalid registration QR or ID.'::text, NULL::text, NULL::text, NULL::text, 'not_found'::text, false::boolean;
    RETURN;
  END IF;

  -- Idempotency check: Already checked in returns success status with already_checked_in=true (NO mutation)
  IF v_reg_record.status = 'attended' THEN
    RETURN QUERY SELECT true, 'ALREADY_CHECKED_IN'::text, 'Participant already checked in previously.'::text, v_reg_record.name, v_reg_record.event_title, v_reg_record.registration_number, 'attended'::text, true::boolean;
    RETURN;
  END IF;

  IF v_reg_record.status = 'cancelled' THEN
    RETURN QUERY SELECT false, 'TICKET_CANCELLED'::text, 'Registration was cancelled. Entry denied.'::text, v_reg_record.name, v_reg_record.event_title, v_reg_record.registration_number, 'cancelled'::text, false::boolean;
    RETURN;
  END IF;

  -- Mark as attended
  UPDATE public.registrations
  SET status = 'attended',
      approved_at = v_now,
      approved_by = v_admin_email,
      updated_at = v_now
  WHERE id = v_reg_record.id;

  RETURN QUERY SELECT true, 'CHECKIN_SUCCESS'::text, 'Check-in verified successfully!'::text, v_reg_record.name, v_reg_record.event_title, v_reg_record.registration_number, 'attended'::text, false::boolean;
END;
$$;

-- ------------------------------------------------------------------------------
-- 6. PUBLIC AGGREGATE RPC: get_total_participants
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.get_total_participants()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN (SELECT COUNT(*)::integer FROM public.registrations WHERE status != 'cancelled');
END;
$$;

-- ------------------------------------------------------------------------------
-- 7. FUNCTION PERMISSIONS
-- ------------------------------------------------------------------------------

REVOKE ALL ON FUNCTION public.register_participant(uuid, text, text, text, integer, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.register_participant(uuid, text, text, text, integer, text) TO anon, authenticated;

REVOKE ALL ON FUNCTION public.get_total_participants() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_total_participants() TO anon, authenticated;

REVOKE ALL ON FUNCTION public.verify_and_checkin_participant(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verify_and_checkin_participant(text) TO authenticated;
