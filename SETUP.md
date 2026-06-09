# VisitorTrack Setup Guide

## 1. Supabase Setup (database + auth)

1. Go to https://supabase.com and create a free account
2. Create a new project (pick any name, choose a region close to you)
3. Go to **SQL Editor** and paste the contents of `schema.sql` → click Run
4. Go to **Authentication → Providers → Google** and enable it
   - You'll need a Google OAuth Client ID & Secret
   - Get it from: https://console.cloud.google.com → APIs → Credentials
5. Go to **Settings → API** and copy:
   - Project URL → paste as `SUPABASE_URL`
   - anon/public key → paste as `SUPABASE_ANON_KEY`

## 2. Local Setup

```bash
# Install dependencies
npm install

# Copy env file and fill in your Supabase credentials
cp .env.example .env

# Start the server
npm start
```

## 3. Deploy to Vercel (free)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables on Vercel dashboard:
# SUPABASE_URL and SUPABASE_ANON_KEY
```

## 4. Add tracking to a website

After signing up and adding a domain in the dashboard, copy your snippet:

```html
<script src="https://your-domain.vercel.app/pixel.js"></script>
```

Paste it inside the `<head>` tag of any website you want to track.

## File structure

```
visitortrack/
├── index.html       ← Landing page + Sign in/Sign up
├── dashboard.html   ← Main app dashboard
├── pixel.js         ← Tracking snippet (goes on client sites)
├── server.js        ← Express backend (Supabase connected)
├── schema.sql       ← Run this once in Supabase SQL Editor
├── package.json
├── .env.example
└── SETUP.md         ← This file
```
