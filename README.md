# HideAway 57 — Game Store

A Steam-style digital game marketplace with accounts, PostgreSQL, OAuth, Stripe payments, and downloadable game installers.

## Features

- Game catalog with cover art and search
- **Email/password** or **Google** sign-in
- Cart, Stripe Checkout (or demo mode), order history
- **ZIP game installers** (README, install scripts, manifest) — auth-gated download
- Personal library with re-download
- Profile page with order history

## Quick start (local)

```bash
cp .env.example .env
docker compose up -d
npm run installers:build
npx prisma migrate deploy
npx tsx prisma/seed.ts
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Port already in use?

```bash
lsof -ti:3000,5173 | xargs kill -9
rm -f .next/dev/lock
npm run dev
```

## Deploy to Render

This repo includes a [Render Blueprint](https://render.com/docs/blueprint-spec) (`render.yaml`) that provisions a **Web Service** + **PostgreSQL** database.

### Option A — Blueprint (recommended)

1. Push this repo to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com/) → **New** → **Blueprint**
3. Connect your repo — Render reads `render.yaml` and creates the web service + database
4. After the first deploy, open the web service **Environment** tab and set:
   - `AUTH_URL` = `https://your-app.onrender.com`
   - `NEXTAUTH_URL` = `https://your-app.onrender.com`
   - `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` (if using Google sign-in)
   - `STRIPE_*` keys (optional — demo checkout works without them)
5. **Redeploy** after setting env vars

### Option B — Manual Web Service

1. Create a **PostgreSQL** database on Render (free tier)
2. Create a **Web Service** connected to this repo:
   - **Runtime:** Node
   - **Build command:** `npm ci && npm run build:render`
   - **Start command:** `npm start`
3. Set environment variables:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Internal connection string from Render Postgres |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `AUTH_URL` | `https://your-app.onrender.com` |
| `NEXTAUTH_URL` | `https://your-app.onrender.com` |
| `AUTH_TRUST_HOST` | `true` |

### After deploy

- **Google OAuth:** add authorized redirect URI  
  `https://your-app.onrender.com/api/auth/callback/google`
- **Stripe webhook:** point to  
  `https://your-app.onrender.com/api/webhooks/stripe`
- **Seed data:** runs automatically during `build:render` (game catalog upserted each deploy)

### Render notes

- Free web services **spin down** after inactivity (~50s cold start on first visit)
- Game installer ZIPs are built during each deploy (`installers:build`) — no persistent disk needed
- PostgreSQL is required; SQLite does not work on Render's ephemeral filesystem

## OAuth setup

### Google

1. [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials
2. Create OAuth 2.0 Client ID (Web application)
3. Authorized redirect URIs:
   - Local: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://your-app.onrender.com/api/auth/callback/google`
4. Add to `.env` or Render environment:

```env
AUTH_GOOGLE_ID=your-client-id
AUTH_GOOGLE_SECRET=your-client-secret
```

OAuth accounts link to existing users with the same email.

## Stripe (optional)

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

Local webhook forwarding:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Without Stripe keys, checkout runs in **demo mode** (instant completion).

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `AUTH_SECRET` | Yes | `openssl rand -base64 32` |
| `AUTH_URL` / `NEXTAUTH_URL` | Yes | App URL (e.g. `https://your-app.onrender.com`) |
| `AUTH_TRUST_HOST` | Yes (Render) | Set to `true` behind Render's proxy |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | No | Google OAuth |
| `STRIPE_*` | No | Payment processing |

## Game installers

Each game has a ZIP in `installers/` containing:

- `README.txt` — install instructions
- `install.bat` / `install.sh` — platform launchers
- `manifest.json` — game metadata

Rebuild after changes:

```bash
npm run installers:build
```

Downloads are served from `GET /api/library/download/[gameId]` (requires purchase + sign-in).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server |
| `npm run build` | Production build (local) |
| `npm run build:render` | Full Render build (installers + migrate + seed + build) |
| `npm run start` | Production server |
| `npm run installers:build` | Generate game ZIP files |
| `npm run db:migrate` | Create/apply migrations (dev) |
| `npm run db:seed` | Seed catalog |
| `npm run covers:figma` | Export game covers from Figma |

## Tech stack

- Next.js 16, Prisma 7, PostgreSQL
- NextAuth.js v5 + Prisma Adapter (credentials + Google OAuth)
- Stripe Checkout
- Tailwind CSS 4
