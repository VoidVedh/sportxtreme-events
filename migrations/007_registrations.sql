-- ============================================================
-- 007_registrations.sql
-- SportXtreme Events — Create registrations table and policies
-- ============================================================

-- Create a sequence for human-readable registration numbers
CREATE SEQUENCE IF NOT EXISTS public.registration_number_seq START 10000;

-- Create registrations table
CREATE TABLE IF NOT EXISTS public.registrations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  registration_number text UNIQUE DEFAULT 'REG-' || nextval('public.registration_number_seq'::regclass),
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  age integer,
  tshirt_size text CHECK (tshirt_size IN ('S', 'M', 'L', 'XL', 'XXL')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'attended', 'cancelled')),
  qr_payload jsonb,
  approved_at timestamptz,
  approved_by text, -- admin email
  created_at timestamptz DEFAULT timezone('utc', now()) NOT NULL,
  updated_at timestamptz DEFAULT timezone('utc', now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Clean recreate policies
DROP POLICY IF EXISTS "public_insert_registrations" ON public.registrations;
DROP POLICY IF EXISTS "public_select_registrations" ON public.registrations;
DROP POLICY IF EXISTS "admin_all_registrations" ON public.registrations;

-- Public users can only INSERT registrations (cannot select)
CREATE POLICY "public_insert_registrations"
ON public.registrations
AS PERMISSIVE
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Authenticated admins have full master CRUD access
CREATE POLICY "admin_all_registrations"
ON public.registrations
AS PERMISSIVE
FOR ALL
TO authenticated
USING (auth.jwt() ->> 'email' = 'sportxtremeevents@gmail.com')
WITH CHECK (auth.jwt() ->> 'email' = 'sportxtremeevents@gmail.com');

-- SECURITY DEFINER RPC to safely verify registrations for certificate generation without leaking personal data
CREATE OR REPLACE FUNCTION verify_registration_for_certificate(reg_id uuid)
RETURNS TABLE (
  registration_number text,
  participant_name text,
  event_title text,
  event_date date,
  status text
) SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.registration_number,
    r.name,
    e.title,
    e.event_date,
    r.status
  FROM public.registrations r
  JOIN public.events e ON e.id = r.event_id
  WHERE r.id = reg_id AND r.status = 'attended';
END;
$$ LANGUAGE plpgsql;
