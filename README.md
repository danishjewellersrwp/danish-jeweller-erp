# Danish Jeweller ERP

Real, production-backed version of the Danish Jeweller ERP prototype — Next.js 14 (App Router) + Supabase (Postgres, Auth, Row-Level Security) + Vercel.

## What's already done for you

- **Database**: fully built on your Supabase project (`kcaddbznkckzzguftabz`, ap-northeast-2) — 18 tables, real Row-Level Security for all 8 roles, an atomic checkout function, and a security/performance audit already passed clean.
- **App**: every module from the prototype (Dashboard, POS, Products, Sales, Purchases, Customers, Suppliers, Old Gold Exchange, Repairs, Custom Orders, Expenses, Reports, Settings), wired to the real database instead of local browser state.
- **Build verified**: `npm run build` completes with zero errors; the login page has been confirmed to render.

## What you still need to do

### 1. Create your first admin user

This app does not include a "create the first admin" script on purpose — that step should happen through Supabase's own dashboard, not through an AI-run script, so you control the very first account and password yourself.

1. Go to your Supabase project → **Authentication → Users → Add User**
2. Create yourself an account with your real email and a real password
3. Come back and tell me the email you used — I'll run one SQL statement to promote that account's role from the default `readonly` to `admin` (everyone starts as `readonly` until promoted, by design — least privilege)

Every other staff account works the same way: an admin creates their login in Settings (once a user-management screen is built) or directly in the Supabase dashboard, and you set their role.

### 2. Local development (optional, to try it before deploying)

```bash
npm install
cp .env.local.example .env.local   # already has your real Supabase URL + public key filled in
npm run dev
```

Visit `http://localhost:3000`.

### 3. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit — Danish Jeweller ERP"
git branch -M main
git remote add origin <your-empty-github-repo-url>
git push -u origin main
```

### 4. Deploy to Vercel

1. In Vercel: **Add New → Project → Import** your GitHub repo
2. Framework preset: Next.js (auto-detected)
3. Add these two Environment Variables (same values as `.env.local.example`):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

### 5. (Optional) Scheduled live rate refresh

The "Fetch Live Rates Now" button works immediately after deploy — it's a real server action. If you want rates to refresh automatically on a schedule (not just on click), add a Vercel Cron Job that hits a small route calling `refreshLiveRates()` on the interval you want (e.g. every 15 minutes). Ask me and I'll build that route + `vercel.json` cron config when you're ready for it.

## Notes on what's genuinely production-grade vs. what to revisit later

- **Real**: Postgres RLS enforcement, atomic checkout transaction, real Supabase Auth sessions, server-side live rate fetch (no CORS/sandbox issues since it runs on Vercel's servers, not a browser).
- **Still worth adding before heavy daily use**: a proper in-app user-management screen (currently: promote roles via SQL/Supabase dashboard), file/receipt PDF export, audit log UI (the table exists and records nothing yet — no triggers write to it), and a staging/branch environment for testing schema changes before they hit production (Supabase branching is available on your plan if you want this).
