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
      background: active ? 'var(--gold)' : 'transparent',
      border: '1px solid transparent',
      borderRadius: 10, padding: '10px 14px', cursor: 'pointer',
      fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: active ? 700 : 500,
      fontSize: 14, color: active ? '#1a1407' : 'var(--muted)',
    }}>
      <Icon name={icon} size={18} color={active ? '#1a1407' : 'var(--dim)'} />
      <span className="desk-label" style={{ flex: 1 }}>{label}</span>
      {badge > 0 && (
        <span style={{ minWidth: 18, height: 18, padding: '0 5px', borderRadius: 999, background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Space Mono, monospace', fontSize: 10, fontWeight: 700, color: '#1a1407' }}>{badge}</span>
      )}
    </button>
  );
}

function DesktopSidebar({ S }) {
  const sectionLabel = (txt) => (
    <div className="desk-side-extra" style={{ fontFamily: 'Space Mono, monospace', fontSize: 9.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--dim)', padding: '18px 14px 8px' }}>{txt}</div>
  );
  const goSub = (screen) => { S.setTab('home'); S.go(screen); };
  const activeSub = S.topScreen;

  return (
    <aside className="desk-sidebar" style={{
      flexShrink: 0, height: '100%', display: 'flex', flexDirection: 'column',
      borderRight: '1px solid var(--line)', background: 'var(--deep)', padding: '22px 14px 16px',
      overflowY: 'auto',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px 16px' }}>
        <CoinMark size={30} />
        <span className="desk-label" style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 24, letterSpacing: '0.06em', color: 'var(--text)' }}>BEINGCAMP</span>
      </div>

      <div style={{ padding: '0 4px 6px' }}>
        <Btn variant="primary" full icon="plus" onClick={() => S.openSheet('create')}><span className="desk-label">Start something</span></Btn>
      </div>

      {sectionLabel('Camp')}
      {DESK_NAV_PRIMARY.map((n) => (
        <DeskNavBtn key={n.id} icon={n.icon} label={n.label}
          active={!activeSub && S.tab === n.id}
          onClick={() => S.setTab(n.id)} />
      ))}

      {S.isAdmin && (
        <DeskNavBtn icon="spark" label="Admin" active={activeSub === 'admin'} onClick={() => goSub('admin')} />
      )}

      {sectionLabel('Everything else')}
      {DESK_NAV_MORE.map((n) => (
        <DeskNavBtn key={n.screen} icon={n.icon} label={n.label}
          active={activeSub === n.screen}
          badge={n.screen === 'notifications' ? S.unreadCount : 0}
          onClick={() => goSub(n.screen)} />
      ))}

      <div style={{ flex: 1 }} />

      <button className="tap desk-side-extra" onClick={() => goSub('wallet')} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface)', border: '1px solid var(--gold-line)', borderRadius: 14, padding: '12px 14px', cursor: 'pointer', marginBottom: 10 }}>
        <CoinMark size={22} />
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--dim)' }}>Balance</div>
          <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 800, letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums', fontSize: 16, color: 'var(--text)', lineHeight: 1 }}>{fmt(S.balance)} <span style={{ fontSize: 12, color: 'var(--gold)' }}>BC</span></div>
        </div>
      </button>

      <div className="desk-side-extra" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 6px 0' }}>
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

// ── Reference-style data primitives: area chart, delta chip, stat tile ──
function AreaChart({ data, color = 'var(--gold)', h = 120, id = 'ac' }) {
  const series = data && data.length >= 2 ? data : [0, 0];
  const w = 600;
  const min = Math.min(...series), max = Math.max(...series);
  const span = max - min || 1, pad = h * 0.14;
  const pts = series.map((v, i) => [(i / (series.length - 1)) * w, pad + (1 - (v - min) / span) * (h - 2 * pad)]);
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 'auto', display: 'block' }} aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.32" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${line} L${w},${h} L0,${h} Z`} fill={`url(#${id})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="4.5" fill={color} />
    </svg>
  );
}

