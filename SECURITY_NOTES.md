# Security Vulnerabilities & Remediation Notes
**Repository:** VoidVedh/sportxtreme-events  
**Branch:** `hardening/quality-pass`  
**Date:** October 2026  

---

## 1. Identified Risks & Hardening Summary

### Risk 1: Registrations Table PII Exposure (High Severity)
- **Vulnerability:** Under previous policy `public_select_registrations`, anonymous visitors (`anon` role) had unrestricted `SELECT` permission on the `registrations` table. Any automated bot or malicious actor could issue a query:
  ```javascript
  const { data } = await supabase.from("registrations").select("*");
  ```
  and exfiltrate personal identifiable information (full athlete names, email addresses, phone numbers, ages, and T-shirt sizes).
- **Remediation:**
  1. Revoked `public_select_registrations` from `anon` in [`migrations/013_harden_security_and_thumbnails.sql`](file:///Users/ved/Documents/sport/migrations/013_harden_security_and_thumbnails.sql).
  2. Routed participant onboarding through a `SECURITY DEFINER` stored procedure (`register_participant`) with `SET search_path = public, pg_temp`.
  3. The procedure validates inputs server-side and returns **only** the newly created registration's `id`, `registration_number`, `created_at`, and `checkin_token`.
- **Manual Verification Steps:**
  - In browser devtools or test script using the public anon key:
    ```javascript
    const { data, error } = await supabase.from("registrations").select("*");
    console.log(data); // Must return empty array [] or permission denied error. Zero PII returned.
    ```

---

### Risk 2: Client-Controlled Status & QR Payload Injection (Medium Severity)
- **Vulnerability:** When inserting directly from the client, a malicious user could submit `{ status: 'attended' }` or forge arbitrary `qr_payload` contents.
- **Remediation:**
  1. Database column `status` defaults to `'pending'`.
  2. The `register_participant` RPC hardcodes `status = 'pending'`, ignores client status requests, and cryptographically generates a unique random check-in token (`v_checkin_token := encode(gen_random_bytes(16), 'hex')`).
  3. Gate check-in uses server-side verification (`verify_and_checkin_participant`) that matches tokens and status against the database.
- **Manual Verification Steps:**
  - Submit registration via the UI or RPC. Observe database row: `status` is guaranteed `'pending'`, `approved_at` is `NULL`, `approved_by` is `NULL`.

---

### Risk 3: Unlimited Submission & Spam Payload Flooding (Low/Medium Severity)
- **Vulnerability:** Public tables `contacts` and `proposals` allowed unbounded text inputs, making them vulnerable to database storage bloat or bot spam.
- **Remediation:**
  1. Added database `CHECK` constraints on `contacts` and `proposals` limiting `name <= 100`, `email <= 120`, `phone <= 30`, and `message/description <= 3000`.
  2. Client forms now include a hidden honeypot input field (`hp_website`). If filled by a bot, submission is silently rejected without database invocation.
- **Manual Verification Steps:**
  - In Supabase SQL editor:
    ```sql
    -- Attempting oversized text will fail with constraint violation:
    INSERT INTO public.contacts (name, email, message) 
    VALUES ('Valid Name', 'valid@email.com', repeat('A', 5000));
    -- Result: ERROR: new row for relation "contacts" violates check constraint "chk_contacts_message_len"
    ```

---

### Risk 4: Missing Search Path on Security Definer Functions (Medium Severity)
- **Vulnerability:** Functions created with `SECURITY DEFINER` without an explicit `SET search_path` are vulnerable to search-path hijacking in multi-schema environments.
- **Remediation:**
  - Appended `SET search_path = public, pg_temp` to all `SECURITY DEFINER` functions (`register_participant`, `get_total_participants`, `verify_and_checkin_participant`).
