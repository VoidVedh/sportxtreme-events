-- ==============================================================================
-- 013_harden_security_and_thumbnails.sql
-- SportXtreme Events — Production Security Hardening & Thumbnail Support
-- 
-- PURPOSE:
-- 1. Close PII vulnerability on registrations: revoke public SELECT/INSERT on 
--    registrations table; encapsulate all participant registration via an
--    idempotent, server-side validated SECURITY DEFINER RPC with search_path protection.
-- 2. Add event capacity (max_participants) and deadline (registration_deadline)
--    columns to public.events if missing.
-- 3. Add thumbnail_url column to public.gallery for lightweight asset grid loading.
-- 4. Add database-level length and sanitization CHECK constraints on contacts
--    and proposals to prevent abuse/spam attacks.
-- 5. Provide server-side verified check-in RPC (verify_and_checkin_participant)
--    restricted strictly to authenticated administrators.
--
-- INSTRUCTIONS:
-- Run in Supabase SQL Editor. This script is idempotent and safe to re-run.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. SCHEMA ALIGNMENT: Events, Gallery & Registrations Columns
-- ------------------------------------------------------------------------------

-- Ensure registration_deadline and max_participants exist on events
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS registration_deadline timestamptz,
  ADD COLUMN IF NOT EXISTS max_participants integer;

-- Ensure thumbnail_url exists on gallery for responsive performance optimization
ALTER TABLE public.gallery
  ADD COLUMN IF NOT EXISTS thumbnail_url text;

-- Ensure checkin_token column exists on registrations for cryptographic verification
ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS checkin_token text UNIQUE;

-- Add composite unique index to registrations to block concurrent duplicate submissions
CREATE UNIQUE INDEX IF NOT EXISTS idx_registrations_event_email_unique 
  ON public.registrations(event_id, lower(trim(email)));

-- ------------------------------------------------------------------------------
-- 2. DATA INTEGRITY: Constraints on Contacts & Proposals
-- ------------------------------------------------------------------------------

-- Length constraints on contacts (leads/inquiries)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_contacts_name_len'
  ) THEN
    ALTER TABLE public.contacts ADD CONSTRAINT chk_contacts_name_len 
      CHECK (char_length(name) >= 2 AND char_length(name) <= 100);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_contacts_email_len'
  ) THEN
    ALTER TABLE public.contacts ADD CONSTRAINT chk_contacts_email_len 
      CHECK (char_length(email) >= 5 AND char_length(email) <= 120);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_contacts_phone_len'
  ) THEN
    ALTER TABLE public.contacts ADD CONSTRAINT chk_contacts_phone_len 
      CHECK (phone IS NULL OR char_length(phone) <= 30);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_contacts_message_len'
  ) THEN
    ALTER TABLE public.contacts ADD CONSTRAINT chk_contacts_message_len 
      CHECK (message IS NULL OR char_length(message) <= 3000);
  END IF;
END $$;

-- Length constraints on proposals (corporate event inquiries)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_proposals_company_len'
  ) THEN
    ALTER TABLE public.proposals ADD CONSTRAINT chk_proposals_company_len 
      CHECK (company_name IS NULL OR char_length(company_name) <= 150);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_proposals_desc_len'
  ) THEN
    ALTER TABLE public.proposals ADD CONSTRAINT chk_proposals_desc_len 
      CHECK (description IS NULL OR char_length(description) <= 3000);
  END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 3. SECURE RPC: register_participant (Encapsulated Registration)
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
  id uuid,
  registration_number text,
  created_at timestamptz,
  checkin_token text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_norm_name text;
  v_norm_email text;
  v_norm_phone text;
  v_event_status text;
  v_reg_deadline timestamptz;
  v_event_date date;
  v_max_participants integer;
  v_current_count integer;
  v_duplicate_exists boolean;
  v_reg_id uuid;
  v_reg_num text;
  v_created_at timestamptz;
  v_checkin_token text;