function DeltaChip({ value, suffix = 'this week' }) {
  const up = value >= 0;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: 'Space Mono, monospace', fontSize: 10, padding: '3px 9px', borderRadius: 999, color: up ? 'var(--green)' : 'var(--red)', background: up ? 'rgba(62,207,122,0.10)' : 'rgba(224,82,82,0.10)' }}>
      {up ? '\u25B2' : '\u25BC'} {up ? '+' : ''}{fmt(value)} {suffix}
    </span>
  );
}

function DeskStat({ icon, label, value, sub, tone = 'var(--gold)', onClick }) {
  return (
    <DeskCard onClick={onClick} style={{ padding: '16px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 28, height: 28, borderRadius: 9, background: 'var(--panel)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={icon} size={15} color={tone} /></span>
        <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 9.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--dim)' }}>{label}</span>
      </div>
      <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 800, fontSize: 26, letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums', color: 'var(--text)', margin: '10px 0 3px' }}>{value}</div>
      <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 11.5, color: 'var(--muted)' }}>{sub}</div>
    </DeskCard>
  );
}

// Running balance history reconstructed from the ledger (newest txn first).
function balanceSeries(S) {
  const txns = (S.txns || []).slice(0, 24);
  let bal = S.balance;
  const out = [bal];
  for (const t of txns) { bal -= t.amount; out.push(bal); }
  return out.reverse();
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
        <span style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 800, letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums', fontSize: 23, color: 'var(--text)', lineHeight: 1 }}>{S.user.name}</span>
        <Badge tone="gold">{rank.name}</Badge>
      </div>

      {/* Reference-style stat row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 14 }}>
        <DeskStat icon="wallet" label="Balance" value={`${fmt(S.balance)} BC`}
          sub={<DeltaChip value={(S.txns || []).slice(0, 6).reduce((a, t) => a + t.amount, 0)} />}
          onClick={() => { S.setTab('home'); S.go('wallet'); }} />
        <DeskStat icon="spark" label="Activity" value={fmt(S.activityCoins)} tone="var(--green)"
          sub={`earn rate ${rank.earn}`} />
        <DeskStat icon="pool" label="Active projects" value={(S.workspaces || []).filter((w) => w.stage < 4).length} tone="var(--blue)"
          sub={`${(S.workspaces || []).length} total`} onClick={() => S.setTab('projects')} />
        <DeskStat icon="lock" label="Escrow held" value={`${fmt((S.workspaces || []).reduce((a, w) => a + Math.max(0, (w.budget || 0) - (w.escrowReleased || 0)), 0))} BC`} tone="var(--purple)"
          sub="releases on milestones" />
      </div>

      {/* Hero row: wallet + camp today */}
      <div className="desk-hero">
        <DeskCard hl>
          <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--gold)' }}>BeingCoin balance</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '10px 0 4px' }}>
            <CoinMark size={44} glow />
            <span style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 800, letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums', fontSize: 44, color: 'var(--text)', lineHeight: 0.95 }}>{fmt(S.balance)}</span>
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--dim)' }}>Earn</div>
              <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 800, letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums', fontSize: 19, color: 'var(--gold)' }}>{rank.earn}</div>
            </div>
          </div>
          <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 12.5, color: 'var(--muted)', margin: '8px 0 10px' }}>
            {fmt(S.activityCoins)} activity BC · {S.rankIndex < 4 ? `next rank: ${next.name}` : 'top rank reached'}
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
            <Btn variant="primary" icon="plus" onClick={() => { S.setTab('home'); S.go('wallet'); S.go('buy'); }}>Buy coins</Btn>
            <Btn variant="ghost" icon="wallet" onClick={() => { S.setTab('home'); S.go('wallet'); }}>Wallet</Btn>
          </div>
          <div style={{ margin: '16px -8px -8px' }}>
            <AreaChart data={balanceSeries(S)} id="bal-home" h={96} />
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
        <div className="desk-2col">
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
      <div className="desk-2col">
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

