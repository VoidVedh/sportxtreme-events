-- Fix RLS policy conflicts: separate public insert from admin management
-- The admin policies with FOR ALL were blocking public inserts

-- Drop all existing policies
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

-- Public INSERT policies (for anon/authenticated users with publishable key)
CREATE POLICY "Allow public insert contacts" ON public.contacts
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Allow public insert proposals" ON public.proposals
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Public SELECT policies (for anon/authenticated users)
CREATE POLICY "Allow public read events" ON public.events
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Allow public read gallery" ON public.gallery
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Allow public read testimonials" ON public.testimonials
  FOR SELECT TO anon, authenticated USING (true);

-- Admin policies (only for authenticated admin email, separate operations)
CREATE POLICY "Admins can select contacts" ON public.contacts 
  FOR SELECT TO authenticated USING (auth.jwt() ->> 'email' = 'sportxtremeevents@gmail.com');

CREATE POLICY "Admins can update contacts" ON public.contacts 
  FOR UPDATE TO authenticated USING (auth.jwt() ->> 'email' = 'sportxtremeevents@gmail.com');

CREATE POLICY "Admins can delete contacts" ON public.contacts 
  FOR DELETE TO authenticated USING (auth.jwt() ->> 'email' = 'sportxtremeevents@gmail.com');

CREATE POLICY "Admins can select proposals" ON public.proposals 
  FOR SELECT TO authenticated USING (auth.jwt() ->> 'email' = 'sportxtremeevents@gmail.com');

CREATE POLICY "Admins can update proposals" ON public.proposals 
  FOR UPDATE TO authenticated USING (auth.jwt() ->> 'email' = 'sportxtremeevents@gmail.com');

CREATE POLICY "Admins can delete proposals" ON public.proposals 
  FOR DELETE TO authenticated USING (auth.jwt() ->> 'email' = 'sportxtremeevents@gmail.com');

CREATE POLICY "Admins can insert events" ON public.events 
  FOR INSERT TO authenticated WITH CHECK (auth.jwt() ->> 'email' = 'sportxtremeevents@gmail.com');

CREATE POLICY "Admins can update events" ON public.events 
  FOR UPDATE TO authenticated USING (auth.jwt() ->> 'email' = 'sportxtremeevents@gmail.com');

CREATE POLICY "Admins can delete events" ON public.events 
  FOR DELETE TO authenticated USING (auth.jwt() ->> 'email' = 'sportxtremeevents@gmail.com');

CREATE POLICY "Admins can insert gallery" ON public.gallery 
  FOR INSERT TO authenticated WITH CHECK (auth.jwt() ->> 'email' = 'sportxtremeevents@gmail.com');

CREATE POLICY "Admins can update gallery" ON public.gallery 
  FOR UPDATE TO authenticated USING (auth.jwt() ->> 'email' = 'sportxtremeevents@gmail.com');

CREATE POLICY "Admins can delete gallery" ON public.gallery 
  FOR DELETE TO authenticated USING (auth.jwt() ->> 'email' = 'sportxtremeevents@gmail.com');

CREATE POLICY "Admins can insert testimonials" ON public.testimonials 
  FOR INSERT TO authenticated WITH CHECK (auth.jwt() ->> 'email' = 'sportxtremeevents@gmail.com');

CREATE POLICY "Admins can update testimonials" ON public.testimonials 
  FOR UPDATE TO authenticated USING (auth.jwt() ->> 'email' = 'sportxtremeevents@gmail.com');

CREATE POLICY "Admins can delete testimonials" ON public.testimonials 
  FOR DELETE TO authenticated USING (auth.jwt() ->> 'email' = 'sportxtremeevents@gmail.com');
