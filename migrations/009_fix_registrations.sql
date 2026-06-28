-- ============================================================
-- 009_fix_registrations.sql
-- SportXtreme Events — Ensure registrations table, indexes, and correct RLS policies exist
-- ============================================================

-- 1. Create a sequence for human-readable registration numbers
CREATE SEQUENCE IF NOT EXISTS public.registration_number_seq START 10000;

-- 2. Create registrations table if not exists
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

-- 3. Enable RLS
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- 4. Clean recreate policies
DROP POLICY IF EXISTS "public_insert_registrations" ON public.registrations;
DROP POLICY IF EXISTS "public_select_registrations" ON public.registrations;
DROP POLICY IF EXISTS "admin_all_registrations" ON public.registrations;

-- Public users can INSERT registrations (for registration form)
CREATE POLICY "public_insert_registrations"
ON public.registrations
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Public users can SELECT registrations (needed for select returning after insert)
CREATE POLICY "public_select_registrations"
ON public.registrations
FOR SELECT
TO anon, authenticated
USING (true);

-- Authenticated admins have full master CRUD access
CREATE POLICY "admin_all_registrations"
ON public.registrations
FOR ALL
TO authenticated
USING (auth.jwt() ->> 'email' = 'sportxtremeevents@gmail.com')
WITH CHECK (auth.jwt() ->> 'email' = 'sportxtremeevents@gmail.com');

-- 5. Create indexes if missing
CREATE INDEX IF NOT EXISTS idx_registrations_event_id ON public.registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_number ON public.registrations(registration_number);

-- 6. Trigger for updated_at modtime
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_registrations_modtime ON public.registrations;
CREATE TRIGGER update_registrations_modtime
  BEFORE UPDATE ON public.registrations
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();