// ── Desktop Showcase: publications as a wide gallery grid ───────────────
function DesktopShowcase({ S }) {
  const pubs = S.publications || [];
  return (
    <div style={{ animation: 'screenIn .3s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 800, letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums', fontSize: 25, color: 'var(--text)', lineHeight: 1 }}>SHOWCASE</div>
          <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>Case studies, work & theory from the Camp</div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <Btn variant="primary" icon="plus" onClick={() => S.openSheet('publish')}>Publish</Btn>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 14 }}>
        {pubs.map((p) => (
          <DeskCard key={p.id} onClick={() => { S.setTab('showcase'); S.go('pubDetail', { id: p.id }); }} style={{ padding: 0, overflow: 'hidden' }}>
            <Placeholder tone={p.tone} h={120} radius={0} icon={p.type === 'Work' ? 'spark' : 'pool'} />
            <div style={{ padding: '14px 16px 16px' }}>
              <Badge tone={p.type === 'Case Study' ? 'gold' : p.type === 'Work' ? 'blue' : 'purple'}>{p.type}</Badge>
              <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 700, fontSize: 14.5, color: 'var(--text)', margin: '10px 0 6px', lineHeight: 1.3 }}>{p.title}</div>
              <div style={{ display: 'flex', fontFamily: 'Space Mono, monospace', fontSize: 10, color: 'var(--dim)' }}>
                <span>{p.author}</span>
                <span style={{ marginLeft: 'auto' }}>{p.read}</span>
              </div>
            </div>
          </DeskCard>
        ))}
      </div>
    </div>
  );
}

// ── Desktop Projects: workspace grid + open work table ──────────────────
function DesktopProjects({ S }) {
  const mine = S.workspaces || [];
  const open = S.openWork || [];
  return (
    <div style={{ animation: 'screenIn .3s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 800, letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums', fontSize: 25, color: 'var(--text)', lineHeight: 1 }}>PROJECTS</div>
          <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>Your workspaces and open work in the Pool</div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <Btn variant="primary" icon="plus" onClick={() => S.openSheet('postWork')}>Post work</Btn>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
        {mine.map((w) => {
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

      <DeskSectionHead label="Open in the Pool" />
      <DeskCard style={{ padding: '4px 20px' }}>
        {open.map((o, i) => {
          const applied = (S.appliedWork || []).includes(o.id);
          return (
            <div key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderBottom: i < open.length - 1 ? '1px solid var(--line)' : 'none' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{o.title}</div>
                <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 10.5, color: 'var(--dim)', marginTop: 3 }}>{o.poster} · {o.cat} · {o.need}</div>
              </div>
              <BC amount={o.pay} size={14} color="var(--gold)" />
              <Btn variant={applied ? 'ghost' : 'outline'} size="sm" onClick={() => !applied && S.openSheet('applyWork', { work: o })}>{applied ? 'Applied' : 'Apply'}</Btn>
            </div>
          );
        })}
      </DeskCard>
    </div>
  );
}

// ── Desktop Wallet: ledger built for width ───────────────────────────────
function DesktopWallet({ S }) {
  const rank = RANK_PERKS[S.rankIndex];
  return (
    <div style={{ animation: 'screenIn .3s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 800, letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums', fontSize: 25, color: 'var(--text)', lineHeight: 1 }}>WALLET</div>
          <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>BeingCoin — earned by making, spent in the Camp</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
          <Btn variant="ghost" icon="gift" onClick={() => S.openSheet('gift')}>Send · Gift</Btn>
          <Btn variant="primary" icon="plus" onClick={() => S.go('buy')}>Buy coins</Btn>
        </div>
      </div>

      <div className="desk-hero">
        <DeskCard hl>
          <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--gold)' }}>Balance</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 10 }}>
            <CoinMark size={46} glow />
            <span style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 800, letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums', fontSize: 46, color: 'var(--text)', lineHeight: 0.95 }}>{fmt(S.balance)}</span>
            <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 14, color: 'var(--gold)' }}>BC</span>
            <span style={{ marginLeft: 'auto' }}><DeltaChip value={(S.txns || []).slice(0, 6).reduce((a, t) => a + t.amount, 0)} /></span>
          </div>
          <div style={{ margin: '14px -8px -8px' }}>
            <AreaChart data={balanceSeries(S)} id="bal-wallet" h={110} />
          </div>
        </DeskCard>
        <DeskCard>
          {[['Activity BC', fmt(S.activityCoins)], ['Earn rate', rank.earn], ['Loyalty', S.loyalty], ['Status', 'Active']].map(([l, v], i, a) => (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: i < a.length - 1 ? '1px solid var(--line)' : 'none' }}>
              <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{l}</span>
              <span style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{v}</span>
            </div>
          ))}
        </DeskCard>
      </div>

      <DeskSectionHead label="Transactions" />
      <DeskCard style={{ padding: '4px 20px' }}>
        {(S.txns || []).map((x, i, a) => (
          <div key={x.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 0', borderBottom: i < a.length - 1 ? '1px solid var(--line)' : 'none' }}>
            <Icon name={txIcon(x.ref)} size={16} color={x.amount > 0 ? 'var(--green)' : 'var(--muted)'} />
            <span style={{ flex: 1, fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 14, color: 'var(--text)' }}>{x.label}</span>
            <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 10.5, color: 'var(--dim)' }}>{x.when}</span>
            <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 13.5, minWidth: 84, textAlign: 'right', color: x.amount > 0 ? 'var(--green)' : 'var(--text)' }}>{x.amount > 0 ? '+' : ''}{fmt(x.amount)} BC</span>
          </div>
        ))}
      </DeskCard>
    </div>
  );
}

