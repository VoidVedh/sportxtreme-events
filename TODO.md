# SportXtreme Events — Project Audit & Update TODO List

Generated: October 2026
Repository: `VoidVedh/sportxtreme-events`

---

## 🚨 Priority 1: Critical & Blocking Bugs (Must Fix Before Deployment)

- [ ] **1.1 Fix Supabase Connection / Restore Paused Project**
  - **Issue**: `bwgmsjyouvnswftmrnkm.supabase.co` fails DNS resolution (`NXDOMAIN`). Supabase free-tier projects pause after inactivity.
  - **Action**:
    - Go to Supabase Dashboard (`https://supabase.com/dashboard/project/bwgmsjyouvnswftmrnkm`) and click **Restore / Unpause**.
    - If recreating or using a new Supabase project, update `.env` and Vercel environment variables with the new `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.
    - Update `vercel.json` CSP `connect-src` and `img-src` with the new Supabase domain.

- [ ] **1.2 Fix Content-Security-Policy (CSP) Blocking QR Code Images**
  - **File**: [`vercel.json`](file:///Users/ved/Documents/sport/vercel.json)
  - **Issue**: `img-src` in CSP only allows `'self'`, `data:`, `blob:`, and `bwgmsjyouvnswftmrnkm.supabase.co`.
  - In [`RegisterPage.jsx:244`](file:///Users/ved/Documents/sport/src/pages/RegisterPage.jsx#L244), ticket QR codes load from `https://api.qrserver.com`.
  - **Impact**: On production (Vercel), all generated tickets show broken QR code images due to CSP block.
  - **Fix**: Add `https://api.qrserver.com` to `img-src` in `vercel.json`, or generate QR codes client-side using `qrcode.react` / SVG.

