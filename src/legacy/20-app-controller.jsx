// BeingCamp — App controller: state, navigation, economy actions

function useBeingCamp(t) {
  // Supabase bridge (src/services/bridge.ts) — present + enabled only when the
  // backend env keys are configured; null in local/demo mode. Mirror calls are
  // fire-and-forget so a flaky network never blocks the UI.
  const BE = (typeof window !== 'undefined' && window.BeingCampBackend && window.BeingCampBackend.enabled)
    ? window.BeingCampBackend : null;
  const mirror = (promise) => {
    if (promise && promise.catch) promise.catch((e) => {
      console.warn('[beingcamp] backend sync failed:', e);
      toast({ msg: 'Sync failed — saved on this device', icon: 'wallet' });
    });
  };

  const fresh = !!t.newMember;
  const PKEY = fresh ? 'beingcamp_new' : 'beingcamp_v3';
  const loadState = () => { try { return JSON.parse(localStorage.getItem(PKEY)) || {}; } catch (e) { return {}; } };
  const saved = React.useRef(loadState()).current;
  const [entered, setEntered] = React.useState(saved.entered ?? false);
  const [tab, setTab] = React.useState('home');
  const [stack, setStack] = React.useState([]); // sub-screens above the tab
  const [sheet, setSheet] = React.useState({ name: null, payload: {} });
  const [balance, setBalance] = React.useState(saved.balance ?? (fresh ? 100 : 2740));
  const [activityCoins, setActivityCoins] = React.useState(saved.activityCoins ?? (fresh ? 100 : 740));
  const [txns, setTxns] = React.useState(saved.txns ?? (fresh ? [{ id: 't0', ref: 'pack', label: 'Initiation reward', amount: 100, when: 'Just now' }] : SEED_TXNS));
  const [appliedWork, setAppliedWork] = React.useState(saved.appliedWork ?? (fresh ? [] : ['o4']));
  const [orders, setOrders] = React.useState(saved.orders ?? (fresh ? [] : (typeof MY_ORDERS !== 'undefined' ? MY_ORDERS : [])));
  const [workspaces, setWorkspaces] = React.useState(saved.workspaces ?? (fresh ? [] : (typeof WORKSPACES !== 'undefined' ? WORKSPACES : [])));
  const [publications, setPublications] = React.useState(saved.publications ?? (fresh ? [] : (typeof PUBLICATIONS !== 'undefined' ? PUBLICATIONS : [])));
  const [notifs, setNotifs] = React.useState(saved.notifs ?? (fresh ? [] : (typeof NOTIFS !== 'undefined' ? NOTIFS.map((n) => ({ ...n })) : [])));
  const [attending, setAttending] = React.useState(saved.attending ?? (fresh ? [] : ['ws3']));
  const [programs, setPrograms] = React.useState(saved.programs ?? (typeof WORKSHOPS !== 'undefined' ? WORKSHOPS.map((w) => ({ ...w })) : []));
  const DEFAULT_PROFILE = { name: 'Aman', accent: '#c9a84c', city: 'Calicut', headline: 'Brand & product designer', bio: 'Building things at the Camp — branding, product, and the occasional film. Open to leading small teams.', skills: ['Branding', 'Motion', 'Web Dev'], path: 'maker', since: "Jun '25" };
  const [profile, setProfile] = React.useState(saved.profile ?? (fresh ? null : DEFAULT_PROFILE));
  const [catalog, setCatalog] = React.useState(null); // live catalog from the DB (null → demo data)
  const [toastData, setToastData] = React.useState(null);
  const rankIndex = Math.max(0, Math.min(4, t.rankIndex ?? 1));

  React.useEffect(() => {
    localStorage.setItem(PKEY, JSON.stringify({ entered, balance, activityCoins, txns, appliedWork, orders, workspaces, publications, notifs, attending, programs, profile }));
  }, [entered, balance, activityCoins, txns, appliedWork, orders, workspaces, publications, notifs, attending, programs, profile]);

  // Live mode: the public catalog (packs, store, services, briefs) comes from
  // the database — no session needed; demo catalog stays as the fallback.
  React.useEffect(() => {
    if (!BE || !BE.loadCatalog) return;
    let alive = true;
    BE.loadCatalog().then((c) => { if (alive && c) setCatalog(c); })
      .catch((e) => console.warn('[beingcamp] catalog load failed:', e));
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Live mode: restore the Supabase session and hydrate from the database.
  // Server state wins for identity + wallet; demo content fills the rest until
  // those screens are migrated. No session (or any failure) → start local.
  React.useEffect(() => {
    if (!BE) return;
    let alive = true;
    BE.boot().then((b) => {
      if (!alive) return;
      if (b) {
        if (b.profile) setProfile(b.profile);
        setBalance(b.balance);
        setActivityCoins(b.activityCoins);
        if (b.txns.length) setTxns(b.txns);
        if (b.orders.length) setOrders(b.orders);
        setEntered(true);
      } else if (entered && profile) {
        // Entered locally but no server account (e.g. sign-ins were disabled
        // when onboarding ran) — establish one now with the saved identity.
        mirror(BE.signIn(profile, balance));
      }
    }).catch((e) => console.warn('[beingcamp] backend boot failed:', e));
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initialsOf = (name) => (name || 'You').trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase() || 'YOU';
  const p = profile || DEFAULT_PROFILE;

  const toast = (d) => setToastData({ ...d, key: Date.now() });
  React.useEffect(() => { if (toastData) { const x = setTimeout(() => setToastData(null), 2600); return () => clearTimeout(x); } }, [toastData]);

  const pushTxn = (label, amount, ref) => setTxns((p) => [{ id: 'x' + Date.now(), label, amount, ref, when: 'Just now' }, ...p]);

  const S = {
    user: { name: p.name, initials: initialsOf(p.name), accent: p.accent || '#c9a84c' },
    profile: p,
    updateProfile: (patch) => { setProfile((prev) => ({ ...(prev || DEFAULT_PROFILE), ...patch })); if (BE) mirror(BE.syncProfile(patch)); },
    greeting: (() => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'; })(),
    loyalty: 'Loyal',
    entered, tab, sheet, balance, activityCoins, txns, appliedWork, orders, workspaces, publications, rankIndex,
    // Live catalog with demo fallbacks — screens read these instead of the raw consts.
    packs: (catalog && catalog.packs) || (typeof COIN_PACKS !== 'undefined' ? COIN_PACKS : []),
    products: (catalog && catalog.products) || (typeof PRODUCTS !== 'undefined' ? PRODUCTS : []),
    storeCats: (catalog && catalog.storeCats) || (typeof STORE_CATS !== 'undefined' ? STORE_CATS : ['All']),
    services: (catalog && catalog.services) || (typeof SERVICES !== 'undefined' ? SERVICES : []),
    openWork: (catalog && catalog.openWork) || (typeof OPEN_WORK !== 'undefined' ? OPEN_WORK : []),
    notifs, unreadCount: notifs.filter((n) => n.unread).length,
    markRead: (id) => setNotifs((p) => p.map((n) => n.id === id ? { ...n, unread: false } : n)),
    markAllRead: () => setNotifs((p) => p.map((n) => ({ ...n, unread: false }))),
    attending,
    rsvp: (id) => setAttending((p) => p.includes(id) ? p : [...p, id]),
    cancelRsvp: (id) => setAttending((p) => p.filter((x) => x !== id)),
    programs,
    addProgram: (p) => setPrograms((prev) => [{
      id: 'ws' + Date.now(), title: p.title, host: 'You', init: 'AM', when: p.when, date: 'soon',
      zone: p.zone, cost: p.cost, seats: p.seats, taken: 0, tag: p.tag, tone: p.tone,
      desc: p.desc || 'A member-led session at the Camp.', mine: true,
    }, ...prev]),
    toastData, toast,
    setTab: (id) => { setStack([]); setTab(id); },
    go: (screen, payload = {}) => setStack((s) => [...s, { screen, payload }]),
    back: () => setStack((s) => s.slice(0, -1)),
    openSheet: (name, payload = {}) => setSheet({ name, payload }),
    closeSheet: () => setSheet({ name: null, payload: {} }),
    spend: (amt, label, ref) => { setBalance((b) => b - amt); pushTxn(label, -amt, ref); toast({ msg: label, coin: -amt }); if (BE) mirror(BE.syncTransaction(label, -amt, ref)); },
    earn: (amt, label, ref) => { setBalance((b) => b + amt); setActivityCoins((a) => a + amt); pushTxn(label, amt, ref); toast({ msg: label, coin: amt }); if (BE) mirror(BE.syncTransaction(label, amt, ref)); },
    buyPack: (pack) => { const total = pack.coins + pack.bonus; const label = `${pack.name}${pack.bonus ? ` · +${pack.bonus} bonus` : ''}`; setBalance((b) => b + total); pushTxn(label, total, 'pack'); if (BE) mirror(BE.syncTransaction(label, total, 'pack')); },
    applyWork: (id) => setAppliedWork((p) => p.includes(id) ? p : [...p, id]),
    addOrder: (product) => {
      setOrders((p) => [{
        id: '#BC-' + (2042 + p.length), item: product.name, source: product.source, bc: product.bc,
        tone: product.tone, type: product.type === 'physical' ? 'physical' : 'pass', stage: product.type === 'physical' ? 0 : 4,
        when: 'Just now', eta: product.type === 'physical' ? 'Arrives in 3–5 days' : 'Ready to use',
      }, ...p]);
      if (BE) mirror(BE.syncOrder({ item: product.name, source: product.source, bc: product.bc, tone: product.tone, type: product.type === 'physical' ? 'physical' : 'pass', stage: product.type === 'physical' ? 0 : 4 }));
    },
    addPostedWork: ({ cat, budget }) => setWorkspaces((p) => [{
      id: 'w' + Date.now(), title: 'Your new ' + cat.toLowerCase() + ' project', poster: 'You', cat,
      you: 'poster', role: 'Poster', stage: 1, budget, escrowReleased: 0, deadline: 'Confirm team',
      team: [],
      shortlist: [
        { name: 'Devika S.', role: 'Lead', rank: 'Maker', match: 93, pitch: 'I can lead this end-to-end and bring the right people in.' },
        { name: 'Arjun M.', role: 'Specialist', rank: 'Builder', match: 80, pitch: 'Available now, fast and reliable on delivery.' },
        { name: 'Sami K.', role: 'Support', rank: 'Builder', match: 74, pitch: 'Happy to support on copy and coordination.' },
      ],
      milestones: [{ name: 'Milestone 1', bc: Math.round(budget * 0.4), status: 'todo' }, { name: 'Milestone 2', bc: Math.round(budget * 0.35), status: 'todo' }, { name: 'Final delivery', bc: budget - Math.round(budget * 0.4) - Math.round(budget * 0.35), status: 'todo' }],
      chat: [{ who: 'Aslam · Authority', msg: 'Got your brief — here\u2019s a shortlist. Confirm your team to kick off.', when: 'Now', you: false }],
      files: [], schedule: [],
    }, ...p]),
    updateWorkspace: (w) => setWorkspaces((p) => p.map((x) => x.id === w.id ? w : x)),
    addSchedule: (id, item) => setWorkspaces((p) => p.map((x) => x.id === id ? { ...x, schedule: [...(x.schedule || []), item] } : x)),
    addPublication: ({ type, title, project }) => setPublications((p) => [{
      id: 'pub' + Date.now(), type, title, author: 'You', init: 'AM', tone: '#26201a',
      tags: [type === 'Theory' ? 'Essay' : 'New'], claps: 0, read: type === 'Work' ? 'Gallery' : '2 min',
      excerpt: 'Just published to the Showcase.', project: !!project, mine: true,
    }, ...p]),
    enter: (newProfile) => { if (newProfile) setProfile(newProfile); setEntered(true); setTab('home'); if (BE) mirror(BE.signIn(newProfile || p, fresh ? 100 : balance)); },
    signOut: () => { setEntered(false); setStack([]); setTab('home'); if (BE) mirror(BE.signOut()); },
    resetDemo: () => { localStorage.removeItem(PKEY); location.reload(); },
    topScreen: stack.length ? stack[stack.length - 1].screen : null,
    topPayload: stack.length ? stack[stack.length - 1].payload : {},
  };
  return S;
}

function CurrentScreen({ S }) {
  // Sub-screens (pushed on the stack) take priority
  switch (S.topScreen) {
    case 'wallet': return <WalletScreen S={S} />;
    case 'buy': return <BuyScreen S={S} />;
    case 'coinInfo': return <CoinInfoScreen S={S} />;
    case 'services': return <ServicesScreen S={S} />;
    case 'store': return <StoreScreen S={S} />;
    case 'scan': return <ScanScreen S={S} />;
    case 'findwork': return <FindWorkScreen S={S} />;
    case 'workspace': return <WorkspaceScreen S={S} />;
    case 'pubDetail': return <PubDetailScreen S={S} />;
    case 'memberProfile': return <MemberProfileScreen S={S} />;
    case 'leaders': return <LeadersScreen S={S} />;
    case 'programs': return <ProgramsScreen S={S} />;
    case 'notifications': return <NotificationsScreen S={S} />;
    case 'referrals': return <ReferralsScreen S={S} />;
    case 'orders': return <OrdersScreen S={S} />;
    case 'orderDetail': return <OrderDetailScreen S={S} />;
    default: break;
  }
  switch (S.tab) {
    case 'home': return <MemberHome S={S} />;
    case 'showcase': return <ShowcaseScreen S={S} />;
    case 'projects': return <ProjectsScreen S={S} />;
    case 'profile': return <ProfileScreen S={S} />;
    default: return <MemberHome S={S} />;
  }
}

function BeingCampApp({ t }) {
  const S = useBeingCamp(t);
  const scrollRef = React.useRef(null);
  React.useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = 0; }, [S.tab, S.topScreen]);

  if (!S.entered) {
    return <div style={{ height: '100%', background: 'var(--bg)' }}><Onboarding onComplete={(profile) => S.enter(profile)} /></div>;
  }

  return (
    <div style={{ height: '100%', background: 'var(--bg)', position: 'relative', overflow: 'hidden' }}>
      <div ref={scrollRef} key={S.tab + (S.topScreen || '')} style={{ height: '100%', overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '52px 22px 118px' }}>
        <CurrentScreen S={S} />
      </div>
      <TabBar S={S} />
      <SheetRouter S={S} />
      <Toast data={S.toastData} />
    </div>
  );
}

Object.assign(window, { useBeingCamp, CurrentScreen, BeingCampApp });
