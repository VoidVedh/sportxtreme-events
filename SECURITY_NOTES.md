# Security Vulnerabilities & Remediation Notes
**Repository:** VoidVedh/sportxtreme-events  
**Branch:** `hardening/quality-pass`  
**Date:** October 2026  

---

## 1. Migration Staging Plan (Two-Step Application)

To guarantee zero downtime and prevent breaking active registrations during deployment, database changes are split into two numbered migrations:

1. **[`migrations/013_additive.sql`](file:///Users/ved/Documents/sport/migrations/013_additive.sql) (Apply FIRST)**
   - Fully additive and non-breaking.
   - Creates `admin_users` table and `public.is_admin()` security definer function.
   - Adds columns: `events.registration_deadline`, `events.max_participants`, `gallery.thumbnail_url`, `registrations.checkin_token`.
   - Creates hardened RPCs: `register_participant` (encapsulated registration with full capacity/deadline/duplicate checks) and `verify_and_checkin_participant` (idempotent check-in).
   - Does NOT drop or alter any existing policies. Safe to apply while legacy client code is running.

2. **[`migrations/014_restrict.sql`](file:///Users/ved/Documents/sport/migrations/014_restrict.sql) (Apply ONLY AFTER new client is live)**
   - Hard policy lockdown.
   - Completely revokes direct `SELECT` and direct `INSERT` on `public.registrations` from the `anon` role (preventing any PII exfiltration).
   - Replaces all legacy hardcoded email checks (`sportxtremeevents@gmail.com`) and loose `authenticated` checks with `public.is_admin()`.
   - Locks down storage mutations on the `gallery` bucket to verified admins only.

---

## 2. Identified Risks & Remediations

### Risk 1: Registrations Table PII Exposure (High Severity)
- **Vulnerability:** Under previous policies, anonymous visitors (`anon` role) could query `SELECT * FROM registrations;` and exfiltrate all participant personal identifiable information (full names, phone numbers, email addresses, ages, and T-shirt sizes).
- **Remediation:** Direct `SELECT` permission is completely revoked from `anon` in `014_restrict.sql`. Public registration onboarding is routed through the `SECURITY DEFINER` stored procedure `register_participant()`. This procedure returns **only** the ticket credentials (`registration_id`, `registration_number`, `check_in_token`) to the participant who just registered.

### Risk 2: Arbitrary Status & Check-In Payload Injection (Medium Severity)
- **Vulnerability:** Unrestricted direct client inserts allowed attackers to set `{ status: 'attended' }` or forge arbitrary ticket payloads.
- **Remediation:** 
  1. `register_participant()` hardcodes `status = 'pending'` and ignores client-supplied statuses.
  2. The procedure generates an opaque, cryptographically random check-in token (`encode(gen_random_bytes(16), 'hex')`).
  3. Gate check-in uses server-side verified `verify_and_checkin_participant()` which validates the token against the database and is idempotent (already checked-in tickets return a stable status with zero repeat mutations).

### Risk 3: Admin Authorization & Threat of Public Signups (High Severity)
- **Vulnerability:** Previous admin policies permitted any authenticated user (`TO authenticated`) or checked a hardcoded email string. If public signups are left open in Supabase Auth, any stranger could create an account and immediately gain full admin write access to events, gallery, and registrations.
- **Remediation:**
  1. Replaced with `public.admin_users` table and `public.is_admin()` function.
  2. **MANDATORY SUPABASE CONFIGURATION:** Public signups MUST be disabled in the Supabase Dashboard:
     - Navigate to **Authentication -> Providers -> Email**.
     - Turn **OFF** `"Enable Sign up"`.
     - Administrator accounts must be created manually by the database owner via Supabase Dashboard or invited via email.

### Risk 4: Unbounded Inquiries & Denial-of-Service (Medium Severity)
- **Vulnerability:** Public submission tables `contacts` and `proposals` allowed unbounded payloads.
- **Remediation:** Added database-level `CHECK` constraints limiting `name <= 100`, `email <= 120`, `phone <= 30`, and `message/description <= 3000`. Forms implement hidden honeypot fields (`hp_website` and `reg_hp`) to drop automated bot submissions.

### Risk 5: Missing Search Path on Security Definer Functions (Medium Severity)
- **Vulnerability:** Security Definer functions without an explicit search path can be hijacked via schema shadowing.
- **Remediation:** Added `SET search_path = public, pg_temp` to all functions (`register_participant`, `verify_and_checkin_participant`, `is_admin`, `get_total_participants`).

---

## 3. SQL Role Verification Script

An automated role-based verification script is provided at [`tests/auth_matrix_test.sql`](file:///Users/ved/Documents/sport/tests/auth_matrix_test.sql).

### How to Run:
1. Open Supabase Dashboard: **SQL Editor**.
2. Paste the contents of [`tests/auth_matrix_test.sql`](file:///Users/ved/Documents/sport/tests/auth_matrix_test.sql).
3. Click **Run**.
4. The script executes within a rolled-back transaction and reports results for all 3 personas:
   - `anon`: Verifies `registrations` returns 0 rows, event creation fails, public events readable.
   - `authenticated non-admin`: Verifies `is_admin()` returns false, event mutations blocked, registration access blocked.
   - `authenticated admin`: Verifies `is_admin()` returns true, admin tables accessible, check-in RPC operates with stable codes.
