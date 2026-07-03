// BeingCamp — reshaped data: unified ranks, workspaces, open work, publications

// Unified rank ladder — everyone is a Member. Perks tilt by how you use BeingCoin.
const RANK_PERKS = [
  { i: 0, name: 'Visitor',  earn: '1.0×', discount: '0%',  commit: 'Just arrived' },
  { i: 1, name: 'Recruit',  earn: '1.0×', discount: '0%',  commit: 'Initiated' },
  { i: 2, name: 'Builder',  earn: '1.5×', discount: '5%',  commit: '500+ BC moved · 3 projects' },
  { i: 3, name: 'Maker',    earn: '1.75×', discount: '10%', commit: '1,500+ BC moved · hosted a project' },
  { i: 4, name: 'Chief',    earn: '2.0×', discount: '15%', commit: '5,000+ BC moved · community vote' },
];

const STAGES = ['Posted', 'Scoping', 'Team set', 'In progress', 'Delivered'];
const POST_CATS = ['Branding', 'Production', 'Tech', 'Marketing', 'Strategy'];

// Your collaboration workspaces — you're poster on some, team on others
const WORKSPACES = [
  {
    id: 'w1', title: 'Brew Theory — Launch Posters', poster: 'Brew Theory', cat: 'Branding',
    you: 'member', role: 'Lead Designer', stage: 3, budget: 900, escrowReleased: 300, deadline: '8 days',
    team: [
      { name: 'You', role: 'Lead Designer', lead: true, you: true },
      { name: 'Fathima R.', role: 'Illustrator', lead: false },
      { name: 'Sami K.', role: 'Copy', lead: false },
    ],
    milestones: [
      { name: 'Concept directions', bc: 300, status: 'done' },
      { name: 'First poster set', bc: 300, status: 'active' },
      { name: 'Final delivery', bc: 300, status: 'todo' },
    ],
    chat: [
      { who: 'Aslam · Authority', msg: 'Team is set. Escrow of 900 BC is funded and locked. Kickoff notes in Files.', when: 'Mon 9:02', you: false },
      { who: 'Brew Theory', msg: 'Excited! Love the moodboard direction — go bold.', when: 'Mon 10:15', you: false },
      { who: 'You', msg: 'On it. First set of three posters by Thursday.', when: 'Mon 10:21', you: true },
      { who: 'Fathima R.', msg: 'Illustrations for #2 are ready, dropping them in Files.', when: 'Tue 16:40', you: false },
    ],
    files: [
      { name: 'Brief + brand assets.pdf', kind: 'pdf', size: '2.4 MB', by: 'Brew Theory', when: 'Mon' },
      { name: 'Moodboard.fig', kind: 'fig', size: '14 MB', by: 'You', when: 'Mon' },
      { name: 'Poster-02-illustration.png', kind: 'img', size: '6.1 MB', by: 'Fathima R.', when: 'Tue' },
    ],
    schedule: [
      { title: 'Weekly sync', when: 'Thu · 4:00 PM', where: 'The Room' },
      { title: 'First review', when: 'Fri · 11:00 AM', where: 'Video call' },
    ],
  },
  {
    id: 'w2', title: 'My Café Rebrand', poster: 'You', cat: 'Branding',
    you: 'poster', role: 'Poster', stage: 1, budget: 2400, escrowReleased: 0, deadline: 'Confirm team',
    team: [],
    shortlist: [
      { name: 'Devika S.', role: 'Brand Lead', rank: 'Maker', match: 95, pitch: 'Identity is my craft — café & F&B is a sweet spot. I can lead end-to-end.' },
      { name: 'Arjun M.', role: 'Designer', rank: 'Builder', match: 82, pitch: 'Strong on systems & rollout kits. Fast turnarounds.' },
      { name: 'Fathima R.', role: 'Illustrator', rank: 'Maker', match: 78, pitch: 'Hand-drawn marks and menu illustration if you want warmth.' },
    ],
    milestones: [
      { name: 'Strategy + naming', bc: 800, status: 'todo' },
      { name: 'Identity system', bc: 900, status: 'todo' },
      { name: 'Rollout kit', bc: 700, status: 'todo' },
    ],
    chat: [
      { who: 'Aslam · Authority', msg: 'Shortlisted 3 makers for your rebrand. Confirm who joins and we\u2019ll kick off.', when: 'Wed 12:00', you: false },
    ],
    files: [
      { name: 'Café brief.pdf', kind: 'pdf', size: '1.1 MB', by: 'You', when: 'Wed' },
    ],
    schedule: [],
  },
  {
    id: 'w3', title: 'Theeram — Reels Package', poster: 'Theeram Resorts', cat: 'Production',
    you: 'member', role: 'Editor', stage: 4, budget: 1800, escrowReleased: 1800, deadline: 'Delivered',
    team: [
      { name: 'You', role: 'Editor', lead: false, you: true },
      { name: 'Hisham K.', role: 'DOP', lead: true },
    ],
    milestones: [
      { name: 'Shoot', bc: 700, status: 'done' },
      { name: 'Edit 8 reels', bc: 700, status: 'done' },
      { name: 'Delivery', bc: 400, status: 'done' },
    ],
    chat: [
      { who: 'Theeram Resorts', msg: 'These are incredible. Thank you team!', when: 'Last wk', you: false },
    ],
    files: [
      { name: 'Final-reels-pack.zip', kind: 'zip', size: '480 MB', by: 'You', when: 'Last wk' },
    ],
    schedule: [],
  },
];

