# SportXtreme Events

SportXtreme Events is a professional sports event management platform built with React 18, Vite 5, React Router v7, and Supabase. Deployed at [sportxtreme-events.vercel.app](https://sportxtreme-events.vercel.app).

---

## ⚠️ Critical Rule: Safe Database Practices

> **NEVER run write operations (insert, update, delete, mutating RPCs, or storage uploads) against the production Supabase database.**
> All local testing that mutates data must run against a local Supabase CLI instance or a dedicated development project. Read-only checks (`SELECT`) against production are permissible.

---

## Getting Started

### 1. Prerequisites
- Node.js 18+ (tested with Node 20 / 22)
- npm 9+

### 2. Installation
```bash
git clone https://github.com/VoidVedh/sportxtreme-events.git
cd sportxtreme-events
git checkout hardening/quality-pass
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env.local` or `.env`:
```bash
cp .env.example .env.local
```

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `VITE_SITE_URL` | Canonical origin used for SEO, sitemaps, OpenGraph | `https://sportxtreme-events.vercel.app` |
| `VITE_SUPABASE_URL` | Supabase project API gateway | `https://your-project-ref.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase Anon Key (never use `service_role` in frontend) | `eyJhbGci...` |
| `VITE_ADMIN_EMAIL` | Admin login email credential | `admin@sportxtreme.com` |
| `VITE_ADMIN_PASSWORD` | Admin login password credential | `********` |
| `TEST_URL` | Target server URL for Playwright smoke tests | `http://127.0.0.1:4173` |

---

## Database Migrations

All schema modifications are tracked as idempotent, numbered SQL files in `migrations/`.

### Migration Application Order:
1. `migrations/001_create_events.sql`
2. `migrations/002_create_gallery.sql`
3. `migrations/003_create_testimonials.sql`
4. `migrations/004_create_contacts.sql`
5. `migrations/005_create_proposals.sql`
6. `migrations/006_storage_policies.sql`
7. `migrations/007_fix_proposals_rls.sql`
8. `migrations/008_fix_gallery_rls.sql`
9. `migrations/009_fix_contacts_rls.sql`
10. `migrations/010_fix_events_rls.sql`
11. `migrations/011_fix_all_rls_final.sql`
12. `migrations/012_secure_registrations.sql`
13. `migrations/013_harden_security_and_thumbnails.sql`

### How to Apply:
1. Open your Supabase Dashboard: **SQL Editor**.
2. Review the migration file (e.g., `migrations/013_harden_security_and_thumbnails.sql`).
3. Paste the contents into the SQL Editor and click **Run**.
4. Verify execution success. Detailed verification queries can be found in `SECURITY_NOTES.md`.

---

## Development & Verification Scripts

### Development Server
```bash
npm run dev
```

### Build & Sitemap Generation
Generates `public/sitemap.xml` and `public/robots.txt` before compiling production bundles:
```bash
npm run build
```

### Linting
Runs ESLint with flat config (rules for React 18, React Hooks, and standard globals):
```bash
npm run lint
npm run lint:fix
```

### End-to-End Tests
Executes Playwright smoke tests against local preview server (with RPC submit calls mocked):
```bash
npm run test:e2e
```

---

## Key Hardening Features

- **PII Lockdown**: Public `SELECT` is revoked on `registrations`. Participant onboarding goes through the `SECURITY DEFINER` RPC `register_participant` which validates input, prevents duplicates, checks event capacity, and returns only registration ticket credentials.
- **Dual-Image Generation**: Gallery uploads generate both thumbnail (~600px, target ≤120 kB) and full (~1600px, target ≤200 kB) versions via `browser-image-compression`.
- **Bundle Optimization**: React and Supabase vendor libraries are split into separate Rollup chunks, reducing the initial client JavaScript bundle to ~77 kB.
- **Dynamic SEO & Structured Data**: `useDocumentMeta` sets self-referencing canonical links, social tags, and Schema.org `SportsEvent` JSON-LD per route.
