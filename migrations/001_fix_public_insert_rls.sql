-- Fix public INSERT policies for contacts and proposals.
-- Root cause: policies without explicit TO anon/authenticated may not apply to
-- requests authenticated with Supabase publishable (sb_publishable_*) keys.

DROP POLICY IF EXISTS "Allow public insert" ON public.contacts;
DROP POLICY IF EXISTS "Allow public insert" ON public.proposals;

CREATE POLICY "Allow public insert" ON public.contacts
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public insert" ON public.proposals
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Ensure events remain publicly readable (verify-only; idempotent)
DROP POLICY IF EXISTS "Allow public read" ON public.events;
CREATE POLICY "Allow public read" ON public.events
  FOR SELECT
  TO anon, authenticated
  USING (true);
