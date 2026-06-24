# SportXtreme Events - Deployment Checklist

## Pre-Deployment

- [ ] Run `npm run build` - verify build passes
- [ ] Test all routes locally
- [ ] Test all forms (Contact, Proposal, Sponsor)
- [ ] Test navigation (desktop and mobile)
- [ ] Test responsive design (mobile, tablet, desktop)
- [ ] Verify admin login and dashboard functionality
- [ ] Check for console errors
- [ ] Verify all CTAs work

## Environment Variables

### Required for Production
```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-or-anon-key
```

### Optional (for local development only)
```
SUPABASE_ACCESS_TOKEN=your-supabase-personal-access-token
SUPABASE_DB_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
```

## Vercel Deployment Steps

1. **Push to GitHub**
   - Ensure code is pushed to a GitHub repository
   - Verify `.gitignore` excludes `.env`, `node_modules`, `dist`

2. **Connect to Vercel**
   - Go to vercel.com
   - Click "Add New Project"
   - Import your GitHub repository

3. **Configure Environment Variables**
   - In Vercel project settings → Environment Variables
   - Add `VITE_SUPABASE_URL`
   - Add `VITE_SUPABASE_PUBLISHABLE_KEY`

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Verify deployment URL works

5. **Post-Deployment Verification**
   - Test all pages load
   - Test all forms submit
   - Test navigation works
   - Test responsive design
   - Check browser console for errors

## Database Setup (When Ready)

1. **Run Schema Migration**
   - Execute `schema.sql` in Supabase SQL Editor
   - Verify all tables created (contacts, proposals, events, gallery, testimonials)

2. **Configure RLS Policies**
   - Run the RLS fix SQL when ready
   - Verify public insert policies work
   - Verify admin policies work

3. **Seed Initial Data**
   - Add sample events to events table
   - Add sample testimonials to testimonials table

## Security Checklist

- [ ] No hardcoded secrets in code
- [ ] `.env` is in `.gitignore`
- [ ] Supabase keys are environment variables
- [ ] RLS policies configured (when database ready)
- [ ] HTTPS enabled (Vercel provides this)
- [ ] Security headers configured (in vercel.json)

## Performance Optimization

- [ ] Build output is optimized (Vite handles this)
- [ ] Images are optimized (when real images added)
- [ ] CSS is minified (Vite handles this)
- [ ] JavaScript is minified (Vite handles this)
- [ ] Static assets have cache headers (configured in vercel.json)

## Monitoring

- [ ] Set up error tracking (optional - e.g., Sentry)
- [ ] Set up analytics (optional - e.g., Google Analytics)
- [ ] Monitor Vercel deployment logs
- [ ] Monitor Supabase logs (when database connected)

## Rollback Plan

If deployment fails:
1. Revert to previous commit
2. Vercel will automatically redeploy previous version
3. Verify rollback works
4. Investigate failure cause
5. Fix and redeploy

## Domain Configuration (Optional)

1. In Vercel project settings → Domains
2. Add custom domain
3. Update DNS records as instructed by Vercel
4. Wait for SSL certificate to provision
5. Verify custom domain works
