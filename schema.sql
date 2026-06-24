-- Trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 1. contacts table
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

-- 2. proposals table
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

-- 3. events table
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

-- 4. gallery table
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

-- 5. testimonials table
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

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_events_sport ON public.events(sport);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON public.contacts(email);
CREATE INDEX IF NOT EXISTS idx_proposals_created_at ON public.proposals(created_at);

-- Enable RLS
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to prevent errors
DROP POLICY IF EXISTS "Allow public insert" ON public.contacts;
DROP POLICY IF EXISTS "Allow public insert" ON public.proposals;
DROP POLICY IF EXISTS "Allow public read" ON public.events;
DROP POLICY IF EXISTS "Allow public read" ON public.gallery;
DROP POLICY IF EXISTS "Allow public read" ON public.testimonials;
DROP POLICY IF EXISTS "Admins full management on contacts" ON public.contacts;
DROP POLICY IF EXISTS "Admins full management on proposals" ON public.proposals;
DROP POLICY IF EXISTS "Admins full management on events" ON public.events;
DROP POLICY IF EXISTS "Admins full management on gallery" ON public.gallery;
DROP POLICY IF EXISTS "Admins full management on testimonials" ON public.testimonials;

-- Public policies (explicit TO anon/authenticated for publishable key compatibility)
CREATE POLICY "Allow public insert" ON public.contacts
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Allow public insert" ON public.proposals
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Allow public read" ON public.events
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow public read" ON public.gallery FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON public.testimonials FOR SELECT USING (true);

-- Admin restrictions (restricted by auth email)
CREATE POLICY "Admins full management on contacts" ON public.contacts 
  FOR ALL TO authenticated USING (auth.jwt() ->> 'email' = 'sportxtremeevents@gmail.com');

CREATE POLICY "Admins full management on proposals" ON public.proposals 
  FOR ALL TO authenticated USING (auth.jwt() ->> 'email' = 'sportxtremeevents@gmail.com');

CREATE POLICY "Admins full management on events" ON public.events 
  FOR ALL TO authenticated USING (auth.jwt() ->> 'email' = 'sportxtremeevents@gmail.com');

CREATE POLICY "Admins full management on gallery" ON public.gallery 
  FOR ALL TO authenticated USING (auth.jwt() ->> 'email' = 'sportxtremeevents@gmail.com');

CREATE POLICY "Admins full management on testimonials" ON public.testimonials 
  FOR ALL TO authenticated USING (auth.jwt() ->> 'email' = 'sportxtremeevents@gmail.com');
