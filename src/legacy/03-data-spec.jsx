// BeingCamp — sample data drawn from the developer spec
// All economy values, zones, ranks, packs, products, services, briefs.

const RANKS = [
  { i: 0, name: 'Visitor',  mult: '1.0×', unlock: 'Default' },
  { i: 1, name: 'Recruit',  mult: '1.0×', unlock: 'Any coin pack + Initiation complete' },
  { i: 2, name: 'Builder',  mult: '1.5×', unlock: '500+ activity BC · 3 Drops completed' },
  { i: 3, name: 'Maker',    mult: '1.75×', unlock: '1,500+ activity BC · hosted session · community vote' },
  { i: 4, name: 'Chief',    mult: '2.0×', unlock: '5,000+ activity BC · nominated · management approval' },
];

const COIN_PACKS = [
  { id: 'starter', name: 'Starter Pack', coins: 500,  bonus: 0,    inr: 5000,  rate: '₹10/BC' },
  { id: 'builder', name: 'Builder Pack', coins: 1200, bonus: 200,  inr: 10000, rate: '₹8.33/BC' },
  { id: 'maker',   name: 'Maker Pack',   coins: 2500, bonus: 500,  inr: 20000, rate: '₹8/BC', popular: true },
  { id: 'chief',   name: 'Chief Pack',   coins: 6000, bonus: 1500, inr: 45000, rate: '₹7.5/BC' },
];

const EARN_EVENTS = [
  { id: 'milestone', name: 'Complete a milestone', desc: 'Escrow releases on approval', bc: 765, cap: 'Per milestone', freq: 'Per project' },
  { id: 'deliver',  name: 'Deliver a project',  desc: 'Full payout on sign-off',      bc: 1530, cap: 'No cap',   freq: 'Per project' },
  { id: 'refer',    name: 'Refer a member',     desc: 'Referee buys their first pack', bc: 300, cap: 'No cap',   freq: 'Anytime' },
  { id: 'publish',  name: 'Publish a case study', desc: 'Featured on the Showcase',   bc: 50,  cap: 'Per piece', freq: 'Reputation' },
  { id: 'host',     name: 'Lead a team',        desc: 'Run a project as lead',        bc: 200, cap: 'No cap',   freq: 'Per project' },
];

const ZONES = [
  { id: 'front', n: '01', name: 'The Front', layer: 'Public',    desc: 'Walk-in. The threshold.',        cost: 0,   minRank: 0, accent: 'var(--muted)' },
  { id: 'camp',  n: '02', name: 'The Camp',  layer: 'Work',      desc: 'The working floor. Day passes.', cost: 30,  minRank: 1, accent: 'var(--gold)' },
  { id: 'room',  n: '03', name: 'The Room',  layer: 'Immersive', desc: 'Scheduled immersive sessions.',  cost: 50,  minRank: 1, accent: 'var(--blue)' },
  { id: 'den',   n: '04', name: 'The Den',   layer: 'Community',  desc: 'Members lounge. Where it loosens.', cost: 10, minRank: 1, accent: 'var(--green)' },
  { id: 'stage', n: '05', name: 'The Stage', layer: 'Programme', desc: 'Talks, Clash nights, The Fire.', cost: 20,  minRank: 0, accent: 'var(--purple)' },
  { id: 'inner', n: '06', name: 'The Inner', layer: 'Authority', desc: 'Private meeting. Maker & above.', cost: 150, minRank: 3, accent: 'var(--red)' },
];

const STORE_CATS = ['All', 'B2G Drops', 'Merch', 'Motiontape', 'BreakIT', 'Passes'];

const PRODUCTS = [
  { id: 'p1', name: 'B2G Field Jacket',     cat: 'B2G Drops', source: 'Back2Ground', bc: 1200, type: 'physical', stock: 8,  tone: '#3a3024', tag: 'Drop 04' },
  { id: 'p2', name: 'Camp Heavyweight Tee', cat: 'Merch',     source: 'BeingCamp',   bc: 180,  type: 'physical', stock: 40, tone: '#242424', tag: 'Core' },
  { id: 'p3', name: 'Motiontape Print №7',  cat: 'Motiontape', source: 'Motiontape', bc: 600,  type: 'physical', stock: 3,  tone: '#2a2438', tag: 'Limited' },
  { id: 'p4', name: 'BreakIT Macropad',     cat: 'BreakIT',   source: 'BreakIT',     bc: 1500, type: 'physical', stock: 12, tone: '#1f2a30', tag: 'Hardware' },
  { id: 'p5', name: 'Camp Day Pass',        cat: 'Passes',    source: 'BeingCamp',   bc: 30,   type: 'pass',     stock: -1, tone: '#332b16', tag: 'Zone' },
  { id: 'p6', name: 'B2G Cap',              cat: 'B2G Drops', source: 'Back2Ground', bc: 240,  type: 'physical', stock: 22, tone: '#33291d', tag: 'Drop 04' },
  { id: 'p7', name: 'Field Notebook',       cat: 'Merch',     source: 'BeingCamp',   bc: 90,   type: 'physical', stock: 60, tone: '#222', tag: 'Core' },
  { id: 'p8', name: 'Stage Ticket — Clash', cat: 'Passes',   source: 'BeingCamp',   bc: 40,   type: 'ticket',   stock: -1, tone: '#2c2438', tag: 'Event' },
];

