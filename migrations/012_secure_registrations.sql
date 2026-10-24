-- ============================================================
-- 012_secure_registrations.sql
-- Hardening registrations table RLS and creating RPC functions
-- ============================================================

-- 1. Create SECURITY DEFINER RPC to safely register participants with server-side validations
CREATE OR REPLACE FUNCTION public.register_participant(
  p_event_id uuid,
  p_name text,
  p_email text,
  p_phone text,
  p_age integer,
  p_tshirt_size text
)
RETURNS TABLE (
  id uuid,
  registration_number text,
  created_at timestamptz
) SECURITY DEFINER AS $$
DECLARE
  v_reg_deadline date;
  v_max_participants integer;
  v_current_count integer;
  v_exists boolean;
  v_reg_id uuid;
  v_reg_num text;
  v_created_at timestamptz;
BEGIN
  -- Validate inputs
  IF p_name IS NULL OR trim(p_name) = '' THEN
    RAISE EXCEPTION 'Please enter your name.';
  END IF;
  IF p_email IS NULL OR trim(p_email) = '' OR p_email !~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$' THEN
    RAISE EXCEPTION 'Please enter a valid email address.';
  END IF;
  IF p_phone IS NULL OR trim(p_phone) = '' THEN
    RAISE EXCEPTION 'Please enter your phone number.';
  END IF;
  IF p_age IS NOT NULL AND (p_age < 1 OR p_age > 120) THEN
    RAISE EXCEPTION 'Please enter a valid age between 1 and 120.';
  END IF;
  IF p_tshirt_size IS NOT NULL AND p_tshirt_size NOT IN ('S', 'M', 'L', 'XL', 'XXL') THEN
    RAISE EXCEPTION 'Please select a valid T-shirt size.';
  END IF;

  -- 1. Get event details
  SELECT registration_deadline, max_participants
  INTO v_reg_deadline, v_max_participants
  FROM public.events
  WHERE public.events.id = p_event_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Event not found.';
  END IF;

  -- 2. Check registration deadline
  IF v_reg_deadline IS NOT NULL AND CURRENT_DATE > v_reg_deadline THEN
    RAISE EXCEPTION 'Registration for this event has closed (deadline passed).';
  END IF;

  -- 3. Check maximum participant limit
  IF v_max_participants IS NOT NULL THEN
    SELECT COUNT(*)::integer
    INTO v_current_count
    FROM public.registrations
    WHERE event_id = p_event_id;

    IF v_current_count >= v_max_participants THEN
      RAISE EXCEPTION 'Registration is full. Maximum participant limit reached.';
    END IF;
  END IF;

  -- 4. Check for duplicate registration (email per event)
  SELECT EXISTS (
    SELECT 1 FROM public.registrations
    WHERE event_id = p_event_id AND email = trim(p_email)
  ) INTO v_exists;

  IF v_exists THEN
    RAISE EXCEPTION 'You are already registered for this event with this email address.';
  END IF;

  -- 5. Insert registration record securely
  INSERT INTO public.registrations (
    event_id,
    name,
    email,
    phone,
    age,
    tshirt_size,
    status,
    qr_payload
  ) VALUES (
    p_event_id,
    trim(p_name),
    trim(p_email),
    trim(p_phone),
    p_age,
    p_tshirt_size,
    'pending',
    jsonb_build_object('name', trim(p_name), 'email', trim(p_email), 'phone', trim(p_phone))
  )
  RETURNING public.registrations.id, public.registrations.registration_number, public.registrations.created_at
  INTO v_reg_id, v_reg_num, v_created_at;

  RETURN QUERY SELECT v_reg_id, v_reg_num, v_created_at;
END;
$$ LANGUAGE plpgsql;

-- 2. Create SECURITY DEFINER RPC to fetch total registrations count safely
CREATE OR REPLACE FUNCTION public.get_total_participants()
RETURNS integer SECURITY DEFINER AS $$
BEGIN
  RETURN (SELECT COUNT(*)::integer FROM public.registrations);
END;
$$ LANGUAGE plpgsql;

-- 3. Recreate policies to restrict direct SELECT/INSERT from public (anon)
-- Drop existing public insert/select policies
DROP POLICY IF EXISTS "public_insert_registrations" ON public.registrations;
DROP POLICY IF EXISTS "public_select_registrations" ON public.registrations;
DROP POLICY IF EXISTS "admin_all_registrations" ON public.registrations;

-- Authenticated admins continue to have full master CRUD access
CREATE POLICY "admin_all_registrations"
ON public.registrations
FOR ALL
TO authenticated
USING (auth.jwt() ->> 'email' = 'sportxtremeevents@gmail.com')
WITH CHECK (auth.jwt() ->> 'email' = 'sportxtremeevents@gmail.com');

-- Minimum permission SELECT policy: replace anonymous select with admin-only select
CREATE POLICY "public_select_registrations"
ON public.registrations
FOR SELECT
TO authenticated
USING (auth.jwt() ->> 'email' = 'sportxtremeevents@gmail.com');
