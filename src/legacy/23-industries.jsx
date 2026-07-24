// BeingCamp — Industry engine + community challenges.
// A project's roles, milestone plan, and requirement checklist change with the
// industry: a film crew needs pre-production and gear; a tech build needs
// scope and ship. Small gigs and big productions scale the same templates.

const INDUSTRIES = [
  {
    id: 'design', name: 'Design', icon: 'spark', tone: 'var(--gold)',
    desc: 'Brand, graphic, packaging, illustration',
    roles: ['Lead designer', 'Illustrator', 'Copywriter'],
    milestones: [{ name: 'Concept directions', pct: 0.3 }, { name: 'Refinement', pct: 0.3 }, { name: 'Final delivery', pct: 0.4 }],
    requirements: ['Brief & references', 'Brand assets (if any)', 'Formats & sizes list'],
    sizes: { small: 'Logo · poster · single asset', big: 'Full identity · campaign system' },
  },
  {
    id: 'tech', name: 'Tech', icon: 'scan', tone: 'var(--blue)',
    desc: 'Websites, apps, tools, automations',
    roles: ['Frontend dev', 'Backend dev', 'Product designer'],
    milestones: [{ name: 'Scope & prototype', pct: 0.25 }, { name: 'Build', pct: 0.45 }, { name: 'Ship & handover', pct: 0.3 }],
    requirements: ['Feature list', 'Design files or references', 'Hosting / accounts access'],
    sizes: { small: 'Landing page · fix · widget', big: 'Full product · multi-screen app' },
  },
  {
    id: 'film', name: 'Film & Video', icon: 'pool', tone: 'var(--red)',
    desc: 'Ads, brand films, shorts, documentaries',
    roles: ['Director', 'DoP / Camera', 'Editor', 'Sound', 'Production assistant'],
    milestones: [{ name: 'Pre-production', pct: 0.25 }, { name: 'Shoot days', pct: 0.4 }, { name: 'Post & final cut', pct: 0.35 }],
    requirements: ['Script or treatment', 'Locations & permissions', 'Gear list & crew size', 'Shoot dates'],
    sizes: { small: 'Reel · single-day shoot', big: 'Multi-day production · full crew' },
  },
  {
    id: 'media', name: 'Media & Content', icon: 'user', tone: 'var(--green)',
    desc: 'Photography, social, writing, podcasts',
    roles: ['Photographer', 'Content writer', 'Social manager'],
    milestones: [{ name: 'Plan & shot list', pct: 0.3 }, { name: 'Production', pct: 0.4 }, { name: 'Edit & publish pack', pct: 0.3 }],
    requirements: ['Platforms & formats', 'Brand voice notes', 'Publishing calendar'],
    sizes: { small: 'One shoot · content pack', big: 'Monthly retainer · full channel' },
  },
  {
    id: 'music', name: 'Music & Audio', icon: 'bell', tone: 'var(--purple)',
    desc: 'Production, scoring, mixing, jingles',
    roles: ['Producer', 'Session artist', 'Mix engineer'],
    milestones: [{ name: 'Demo / sketch', pct: 0.3 }, { name: 'Production', pct: 0.4 }, { name: 'Mix & master', pct: 0.3 }],
    requirements: ['References & mood', 'Duration & usage rights', 'Stems (if existing)'],
    sizes: { small: 'Jingle · single track', big: 'EP · full score' },
  },
  {
    id: 'events', name: 'Events', icon: 'calendar', tone: 'var(--gold)',
    desc: 'Launches, workshops, exhibitions, gigs',
    roles: ['Event lead', 'Stage & space design', 'AV / technical'],
    milestones: [{ name: 'Plan & vendors', pct: 0.35 }, { name: 'Event day', pct: 0.4 }, { name: 'Wrap & recap', pct: 0.25 }],
    requirements: ['Date & venue', 'Expected headcount', 'Budget split (space / AV / catering)'],
    sizes: { small: 'Workshop · pop-up', big: 'Launch · festival day' },
  },
  {
    id: 'marketing', name: 'Marketing', icon: 'trophy', tone: 'var(--blue)',
    desc: 'Campaigns, launches, growth, ads',
    roles: ['Strategist', 'Performance marketer', 'Creative lead'],
    milestones: [{ name: 'Strategy & plan', pct: 0.3 }, { name: 'Campaign live', pct: 0.4 }, { name: 'Report & optimize', pct: 0.3 }],
    requirements: ['Goal & KPI', 'Audience notes', 'Ad budget (separate from fee)'],
    sizes: { small: 'One campaign · audit', big: 'Quarter plan · multi-channel' },
  },
];