// ── Desktop Store: catalog grid ──────────────────────────────────────────
function DesktopStore({ S }) {
  const [cat, setCat] = React.useState('All');
  const items = S.products.filter((p) => cat === 'All' || p.cat === cat);
  return (
    <div style={{ animation: 'screenIn .3s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 800, letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums', fontSize: 25, color: 'var(--text)', lineHeight: 1 }}>THE STORE</div>
          <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>Priced in BeingCoin</div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <Btn variant="ghost" icon="briefcase" onClick={() => { S.back(); S.go('services'); }}>Services</Btn>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
        {S.storeCats.map((c) => (
          <button key={c} className="tap" onClick={() => setCat(c)} style={{ cursor: 'pointer', fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 600, fontSize: 12.5, padding: '8px 14px', borderRadius: 999, border: `1px solid ${cat === c ? 'var(--gold)' : 'var(--line)'}`, background: cat === c ? 'var(--gold)' : 'var(--surface)', color: cat === c ? '#1a1407' : 'var(--muted)' }}>{c}</button>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
        {items.map((p) => (
          <DeskCard key={p.id} onClick={() => S.openSheet('product', { product: p })} style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ position: 'relative' }}>
              <Placeholder tone={p.tone} h={130} radius={0} icon={p.type === 'pass' ? 'qr' : 'bag'} />
              <div style={{ position: 'absolute', top: 8, left: 8 }}><Badge>{p.tag}</Badge></div>
            </div>
            <div style={{ padding: '12px 14px 14px' }}>
              <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--dim)' }}>{p.source}</div>
              <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 700, fontSize: 14, color: 'var(--text)', margin: '4px 0 9px', lineHeight: 1.25 }}>{p.name}</div>
              <BC amount={p.bc} size={14} />
            </div>
          </DeskCard>
        ))}
      </div>
    </div>
  );
}

