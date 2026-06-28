-- ============================================================
-- 008_complete_backend_setup.sql
-- SportXtreme Events — Complete Backend Setup
-- ============================================================
-- This migration ensures all tables required by the frontend exist
-- with proper RLS policies for both public and admin access.
-- 
-- Tables required by frontend:
-- 1. contacts - Contact form submissions
-- 2. proposals - Event proposals and sponsor inquiries
-- 3. events - Event listings
-- 4. gallery - Photo gallery
-- 5. testimonials - Client testimonials
-- 6. registrations - Event registrations (QR/ticket system)
-- ============================================================

-- Trigger function for updated_at timestamps
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================================
-- 1. CONTACTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.contacts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  phone text,
  email text NOT NULL,
  message text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE OR REPLACE TRIGGER update_contacts_modtime 
BEFORE UPDATE ON public.contacts 
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- ============================================================
-- 2. PROPOSALS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.proposals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name text,
  event_type text,
  participants text,
  budget text,
  description text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE OR REPLACE TRIGGER update_proposals_modtime 
BEFORE UPDATE ON public.proposals 
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- ============================================================
-- 3. EVENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  category text NOT NULL,
  sport text NOT NULL,
  description text,
  location text,
  participants text,
  event_date date,
  image_url text,
  status text DEFAULT 'upcoming',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE OR REPLACE TRIGGER update_events_modtime 
