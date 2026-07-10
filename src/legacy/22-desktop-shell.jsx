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

// ── Desktop-native Home: a real dashboard that uses the width ──────────
function DeskCard({ children, style, onClick, hl }) {
  return (
    <div className={onClick ? 'tap' : ''} onClick={onClick} style={{
      background: hl
        ? 'radial-gradient(120% 180% at 10% 0%, var(--gold-dim), rgba(201,168,76,0.02) 60%), var(--surface)'
        : 'var(--surface)',
      border: '1px solid ' + (hl ? 'var(--gold-line)' : 'var(--line)'),
      borderRadius: 18, padding: 20, cursor: onClick ? 'pointer' : 'default', ...style,
    }}>{children}</div>
  );
}

function DeskSectionHead({ label, action, onAction }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', margin: '26px 0 12px' }}>
      <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--dim)' }}>{label}</span>
      {action && <button className="tap" onClick={onAction} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 700, fontSize: 12.5, color: 'var(--gold)' }}>{action} →</button>}
    </div>
  );
}

function DesktopHome({ S }) {
  const rank = RANK_PERKS[S.rankIndex];
  const next = RANK_PERKS[Math.min(4, S.rankIndex + 1)];
  const projects = (S.workspaces || []).slice(0, 4);
  const briefs = (S.openWork || []).slice(0, 3);
  const recent = (S.txns || []).slice(0, 5);

  return (
    <div style={{ animation: 'screenIn .3s ease' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 18 }}>
        <span style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 14, color: 'var(--muted)' }}>{S.greeting},</span>
        <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 30, color: 'var(--text)', lineHeight: 1 }}>{S.user.name}</span>
        <Badge tone="gold">{rank.name}</Badge>
      </div>

      {/* Hero row: wallet + camp today */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 14 }}>
        <DeskCard hl>
          <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--gold)' }}>BeingCoin balance</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '10px 0 4px' }}>
            <CoinMark size={44} glow />
            <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 58, color: 'var(--text)', lineHeight: 0.95 }}>{fmt(S.balance)}</span>
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--dim)' }}>Earn</div>
              <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 24, color: 'var(--gold)' }}>{rank.earn}</div>
            </div>
          </div>
          <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 12.5, color: 'var(--muted)', margin: '8px 0 10px' }}>
            {fmt(S.activityCoins)} activity BC · {S.rankIndex < 4 ? `next rank: ${next.name}` : 'top rank reached'}
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
            <Btn variant="primary" icon="plus" onClick={() => { S.setTab('home'); S.go('wallet'); S.go('buy'); }}>Buy coins</Btn>
            <Btn variant="ghost" icon="wallet" onClick={() => { S.setTab('home'); S.go('wallet'); }}>Wallet</Btn>
          </div>
        </DeskCard>

        <DeskCard>
          <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--dim)', marginBottom: 12 }}>Camp today</div>
          {[
            { ic: 'bell', tone: 'var(--gold)', label: S.unreadCount ? `${S.unreadCount} unread notification${S.unreadCount > 1 ? 's' : ''}` : 'All caught up', go: () => { S.setTab('home'); S.go('notifications'); } },
            { ic: 'scan', tone: 'var(--green)', label: 'Check in to a zone', go: () => { S.setTab('home'); S.go('scan'); } },
            { ic: 'calendar', tone: 'var(--blue)', label: `${(S.programs || []).length} programs coming up`, go: () => { S.setTab('home'); S.go('programs'); } },
          ].map((r) => (
            <button key={r.label} className="tap" onClick={r.go} style={{ display: 'flex', alignItems: 'center', gap: 11, width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: '9px 2px', borderBottom: '1px solid var(--line)' }}>
              <Icon name={r.ic} size={17} color={r.tone} />
              <span style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 13.5, color: 'var(--text)' }}>{r.label}</span>
              <Icon name="arrowR" size={14} color="var(--dim)" style={{ marginLeft: 'auto' }} />
            </button>
          ))}
        </DeskCard>
      </div>

      {/* Projects */}
      <DeskSectionHead label="Your projects" action="All" onAction={() => S.setTab('projects')} />
      {projects.length === 0 ? (
        <DeskCard onClick={() => S.openSheet('postWork')}>
          <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 700, fontSize: 14.5, color: 'var(--text)' }}>No projects yet</div>
          <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>Post work or apply in the Pool to start your first one.</div>
        </DeskCard>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {projects.map((w) => {
            const released = w.milestones ? w.milestones.filter((m) => m.status === 'done').length : 0;
            return (
              <DeskCard key={w.id} onClick={() => { S.setTab('projects'); S.go('workspace', { id: w.id }); }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                  <Badge tone={w.you === 'poster' ? 'blue' : 'gold'}>{w.you === 'poster' ? 'You posted' : w.role}</Badge>
                  <Badge>{STAGES[w.stage]}</Badge>
                </div>
                <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 700, fontSize: 15.5, color: 'var(--text)', lineHeight: 1.3 }}>{w.title}</div>
                <div style={{ margin: '12px 0 6px' }}><Progress value={w.escrowReleased} max={w.budget} h={5} /></div>
                <div style={{ display: 'flex', fontFamily: 'Space Mono, monospace', fontSize: 10.5, color: 'var(--dim)' }}>
                  <span>{released}/{w.milestones ? w.milestones.length : 0} milestones</span>
                  <span style={{ marginLeft: 'auto', color: 'var(--green)' }}>{fmt(w.escrowReleased)} / {fmt(w.budget)} BC</span>
                </div>
              </DeskCard>
            );
          })}
        </div>
      )}

      {/* Open work + recent activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div>
          <DeskSectionHead label="Open in the Pool" action="Find work" onAction={() => { S.setTab('projects'); S.go('findwork'); }} />
          <DeskCard style={{ padding: '6px 20px' }}>
            {briefs.map((o, i) => (
              <div key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 0', borderBottom: i < briefs.length - 1 ? '1px solid var(--line)' : 'none' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 700, fontSize: 13.5, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{o.title}</div>
                  <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, color: 'var(--dim)', marginTop: 2 }}>{o.poster} · {o.cat}</div>
                </div>
                <BC amount={o.pay} size={13} color="var(--gold)" />
              </div>
            ))}
          </DeskCard>
        </div>
        <div>
          <DeskSectionHead label="Recent activity" action="Wallet" onAction={() => { S.setTab('home'); S.go('wallet'); }} />
          <DeskCard style={{ padding: '6px 20px' }}>
            {recent.map((x, i) => (
              <div key={x.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 0', borderBottom: i < recent.length - 1 ? '1px solid var(--line)' : 'none' }}>
                <Icon name={txIcon(x.ref)} size={15} color={x.amount > 0 ? 'var(--green)' : 'var(--muted)'} />
                <span style={{ flex: 1, fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 13, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{x.label}</span>
                <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 12, color: x.amount > 0 ? 'var(--green)' : 'var(--muted)' }}>{x.amount > 0 ? '+' : ''}{fmt(x.amount)}</span>
              </div>
            ))}
          </DeskCard>
        </div>
      </div>
    </div>
  );
}

// ── Right rail: live context beside every non-home screen ──────────────
function DesktopRail({ S }) {
  const notifs = (S.notifs || []).filter((n) => n.unread).slice(0, 3);
  const briefs = (S.openWork || []).slice(0, 3);
  const programs = (S.programs || []).slice(0, 2);
  return (
    <aside className="desk-rail">
      <DeskCard style={{ marginBottom: 14 }}>
        <DeskSectionHead label="Notifications" action={notifs.length ? 'All' : null} onAction={() => { S.setTab('home'); S.go('notifications'); }} />
        {notifs.length === 0 ? (
          <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 12.5, color: 'var(--dim)' }}>All caught up.</div>
        ) : notifs.map((n) => (
          <div key={n.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--line)' }}>
            <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 700, fontSize: 12.5, color: 'var(--text)' }}>{n.title}</div>
            <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 11.5, color: 'var(--muted)', marginTop: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{n.body}</div>
          </div>
        ))}
      </DeskCard>
      <DeskCard style={{ marginBottom: 14 }}>
        <DeskSectionHead label="Open work" action="Pool" onAction={() => { S.setTab('projects'); S.go('findwork'); }} />
        {briefs.map((o) => (
          <div key={o.id} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '7px 0', borderBottom: '1px solid var(--line)' }}>
            <span style={{ flex: 1, fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 12.5, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{o.title}</span>
            <BC amount={o.pay} size={12} color="var(--gold)" />
          </div>
        ))}
      </DeskCard>
      <DeskCard>
        <DeskSectionHead label="Programs" action="All" onAction={() => { S.setTab('home'); S.go('programs'); }} />
        {programs.map((w) => (
          <div key={w.id} style={{ padding: '7px 0', borderBottom: '1px solid var(--line)' }}>
            <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 700, fontSize: 12.5, color: 'var(--text)' }}>{w.title}</div>
            <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, color: 'var(--dim)', marginTop: 2 }}>{w.when} · {w.host}</div>
          </div>
        ))}
      </DeskCard>
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

  const isHome = S.tab === 'home' && !S.topScreen;

  return (
    <div className="app-desktop">
      <DesktopSidebar S={S} />
      <main ref={scrollRef} key={S.tab + (S.topScreen || '')} style={{ flex: 1, height: '100%', overflowY: 'auto' }}>
        {isHome ? (
          // Home gets a desktop-native dashboard that uses the width.
          <div style={{ maxWidth: 980, margin: '0 auto', padding: '34px 34px 90px' }}>
            <DesktopHome S={S} />
          </div>
        ) : (
          // Other screens: content column + live context rail.
          <div className="desk-content">
            <div style={{ maxWidth: 620, minWidth: 0, flex: 1 }}>
              <CurrentScreen S={S} />
            </div>
            <DesktopRail S={S} />
          </div>
        )}
      </main>
      <div className="app-desktop-sheets"><SheetRouter S={S} /></div>
      <div className="app-desktop-toast"><Toast data={S.toastData} /></div>
    </div>
  );
}

Object.assign(window, { BeingCampDesktop, DesktopSidebar });