// ── Community challenges: always something to play, always a way to earn ──
const CHALLENGES = [
  { id: 'ch1', title: 'Poster Jam: Monsoon Edition', industry: 'design', reward: 300, deadline: '6 days', entries: 14, tag: 'Weekly', desc: 'One poster, any medium, on this month’s theme: monsoon in the city. Top 3 picked at Friday Crit Night.' },
  { id: 'ch2', title: '60-Second Story', industry: 'film', reward: 500, deadline: '12 days', entries: 8, tag: 'Open', desc: 'Tell a complete story in sixty seconds. Phone footage welcome. Screened at The Stage.' },
  { id: 'ch3', title: 'Camp Website Micro-tool', industry: 'tech', reward: 400, deadline: '9 days', entries: 5, tag: 'Build', desc: 'Build a tiny tool the Camp actually needs — booking widget, gear list, ride share. Ships if it wins.' },
  { id: 'ch4', title: 'Street Portrait Series', industry: 'media', reward: 250, deadline: '4 days', entries: 19, tag: 'Weekly', desc: 'Five portraits, one street, one hour of light. Series thinking over single shots.' },
  { id: 'ch5', title: 'Sound of the Space', industry: 'music', reward: 350, deadline: '15 days', entries: 3, tag: 'Open', desc: 'A 90-second ambient piece built from sounds recorded inside BeingCamp.' },
];

function industryOf(id) { return INDUSTRIES.find((x) => x.id === id) || INDUSTRIES[0]; }

// ── Dispatch: crew seats + payout shares + rank gates ───────────────────
// Each posted project opens one seat per template role. Shares are the
// ratio used by the escrow release (milestone amount × share ÷ total), so
// an equal split is the default; the lead absorbs the rounding remainder.
// The lead seat carries a rank gate so a brand-new member can't grab the
// wheel on a big production — bigger budgets need a more proven lead.
function crewSharesFor(roles, budget = 0) {
  const n = roles.length;
  if (!n) return [];
  const base = Math.floor(100 / n);
  const leadGate = budget >= 5000 ? 2 : budget >= 1500 ? 1 : 0; // Builder / Recruit / any
  return roles.map((role, i) => ({
    role,
    sharePct: i === 0 ? 100 - base * (n - 1) : base,
    minRank: i === 0 ? leadGate : 0,
  }));
}
// Rank names for gate labels (matches profile ladder order).
const RANK_LABELS = ['Visitor', 'Recruit', 'Builder', 'Maker', 'Chief'];

// Demo crew calls — the local-mode dispatch feed (live mode loads real
// open seats from the database instead).
const CREW_CALLS = [
  { id: 'cc1', role: 'Director', sharePct: 40, minRank: 2, projectId: 'demo1', title: 'Backwater wedding film — final cut', cat: 'Film & Video', budget: 2400 },
  { id: 'cc2', role: 'Frontend dev', sharePct: 34, minRank: 0, projectId: 'demo2', title: 'Café ordering site', cat: 'Tech', budget: 1800 },
  { id: 'cc3', role: 'Illustrator', sharePct: 33, minRank: 0, projectId: 'demo3', title: 'Monsoon gig poster series', cat: 'Design', budget: 900 },
  { id: 'cc4', role: 'Sound', sharePct: 20, minRank: 0, projectId: 'demo1', title: 'Backwater wedding film — final cut', cat: 'Film & Video', budget: 2400 },
];

// ── Personalization: use cases follow the member's craft, not everyone
// gets everything. Skills chosen at onboarding map to industries; matched
// briefs/challenges surface first for that member.
const SKILL_TO_INDUSTRY = {
  branding: 'design', illustration: 'design', 'ui/ux': 'design', print: 'design', packaging: 'design', strategy: 'design',
  'web dev': 'tech', web: 'tech', tech: 'tech', product: 'tech',
  film: 'film', motion: 'film', editing: 'film', video: 'film',
  photography: 'media', copywriting: 'media', social: 'media', content: 'media',
  sound: 'music', music: 'music',
  events: 'events', marketing: 'marketing',
};