// ── Desktop You: identity + rank + account actions ───────────────────────
function DesktopYou({ S }) {
  const p = S.profile || {};
  const goSub = (screen) => { S.setTab('home'); S.go(screen); };
  return (
    <div style={{ animation: 'screenIn .3s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 800, letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums', fontSize: 25, color: 'var(--text)', lineHeight: 1 }}>YOU</div>
        <div style={{ marginLeft: 'auto' }}>
          <Btn variant="ghost" icon="user" onClick={() => S.openSheet('editProfile')}>Edit profile</Btn>
        </div>
      </div>

      <div className="desk-hero">
        <DeskCard hl>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{ width: 66, height: 66, borderRadius: 20, background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 800, fontSize: 24, color: '#1a1407', flexShrink: 0 }}>{S.user.initials}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 800, letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums', fontSize: 23, color: 'var(--text)', lineHeight: 1 }}>{S.user.name}</div>
              <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 13.5, color: 'var(--muted)', marginTop: 5 }}>{p.headline || 'Member of the Camp'}</div>
              <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 10.5, color: 'var(--dim)', marginTop: 5 }}>{p.city || 'BeingCamp'}{p.since ? ` · since ${p.since}` : ''}</div>
            </div>
          </div>
          {p.bio && <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.55, marginTop: 14 }}>{p.bio}</div>}
          {(p.skills || []).length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 14 }}>
              {p.skills.map((s) => <Badge key={s}>{s}</Badge>)}
            </div>
          )}
        </DeskCard>

        <DeskCard>
          <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--dim)', marginBottom: 12 }}>Rank ladder</div>
          {RANK_PERKS.map((r) => (
            <div key={r.i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', opacity: r.i <= S.rankIndex ? 1 : 0.45 }}>
              <span style={{ width: 8, height: 8, borderRadius: 999, background: r.i === S.rankIndex ? 'var(--gold)' : r.i < S.rankIndex ? 'var(--green)' : 'var(--line2)', flexShrink: 0 }} />
              <span style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: r.i === S.rankIndex ? 700 : 500, fontSize: 13.5, color: r.i === S.rankIndex ? 'var(--gold)' : 'var(--text)' }}>{r.name}</span>
              <span style={{ marginLeft: 'auto', fontFamily: 'Space Mono, monospace', fontSize: 10.5, color: 'var(--dim)' }}>{r.earn} · {r.discount}</span>
            </div>
          ))}
        </DeskCard>
      </div>

      <DeskSectionHead label="Account" />
      <div className="desk-2col">
        {[
          { ic: 'gift', label: 'Orders & tracking', go: () => goSub('orders') },
          { ic: 'user', label: 'Referrals', go: () => goSub('referrals') },
          { ic: 'bell', label: 'Notifications', go: () => goSub('notifications') },
          { ic: 'arrowR', label: 'Sign out', go: S.signOut },
        ].map((r) => (
          <DeskCard key={r.label} onClick={r.go} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px' }}>
            <Icon name={r.ic} size={18} color="var(--muted)" />
            <span style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{r.label}</span>
            <Icon name="arrowR" size={15} color="var(--dim)" style={{ marginLeft: 'auto' }} />
          </DeskCard>
        ))}
      </div>
    </div>
  );
}


// ── Desktop Programs: workshop card grid ─────────────────────────────────
function DesktopPrograms({ S }) {
  return (
    <div style={{ animation: 'screenIn .3s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 800, letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums', fontSize: 25, color: 'var(--text)', lineHeight: 1 }}>PROGRAMS</div>
          <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>Workshops & sessions at the Camp</div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <Btn variant="primary" icon="plus" onClick={() => S.openSheet('hostProgram')}>Host a program</Btn>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: 14 }}>
        {(S.programs || []).map((w) => {
          const isOn = (S.attending || []).includes(w.id);
          const left = w.seats - w.taken;
          return (
            <DeskCard key={w.id} onClick={() => S.openSheet('rsvp', { workshop: w })} style={{ padding: 0, overflow: 'hidden' }}>
              <Placeholder tone={w.tone} h={100} radius={0} icon="calendar" />
              <div style={{ padding: '13px 16px 15px' }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <Badge tone="blue">{w.tag}</Badge>
                  {isOn && <Badge tone="green">Reserved</Badge>}
                </div>
                <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 700, fontSize: 14.5, color: 'var(--text)', lineHeight: 1.3 }}>{w.title}</div>
                <div style={{ display: 'flex', fontFamily: 'Space Mono, monospace', fontSize: 10, color: 'var(--dim)', marginTop: 8 }}>
                  <span>{w.host} · {w.when}</span>
                  <span style={{ marginLeft: 'auto', color: left <= 3 ? 'var(--red)' : 'var(--dim)' }}>{left} left</span>
                </div>
              </div>
            </DeskCard>
          );
        })}
      </div>
    </div>
  );
}

