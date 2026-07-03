# BeingCamp

The creative-community **ecosystem app** — one space, one coin (BeingCoin), a whole
economy of brands, work, projects, and community. Mobile-first React app with a
Supabase backend.

> A subsidiary of ADALINE THE AGENCY.

---

## What's in the box

| Area          | Screens / features                                                              |
| ------------- | ------------------------------------------------------------------------------- |
| Onboarding    | Splash → Phone → OTP → Initiation                                               |
| Home          | Unified member dashboard, wallet chip, quick actions                            |
| Wallet        | BeingCoin balance, transaction ledger, buy coin packs                           |
| Store         | Products & professional services, cart/checkout, orders + tracking             |
| The Pool      | Open work / briefs, apply, gift wallet                                          |
| Projects      | Post work, project list, collaboration **workspaces**, milestones/escrow        |
| Showcase      | Published case studies, works & theory                                          |
| Community     | Leaders (leaderboard), Programs (workshops + RSVP), member profiles             |
| Zones         | Physical space QR check-in tied to the work loop                                |
| Activity      | Notifications, referrals, orders                                                |
| Membership    | Rank ladder (Visitor → Recruit → Builder → Maker → Chief), profile editing      |

## Tech stack

- **React 18** + **Vite 5** (fast dev, esbuild build, no runtime Babel)
- **TypeScript** for new code (`src/lib`, `src/services`) — `allowJs` for the design layer
- **Supabase** (Postgres + Auth + RLS + Realtime-ready) as the backend
- **PWA-ready** (installable, manifest + icon)
- Deploys to **GitHub Pages** _or_ **Vercel** (static output, deploy anywhere)

## Quick start

```bash
npm install
npm run dev          # http://localhost:5173  — runs in local/demo mode out of the box
```

The app runs immediately with **no backend** (demo data + localStorage). To wire the
real backend, see [Backend setup](#backend-setup).

### Scripts

| Script              | What it does                                        |
| ------------------- | --------------------------------------------------- |
| `npm run dev`       | Dev server with HMR                                 |
| `npm run build`     | Production build → `dist/`                           |
| `npm run preview`   | Preview the production build locally                |
| `npm run typecheck` | `tsc --noEmit`                                       |
| `npm run lint`      | ESLint over `src`                                    |
| `npm run format`    | Prettier                                             |
| `npm run db:push`   | Apply Supabase migrations (needs Supabase CLI)      |
| `npm run db:reset`  | Reset local DB + re-run migrations & seed           |

## Backend setup

The app has two modes, chosen automatically by env vars:

- **local** — no keys set → demo data in `localStorage`. Always works.
- **backend** — Supabase keys set → real auth + Postgres.

To go live:

1. Create a project at [supabase.com](https://supabase.com).
2. Copy `.env.example` → `.env` and fill in:
   ```
   VITE_SUPABASE_URL=https://<ref>.supabase.co
   VITE_SUPABASE_ANON_KEY=<anon key>
   ```
3. Apply the schema (see [`supabase/README.md`](./supabase/README.md)):
   ```bash
   npx supabase link --project-ref <ref>
   npx supabase db push          # runs migrations
   npx supabase db reset         # (local) migrations + seed
   ```
4. Regenerate typed DB types for full autocomplete:
   ```bash
   npx supabase gen types typescript --project-id <ref> > src/lib/database.types.ts
   ```
5. Restart `npm run dev`. The console will log `backend: Supabase (...)`.

## Deployment

The build output (`dist/`) is fully static — host it anywhere.

- **GitHub Pages** — `.github/workflows/pages.yml` builds and deploys on push to
  `main`. Set `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` as repo **Variables**
  to point the live site at your backend.
- **Vercel** — `vercel.json` is included (framework: vite, SPA rewrites). Add the
  two `VITE_*` env vars in the Vercel project settings.

## Architecture & the migration path

This project started life as a single self-contained design export. That polished
UI is preserved verbatim under **`src/legacy/`** (20 ordered modules), and stitched
into one module at build time by a small Vite plugin (`vite.config.js` →
`beingcampLegacy`) so the original shared-scope design keeps working — but now as a
real, minified, buildable app instead of a 1.6 MB in-browser-Babel bundle.

```
src/
  main.jsx              # entry — mounts the app
  styles/global.css     # design tokens + base styles
  legacy/               # the preserved design (screens, UI kit, iOS frame, controller)
  lib/
    config.ts           # env + feature flags (isBackendEnabled)
    supabase.ts         # Supabase client (null in local mode)
    database.types.ts   # generated DB types (regenerate with supabase gen types)
  services/
    auth.ts             # phone/email OTP, session
    data.ts             # typed reads/writes for every table
    index.ts            # barrel: import { auth, data } from '@/services'
supabase/
  migrations/           # 0001_init.sql (schema), 0002_rls.sql (policies)
  seed.sql              # demo catalog data
```

**How it evolves:** new work lives in `src/` proper and uses `src/services`. The
legacy demo screens migrate onto real backend data **one screen at a time** — until
a screen is migrated it keeps using demo data, so the app is always runnable. This
is the "MVP now, redesign later" seam: the whole backend is built and wired; screens
adopt it incrementally.

## License

Private / all rights reserved.