function industriesForProfile(profile) {
  const out = new Set();
  // The chosen category (agile discipline) leads — it's the member's home lane.
  if (profile && profile.category) out.add(String(profile.category));
  const skills = (profile && profile.skills) || [];
  for (const sk of skills) {
    const hit = SKILL_TO_INDUSTRY[String(sk).toLowerCase()];
    if (hit) out.add(hit);
  }
  return [...out];
}

// Stable partition: items matching the member's industries first.
function forYouFirst(items, myIndustries, keyOf) {
  if (!myIndustries || !myIndustries.length) return items;
  const mine = new Set(myIndustries);
  const hit = [], rest = [];
  for (const it of items) (mine.has(keyOf(it)) ? hit : rest).push(it);
  return [...hit, ...rest];
}

// Briefs use display categories; map them back to industry ids for matching.
const CAT_TO_INDUSTRY = { Branding: 'design', Production: 'film', Tech: 'tech', Marketing: 'marketing', Strategy: 'marketing' };

// ── Challenges screen (phone column + desktop wide) ─────────────────────
function ChallengeCard({ S, c }) {
  const ind = industryOf(c.industry);
  const joined = (S.joinedChallenges || []).includes(c.id);
  return (
    <Card pad={16} style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 9 }}>
        <Badge tone="gold">{c.tag}</Badge>
        <Badge>{ind.name}</Badge>
        {(S.myIndustries || []).includes(c.industry) && <Badge tone="green">For your craft</Badge>}
        <span style={{ marginLeft: 'auto', fontFamily: 'Space Mono, monospace', fontSize: 10.5, color: 'var(--dim)' }}>{c.deadline} left</span>
      </div>
      <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 800, fontSize: 16.5, color: 'var(--text)', letterSpacing: '-0.01em' }}>{c.title}</div>
      <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 12.5, color: 'var(--muted)', margin: '6px 0 12px', lineHeight: 1.5 }}>{c.desc}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <BC amount={c.reward} size={14} color="var(--gold)" />
        <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 10.5, color: 'var(--dim)' }}>{c.entries + (joined ? 1 : 0)} entries</span>
        <span style={{ marginLeft: 'auto' }}>
          {joined
            ? <Btn variant="outline" size="sm" icon="arrowUR" onClick={() => S.submitChallenge(c)}>Submit entry</Btn>
            : <Btn variant="primary" size="sm" onClick={() => S.joinChallenge(c)}>Join</Btn>}
        </span>
      </div>
    </Card>
  );
}

function ChallengesScreen({ S }) {
  return (
    <div style={{ animation: 'screenIn .3s ease' }}>
      <ScreenHead title="CHALLENGES" sub="Play, compete, earn" onBack={S.back} right={<WalletChip S={S} />} />
      <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 12.5, color: 'var(--muted)', margin: '-6px 0 16px', lineHeight: 1.5 }}>
        Weekly prompts across every craft. Join free, submit before the deadline, winners take the pot at Crit Night.
      </div>
      {forYouFirst(S.challenges || CHALLENGES, S.myIndustries, (c) => c.industry).map((c) => <ChallengeCard key={c.id} S={S} c={c} />)}
    </div>
  );
}

function DesktopChallenges({ S }) {
  return (
    <div style={{ animation: 'screenIn .3s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 800, letterSpacing: '-0.01em', fontSize: 25, color: 'var(--text)' }}>Challenges</div>
          <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>Weekly prompts across every craft — join, submit, take the pot</div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
        {forYouFirst(S.challenges || CHALLENGES, S.myIndustries, (c) => c.industry).map((c) => <ChallengeCard key={c.id} S={S} c={c} />)}
      </div>
    </div>
  );
}

Object.assign(window, { INDUSTRIES, CHALLENGES, CREW_CALLS, RANK_LABELS, industryOf, industriesForProfile, forYouFirst, crewSharesFor, CAT_TO_INDUSTRY, ChallengesScreen, DesktopChallenges });
