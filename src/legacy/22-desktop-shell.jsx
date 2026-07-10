// BeingCamp — Desktop shell: sidebar navigation + content column.
// Same brain as the phone app (useBeingCamp, CurrentScreen, sheets, toasts) —
// only the chrome differs. Phones keep the tab-bar composition in
// 20-app-controller.jsx; this wraps the identical screens for big displays.

const DESK_NAV_PRIMARY = [
  { id: 'home', icon: 'home', label: 'Home' },
  { id: 'showcase', icon: 'spark', label: 'Showcase' },
  { id: 'projects', icon: 'pool', label: 'Projects' },
  { id: 'profile', icon: 'user', label: 'You' },
];

const DESK_NAV_MORE = [
  { screen: 'wallet', icon: 'wallet', label: 'Wallet' },
  { screen: 'store', icon: 'bag', label: 'The Store' },
  { screen: 'services', icon: 'briefcase', label: 'Services' },
  { screen: 'scan', icon: 'scan', label: 'Zones' },
  { screen: 'programs', icon: 'calendar', label: 'Programs' },
  { screen: 'leaders', icon: 'trophy', label: 'Leaders' },
  { screen: 'orders', icon: 'gift', label: 'Orders' },
  { screen: 'notifications', icon: 'bell', label: 'Notifications' },
];

function DeskNavBtn({ active, icon, label, badge, onClick }) {
  return (
    <button className="tap" onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left',
      background: active ? 'var(--gold-dim)' : 'transparent',
      border: '1px solid ' + (active ? 'var(--gold-line)' : 'transparent'),
      borderRadius: 12, padding: '10px 14px', cursor: 'pointer',
      fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: active ? 700 : 500,
      fontSize: 14, color: active ? 'var(--gold)' : 'var(--muted)',
    }}>
      <Icon name={icon} size={18} color={active ? 'var(--gold)' : 'var(--dim)'} />
      <span style={{ flex: 1 }}>{label}</span>
      {badge > 0 && (
        <span style={{ minWidth: 18, height: 18, padding: '0 5px', borderRadius: 999, background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Space Mono, monospace', fontSize: 10, fontWeight: 700, color: '#1a1407' }}>{badge}</span>
      )}
    </button>
  );
}

function DesktopSidebar({ S }) {
  const sectionLabel = (txt) => (
    <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--dim)', padding: '18px 14px 8px' }}>{txt}</div>
  );
  const goSub = (screen) => { S.setTab('home'); S.go(screen); };
  const activeSub = S.topScreen;

  return (
    <aside style={{
      width: 264, flexShrink: 0, height: '100%', display: 'flex', flexDirection: 'column',
      borderRight: '1px solid var(--line)', background: 'var(--deep)', padding: '22px 14px 16px',
      overflowY: 'auto',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px 16px' }}>
        <CoinMark size={30} />
        <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 24, letterSpacing: '0.06em', color: 'var(--text)' }}>BEINGCAMP</span>
      </div>

      <div style={{ padding: '0 4px 6px' }}>
        <Btn variant="primary" full icon="plus" onClick={() => S.openSheet('create')}>Start something</Btn>
      </div>

      {sectionLabel('Camp')}
      {DESK_NAV_PRIMARY.map((n) => (
        <DeskNavBtn key={n.id} icon={n.icon} label={n.label}
          active={!activeSub && S.tab === n.id}
          onClick={() => S.setTab(n.id)} />
      ))}

      {sectionLabel('Everything else')}
      {DESK_NAV_MORE.map((n) => (
        <DeskNavBtn key={n.screen} icon={n.icon} label={n.label}
          active={activeSub === n.screen}
          badge={n.screen === 'notifications' ? S.unreadCount : 0}
          onClick={() => goSub(n.screen)} />
      ))}

      <div style={{ flex: 1 }} />

      <button className="tap" onClick={() => goSub('wallet')} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface)', border: '1px solid var(--gold-line)', borderRadius: 14, padding: '12px 14px', cursor: 'pointer', marginBottom: 10 }}>
        <CoinMark size={22} />
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--dim)' }}>Balance</div>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 20, color: 'var(--text)', lineHeight: 1 }}>{fmt(S.balance)} <span style={{ fontSize: 12, color: 'var(--gold)' }}>BC</span></div>
        </div>
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 6px 0' }}>
        <div style={{ width: 34, height: 34, borderRadius: 11, background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 800, fontSize: 13, color: '#1a1407', flexShrink: 0 }}>{S.user.initials}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 700, fontSize: 13, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{S.user.name}</div>
          <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9.5, color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{RANK_PERKS[S.rankIndex].name}</div>
        </div>
        <button className="tap" aria-label="Sign out" onClick={S.signOut} style={{ background: 'none', border: '1px solid var(--line)', borderRadius: 10, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Icon name="arrowR" size={15} color="var(--dim)" />
        </button>
      </div>
    </aside>
  );
}

function BeingCampDesktop({ t }) {
  const S = useBeingCamp(t);
  const scrollRef = React.useRef(null);
  React.useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = 0; }, [S.tab, S.topScreen]);

  // First run: the onboarding journey, centered as a card.
  if (!S.entered) {
    return (
      <div className="app-desktop" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 402, height: 'min(844px, calc(100vh - 48px))', borderRadius: 26, overflow: 'hidden', border: '1px solid var(--line2)', boxShadow: '0 30px 80px rgba(0,0,0,0.5)', background: 'var(--bg)', position: 'relative' }}>
          <Onboarding onComplete={(profile) => S.enter(profile)} />
        </div>
      </div>
    );
  }

  return (
    <div className="app-desktop">
      <DesktopSidebar S={S} />
      <main ref={scrollRef} key={S.tab + (S.topScreen || '')} style={{ flex: 1, height: '100%', overflowY: 'auto' }}>
        <div style={{ maxWidth: 620, margin: '0 auto', padding: '30px 30px 90px' }}>
          <CurrentScreen S={S} />
        </div>
      </main>
      <div className="app-desktop-sheets"><SheetRouter S={S} /></div>
      <div className="app-desktop-toast"><Toast data={S.toastData} /></div>
    </div>
  );
}

Object.assign(window, { BeingCampDesktop, DesktopSidebar });
