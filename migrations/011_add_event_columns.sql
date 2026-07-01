-- ============================================================
-- 011_add_event_columns.sql
-- Add missing registration_deadline and max_participants columns
-- and add unique constraint to prevent duplicate registrations.
-- ============================================================

-- 1. Add missing columns to public.events
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS registration_deadline timestamptz,
  ADD COLUMN IF NOT EXISTS max_participants integer;

-- 2. Add unique constraint to public.registrations to prevent duplicate registrations (email per event)
ALTER TABLE public.registrations
  ADD CONSTRAINT unique_event_email UNIQUE (event_id, email);
