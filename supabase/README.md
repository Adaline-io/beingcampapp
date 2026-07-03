# BeingCamp — Supabase backend

Complete Postgres schema, Row-Level-Security policies, and seed data for the app.

## Files

| File                       | Purpose                                                    |
| -------------------------- | ---------------------------------------------------------- |
| `config.toml`              | Supabase local-dev config (`project_id = "beingcamp"`)     |
| `migrations/0001_init.sql` | Schema — 17 tables, functions, triggers, indexes           |
| `migrations/0002_rls.sql`  | RLS enabled on every table + access policies               |
| `seed.sql`                 | Demo catalog (coin packs, products, services, workshops…)  |

## Schema overview

- **profiles** — 1:1 with `auth.users`; wallet (`balance`, `activity_coins`),
  portfolio (name, bio, skills, accent), rank 0–4. Auto-created on signup via the
  `handle_new_user` trigger.
- **transactions** — signed BeingCoin ledger (`+earn` / `-spend`).
- **coin_packs / products / services** — public catalogs.
- **pool_briefs** — open work; **projects** + **project_members** +
  **project_milestones** (escrow) — collaboration workspaces.
- **publications** — Showcase case studies / works / theory.
- **zones** + **zone_checkins** — physical space check-in.
- **workshops** + **workshop_rsvps** — programs.
- **orders** — store/service purchases with tracking stage.
- **notifications**, **referrals**.

## Apply it

Install the [Supabase CLI](https://supabase.com/docs/guides/cli), then:

### Against a hosted project

```bash
npx supabase link --project-ref <your-project-ref>
npx supabase db push                         # applies migrations 0001 + 0002
# seed the catalog (optional, one-off):
psql "$SUPABASE_DB_URL" -f supabase/seed.sql
```

### Local development

```bash
npx supabase start        # spins up local Postgres + Studio in Docker
npx supabase db reset     # runs migrations + seed.sql (repeatable)
```

Then regenerate typed client types:

```bash
npx supabase gen types typescript --local > ../src/lib/database.types.ts
```

## Security model (RLS)

- **Public read** (`anon` + `authenticated`): coin_packs, products, services, zones,
  workshops, pool_briefs, publications, and all profiles (public portfolios).
- **Owner-only** write/read on user data: transactions, orders, notifications,
  referrals, zone_checkins, workshop_rsvps, project_members — gated on
  `auth.uid() = profile_id`.
- **profiles**: anyone can read; only the owner can update their own row.
- **projects / project_milestones**: members can read; only the owner can write.
- **Catalog tables** have no INSERT policy — seed/manage them with the service-role
  key (which bypasses RLS), not from the browser.

## Next steps (production hardening)

- Move `recordTransaction` (balance update + ledger insert) into a **Postgres RPC /
  edge function** so it's atomic and server-authoritative — the client version in
  `src/services/data.ts` is fine for the MVP but a determined client could desync a
  balance.
- Add DB-level constraints/triggers for escrow release and rank progression.
- Wire **Realtime** subscriptions for notifications and workspace activity.
- Add Storage buckets for avatars / publication images.
