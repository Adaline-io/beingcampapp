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
  const [isAdmin, setIsAdmin] = React.useState(false); // founder/admin flag from the profile row
  const [isStaff, setIsStaff] = React.useState(false);
  const [teamRole, setTeamRole] = React.useState(null);
  const [joinedChallenges, setJoinedChallenges] = React.useState(saved.joinedChallenges ?? []);
  const [claimedSeats, setClaimedSeats] = React.useState(saved.claimedSeats ?? []);
  const [serverRank, setServerRank] = React.useState(null); // live rank from the DB (levels auto-earned)
  const [completions, setCompletions] = React.useState(null); // live track record (null → derive from workspaces)
  const [authed, setAuthed] = React.useState(false); // has a Supabase session (email account)
  const [booting, setBooting] = React.useState(!!BE); // gate first paint until boot resolves (backend only)
  const [toastData, setToastData] = React.useState(null);
  const rankIndex = serverRank != null ? serverRank : Math.max(0, Math.min(4, t.rankIndex ?? 1));

  React.useEffect(() => {
    localStorage.setItem(PKEY, JSON.stringify({ entered, balance, activityCoins, txns, appliedWork, orders, workspaces, publications, notifs, attending, programs, profile, joinedChallenges, claimedSeats }));
  }, [entered, balance, activityCoins, txns, appliedWork, orders, workspaces, publications, notifs, attending, programs, profile, joinedChallenges, claimedSeats]);

  // Live mode: the public catalog (packs, store, services, briefs) comes from
  // the database — no session needed; demo catalog stays as the fallback.
  React.useEffect(() => {
    if (!BE || !BE.loadCatalog) return;
    let alive = true;
    BE.loadCatalog().then((c) => {
      if (!alive || !c) return;
      setCatalog(c);
      // Shared Showcase: DB publications replace their demo counterparts,
      // local-only pieces (just published, not yet fetched) stay on top.
      if (c.publications && c.publications.length) {
        setPublications((prev) => {
          const ids = new Set(c.publications.map((p) => p.id));
          return [...prev.filter((p) => p.mine && !ids.has(p.id)), ...c.publications];
        });
      }
      // Real programs from the DB + anything the member is hosting locally.
      if (c.workshops && c.workshops.length) {
        setPrograms((prev) => {
          const ids = new Set(c.workshops.map((w) => w.id));
          return [...prev.filter((w) => w.mine && !ids.has(w.id)), ...c.workshops];
        });
      }
    }).catch((e) => console.warn('[beingcamp] catalog load failed:', e));
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
        // A session exists. Hydrate identity + wallet from the server.
        if (b.profile) setProfile(b.profile);
        setBalance(b.balance);
        setActivityCoins(b.activityCoins);
        if (b.txns.length) setTxns(b.txns);
        if (b.orders.length) setOrders(b.orders);
        if (b.projects) setWorkspaces(b.projects); // server truth for signed-in members
        setIsAdmin(!!b.isAdmin);
        setIsStaff(!!b.isStaff);
        setTeamRole(b.teamRole || null);
        if (typeof b.rankIndex === 'number') setServerRank(b.rankIndex);
        setAuthed(true);
        // Enter the app only when the professional profile is complete;
        // a brand-new email account still needs to pick its category/skills.
        setEntered(!!b.onboarded);
        // Track record: delivered work, earnings and scores from the DB.
        if (b.onboarded && BE.listCompletions) BE.listCompletions().then((rows) => {
          if (alive && rows && rows.length) setCompletions(rows.map((r) => ({
            id: String(r.id), title: String(r.title), role: String(r.role), cat: r.cat ? String(r.cat) : null,
            coins: Number(r.coins_earned || 0), score: r.score ? Number(r.score) : null, completed: !!r.completed,
          })));
        }).catch(() => {});
      } else {
        // No session → everyone signs in with email + password.
        setAuthed(false);
        setEntered(false);
      }
      setBooting(false);
    }).catch((e) => { console.warn('[beingcamp] backend boot failed:', e); setBooting(false); });
    // Live bell: new notifications stream in without a reload.
    let unsub = null;
    if (BE.subscribeNotifications) {
      BE.subscribeNotifications((n) => {
        if (!alive) return;
        setNotifs((prev) => [{
          id: String(n.id), ic: n.ic || 'bell', tone: n.tone || 'gold',
          title: String(n.title || 'Update'), body: String(n.body || ''),
          when: 'Now', unread: true, group: 'Today', cta: n.cta || null,
        }, ...prev]);
        toast({ msg: String(n.title || 'New notification'), icon: n.ic || 'bell' });
      }).then((u) => { if (alive) unsub = u; else u(); }).catch(() => {});
    }
    return () => { alive = false; if (unsub) unsub(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Zone QR deep-link (?checkin=<zoneId>): a member scans a printed zone QR
  // with their phone camera, which opens the app here. Once they're in, run the
  // check-in server-side (rank + cost enforced by record_checkin) and strip the
  // param so a refresh doesn't check them in again.
  React.useEffect(() => {
    if (!entered) return;
    let zid = null;
    try { zid = new URLSearchParams(window.location.search).get('checkin'); } catch (e) { zid = null; }
    if (!zid) return;
    try { window.history.replaceState({}, '', window.location.pathname); } catch (e) { /* ignore */ }
    const zone = (typeof ZONES !== 'undefined' ? ZONES : []).find((z) => String(z.id) === zid);
    const label = zone ? zone.name : 'the zone';
    if (BE && BE.syncCheckin) {
      BE.syncCheckin(zid)
        .then(() => { toast({ msg: `Checked in · ${label}`, icon: 'scan' }); })
        .catch((e) => {
          const m = String((e && e.message) || '');
          toast({ msg: /rank too low/i.test(m) ? `Locked — higher rank needed for ${label}` : /insufficient/i.test(m) ? 'Not enough coins to check in' : 'Check-in failed — try the QR again', icon: 'lock' });
        });
    } else if (zone) {
      // Demo/local mode: mirror the check-in locally.
      if (zone.cost > 0) { setBalance((b) => b - zone.cost); pushTxn(`${zone.name} · check-in`, -zone.cost, 'zone'); }
      toast({ msg: `Checked in · ${zone.name}`, icon: 'scan' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entered]);

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
    openWork: (() => {
      const raw = (catalog && catalog.openWork) || (typeof OPEN_WORK !== 'undefined' ? OPEN_WORK : []);
      // Matched-to-your-craft briefs first — makers see their industry's work
      // on top everywhere (Pool, home feed, rail).
      const mine = (typeof industriesForProfile !== 'undefined') ? industriesForProfile(p) : [];
      return (typeof forYouFirst !== 'undefined')
        ? forYouFirst(raw, mine, (o) => (typeof CAT_TO_INDUSTRY !== 'undefined' && CAT_TO_INDUSTRY[o.cat]) || o.cat)
        : raw;
    })(),
    myIndustries: (typeof industriesForProfile !== 'undefined') ? industriesForProfile(p) : [],
    // Dispatch feed: open crew seats, matched-to-your-craft first, claimed hidden.
    crewCalls: (() => {
      const raw = (catalog && catalog.crewCalls) || (typeof CREW_CALLS !== 'undefined' ? CREW_CALLS : []);
      const open = raw.filter((c) => !claimedSeats.includes(c.id));
      const mine = (typeof industriesForProfile !== 'undefined') ? industriesForProfile(p) : [];
      return (typeof forYouFirst !== 'undefined')
        ? forYouFirst(open, mine, (c) => (typeof CAT_TO_INDUSTRY !== 'undefined' && CAT_TO_INDUSTRY[c.cat]) || (typeof INDUSTRIES !== 'undefined' && (INDUSTRIES.find((x) => x.name === c.cat) || {}).id) || c.cat)
        : open;
    })(),
    // Track record: live completion rows, or derived from delivered demo work.
    trackRecord: completions || (workspaces || []).filter((w) => w.stage >= 4).map((w) => ({
      id: 'tr' + w.id, title: w.title, cat: w.cat,
      role: w.you === 'poster' ? 'Poster' : (w.role || 'Member'),
      coins: w.you === 'poster' ? 0 : (w.escrowReleased || w.budget || 0),
      score: w.rating || null, completed: true,
    })),
    // Poster scores the whole crew on delivery — lands on every member's profile.
    rateProject: (w, score) => {
      setWorkspaces((prev) => prev.map((x) => x.id === w.id ? { ...x, rating: score } : x));
      toast({ msg: `Crew scored ${score}/5`, icon: 'star' });
      if (BE && BE.rateProject && /^[0-9a-f-]{36}$/i.test(w.id)) mirror(BE.rateProject(w.id, score));
    },
    // Poster scores one crew member (per-person completion report).
    rateMember: (w, member, score) => {
      setWorkspaces((prev) => prev.map((x) => x.id === w.id
        ? { ...x, team: (x.team || []).map((m) => m === member ? { ...m, score } : m) } : x));
      toast({ msg: `${member.you ? 'You' : member.name} scored ${score}/5`, icon: 'star' });
      if (BE && BE.rateMember && /^[0-9a-f-]{36}$/i.test(w.id) && member.profileId && /^[0-9a-f-]{36}$/i.test(member.profileId)) {
        mirror(BE.rateMember(w.id, member.profileId, score));
      }
    },
    claimSeat: (call) => {
      setClaimedSeats((prev) => prev.includes(call.id) ? prev : [...prev, call.id]);
      toast({ msg: `You're on the crew · ${call.role}`, icon: 'check' });
      if (BE && BE.claimRole && /^[0-9a-f-]{36}$/i.test(call.id)) {
        // Live: the RPC locks the seat atomically, then we rehydrate projects
        // so the new workspace shows up with real team + milestones.
        BE.claimRole(call.id)
          .then(() => BE.boot())
          .then((b) => { if (b && b.projects) setWorkspaces(b.projects); })
          .catch((e) => {
            console.warn('[beingcamp] claim failed:', e);
            // Roll back the optimistic hide + surface the real reason.
            setClaimedSeats((prev) => prev.filter((x) => x !== call.id));
            const msg = String((e && e.message) || '');
            const nice = /higher rank/.test(msg) ? 'That seat needs a higher rank'
              : /already on this project/.test(msg) ? 'You already hold a seat here'
              : /already filled/.test(msg) ? 'Seat just got taken — pick another'
              : 'Could not join — try another seat';
            toast({ msg: nice, icon: 'lock' });
          });
      } else {
        // Demo: open a member-side workspace for the claimed seat.
        setWorkspaces((prev) => [{
          id: 'cw' + Date.now(), title: call.title, poster: 'The Pool', cat: call.cat,
          you: 'member', role: call.role, stage: 2, budget: call.budget, escrowReleased: 0,
          deadline: 'In progress', team: [{ name: 'You', role: call.role, you: true }],
          seats: [], shortlist: [],
          milestones: [
            { name: 'Kickoff', bc: Math.round(call.budget * 0.3), status: 'active' },
            { name: 'Delivery', bc: call.budget - Math.round(call.budget * 0.3), status: 'todo' },
          ],
          chat: [], files: [], schedule: [],
        }, ...prev]);
      }
    },
    leaders: (catalog && catalog.leaders && catalog.leaders.length ? catalog.leaders : null),
    isAdmin, isStaff, teamRole,
    joinedChallenges,
    challenges: (catalog && catalog.challenges && catalog.challenges.length ? catalog.challenges : (typeof CHALLENGES !== 'undefined' ? CHALLENGES : [])),
    joinChallenge: (c) => { setJoinedChallenges((p) => p.includes(c.id) ? p : [...p, c.id]); toast({ msg: `Joined · ${c.title}`, icon: 'trophy' }); if (BE && BE.syncJoinChallenge) mirror(BE.syncJoinChallenge(c.id)); },
    submitChallenge: (c) => { setSheet({ name: 'publish', payload: { challenge: c } }); toast({ msg: 'Publish your entry to submit', icon: 'arrowUR' }); },
    notifs, unreadCount: notifs.filter((n) => n.unread).length,
    markRead: (id) => setNotifs((p) => p.map((n) => n.id === id ? { ...n, unread: false } : n)),
    markAllRead: () => setNotifs((p) => p.map((n) => ({ ...n, unread: false }))),
    attending,
    rsvp: (id) => { setAttending((p) => p.includes(id) ? p : [...p, id]); if (BE) mirror(BE.syncRsvp(id)); },
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
    checkinZone: (zone) => {
      if (zone.cost > 0) { setBalance((b) => b - zone.cost); pushTxn(`${zone.name} · check-in`, -zone.cost, 'zone'); }
      toast({ msg: `Checked in · ${zone.name}`, icon: 'scan' });
      if (BE) mirror(BE.syncCheckin(zone.id));
    },
    spend: (amt, label, ref) => { setBalance((b) => b - amt); pushTxn(label, -amt, ref); toast({ msg: label, coin: -amt }); if (BE) mirror(BE.syncTransaction(label, -amt, ref)); },
    // Escrow funding is deducted server-side by create_project — mirror locally
    // only, so the balance drops once (not twice) in live mode.
    fundEscrow: (amt, label) => { setBalance((b) => b - amt); pushTxn(label, -amt, 'pool'); toast({ msg: label, coin: -amt }); },
    cancelProject: (w) => {
      const released = (w.milestones || []).filter((m) => m.status === 'done').reduce((s, m) => s + (m.bc || 0), 0);
      const refund = Math.max(0, (w.budget || 0) - released);
      setWorkspaces((prev) => prev.map((x) => x.id === w.id ? { ...x, state: 'cancelled', stage: Math.min(x.stage, 1) } : x));
      if (refund > 0) { setBalance((b) => b + refund); pushTxn('Escrow refunded · ' + w.title, refund, 'pool'); }
      toast({ msg: refund > 0 ? `Cancelled · ${fmt(refund)} BC refunded` : 'Project cancelled', icon: 'wallet' });
      if (BE && BE.cancelProject && /^[0-9a-f-]{36}$/i.test(w.id)) {
        BE.cancelProject(w.id).then(() => BE.boot()).then((b) => { if (b) { setBalance(b.balance); if (b.projects) setWorkspaces(b.projects); } }).catch((e) => console.warn('[beingcamp] cancel failed:', e));
      }
    },
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
    addPostedWork: ({ cat, budget, template }) => {
      const tempId = 'w' + Date.now();
      const title = 'Your new ' + cat.toLowerCase() + ' project';
      let milestones;
      if (template && template.milestones) {
        // Industry template: milestone plan scaled to the budget, last one absorbs rounding.
        const ms = template.milestones;
        let used = 0;
        milestones = ms.map((m, i) => {
          const bc = i === ms.length - 1 ? budget - used : Math.round(budget * m.pct);
          used += bc;
          return { name: m.name, bc, status: 'todo' };
        });
      } else {
        milestones = [
          { name: 'Milestone 1', bc: Math.round(budget * 0.4), status: 'todo' },
          { name: 'Milestone 2', bc: Math.round(budget * 0.35), status: 'todo' },
          { name: 'Final delivery', bc: budget - Math.round(budget * 0.4) - Math.round(budget * 0.35), status: 'todo' },
        ];
      }
      // Crew seats: one open seat per template role, payout shares split equally
      // (lead takes the rounding remainder). These become claimable crew calls.
      const roles = (template && template.roles && typeof crewSharesFor !== 'undefined')
        ? crewSharesFor(template.roles, budget) : [];
      if (BE) {
        BE.syncProject({ title, cat, budget, milestones, roles })
          .then((w) => { if (w) setWorkspaces((prev) => prev.map((x) => x.id === tempId ? { ...w, shortlist: x.shortlist, chat: x.chat } : x)); })
          .catch((e) => console.warn('[beingcamp] project sync failed:', e));
      }
      setWorkspaces((p) => [{
      id: tempId, title, poster: 'You', cat,
      you: 'poster', role: 'Poster', stage: 1, budget, escrowReleased: 0, deadline: 'Confirm team',
      team: [],
      seats: roles.map((r) => ({ role: r.role, sharePct: r.sharePct, filled: false })),
      shortlist: [
        { name: 'Devika S.', role: 'Lead', rank: 'Maker', match: 93, pitch: 'I can lead this end-to-end and bring the right people in.' },
        { name: 'Arjun M.', role: 'Specialist', rank: 'Builder', match: 80, pitch: 'Available now, fast and reliable on delivery.' },
        { name: 'Sami K.', role: 'Support', rank: 'Builder', match: 74, pitch: 'Happy to support on copy and coordination.' },
      ],
      milestones,
      chat: [{ who: 'Aslam · Authority', msg: 'Got your brief — here\u2019s a shortlist. Confirm your team to kick off.', when: 'Now', you: false }],
      files: [], schedule: [],
    }, ...p]);
    },
    updateWorkspace: (w) => setWorkspaces((p) => p.map((x) => x.id === w.id ? w : x)),
    // Seat management: a member leaves their own seat, or the poster kicks a
    // claimant. Both reopen the seat (server refuses once coins have been paid).
    leaveSeat: (w, seat) => {
      if (BE && BE.unclaimRole && /^[0-9a-f-]{36}$/i.test(seat.id || '')) {
        BE.unclaimRole(seat.id).then(() => BE.boot()).then((b) => { if (b && b.projects) setWorkspaces(b.projects); })
          .catch((e) => { console.warn(e); toast({ msg: String(e && e.message || '').includes('earned') ? 'You have already earned here' : 'Could not leave', icon: 'lock' }); });
      } else {
        setWorkspaces((prev) => prev.filter((x) => x.id !== w.id));
      }
      toast({ msg: 'Left the crew', icon: 'arrowR' });
    },
    kickSeat: (w, seat) => {
      if (BE && BE.releaseSeat && /^[0-9a-f-]{36}$/i.test(seat.id || '')) {
        BE.releaseSeat(seat.id).then(() => BE.boot()).then((b) => { if (b && b.projects) setWorkspaces(b.projects); })
          .catch((e) => { console.warn(e); toast({ msg: String(e && e.message || '').includes('earned') ? 'They already earned — cannot remove' : 'Could not remove', icon: 'lock' }); });
      } else {
        setWorkspaces((prev) => prev.map((x) => x.id === w.id ? { ...x, seats: (x.seats || []).map((s) => s === seat ? { ...s, filled: false, mine: false } : s), team: (x.team || []).filter((m) => m.role !== seat.role) } : x));
      }
      toast({ msg: `Seat reopened · ${seat.role}`, icon: 'arrowR' });
    },
    addSchedule: (id, item) => setWorkspaces((p) => p.map((x) => x.id === id ? { ...x, schedule: [...(x.schedule || []), item] } : x)),
    addPublication: ({ type, title, project }) => {
      setPublications((prev) => [{
        id: 'pub' + Date.now(), type, title, author: p.name, init: initialsOf(p.name), tone: '#26201a',
        tags: [type === 'Theory' ? 'Essay' : 'New'], claps: 0, read: type === 'Work' ? 'Gallery' : '2 min',
        excerpt: 'Just published to the Showcase.', project: !!project, mine: true,
      }, ...prev]);
      if (BE) mirror(BE.syncPublication({ type, title, author: p.name }));
    },
    authed, booting,
    enter: (newProfile) => { if (newProfile) setProfile(newProfile); setEntered(true); setTab('home'); if (BE) mirror(BE.signIn(newProfile || p, fresh ? 100 : balance)); },
    signOut: () => { setEntered(false); setAuthed(false); setStack([]); setTab('home'); if (BE) mirror(BE.signOut()); },
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
    case 'challenges': return <ChallengesScreen S={S} />;
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

  // Backend mode: hold the first paint until we know if there's a session,
  // so a returning member never flashes the sign-in screen.
  if (S.booting) {
    return (
      <div style={{ height: '100%', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ animation: 'coinPop .6s ease' }}><CoinMark size={54} glow /></div>
      </div>
    );
  }

  if (!S.entered) {
    return <div style={{ height: '100%', background: 'var(--bg)' }}><Onboarding authed={S.authed} onComplete={(profile) => S.enter(profile)} /></div>;
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