BEFORE UPDATE ON public.events 
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- ============================================================
-- 4. GALLERY TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.gallery (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  url text NOT NULL,
  caption text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE OR REPLACE TRIGGER update_gallery_modtime 
BEFORE UPDATE ON public.gallery 
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- ============================================================
-- 5. TESTIMONIALS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.testimonials (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  role text,
  text text NOT NULL,
  stars integer DEFAULT 5 CHECK (stars >= 1 AND stars <= 5),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE OR REPLACE TRIGGER update_testimonials_modtime 
BEFORE UPDATE ON public.testimonials 
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- ============================================================
-- 6. REGISTRATIONS TABLE (for QR/ticket system)
-- ============================================================
-- Create sequence for human-readable registration numbers
CREATE SEQUENCE IF NOT EXISTS public.registration_number_seq START 10000;

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
  approved_by text,
  created_at timestamptz DEFAULT timezone('utc', now()) NOT NULL,
  updated_at timestamptz DEFAULT timezone('utc', now()) NOT NULL
);

CREATE OR REPLACE TRIGGER update_registrations_modtime 
BEFORE UPDATE ON public.registrations 
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_events_sport ON public.events(sport);
CREATE INDEX IF NOT EXISTS idx_events_category ON public.events(category);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON public.contacts(email);
CREATE INDEX IF NOT EXISTS idx_proposals_created_at ON public.proposals(created_at);
CREATE INDEX IF NOT EXISTS idx_registrations_event_id ON public.registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_number ON public.registrations(registration_number);

-- ============================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- DROP EXISTING POLICIES (idempotent)
-- ============================================================
-- Contacts policies
DROP POLICY IF EXISTS "Allow public insert contacts" ON public.contacts;
DROP POLICY IF EXISTS "Admins can select contacts" ON public.contacts;
DROP POLICY IF EXISTS "Admins can update contacts" ON public.contacts;
DROP POLICY IF EXISTS "Admins can delete contacts" ON public.contacts;
DROP POLICY IF EXISTS "Admins full management on contacts" ON public.contacts;

-- Proposals policies
DROP POLICY IF EXISTS "Allow public insert proposals" ON public.proposals;
DROP POLICY IF EXISTS "Admins can select proposals" ON public.proposals;
DROP POLICY IF EXISTS "Admins can update proposals" ON public.proposals;
DROP POLICY IF EXISTS "Admins can delete proposals" ON public.proposals;
DROP POLICY IF EXISTS "Admins full management on proposals" ON public.proposals;

-- Events policies
DROP POLICY IF EXISTS "Allow public read events" ON public.events;
DROP POLICY IF EXISTS "Admins can insert events" ON public.events;
DROP POLICY IF EXISTS "Admins can update events" ON public.events;
DROP POLICY IF EXISTS "Admins can delete events" ON public.events;
DROP POLICY IF EXISTS "Admins full management on events" ON public.events;

-- Gallery policies
DROP POLICY IF EXISTS "Allow public read gallery" ON public.gallery;
DROP POLICY IF EXISTS "Admins can insert gallery" ON public.gallery;
DROP POLICY IF EXISTS "Admins can update gallery" ON public.gallery;
DROP POLICY IF EXISTS "Admins can delete gallery" ON public.gallery;
DROP POLICY IF EXISTS "Admins full management on gallery" ON public.gallery;

-- Testimonials policies
DROP POLICY IF EXISTS "Allow public read testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Admins can insert testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Admins can update testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Admins can delete testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Admins full management on testimonials" ON public.testimonials;

-- Registrations policies
DROP POLICY IF EXISTS "public_insert_registrations" ON public.registrations;
DROP POLICY IF EXISTS "public_select_registrations" ON public.registrations;
DROP POLICY IF EXISTS "admin_all_registrations" ON public.registrations;

-- ============================================================
-- PUBLIC POLICIES (for anon/authenticated with publishable key)
-- ============================================================

-- Contacts: Public can INSERT (contact form)
CREATE POLICY "Allow public insert contacts" ON public.contacts
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Proposals: Public can INSERT (proposal form, sponsor form)
CREATE POLICY "Allow public insert proposals" ON public.proposals
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Events: Public can SELECT (event listings)
CREATE POLICY "Allow public read events" ON public.events
  FOR SELECT TO anon, authenticated USING (true);

-- Gallery: Public can SELECT (gallery display)
CREATE POLICY "Allow public read gallery" ON public.gallery
  FOR SELECT TO anon, authenticated USING (true);

-- Testimonials: Public can SELECT (testimonials display)
CREATE POLICY "Allow public read testimonials" ON public.testimonials
  FOR SELECT TO anon, authenticated USING (true);

-- Registrations: Public can INSERT (registration form)
CREATE POLICY "public_insert_registrations" ON public.registrations
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- ============================================================
-- ADMIN POLICIES (for authenticated admin email only)
-- ============================================================

-- Contacts: Admin can SELECT, UPDATE, DELETE
CREATE POLICY "Admins can select contacts" ON public.contacts 
  FOR SELECT TO authenticated USING (auth.jwt() ->> 'email' = 'sportxtremeevents@gmail.com');

CREATE POLICY "Admins can update contacts" ON public.contacts 
  FOR UPDATE TO authenticated USING (auth.jwt() ->> 'email' = 'sportxtremeevents@gmail.com');

CREATE POLICY "Admins can delete contacts" ON public.contacts 
  FOR DELETE TO authenticated USING (auth.jwt() ->> 'email' = 'sportxtremeevents@gmail.com');

-- Proposals: Admin can SELECT, UPDATE, DELETE
CREATE POLICY "Admins can select proposals" ON public.proposals 
  FOR SELECT TO authenticated USING (auth.jwt() ->> 'email' = 'sportxtremeevents@gmail.com');

CREATE POLICY "Admins can update proposals" ON public.proposals 
  FOR UPDATE TO authenticated USING (auth.jwt() ->> 'email' = 'sportxtremeevents@gmail.com');

CREATE POLICY "Admins can delete proposals" ON public.proposals 
  FOR DELETE TO authenticated USING (auth.jwt() ->> 'email' = 'sportxtremeevents@gmail.com');

-- Events: Admin can INSERT, SELECT, UPDATE, DELETE
CREATE POLICY "Admins can insert events" ON public.events 
  FOR INSERT TO authenticated WITH CHECK (auth.jwt() ->> 'email' = 'sportxtremeevents@gmail.com');

CREATE POLICY "Admins can update events" ON public.events 
  FOR UPDATE TO authenticated USING (auth.jwt() ->> 'email' = 'sportxtremeevents@gmail.com');

CREATE POLICY "Admins can delete events" ON public.events 
  FOR DELETE TO authenticated USING (auth.jwt() ->> 'email' = 'sportxtremeevents@gmail.com');

-- Gallery: Admin can INSERT, SELECT, UPDATE, DELETE
CREATE POLICY "Admins can insert gallery" ON public.gallery 
  FOR INSERT TO authenticated WITH CHECK (auth.jwt() ->> 'email' = 'sportxtremeevents@gmail.com');

CREATE POLICY "Admins can update gallery" ON public.gallery 
  FOR UPDATE TO authenticated USING (auth.jwt() ->> 'email' = 'sportxtremeevents@gmail.com');

CREATE POLICY "Admins can delete gallery" ON public.gallery 
  FOR DELETE TO authenticated USING (auth.jwt() ->> 'email' = 'sportxtremeevents@gmail.com');

-- Testimonials: Admin can INSERT, SELECT, UPDATE, DELETE
CREATE POLICY "Admins can insert testimonials" ON public.testimonials 
  FOR INSERT TO authenticated WITH CHECK (auth.jwt() ->> 'email' = 'sportxtremeevents@gmail.com');

CREATE POLICY "Admins can update testimonials" ON public.testimonials 
  FOR UPDATE TO authenticated USING (auth.jwt() ->> 'email' = 'sportxtremeevents@gmail.com');

CREATE POLICY "Admins can delete testimonials" ON public.testimonials 
  FOR DELETE TO authenticated USING (auth.jwt() ->> 'email' = 'sportxtremeevents@gmail.com');

-- Registrations: Admin has full access
CREATE POLICY "admin_all_registrations" ON public.registrations
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'email' = 'sportxtremeevents@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'sportxtremeevents@gmail.com');

-- ============================================================
-- SECURITY DEFINER FUNCTION FOR CERTIFICATE VERIFICATION
-- ============================================================
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

-- ============================================================
-- SEED DEMO DATA (if tables are empty)
-- ============================================================

-- Seed events if empty
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.events LIMIT 1) THEN
    INSERT INTO public.events (title, category, sport, description, location, participants, event_date, status) VALUES
    ('Mumbai Corporate Cricket League', 'CORPORATE', 'Cricket', 'Annual corporate cricket tournament featuring 32 companies across Mumbai', 'Mumbai, Maharashtra', '500+', '2025-03-15', 'upcoming'),
    ('SportXtreme City Marathon 2025', 'MARATHON', 'Running', 'City-wide marathon with 21K and 42K categories attracting elite runners', 'Mumbai, Maharashtra', '2,500+', '2025-04-20', 'upcoming'),
    ('Inter-School Sports Championship', 'SCHOOL', 'Multi-Sport', 'Multi-sport championship for schools across Mumbai with 8 different sports', 'Mumbai, Maharashtra', '1,200+', '2025-02-10', 'upcoming'),
    ('Football Super League Mumbai', 'LEAGUE', 'Football', 'Competitive football league with 16 teams competing for the championship title', 'Mumbai, Maharashtra', '800+', '2025-05-01', 'upcoming'),
    ('Western Mumbai Cyclothon', 'CYCLING', 'Cycling', 'Inaugural cycling event covering scenic routes across Western Mumbai', 'Mumbai, Maharashtra', '3,000+', '2025-06-15', 'upcoming'),
    ('Corporate Swim Challenge', 'AQUATIC', 'Swimming', 'Corporate swimming competition with relay and individual events', 'Mumbai, Maharashtra', '400+', '2025-07-20', 'upcoming');
  END IF;
END $$;

-- Seed testimonials if empty
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.testimonials LIMIT 1) THEN
    INSERT INTO public.testimonials (name, role, text, stars) VALUES
    ('Rajesh Kumar', 'HR Director, TechCorp', 'SportXtreme managed our annual sports day flawlessly. The coordination was exceptional and our employees had a fantastic time.', 5),
    ('Priya Sharma', 'School Principal', 'The inter-school championship was professionally organized. Every detail was taken care of, from registration to awards.', 5),
    ('Amit Patel', 'Event Coordinator', 'Best sports event management company we have worked with. Their team is responsive and delivers on promises.', 5);
  END IF;
END $$;
