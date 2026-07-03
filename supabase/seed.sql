-- =============================================================================
-- BeingCamp — seed.sql
-- Demo / catalog data. Idempotent-ish: clears catalog tables then re-inserts.
-- Does NOT seed profiles or auth.users — those come from real signups.
-- Prices are in BeingCoin (BC).
-- =============================================================================

-- Reset catalog + public content so `supabase db reset` is repeatable.
truncate table
  public.workshops,
  public.zones,
  public.publications,
  public.pool_briefs,
  public.services,
  public.products,
  public.coin_packs
restart identity cascade;

-- -----------------------------------------------------------------------------
-- coin_packs — real-money BeingCoin top-up bundles.
-- -----------------------------------------------------------------------------
insert into public.coin_packs (name, coins, bonus, price_cents, sort) values
  ('Starter Pouch',   100,   0,   199, 1),
  ('Maker Pack',      500,  50,   899, 2),
  ('Builder Stack',  1200, 200,  1999, 3),
  ('Studio Chest',   3000, 600,  4499, 4),
  ('Chief Vault',    7500, 2000, 9999, 5);

-- -----------------------------------------------------------------------------
-- products — store items priced in BeingCoin.
-- -----------------------------------------------------------------------------
insert into public.products (name, source, bc, tone, cat, type, description, sort) values
  ('Camp Ceramic Mug',        'Kiln & Co.',       120, '#c9a84c', 'Goods',   'physical', 'Hand-thrown stoneware mug glazed in warm ochre. Made in the Camp studio.', 1),
  ('Field Notebook (A5)',     'Paper Union',       80, '#7a8b6f', 'Goods',   'physical', 'Dot-grid notebook with a linen cover for sketching and briefs.', 2),
  ('BeingCamp House Blend',   'Ground Floor',      95, '#8a5a3a', 'Coffee',  'physical', '250g of single-origin beans roasted for the Camp espresso bar.', 3),
  ('Riso Print — "Make"',     'Ink Room',         140, '#c94c6a', 'Art',     'physical', 'Two-color risograph print, A3, signed edition of 50.', 4),
  ('Day Pass — Room',         'BeingCamp',         60, '#c9a84c', 'Access',  'pass',     'One full day of hot-desk access to The Room.', 5),
  ('Studio Week Pass',        'BeingCamp',        350, '#4c8ac9', 'Access',  'pass',     'Seven days of studio + zone access, including the Inner circle.', 6),
  ('Brand Kit Template',      'Signal Studio',    220, '#9a4cc9', 'Digital', 'digital',  'Editable brand guideline + logo suite template pack.', 7),
  ('Preset Pack — Warm Film', 'Cade Wallace',     110, '#c98a4c', 'Digital', 'digital',  'Twelve cinematic color grades for photo and video.', 8);

-- -----------------------------------------------------------------------------
-- services — professional services bookable with BeingCoin.
-- -----------------------------------------------------------------------------
insert into public.services (name, provider, bc, cat, description, sort) values
  ('Logo & Identity Sprint',   'Signal Studio',   900, 'Branding',   'Two-week focused sprint delivering a logo, palette, and mini brand guide.', 1),
  ('Product Photography Day',  'Cade Wallace',    650, 'Production', 'Full studio day: styling, shooting, and 20 edited hero images.', 2),
  ('Landing Page Build',       'Nine Grid',       780, 'Tech',       'Responsive marketing page, built and shipped in one week.', 3),
  ('Launch Strategy Session',  'North Marketing', 320, 'Marketing',  '90-minute working session to plan your go-to-market moves.', 4),
  ('Copy & Voice Polish',      'Word Foundry',    280, 'Branding',   'Rewrite and tighten up to 1,500 words of product or site copy.', 5);

