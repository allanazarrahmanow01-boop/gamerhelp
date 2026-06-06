# GamerHelp — Setup & Deployment Guide

## Auth System
- Username + password only (no OAuth, no email)
- Passwords hashed with bcrypt (12 rounds)
- Cookie-based device tracking: **1 account per device**
- Cookies last 5 years — users can't easily bypass without clearing all cookies

---

## Step 1 — Set Up Supabase (Free)

1. Go to [supabase.com](https://supabase.com) → Create account → New Project
2. Go to **SQL Editor** → paste the full contents of `supabase/schema.sql` → Run
3. Go to **Project Settings → API** and copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon/public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

---

## Step 2 — Run Locally

```bash
cp .env.example .env.local
# Fill in your Supabase keys and generate NEXTAUTH_SECRET:
# openssl rand -base64 32

npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Step 3 — Deploy to Netlify (Free)

1. Push your code to GitHub
2. Go to [netlify.com](https://netlify.com) → **Add new site → Import from Git**
3. Select your repo — Netlify auto-detects Next.js via `netlify.toml`
4. Go to **Site settings → Environment variables** and add:
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY
   NEXTAUTH_SECRET
   NEXTAUTH_URL=https://your-site.netlify.app
   ```
5. Hit **Deploy** — done!

> Netlify's free tier includes 100GB bandwidth/month and 300 build minutes.

---

## Features
- ✅ Username + password login (no OAuth, no email needed)
- ✅ 1 account per device (cookie tracking)
- ✅ Forum with categories, game tags, voting, accepted answers
- ✅ LFG with platform/region filters + Discord links
- ✅ Leaderboard
- ✅ User profiles + settings
- ✅ Dark gamer UI, fully mobile responsive
- ✅ Netlify-ready (netlify.toml included)