const SERVICES = [
  { id: 's1', name: 'Brand Strategy & Identity', div: 'Adaline',    deposit: 500, from: 2000, timeline: '3–6 weeks', tone: '#332b16' },
  { id: 's2', name: 'Digital Marketing',         div: 'Adaline',    deposit: 200, from: 800,  timeline: 'Monthly',   tone: '#2b2b2b' },
  { id: 's3', name: 'Film & Content Production',  div: 'Motiontape', deposit: 400, from: 3000, timeline: '2–4 weeks', tone: '#2a2438' },
  { id: 's4', name: 'Immersive Experience Design',div: 'BreakIT',    deposit: 600, from: 5000, timeline: '4–8 weeks', tone: '#1f2a30' },
  { id: 's5', name: 'The Room — Full Day',        div: 'BeingCamp',  deposit: 400, from: 2000, timeline: 'Per booking', tone: '#262017' },
];

const BRIEFS = [
  { id: 'b1', title: 'Rebrand for a Calicut café', cat: 'Branding', client: 'Kappa & Co.', budget: 2400, deadline: '12 days', minRank: 2, applicants: 7, desc: 'Full visual identity — logo, menu system, signage direction for a specialty filter-coffee bar opening in Kozhikode.' },
  { id: 'b2', title: 'Reels package — 8 shorts', cat: 'Production', client: 'Theeram Resorts', budget: 1800, deadline: '3 weeks', minRank: 2, applicants: 12, desc: 'Eight vertical shorts for Instagram. Shoot + edit. Backwater property. Footage partly provided.' },
  { id: 'b3', title: 'Landing page build', cat: 'Tech', client: 'Nila Logistics', budget: 3200, deadline: '2 weeks', minRank: 2, applicants: 5, desc: 'Next.js marketing site, 5 sections, CMS-backed. Design provided in Figma.' },
  { id: 'b4', title: 'Launch poster series', cat: 'Branding', client: 'Brew Theory', budget: 900, deadline: '8 days', minRank: 1, applicants: 19, desc: 'Entry-level brief — three launch posters, print + digital. Good first Pool job.' },
];

const LEADERBOARD = [
  { rank: 1, name: 'Hisham K.',   bc: 4820, tier: 'OG',      you: false },
  { rank: 2, name: 'Fathima R.',  bc: 4110, tier: 'OG',      you: false },
  { rank: 3, name: 'Devika S.',   bc: 3640, tier: 'Loyal',   you: false },
  { rank: 4, name: 'Arjun M.',    bc: 2980, tier: 'Loyal',   you: false },
  { rank: 5, name: 'You',         bc: 2740, tier: 'Loyal',   you: true },
  { rank: 6, name: 'Sneha P.',    bc: 2510, tier: 'Regular', you: false },
  { rank: 7, name: 'Rahul V.',    bc: 2350, tier: 'Regular', you: false },
  { rank: 8, name: 'Ayesha N.',   bc: 2120, tier: 'Regular', you: false },
];

const SEED_TXNS = [
  { id: 't1', type: 'earn',  ref: 'pool',    label: 'Milestone released · Brew Theory', amount: 300, when: 'Today · 10:40' },
  { id: 't2', type: 'spend', ref: 'zone',    label: 'The Den · check-in',    amount: -10,  when: 'Today · 7:40' },
  { id: 't3', type: 'earn',  ref: 'pool',    label: 'Pool job · Theeram Reels', amount: 765,  when: 'Yesterday' },
  { id: 't4', type: 'spend', ref: 'store',   label: 'Camp Heavyweight Tee',  amount: -180, when: '2 days ago' },
  { id: 't5', type: 'purchase', ref: 'pack', label: 'Maker Pack · +500 bonus', amount: 3000, when: '5 days ago' },
  { id: 't6', type: 'spend', ref: 'pool',    label: 'Project escrow · Café Rebrand', amount: -2400, when: '6 days ago' },
];

const PROJECTS = [
  { id: 'pr1', name: 'Brand refresh', div: 'Adaline', stage: 'Active',   stageIdx: 1 },
  { id: 'pr2', name: 'Launch film',   div: 'Motiontape', stage: 'Review', stageIdx: 2 },
];
const PROJECT_STAGES = ['Scoping', 'Active', 'Review', 'Delivered'];

Object.assign(window, {
  RANKS, COIN_PACKS, EARN_EVENTS, ZONES, STORE_CATS, PRODUCTS,
  SERVICES, BRIEFS, LEADERBOARD, SEED_TXNS, PROJECTS, PROJECT_STAGES,
});