- [ ] **1.3 Commit and Apply Untracked Migration `012_secure_registrations.sql`**
  - **Files**:
    - [`migrations/012_secure_registrations.sql`](file:///Users/ved/Documents/sport/migrations/012_secure_registrations.sql)
    - [`src/pages/RegisterPage.jsx`](file:///Users/ved/Documents/sport/src/pages/RegisterPage.jsx)
    - [`src/components/Stats.jsx`](file:///Users/ved/Documents/sport/src/components/Stats.jsx)
  - **Issue**: Frontend code was updated to call `supabase.rpc("register_participant")` and `supabase.rpc("get_total_participants")`. Migration `012_secure_registrations.sql` is currently untracked in git.
  - **Impact**: Any participant registration attempt will immediately throw `function register_participant does not exist` if the SQL migration is not applied in Supabase.
  - **Action**: Apply SQL in Supabase SQL Editor and commit `012_secure_registrations.sql` to version control.

- [ ] **1.4 Fix Missing Static Assets (404 Not Found)**
  - **File**: [`index.html`](file:///Users/ved/Documents/sport/index.html)
  - **Missing Assets**:
    - `/favicon-32x32.png` (404)
    - `/favicon-16x16.png` (404)
    - `/apple-touch-icon.png` (404)
    - `/og-image.jpg` (Open Graph social preview image, 404)
  - **Action**: Generate and place the missing icons and `og-image.jpg` in `public/`, or remove non-existent `<link>` tags from `index.html`.

---

## ⚡ Priority 2: Functional, UX & Performance Issues

- [ ] **2.1 Fix Infinite/Redundant Fetch Loop in `RegisterPage.jsx`**
  - **File**: [`src/pages/RegisterPage.jsx:46`](file:///Users/ved/Documents/sport/src/pages/RegisterPage.jsx#L46)
  - **Issue**: `fetchEvents()` has `[selectedEventId]` in its dependency array. Inside `fetchEvents`, `setSelectedEventId` is called when empty. Furthermore, every dropdown change triggers another full query.
  - **Fix**: Remove `selectedEventId` from the fetch dependency array; fetch once on mount `[]`.

- [ ] **2.2 Code Splitting & Performance Optimization (Bundle Size ~933 kB)**
  - **Issue**: `dist/assets/index-D_QceWFk.js` is 933.47 kB unminified/un-split. The QR camera scanner (`html5-qrcode` / ZXing) is loaded on the initial landing page bundle.
  - **Fix**:
    - Lazy load `AdminDashboard.jsx` with `React.lazy()` and `Suspense` in `App.jsx`.
    - Configure `rollupOptions.output.manualChunks` in `vite.config.js` to split vendor dependencies (`react`, `@supabase`, `html5-qrcode`).

- [ ] **2.3 Admin Email Case-Insensitive Authentication**
  - **File**: [`src/context/AuthContext.jsx:59`](file:///Users/ved/Documents/sport/src/context/AuthContext.jsx#L59)
  - **Issue**: `email.trim() !== ADMIN_EMAIL` fails if user's mobile keyboard auto-capitalizes the email (e.g. `Sportxtremeevents@gmail.com`).
  - **Fix**: Normalize with `.trim().toLowerCase()`.

- [ ] **2.4 Gallery Modal Close Button Positioning & Accessibility**
  - **File**: [`src/pages/GalleryPage.jsx:160`](file:///Users/ved/Documents/sport/src/pages/GalleryPage.jsx#L160)
  - **Issue**: Close button `position: absolute` is inside an unpositioned container, attaching it to the top-right corner of the whole browser screen rather than the modal dialog.
  - **Fix**: Add `position: "relative"` to the modal dialog card; add `Escape` key listener and body scroll lock.

- [ ] **2.5 Add Print Stylesheet for Registration Ticket**
  - **File**: [`src/pages/RegisterPage.jsx:277`](file:///Users/ved/Documents/sport/src/pages/RegisterPage.jsx#L277) & [`src/index.css`](file:///Users/ved/Documents/sport/src/index.css)
  - **Issue**: Clicking "PRINT TICKET" prints the entire website layout (navbar, dark background, buttons, footer).
  - **Fix**: Add `@media print` rules in `index.css` to isolate `#printable-ticket` with a clean white background.

- [ ] **2.6 Provide Fallback Content for Testimonials**
  - **Files**: [`src/data/content.js:61`](file:///Users/ved/Documents/sport/src/data/content.js#L61) and [`src/components/Testimonials.jsx`](file:///Users/ved/Documents/sport/src/components/Testimonials.jsx)
  - **Issue**: `TESTIMONIALS` array in `content.js` is empty `[]`. If the database returns 0 testimonials or network fails, visitors see "No testimonials available yet."
  - **Fix**: Populate standard fallback testimonials in `content.js` and fall back to them when Supabase returns an empty list.

- [ ] **2.7 Fix Image Loading in Gallery & Events (SEO & Lazy Loading)**
  - **Files**:
    - [`src/components/GalleryPreview.jsx:104`](file:///Users/ved/Documents/sport/src/components/GalleryPreview.jsx#L104)
    - [`src/pages/GalleryPage.jsx:62`](file:///Users/ved/Documents/sport/src/pages/GalleryPage.jsx#L62)
  - **Issue**: Images are rendered via CSS `background: url(...)` on `<div>` elements without `alt` text or native `loading="lazy"`.
  - **Fix**: Use semantic `<img>` tags with `alt={item.caption}` and `loading="lazy"`.

---

## 🔒 Priority 3: Security & Compliance

- [ ] **3.1 Fix npm Vulnerabilities (`npm audit`)**
  - **Issue**: 8 vulnerabilities (6 High, 2 Moderate) including CSRF bypass in `react-router` and CLI/middleware flaws in `vite`.
  - **Action**: Run `npm audit fix` and test application routes.

- [ ] **3.2 Disallow Admin Routes in `robots.txt`**
  - **File**: [`public/robots.txt`](file:///Users/ved/Documents/sport/public/robots.txt)
  - **Issue**: `Allow: /` allows search engines to index `/admin/login` and `/admin/dashboard`.
  - **Fix**: Add `Disallow: /admin/` and `Disallow: /admin/*`.

- [ ] **3.3 Hide Direct Public Link to Admin Panel**
  - **File**: [`src/components/Footer.jsx:108-115`](file:///Users/ved/Documents/sport/src/components/Footer.jsx#L108-L115)
  - **Issue**: Prominent red "Admin Panel" link in public footer invites bot probes and brute-force attempts.
  - **Fix**: Remove link or restrict visibility.

- [ ] **3.4 Clean Up Sensitive / Unused Variables in `.env.example`**
  - **File**: [`.env.example`](file:///Users/ved/Documents/sport/.env.example)
  - **Issue**: Lists `VITE_ADMIN_PASSWORD=admin123`. Any variable prefixed with `VITE_` is automatically included in public client bundles.
  - **Fix**: Remove `VITE_ADMIN_PASSWORD` from `.env.example`.

- [ ] **3.5 Remove Exact Admin Email from Login Placeholder**
  - **File**: [`src/pages/AdminLogin.jsx:75`](file:///Users/ved/Documents/sport/src/pages/AdminLogin.jsx#L75)
  - **Issue**: `placeholder="sportxtremeevents@gmail.com"` discloses the admin account email directly on the login form.
  - **Fix**: Change placeholder to `admin@example.com`.

- [ ] **3.6 Strip Verbose Console Logs in `AdminDashboard.jsx`**
  - **File**: [`src/pages/AdminDashboard.jsx`](file:///Users/ved/Documents/sport/src/pages/AdminDashboard.jsx)
  - **Issue**: Dozens of `console.group("[GalleryUpload]")` and `[GalleryDelete]` logs output internal table schemas, bucket paths, and payloads.
  - **Fix**: Remove or guard console logging behind a development environment check.

---

## 🧹 Priority 4: Code Quality & Repository Cleanup

- [ ] **4.1 Remove Dead Code & Unused Context**
  - **Files**:
    - [`src/context/ModalContext.jsx`](file:///Users/ved/Documents/sport/src/context/ModalContext.jsx)
    - [`src/components/Contact.jsx:1,3`](file:///Users/ved/Documents/sport/src/components/Contact.jsx#L1) (unused `useEffect`, `useModal`)
    - [`src/components/Hero.jsx:2,8`](file:///Users/ved/Documents/sport/src/components/Hero.jsx#L2) (unused `useModal`)
    - [`src/lib/errors.js`](file:///Users/ved/Documents/sport/src/lib/errors.js) (unused `formatSubmitError`)
  - **Action**: Remove or connect unused context and helpers.

- [ ] **4.2 Update Master `schema.sql`**
  - **File**: [`schema.sql`](file:///Users/ved/Documents/sport/schema.sql)
  - **Issue**: `schema.sql` does not include `registrations` table, storage bucket policies, or new columns for gallery/events (`storage_path`, `registration_deadline`, etc.).
  - **Fix**: Consolidate latest schema and migrations into `schema.sql` for a reproducible fresh database setup.

- [ ] **4.3 Rename Images with Spaces in Filenames**
  - **Files**:
    - [`public/Ganesh Kamath Co-Founder.jpg`](file:///Users/ved/Documents/sport/public/Ganesh%20Kamath%20Co-Founder.jpg)
    - [`public/Harsh Pawar Co-Founder.jpg`](file:///Users/ved/Documents/sport/public/Harsh%20Pawar%20Co-Founder.jpg)
    - [`src/components/About.jsx:144,157`](file:///Users/ved/Documents/sport/src/components/About.jsx#L144)
  - **Fix**: Rename files to kebab-case (`ganesh-kamath-co-founder.jpg`, `harsh-pawar-co-founder.jpg`) and update references.

- [ ] **4.4 Dynamic Copyright Year in Footer**
  - **File**: [`src/components/Footer.jsx:93`](file:///Users/ved/Documents/sport/src/components/Footer.jsx#L93)
  - **Fix**: Replace hardcoded `2025` with `{new Date().getFullYear()}`.

- [ ] **4.5 Add Real Legal Policy Pages / Modals**
  - **File**: [`src/components/Footer.jsx:7`](file:///Users/ved/Documents/sport/src/components/Footer.jsx#L7)
  - **Issue**: Clicking "Privacy Policy" or "Terms of Service" redirects to the Contact section.
  - **Fix**: Provide dedicated policy pages or informative modal dialogs.

- [ ] **4.6 Update `public/sitemap.xml`**
  - **File**: [`public/sitemap.xml`](file:///Users/ved/Documents/sport/public/sitemap.xml)
  - **Fix**: Update `<lastmod>` dates and include `/register`.