// Open work in the Pool — members apply to join teams
const OPEN_WORK = [
  { id: 'o1', title: 'Identity for a Calicut café', poster: 'Kappa & Co.', cat: 'Branding', pay: 2040, need: 'Brand designer', team: 3, deadline: '12 days', minRank: 2, applicants: 7, desc: 'Full visual identity — logo, menu system, signage direction for a specialty filter-coffee bar in Kozhikode.' },
  { id: 'o2', title: '8 vertical shorts — resort', poster: 'Theeram Resorts', cat: 'Production', pay: 1530, need: 'Video editor', team: 2, deadline: '3 weeks', minRank: 2, applicants: 12, desc: 'Eight Instagram shorts. Shoot + edit. Backwater property. Footage partly provided.' },
  { id: 'o3', title: 'Next.js marketing site', poster: 'Nila Logistics', cat: 'Tech', pay: 2720, need: 'Frontend dev', team: 2, deadline: '2 weeks', minRank: 2, applicants: 5, desc: '5-section CMS-backed marketing site. Design provided in Figma.' },
  { id: 'o4', title: 'Launch poster series', poster: 'Brew Theory', cat: 'Branding', pay: 765, need: 'Graphic designer', team: 1, deadline: '8 days', minRank: 1, applicants: 19, desc: 'Three launch posters, print + digital. A great first Pool job.' },
];

// Showcase — published case studies, personal works, theory
const PUBLICATIONS = [
  { id: 'pub1', type: 'Case Study', title: 'How we rebranded Theeram in 18 days', author: 'Hisham K.', init: 'HK', tone: '#2a2438', tags: ['Branding', 'Film'], claps: 142, read: '6 min', excerpt: 'A backwater resort, a tiny team, and a deadline that should have broken us. Here\u2019s the system that held.', project: true },
  { id: 'pub2', type: 'Theory', title: 'BeingCoin is trust, not currency', author: 'Devika S.', init: 'DS', tone: '#332b16', tags: ['Economy', 'Essay'], claps: 98, read: '4 min', excerpt: 'A closed loop isn\u2019t a limitation — it\u2019s the whole point. Why money that can\u2019t leave makes a community stronger.' },
  { id: 'pub3', type: 'Work', title: 'Poster studies — winter series', author: 'Fathima R.', init: 'FR', tone: '#1f2a30', tags: ['Print', 'Personal'], claps: 76, read: 'Gallery', excerpt: 'Twelve experiments in type and grain. Personal work, no client, no brief — just play.' },
  { id: 'pub4', type: 'Case Study', title: 'Building Nila\u2019s site as a 2-person team', author: 'Arjun M.', init: 'AM', tone: '#1f2733', tags: ['Tech', 'Next.js'], claps: 54, read: '8 min', excerpt: 'Scope, escrow, and shipping fast without burning out. What the workspace made possible.', project: true },
  { id: 'pub5', type: 'Theory', title: 'The brief is the most important deliverable', author: 'You', init: 'AM', tone: '#26201a', tags: ['Process'], claps: 31, read: '3 min', excerpt: 'Everything good downstream comes from a brief that respects everyone\u2019s time. A short manifesto.', mine: true },
];

const PUB_TYPES = ['All', 'Case Study', 'Work', 'Theory'];

