# Comprehensive Security, Performance & Architecture Audit
**Repository:** VoidVedh/sportxtreme-events  
**Branch:** `hardening/quality-pass`  
**Date:** October 2026  
**Auditor:** Senior Full-Stack Engineer  

---

## 1. Executive Summary
This audit provides an exhaustive evaluation of security, data integrity, schema consistency, performance, and SEO across the SportXtreme Events platform. The project stack consists of React 18, Vite, React Router v7, and Supabase (PostgreSQL + PostgREST + Storage + Auth), deployed on Vercel.

---

## 2. Table, RPC & Storage Matrix (Access Control & RLS)

| Entity | Caller in Code | Current Permissions (RLS) | Anon Allowed Operations | Authenticated Allowed Operations | Security Risk / Finding |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`events`** | `useEvents.js`<br>`RegisterPage.jsx`<br>`Stats.jsx`<br>`AdminDashboard.jsx` | `public_select_events`<br>`admin_all_events` | `SELECT` | `SELECT`<br>`INSERT`, `UPDATE`, `DELETE` (if admin email matches) | **LOW RISK**: Public read is expected. Admin mutations are gated by email check `auth.jwt() ->> 'email' = 'sportxtremeevents@gmail.com'`. |
| **`gallery`** | `GalleryPage.jsx`<br>`Home.jsx`<br>`GalleryPreview.jsx`<br>`Stats.jsx`<br>`AdminDashboard.jsx` | `public_select_gallery`<br>`admin_all_gallery` | `SELECT` | `SELECT`<br>`INSERT`, `UPDATE`, `DELETE` (if admin email matches) | **LOW RISK**: Public read is expected. Images are loaded via public bucket. |
| **`registrations`** | `RegisterPage.jsx`<br>`AdminDashboard.jsx` | `public_insert_registrations`<br>`public_select_registrations`<br>`admin_all_registrations` | `SELECT` ⚠️<br>`INSERT` | `SELECT`<br>`INSERT`<br>`UPDATE`, `DELETE` (if admin email matches) | **CRITICAL RISK (PII Leak)**: Under `009_fix_registrations.sql`, `public_select_registrations` permits `anon` to `SELECT` all rows. Anyone can scrape athlete names, phone numbers, emails, ages, and registration numbers! |
| **`contacts`** | `EnquiryForm.jsx`<br>`Contact.jsx`<br>`AdminDashboard.jsx` | `Allow public insert`<br>`Admins full management` | `INSERT` | `INSERT`<br>`SELECT`, `UPDATE`, `DELETE` (if admin email matches) | **MEDIUM RISK**: No database-level length or rate checks on `contacts`. Anon could spam arbitrary text. |
| **`proposals`** | `Contact.jsx`<br>`SponsorModal.jsx`<br>`AdminDashboard.jsx` | `Allow public insert`<br>`Admins full management` | `INSERT` | `INSERT`<br>`SELECT`, `UPDATE`, `DELETE` (if admin email matches) | **MEDIUM RISK**: Same as `contacts`; missing field length CHECK constraints. |
| **`testimonials`** | `Testimonials.jsx`<br>`AdminDashboard.jsx` | `public_select_testimonials`<br>`admin_all_testimonials` | `SELECT` | `SELECT`<br>`INSERT`, `UPDATE`, `DELETE` (if admin email matches) | **LOW RISK**: Read-only public reviews. |
| **Storage: `gallery`** | `AdminDashboard.jsx` (upload/remove)<br>All public pages (GET images) | `public_read_gallery_storage`<br>`admin_insert_gallery_storage`<br>`admin_delete_gallery_storage` | `SELECT` (read) | `SELECT`<br>`INSERT`, `DELETE` (if admin email matches) | **LOW RISK**: Properly gated. However, image uploads in admin currently upload only 1 high-resolution asset without thumbnail generation. |
| **RPC: `register_participant`** | `RegisterPage.jsx` | Defined in `012_secure_registrations.sql` (unapplied) | N/A (unapplied) | N/A (unapplied) | **PENDING**: Must be deployed to encapsulate registration logic and remove direct `anon` table access. |
| **RPC: `get_total_participants`**| `Stats.jsx` | Defined in `012_secure_registrations.sql` (unapplied) | N/A (unapplied) | N/A (unapplied) | **PENDING**: Needed for safe aggregate metrics without exposing PII. |

---

## 3. Schema Drift Analysis

### A. Column Inventory & Comparison