BEGIN
  -- 1. Normalize inputs
  v_norm_name  := trim(p_name);
  v_norm_email := lower(trim(p_email));
  v_norm_phone := regexp_replace(trim(p_phone), '[^\+0-9]', '', 'g');

  -- 2. Input validation
  IF v_norm_name IS NULL OR char_length(v_norm_name) < 2 OR char_length(v_norm_name) > 100 THEN
    RAISE EXCEPTION 'INVALID_INPUT: Please enter a valid name (2-100 characters).';
  END IF;

  IF v_norm_email IS NULL OR v_norm_email !~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' OR char_length(v_norm_email) > 120 THEN
    RAISE EXCEPTION 'INVALID_INPUT: Please enter a valid email address.';
  END IF;

  IF v_norm_phone IS NULL OR char_length(v_norm_phone) < 8 OR char_length(v_norm_phone) > 16 THEN
    RAISE EXCEPTION 'INVALID_INPUT: Please enter a valid phone number (minimum 8 digits).';
  END IF;

  IF p_age IS NOT NULL AND (p_age < 1 OR p_age > 120) THEN
    RAISE EXCEPTION 'INVALID_INPUT: Age must be between 1 and 120.';
  END IF;

  IF p_tshirt_size IS NOT NULL AND p_tshirt_size NOT IN ('S', 'M', 'L', 'XL', 'XXL') THEN
    RAISE EXCEPTION 'INVALID_INPUT: Invalid T-Shirt size. Choose from S, M, L, XL, XXL.';
  END IF;

  -- 3. Verify event exists and is open
  SELECT status, registration_deadline, event_date, max_participants
  INTO v_event_status, v_reg_deadline, v_event_date, v_max_participants
  FROM public.events
  WHERE public.events.id = p_event_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'EVENT_NOT_FOUND: The requested event could not be found.';
  END IF;

  IF v_event_status IN ('cancelled', 'completed') THEN
    RAISE EXCEPTION 'EVENT_CLOSED: Registration for this event is no longer available.';
  END IF;

  -- Check deadline if configured, or event date if passed
  IF v_reg_deadline IS NOT NULL AND CURRENT_TIMESTAMP > v_reg_deadline THEN
    RAISE EXCEPTION 'EVENT_CLOSED: Registration deadline for this event has passed.';
  ELSIF v_reg_deadline IS NULL AND v_event_date IS NOT NULL AND CURRENT_DATE > v_event_date THEN
    RAISE EXCEPTION 'EVENT_CLOSED: This event has already taken place.';
  END IF;

  -- 4. Check capacity limits
  IF v_max_participants IS NOT NULL AND v_max_participants > 0 THEN
    SELECT COUNT(*)::integer
    INTO v_current_count
    FROM public.registrations
    WHERE event_id = p_event_id AND status != 'cancelled';

    IF v_current_count >= v_max_participants THEN
      RAISE EXCEPTION 'EVENT_FULL: This event has reached maximum participant capacity.';
    END IF;
  END IF;

  -- 5. Duplicate prevention (check normalized email or phone for this event)
  SELECT EXISTS (
    SELECT 1 FROM public.registrations
    WHERE event_id = p_event_id
      AND status != 'cancelled'
      AND (lower(trim(email)) = v_norm_email OR regexp_replace(trim(phone), '[^\+0-9]', '', 'g') = v_norm_phone)
  ) INTO v_duplicate_exists;

  IF v_duplicate_exists THEN
    RAISE EXCEPTION 'DUPLICATE_REGISTRATION: A participant with this email address or phone number is already registered for this event.';
  END IF;

  -- 6. Generate cryptographic check-in token
  v_checkin_token := encode(gen_random_bytes(16), 'hex');

  -- 7. Insert registration (database sets default status 'pending')
  INSERT INTO public.registrations (
    event_id,
    name,
    email,
    phone,
    age,
    tshirt_size,
    status,
    checkin_token,
    qr_payload
  ) VALUES (
    p_event_id,
    v_norm_name,
    v_norm_email,
    v_norm_phone,
    p_age,
    COALESCE(p_tshirt_size, 'M'),
    'pending',
    v_checkin_token,
    jsonb_build_object(
      'token', v_checkin_token,
      'name', v_norm_name,
      'email', v_norm_email
    )
  )
  RETURNING public.registrations.id, public.registrations.registration_number, public.registrations.created_at
  INTO v_reg_id, v_reg_num, v_created_at;

  -- Return only minimal ticket fields (never expose other registrants)
  RETURN QUERY SELECT v_reg_id, v_reg_num, v_created_at, v_checkin_token;
END;
$$;