// Public member profiles (directory) — tap a teammate or author to view
const PROFILES = {
  'Devika S.': { init: 'DS', rank: 'Maker', loc: 'Kozhikode', tone: '#332b16', rating: 4.9, projects: 14, bio: 'Brand strategist & identity designer. I lead small teams and ship systems that outlast the launch.', skills: ['Branding', 'Strategy', 'Type', 'Art Direction'] },
  'Hisham K.': { init: 'HK', rank: 'Chief', loc: 'Kochi', tone: '#2a2438', rating: 5.0, projects: 31, bio: 'Director of photography and film lead. Ten years behind the lens, now building teams inside the Camp.', skills: ['Film', 'Photography', 'Direction', 'Edit'] },
  'Fathima R.': { init: 'FR', rank: 'Maker', loc: 'Kozhikode', tone: '#1f2a30', rating: 4.8, projects: 12, bio: 'Illustrator and printmaker. Hand-drawn warmth for brands that want to feel made by people.', skills: ['Illustration', 'Print', 'Murals', 'Type'] },
  'Arjun M.': { init: 'AM', rank: 'Builder', loc: 'Calicut', tone: '#1f2733', rating: 4.7, projects: 9, bio: 'Front-end developer. I turn Figma into fast, accessible sites — and I ship on time.', skills: ['Next.js', 'React', 'Web', 'Motion'] },
  'Sami K.': { init: 'SK', rank: 'Builder', loc: 'Malappuram', tone: '#2b2b2b', rating: 4.6, projects: 7, bio: 'Copywriter and content lead. Words that carry the brand and move people to act.', skills: ['Copy', 'Content', 'Naming', 'Scripts'] },
};

// Monthly leaders — by BeingCoin earned + work delivered (motivation)
const LEADERS = [
  { rank: 1, name: 'Hisham K.', init: 'HK', earned: 8420, delivered: 9, tier: 'OG' },
  { rank: 2, name: 'Fathima R.', init: 'FR', earned: 6110, delivered: 7, tier: 'OG' },
  { rank: 3, name: 'Devika S.', init: 'DS', earned: 5400, delivered: 6, tier: 'Loyal' },
  { rank: 4, name: 'You', init: 'AM', earned: 4240, delivered: 5, tier: 'Loyal', you: true },
  { rank: 5, name: 'Arjun M.', init: 'AM', earned: 2980, delivered: 4, tier: 'Regular' },
  { rank: 6, name: 'Sami K.', init: 'SK', earned: 2510, delivered: 3, tier: 'Regular' },
  { rank: 7, name: 'Sneha P.', init: 'SP', earned: 2120, delivered: 3, tier: 'Regular' },
  { rank: 8, name: 'Rahul V.', init: 'RV', earned: 1840, delivered: 2, tier: 'Regular' },
];

// Programs & workshops members can attend
const WORKSHOPS = [
  { id: 'ws1', title: 'Brand Systems Masterclass', host: 'Devika S.', init: 'DS', when: 'Sat · 4:00 PM', date: 'today', zone: 'The Room', cost: 50, seats: 12, taken: 9, tag: 'Branding', tone: '#332b16', desc: 'Build identity systems that scale — from naming to rollout kits. Hands-on, bring a live project.' },
  { id: 'ws2', title: 'Shooting Reels that Convert', host: 'Hisham K.', init: 'HK', when: 'Sun · 11:00 AM', date: 'tomorrow', zone: 'The Stage', cost: 0, seats: 40, taken: 22, tag: 'Film', tone: '#2a2438', desc: 'A working session on short-form video — lighting, pacing, and the edit that holds attention.' },
  { id: 'ws3', title: 'Intro to BeingCoin & Escrow', host: 'Authority', init: 'BC', when: 'Mon · 6:00 PM', date: 'Mon', zone: 'The Den', cost: 0, seats: 30, taken: 14, tag: 'Onboarding', tone: '#26201a', desc: 'New to the Camp? Understand the closed-loop economy, escrow, and how to price your work.' },
  { id: 'ws4', title: 'Next.js for Makers', host: 'Arjun M.', init: 'AM', when: 'Wed · 5:00 PM', date: 'Wed', zone: 'The Room', cost: 30, seats: 16, taken: 16, tag: 'Tech', tone: '#1f2733', desc: 'Ship a fast, CMS-backed site in a weekend. From Figma to deploy, the practical path.' },
  { id: 'ws5', title: 'Pricing Your Work', host: 'Fathima R.', init: 'FR', when: 'Fri · 3:00 PM', date: 'Fri', zone: 'The Camp', cost: 20, seats: 20, taken: 6, tag: 'Business', tone: '#1f2a30', desc: 'Stop undercharging. A frank workshop on quoting, scope, and protecting your time.' },
];

Object.assign(window, { RANK_PERKS, STAGES, POST_CATS, WORKSPACES, OPEN_WORK, PUBLICATIONS, PUB_TYPES, PROFILES, LEADERS, WORKSHOPS });