| Table | Column Name | In Live Database? | In `schema.sql`? | In `migrations/`? | Used in Frontend Code? | Status & Recommended Resolution |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `events` | `id` | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | Aligned. |
| `events` | `title` | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | Aligned. |
| `events` | `category` | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | Aligned. |
| `events` | `sport` | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | Aligned. |
| `events` | `description` | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | Aligned. |
| `events` | `location` | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | Aligned. |
| `events` | `participants` | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | Aligned. |
| `events` | `event_date` | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | Aligned. |
| `events` | `image_url` | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | Aligned. |
| `events` | `status` | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | Aligned. |
| `events` | `registration_deadline` | ❌ **NO** | ❌ No | ✅ In `011` | ✅ In `AdminDashboard.jsx:368` | **DRIFT**: Admin dashboard writes it; code expects it. **Action**: Apply `011` / add column in new migration. |
| `events` | `max_participants` | ❌ **NO** | ❌ No | ✅ In `011` | ✅ In `AdminDashboard.jsx:371` | **DRIFT**: Admin dashboard writes it; RPC needs it for capacity limit. **Action**: Apply `011` / add column in new migration. |
| `gallery` | `thumbnail_url` | ❌ **NO** | ❌ No | ❌ No | ❌ Planned (Phase 2) | **NEW NEED**: Required for lightweight gallery grid loading. **Action**: Add via migration `013`. |
| `gallery` | `category` | ✅ Yes | ❌ No | ✅ In `010` | ✅ Yes | Applied on live DB, missing from master `schema.sql`. |
| `gallery` | `event_name` | ✅ Yes | ❌ No | ✅ In `010` | ✅ Yes | Applied on live DB, missing from master `schema.sql`. |
| `gallery` | `storage_path` | ✅ Yes | ❌ No | ✅ In `010` | ✅ Yes | Applied on live DB, missing from master `schema.sql`. |
| `registrations`| `*` (entire table) | ✅ Yes | ❌ **NO** | ✅ In `007`, `008`, `009` | ✅ Yes | Table exists in live DB and migrations, completely missing from `schema.sql`. |
| `registrations`| `unique_event_email` | ❌ **NO** | ❌ No | ✅ In `011` | ❌ Code catches duplicates | Constraint was defined in `011` but unapplied. |

---

## 4. Inspection Queries for User Execution
Run the following SQL queries in the **Supabase SQL Editor** to view the live policies and column definitions:

```sql
-- 1. Inspect all active RLS policies in public schema
SELECT tablename, policyname, cmd, roles, qual, with_check 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY 1, 2;

-- 2. Inspect all actual columns, types, and nullability
SELECT table_name, column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_schema = 'public' 
ORDER BY 1, ordinal_position;
```

---

## 5. Security Vulnerability Assessment & Mitigation Plan

### Issue 1: Public SELECT on Registrations Table (CRITICAL)
- **Problem:** Currently, any anonymous client sending `supabase.from("registrations").select("*")` can read all registrant PII (names, emails, phone numbers, ages).
- **Remediation:**
  1. Revoke public `SELECT` on `public.registrations`.
  2. Implement `public.register_participant(...)` as a `SECURITY DEFINER` function with `SET search_path = public`.
  3. The function returns ONLY `id`, `registration_number`, and `created_at`.
  4. Revoke direct `INSERT` on `public.registrations` from `anon` once the RPC is in place.

### Issue 2: Hardcoded Admin Email in Policies vs JWT Role (MEDIUM)
- **Problem:** Policies use `auth.jwt() ->> 'email' = 'sportxtremeevents@gmail.com'`. If the admin email changes, or if additional coordinators are added, every policy breaks.
- **Remediation:** Retain the current check for 100% backward compatibility, but create an idempotent admin function `public.is_admin()` that checks both email and `app_metadata ->> 'role' = 'admin'`.

### Issue 3: Missing Honeypot & Length Limits on Contacts/Enquiries (MEDIUM)
- **Problem:** Public spam bots can send massive payloads to `contacts` and `proposals`.
- **Remediation:**
  1. Add client honeypot field (`hp_website`).
  2. Add database `CHECK` constraints on `contacts` and `proposals` restricting string lengths (`name <= 100`, `email <= 100`, `phone <= 30`, `message <= 2000`).

---

## 6. Performance & Asset Delivery Findings
1. **Initial Bundle Size:** Reduced to **466 kB** (131 kB gzip) by code-splitting `AdminDashboard`.
2. **Gallery Image Weights:** 37 WebP images are currently ~360 kB each. Loading 37 full-sized images in the grid consumes over 13 MB bandwidth!
   - **Fix:** Implement responsive dual-upload (thumbnail ~600px, max 120 kB + full ~1600px, max 200 kB). Use lazy loading, decoding async, and grid pagination (12 per page with "Load More").
3. **HTTP Caching in Vercel:** Static immutable cache headers are configured for `/assets/(.*)`. Need to ensure CSP does not block QR generation or Supabase Storage.

---

## 7. SEO & Metadata Deficiencies
1. **Single Head Bug:** All pages previously shared `index.html` static meta tags pointing to `https://sportxtreme.com/`.
2. **Missing Canonical Matching:** Routes need self-referencing canonicals using dynamic origin/environment variable `VITE_SITE_URL`.
3. **Structured Data:** Schema.org `SportsEvent` JSON-LD is missing for event pages.