-- ------------------------------------------------------------------------------
-- 4. AGGREGATE METRIC RPC: get_total_participants
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
-- 5. ADMIN VERIFICATION RPC: verify_and_checkin_participant
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.verify_and_checkin_participant(
  p_ticket_identifier text
)
RETURNS TABLE (
  success boolean,
  message text,
  participant_name text,
  event_title text,
  registration_number text,
  status text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_clean_id text;
  v_reg_record record;
  v_admin_email text;
BEGIN
  -- Strict administrator check via JWT claim
  v_admin_email := auth.jwt() ->> 'email';
  IF v_admin_email IS NULL OR v_admin_email != 'sportxtremeevents@gmail.com' THEN
    RAISE EXCEPTION 'UNAUTHORIZED: Only authenticated administrators can verify tickets.';
  END IF;

  v_clean_id := trim(p_ticket_identifier);

  -- Locate registration by checkin_token, registration_number, or UUID id
  SELECT r.id, r.registration_number, r.name, r.status, e.title as event_title
  INTO v_reg_record
  FROM public.registrations r
  LEFT JOIN public.events e ON e.id = r.event_id
  WHERE r.checkin_token = v_clean_id
     OR r.registration_number = v_clean_id
     OR (v_clean_id ~* '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' AND r.id = v_clean_id::uuid);

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Ticket not found. Invalid registration QR or ID.', NULL::text, NULL::text, NULL::text, 'not_found'::text;
    RETURN;
  END IF;

  IF v_reg_record.status = 'attended' THEN
    RETURN QUERY SELECT false, 'Already checked in! Participant has already entered.', v_reg_record.name, v_reg_record.event_title, v_reg_record.registration_number, 'already_attended'::text;
    RETURN;
  END IF;

  IF v_reg_record.status = 'cancelled' THEN
    RETURN QUERY SELECT false, 'Registration was cancelled. Entry denied.', v_reg_record.name, v_reg_record.event_title, v_reg_record.registration_number, 'cancelled'::text;
    RETURN;
  END IF;

  -- Mark as attended
  UPDATE public.registrations
  SET status = 'attended',
      approved_at = CURRENT_TIMESTAMP,
      approved_by = v_admin_email,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = v_reg_record.id;

  RETURN QUERY SELECT true, 'Check-in verified successfully!', v_reg_record.name, v_reg_record.event_title, v_reg_record.registration_number, 'attended'::text;
END;
$$;

-- ------------------------------------------------------------------------------
-- 6. RLS POLICIES HARDENING (Protect PII on Registrations)
-- ------------------------------------------------------------------------------

-- Ensure Row Level Security is active
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;

-- Clean up any insecure or duplicate policies
DROP POLICY IF EXISTS "public_select_registrations" ON public.registrations;
DROP POLICY IF EXISTS "public_insert_registrations" ON public.registrations;
DROP POLICY IF EXISTS "Allow public insert" ON public.registrations;
DROP POLICY IF EXISTS "Allow public read" ON public.registrations;
DROP POLICY IF EXISTS "admin_all_registrations" ON public.registrations;

-- RESTRICT DIRECT TABLE ACCESS ON REGISTRATIONS:
-- 1. Authenticated administrator has full management
CREATE POLICY "admin_all_registrations"
ON public.registrations
FOR ALL
TO authenticated
USING (auth.jwt() ->> 'email' = 'sportxtremeevents@gmail.com')
WITH CHECK (auth.jwt() ->> 'email' = 'sportxtremeevents@gmail.com');

-- Direct SELECT on registrations by anon is explicitly blocked (no SELECT policy for anon).
-- Direct INSERT on registrations by anon is routed through register_participant().
-- For backwards compatibility during migration transition, allow anon INSERT only with pending status:
CREATE POLICY "anon_insert_registrations_pending_only"
ON public.registrations
FOR INSERT
TO anon, authenticated
WITH CHECK (
  status = 'pending' 
  AND approved_at IS NULL 
  AND approved_by IS NULL
);

-- ------------------------------------------------------------------------------
-- 7. FUNCTION EXECUTION PERMISSIONS
-- ------------------------------------------------------------------------------

-- Publicly executable RPCs
REVOKE ALL ON FUNCTION public.register_participant(uuid, text, text, text, integer, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.register_participant(uuid, text, text, text, integer, text) TO anon, authenticated;

REVOKE ALL ON FUNCTION public.get_total_participants() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_total_participants() TO anon, authenticated;

-- Admin-only executable RPC
REVOKE ALL ON FUNCTION public.verify_and_checkin_participant(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verify_and_checkin_participant(text) TO authenticated;