-- -----------------------------------------------------------------------------
-- pool_briefs — open gigs in The Pool (posted_by left null: partner-sourced).
-- -----------------------------------------------------------------------------
insert into public.pool_briefs (title, org, cat, budget, summary, status) values
  ('Rebrand for a neighborhood roaster', 'Ground Floor',   'Branding',   1200, 'Warm, tactile identity for an independent coffee roaster opening a second location.', 'open'),
  ('Product film — 60s hero cut',        'Loom Goods',     'Production',  950, 'Short brand film for a homeware launch. Moody, natural light, slow pace.', 'open'),
  ('Headless storefront build',          'Paper Union',    'Tech',       1600, 'Migrate a stationery shop to a fast headless commerce stack.', 'open'),
  ('Launch campaign — spring drop',      'Ink Room',       'Marketing',   700, 'Plan and run a two-week campaign for a limited print release.', 'matched'),
  ('Packaging system for tea line',      'Steep',          'Branding',    880, 'Modular packaging design across six blends, sustainable materials.', 'open'),
  ('Event capture — maker night',        'BeingCamp',      'Production',   400, 'Photo + short reel coverage of the monthly maker night at Camp.', 'closed');

-- -----------------------------------------------------------------------------
-- publications — Showcase case studies / work / theory (guest authors).
-- -----------------------------------------------------------------------------
insert into public.publications (author_id, author, title, kind, summary, tone) values
  (null, 'Signal Studio',  'Rebuilding a roaster''s identity from the cup up', 'Case Study', 'How we turned a single espresso ritual into a full tactile brand system.', '#8a5a3a'),
  (null, 'Cade Wallace',   'Shooting product in one window of light',          'Work',       'A one-day, one-window approach to warm, honest product photography.', '#c98a4c'),
  (null, 'Nine Grid',      'The case for boring, fast websites',               'Theory',     'Why performance and clarity beat novelty for maker storefronts.', '#4c8ac9'),
  (null, 'Word Foundry',   'Finding a brand voice that sounds like a person',  'Theory',     'A practical method for writing copy that doesn''t sound like a committee.', '#c94c6a'),
  (null, 'Loom Goods',     'From workshop to shelf: a homeware launch diary',  'Case Study', 'Six weeks of building, filming, and shipping a small-batch product line.', '#7a8b6f'),
  (null, 'North Marketing','Small launches, real momentum',                    'Work',       'A lightweight campaign playbook for makers with more craft than budget.', '#9a4cc9');

-- -----------------------------------------------------------------------------
-- zones — physical spaces (slug PKs).
-- -----------------------------------------------------------------------------
insert into public.zones (id, name, description, bookable) values
  ('room',  'The Room',  'Open hot-desk floor and café bar — the everyday working space of BeingCamp.', false),
  ('camp',  'The Camp',  'The maker studio: workbenches, kiln, print room, and photo corner. Bookable by the hour.', true),
  ('inner', 'The Inner', 'Quiet members-only lounge for focus, mentoring, and Chief-level gatherings.', true);

-- -----------------------------------------------------------------------------
-- workshops — programs / sessions (host_id null: partner-hosted).
-- -----------------------------------------------------------------------------
insert into public.workshops (title, host, when_text, date_text, zone_id, cost, seats, taken, tag, tone, description) values
  ('Espresso Fundamentals',     'Ground Floor',   'Thu 7pm', 'Jul 18', 'room',  120, 12,  8, 'Coffee',     '#8a5a3a', 'Dial in a shot, steam milk, and taste like a pro. Beans and gear provided.'),
  ('Intro to Wheel Throwing',   'Kiln & Co.',     'Sat 10am','Jul 20', 'camp',  180, 10,  6, 'Craft',      '#c9a84c', 'Hands-on ceramics session — throw and trim your first bowl on the wheel.'),
  ('Brand Identity in a Day',   'Signal Studio',  'Wed 1pm', 'Jul 24', 'inner', 300,  8,  5, 'Branding',   '#9a4cc9', 'Build a mini identity system from strategy to logo in one focused session.'),
  ('Natural-Light Product Shoot','Cade Wallace',  'Fri 3pm', 'Jul 26', 'camp',  150, 10,  4, 'Production', '#c98a4c', 'Learn a repeatable one-window setup for clean, warm product photos.'),
  ('Riso Print Lab',            'Ink Room',       'Sun 11am','Jul 28', 'camp',   90, 14,  9, 'Art',        '#c94c6a', 'Design and pull your own two-color risograph print to take home.');