// ── Desktop Leaders: leaderboard table ───────────────────────────────────
function DesktopLeaders({ S }) {
  const list = S.leaders || LEADERS;
  return (
    <div style={{ animation: 'screenIn .3s ease' }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 800, letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums', fontSize: 25, color: 'var(--text)', lineHeight: 1 }}>LEADERS</div>
        <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>Top of the Camp — ranked by activity coins earned</div>
      </div>
      <DeskCard style={{ padding: '4px 20px' }}>
        {list.map((l, i, a) => (
          <div key={l.rank} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 0', borderBottom: i < a.length - 1 ? '1px solid var(--line)' : 'none', background: l.you ? 'var(--gold-dim)' : 'transparent', margin: l.you ? '0 -20px' : 0, paddingLeft: l.you ? 20 : 0, paddingRight: l.you ? 20 : 0, borderRadius: l.you ? 12 : 0 }}>
            <span style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 800, letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums', fontSize: 17, color: l.rank <= 3 ? 'var(--gold)' : 'var(--dim)', width: 30 }}>{l.rank}</span>
            <span style={{ width: 34, height: 34, borderRadius: 11, background: 'var(--panel)', border: '1px solid var(--line2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 800, fontSize: 12, color: 'var(--muted)' }}>{l.init}</span>
            <span style={{ flex: 1, fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: l.you ? 800 : 600, fontSize: 14.5, color: 'var(--text)' }}>{l.name}{l.you ? ' · you' : ''}</span>
            <Badge tone={l.tier === 'OG' ? 'gold' : l.tier === 'Loyal' ? 'purple' : 'grey'}>{l.tier}</Badge>
            <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 13, color: 'var(--gold)', minWidth: 90, textAlign: 'right' }}>{fmt(l.earned)} BC</span>
          </div>
        ))}
      </DeskCard>
    </div>
  );
}

// ── Desktop Zones: the physical space as a card grid ────────────────────
function DesktopZones({ S }) {
  return (
    <div style={{ animation: 'screenIn .3s ease' }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 800, letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums', fontSize: 25, color: 'var(--text)', lineHeight: 1 }}>ZONES</div>
        <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>Check in as you move through the space</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
        {ZONES.map((z) => {
          const locked = S.rankIndex < z.minRank;
          return (
            <DeskCard key={z.id} onClick={() => S.openSheet('checkin', { zone: z })} style={{ opacity: locked ? 0.55 : 1 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, color: 'var(--dim)' }}>{z.n}</span>
                <span style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 800, letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums', fontSize: 17, color: 'var(--text)' }}>{z.name}</span>
                <span style={{ marginLeft: 'auto' }}><Badge tone={locked ? 'grey' : 'gold'}>{z.layer}</Badge></span>
              </div>
              <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 12.5, color: 'var(--muted)', margin: '8px 0 10px' }}>{z.desc}</div>
              <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, color: locked ? 'var(--red)' : 'var(--gold)' }}>
                {locked ? `Requires ${RANK_PERKS[z.minRank].name}` : z.cost === 0 ? 'Free entry' : `${z.cost} BC per check-in`}
              </div>
            </DeskCard>
          );
        })}
      </div>
    </div>
  );
}

// ── Desktop Orders: fulfillment table ────────────────────────────────────
function DesktopOrders({ S }) {
  const stages = ['Placed', 'Packed', 'Shipped', 'Out for delivery', 'Delivered'];
  return (
    <div style={{ animation: 'screenIn .3s ease' }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 800, letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums', fontSize: 25, color: 'var(--text)', lineHeight: 1 }}>ORDERS</div>
        <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>Purchases & tracking</div>
      </div>
      {(S.orders || []).length === 0 ? (
        <DeskCard onClick={() => { S.setTab('home'); S.go('store'); }}>
          <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 700, fontSize: 14.5, color: 'var(--text)' }}>No orders yet</div>
          <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>Browse the Store — everything is priced in BeingCoin.</div>
        </DeskCard>
      ) : (
        <DeskCard style={{ padding: '4px 20px' }}>
          {(S.orders || []).map((o, i, a) => (
            <div key={o.id} className="tap" onClick={() => { S.setTab('home'); S.go('orderDetail', { id: o.id }); }} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderBottom: i < a.length - 1 ? '1px solid var(--line)' : 'none', cursor: 'pointer' }}>
              <Icon name={o.type === 'pass' ? 'qr' : 'bag'} size={17} color="var(--muted)" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{o.item}</div>
                <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, color: 'var(--dim)', marginTop: 2 }}>{o.id} · {o.when}</div>
              </div>
              <Badge tone={o.stage >= 4 ? 'green' : 'blue'}>{o.type === 'pass' ? 'Ready' : stages[o.stage]}</Badge>
              <BC amount={o.bc} size={13} color="var(--gold)" />
            </div>
          ))}
        </DeskCard>
      )}
    </div>
  );
}

