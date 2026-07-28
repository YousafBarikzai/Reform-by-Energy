# Reform by Energym — Pilates Studio PWA

The Reform by Energym member app: a full-stack, installable PWA in the
studio's baby-pink brand. React (Vite) frontend, Express + SQLite backend,
served together as one Node service.

## Features

- **Personalised dashboard** — next class, weekly progress, streak, credits,
  rule-based class recommendations, challenges, studio news
- **Schedule & booking** — live availability (available / limited / almost
  full / full), interactive studio map with reformer selection, waiting
  lists with automatic promotion, cancellation with credit refunds,
  booking cut-offs, `.ics` calendar export
- **Packages** — class packs, memberships, intro offer, simulated checkout,
  receipts, credit tracking
- **Exercise library** — technique guides with step-by-step instruction,
  search + filters, favourites, routines, completion tracking
- **Progress** — attendance analytics, streaks, badges, monthly comparisons
- **Wellness check-ins** — fixed-formula daily score and trends (no AI)
- **Transformation journey** — goals, measurements, private progress photos
- **Reform Mirror** — private aggregate wellness journal
- **Rewards & loyalty** — configurable point rules, tiers, redemptions
- **Community challenges** — join, track, leaderboards with privacy control
- **Digital membership card** — wallet-style card with check-in QR code
- **Notifications** — rule-based in-app + web push (VAPID), per-category
  member preferences
- **Admin CMS** (`/admin`) — role-gated management of classes, schedule,
  attendance, members, credits, packages, library, challenges, rewards,
  point rules, announcements, and more, with audit logging

All personalisation is transparent and rule-based. No AI features.

## Running

```bash
npm install
npm run build        # build the frontend to dist/
npm start            # serve app + API on $PORT (default 4173)

# development (two processes)
npm run server       # API on :4631 (vite dev proxies /api to it)
npm run dev          # vite dev server with HMR
```

The SQLite database lives in `DATA_DIR` (default `./data`) and seeds itself
with realistic demo data on first boot.

**Demo accounts** — member `sophie@email.com` / `reform123` ·
admin `admin@reformbyenergym.com` / `admin123`

## Deployment (Railway)

The service runs as a single Node process. For member data to survive
redeploys, attach a **volume** and point the app at it:

1. Railway → service → *Volumes* → add a volume mounted at `/data`
2. Railway → service → *Variables* → `DATA_DIR=/data`

Without a volume the app still works, but data resets to the seed on each
deploy. Payments are simulated until a payment provider is configured.
