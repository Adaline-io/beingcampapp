# Working with this repo

## About the maintainer

The project owner is a founder learning software engineering as the project
grows ("vibe coder, quick learner"). When working in this repo:

- **Teach on the go.** When you use a tool, term, or process (service worker,
  RLS, CI, migration, escrow RPC…), add a one-line plain-English explanation
  the first time it comes up in a conversation.
- **Give copy-paste-able steps** for anything the owner must do by hand
  (dashboards, app stores, DNS), numbered, with what success looks like.
- **Explain the why** behind engineering choices in one sentence, not an essay.

## What this project is

BeingCamp — a creative-community ecosystem app (coin economy, work
marketplace with escrow, showcase portfolio, physical-space check-ins) for a
real space in Kerala, India. One React codebase ships as web app (GitHub
Pages), installable PWA, and native iOS/Android via Capacitor.

## Architecture in one breath

- `src/legacy/` — the design-layer screens (JSX, window-globals, migrated
  screen-by-screen; don't fight its lint).
- `src/lib/` + `src/services/` — typed TypeScript: config, Supabase client,
  auth/data services, and `bridge.ts` (mirrors app actions to the backend
  when configured; app works fully offline/demo without it).
- `supabase/` — schema migrations (22 tables), RLS policies, atomic wallet
  RPC (`record_transaction`), dispatch marketplace (crew seats, weighted
  escrow splits, client tokens), seed catalog. Live project: `beingcampapp`
  (eutcbcbalfnwgqddhdog, keys committed in `src/lib/config.ts` — the anon key
  is publishable by design, protected by RLS).
- `tests/e2e/` — 23 Playwright tests covering every core flow; CI runs them
  on every push with `VITE_FORCE_LOCAL=1` so tests never touch production.

## Commands

- `npm run dev` / `build` / `preview`
- `npm run lint` / `typecheck` / `test:e2e`
- `npm run cap:sync|cap:android|cap:ios` — native shells

## Rules

- Push to `main` deploys to GitHub Pages automatically — keep it green.
- Wallet math belongs in the database (RPC), never in the client.
- New code is TypeScript in `src/lib`/`src/services`; legacy screens migrate
  incrementally.