// ── Desktop Notifications ────────────────────────────────────────────────
function DesktopNotifications({ S }) {
  return (
    <div style={{ animation: 'screenIn .3s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 800, letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums', fontSize: 25, color: 'var(--text)', lineHeight: 1 }}>NOTIFICATIONS</div>
          <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>{S.unreadCount ? `${S.unreadCount} unread` : 'All caught up'}</div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <Btn variant="ghost" onClick={S.markAllRead}>Mark all read</Btn>
        </div>
      </div>
      <DeskCard style={{ padding: '4px 20px' }}>
        {(S.notifs || []).map((n, i, a) => (
          <div key={n.id} className="tap" onClick={() => { S.markRead(n.id); if (n.cta) { S.setTab('home'); S.go(n.cta); } }} style={{ display: 'flex', gap: 14, padding: '14px 0', borderBottom: i < a.length - 1 ? '1px solid var(--line)' : 'none', cursor: 'pointer', opacity: n.unread ? 1 : 0.6 }}>
            <Icon name={n.ic || 'bell'} size={17} color={n.unread ? 'var(--gold)' : 'var(--dim)'} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: n.unread ? 700 : 600, fontSize: 14, color: 'var(--text)' }}>{n.title}</div>
              <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 12.5, color: 'var(--muted)', marginTop: 2 }}>{n.body}</div>
            </div>
            <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, color: 'var(--dim)', flexShrink: 0 }}>{n.when}</span>
          </div>
        ))}
      </DeskCard>
    </div>
  );
}


// ── Desktop Admin: founder tools (members, coins, ranks, briefs) ─────────
function DesktopAdmin({ S }) {
  const BE = typeof window !== 'undefined' ? window.BeingCampBackend : null;
  const [members, setMembers] = React.useState(null);
  const [busy, setBusy] = React.useState(false);
  const RANK_NAMES = RANK_PERKS.map((r) => r.name);

  const reload = React.useCallback(() => {
    if (!BE || !BE.enabled) return;
    BE.adminListMembers().then(setMembers).catch((e) => { console.warn(e); S.toast({ msg: 'Could not load members', icon: 'wallet' }); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  React.useEffect(() => { reload(); }, [reload]);

  const grant = async (m) => {
    const amt = parseInt(prompt(`Grant coins to ${m.name} (negative to deduct):`, '100') || '', 10);
    if (!amt) return;
    const label = prompt('Ledger label:', 'Camp grant') || 'Camp grant';
    setBusy(true);
    try { await BE.adminGrant(m.id, amt, label); S.toast({ msg: `${amt > 0 ? '+' : ''}${amt} BC → ${m.name}`, coin: amt }); reload(); }
    catch (e) { S.toast({ msg: 'Grant failed — apply migration 0006?', icon: 'wallet' }); console.warn(e); }
    setBusy(false);
  };
  const setRank = async (m) => {
    const r = parseInt(prompt(`Rank for ${m.name} — 0 Visitor · 1 Recruit · 2 Builder · 3 Maker · 4 Chief:`, String(m.rank_index)) || '', 10);
    if (Number.isNaN(r) || r < 0 || r > 4) return;
    setBusy(true);
    try { await BE.adminSetRank(m.id, r); S.toast({ msg: `${m.name} → ${RANK_NAMES[r]}` }); reload(); }
    catch (e) { S.toast({ msg: 'Rank change failed', icon: 'wallet' }); console.warn(e); }
    setBusy(false);
  };
  const addBrief = async () => {
    const title = prompt('Brief title:'); if (!title) return;
    const org = prompt('Client / org:', 'BeingCamp') || 'BeingCamp';
    const cat = prompt('Category — Branding / Production / Tech / Marketing:', 'Branding') || 'Branding';
    const budget = parseInt(prompt('Budget (BC):', '500') || '0', 10);
    const summary = prompt('One-line summary:') || '';
    setBusy(true);
    try { await BE.adminAddBrief({ title, org, cat, budget, summary }); S.toast({ msg: 'Brief posted to the Pool' }); }
    catch (e) { S.toast({ msg: 'Post failed — apply migration 0006?', icon: 'wallet' }); console.warn(e); }
    setBusy(false);
  };

  if (!S.isAdmin) {
    return (
      <DeskCard>
        <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>Admin only</div>
        <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>Your profile doesn&rsquo;t have the admin flag.</div>
      </DeskCard>
    );
  }

  return (
    <div style={{ animation: 'screenIn .3s ease', opacity: busy ? 0.6 : 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 800, letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums', fontSize: 25, color: 'var(--text)', lineHeight: 1 }}>ADMIN</div>
          <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>Members, coins, ranks & briefs</div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <Btn variant="primary" icon="plus" onClick={addBrief}>Post a brief</Btn>
        </div>
      </div>

      <DeskSectionHead label={`Members${members ? ` · ${members.length}` : ''}`} action="Reload" onAction={reload} />
      <DeskCard style={{ padding: '4px 20px' }}>
        {!members && <div style={{ padding: '14px 0', fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 13, color: 'var(--dim)' }}>Loading members…</div>}
        {members && members.length === 0 && <div style={{ padding: '14px 0', fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 13, color: 'var(--dim)' }}>No members yet.</div>}
        {(members || []).map((m, i, a) => (
          <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: i < a.length - 1 ? '1px solid var(--line)' : 'none' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{m.name || 'Unnamed'}</div>
              <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, color: 'var(--dim)', marginTop: 2 }}>{m.city || '—'} · joined {String(m.created_at).slice(0, 10)}</div>
            </div>
            <Badge tone="gold">{RANK_NAMES[m.rank_index] || 'Visitor'}</Badge>
            <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 12.5, color: 'var(--gold)', minWidth: 80, textAlign: 'right' }}>{fmt(m.balance)} BC</span>
            <Btn variant="outline" size="sm" onClick={() => grant(m)}>Grant</Btn>
            <Btn variant="ghost" size="sm" onClick={() => setRank(m)}>Rank</Btn>
          </div>
        ))}
      </DeskCard>

      <DeskSectionHead label="Open briefs in the Pool" />
      <DeskCard style={{ padding: '4px 20px' }}>
        {(S.openWork || []).map((o, i, a) => (
          <div key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: i < a.length - 1 ? '1px solid var(--line)' : 'none' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{o.title}</div>
              <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, color: 'var(--dim)', marginTop: 2 }}>{o.poster} · {o.cat}</div>
            </div>
            <BC amount={o.pay} size={13} color="var(--gold)" />
            {/^[0-9a-f-]{36}$/i.test(o.id) && (
              <Btn variant="danger" size="sm" onClick={async () => {
                if (!confirm(`Close "${o.title}"?`)) return;
                try { await BE.adminCloseBrief(o.id); S.toast({ msg: 'Brief closed' }); }
                catch (e) { S.toast({ msg: 'Close failed', icon: 'wallet' }); console.warn(e); }
              }}>Close</Btn>
            )}
          </div>
        ))}
      </DeskCard>
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

  // Tabs and key sub-screens get desktop-native wide views; everything else
  // falls back to the phone column + context rail.
  const wideTabs = { home: DesktopHome, showcase: DesktopShowcase, projects: DesktopProjects, profile: DesktopYou };
  const wideSubs = { wallet: DesktopWallet, store: DesktopStore, programs: DesktopPrograms, leaders: DesktopLeaders, scan: DesktopZones, orders: DesktopOrders, notifications: DesktopNotifications, admin: DesktopAdmin };
  const WideView = S.topScreen ? wideSubs[S.topScreen] : wideTabs[S.tab];

  return (
    <div className="app-desktop">
      <DesktopSidebar S={S} />
      <main ref={scrollRef} key={S.tab + (S.topScreen || '')} style={{ flex: 1, height: '100%', overflowY: 'auto' }}>
        {WideView ? (
          <div style={{ maxWidth: 980, margin: '0 auto', padding: '34px 34px 90px' }}>
            <WideView S={S} />
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
