// BeingCamp — Home (unified member dashboard)

function WalletChip({ S }) {
  return (
    <button className="tap" onClick={() => S.go('wallet')} style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'var(--surface)', border: '1px solid var(--gold-line)', borderRadius: 999, padding: '7px 12px 7px 9px', cursor: 'pointer' }}>
      <CoinMark size={18} />
      <span style={{ fontFamily: 'Space Mono, monospace', fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{fmt(S.balance)}</span>
    </button>
  );
}

function TopBar({ S }) {
  const rank = RANK_PERKS[S.rankIndex];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 4, paddingBottom: 18 }}>
      <button className="tap" onClick={() => S.setTab('profile')} style={{ width: 42, height: 42, borderRadius: 13, background: `linear-gradient(140deg, ${S.user.accent}33, #141414)`, border: `1px solid ${S.user.accent}66`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
        <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 19, color: S.user.accent }}>{S.user.initials}</span>
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 12, color: 'var(--muted)' }}>{S.greeting}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 22, color: 'var(--text)', lineHeight: 1 }}>{S.user.name}</span>
          <Badge tone="gold">{rank.name}</Badge>
        </div>
      </div>
      <WalletChip S={S} />
      <button className="tap" aria-label="Notifications" onClick={() => S.go('notifications')} style={{ width: 42, height: 42, borderRadius: 13, background: 'var(--surface)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, position: 'relative' }}>
        <Icon name="bell" size={19} color="var(--muted)" />
        {S.unreadCount > 0 && <span style={{ position: 'absolute', top: 6, right: 6, minWidth: 16, height: 16, padding: '0 4px', borderRadius: 999, background: 'var(--gold)', border: '1.5px solid var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Space Mono, monospace', fontSize: 9, fontWeight: 700, color: '#1a1407' }}>{S.unreadCount}</span>}
      </button>
    </div>
  );
}

function QuickTile({ icon, label, sub, onClick, tone = 'var(--gold)' }) {
  return (
    <button className="tap" onClick={onClick} style={{ cursor: 'pointer', textAlign: 'left', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 16, padding: 14, display: 'flex', flexDirection: 'column', gap: 10, minHeight: 92 }}>
      <div style={{ width: 36, height: 36, borderRadius: 11, background: 'var(--panel)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={icon} size={20} color={tone} /></div>
      <div>
        <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{label}</div>
        <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 11, color: 'var(--muted)', marginTop: 1 }}>{sub}</div>
      </div>
    </button>
  );
}

function BalanceHero({ S }) {
  const rank = RANK_PERKS[S.rankIndex];
  const next = RANK_PERKS[Math.min(S.rankIndex + 1, RANK_PERKS.length - 1)];
  const targets = [0, 0, 500, 1500, 5000, 5000];
  const target = targets[Math.min(S.rankIndex + 1, 5)];
  const atTop = S.rankIndex >= 4;
  return (
    <Card hl pad={20} style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.14), transparent 70%)' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
        <div>
          <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 8 }}>BeingCoin balance</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <CoinMark size={40} glow />
            <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 56, lineHeight: 0.85, color: 'var(--text)' }}>{fmt(S.balance)}</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--dim)' }}>Earn</div>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 22, color: 'var(--gold)', lineHeight: 1 }}>{rank.earn}</div>
          <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--dim)', marginTop: 6 }}>Save</div>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 22, color: 'var(--green)', lineHeight: 1 }}>{rank.discount}</div>
        </div>
      </div>
      <div style={{ marginTop: 20, position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
          <span style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 12, color: 'var(--muted)' }}>{atTop ? 'Top rank reached' : `${S.activityCoins.toLocaleString('en-IN')} BC moved · to ${next.name}`}</span>
          {!atTop && <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, color: 'var(--gold)' }}>{target.toLocaleString('en-IN')}</span>}
        </div>
        <Progress value={atTop ? 1 : S.activityCoins} max={atTop ? 1 : target} />
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 18, position: 'relative' }}>
        <Btn variant="primary" full icon="plus" onClick={() => S.go('buy')}>Buy coins</Btn>
        <Btn variant="ghost" full icon="wallet" onClick={() => S.go('wallet')}>Wallet</Btn>
      </div>
    </Card>
  );
}

function MiniProjectCard({ S, w }) {
  const done = w.milestones.filter((m) => m.status === 'done').length;
  return (
    <div style={{ flexShrink: 0, width: 230 }}>
      <Card pad={15} onClick={() => S.go('workspace', { id: w.id })} style={{ height: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <Badge tone={w.you === 'poster' ? 'blue' : 'gold'}>{w.you === 'poster' ? 'You posted' : w.role}</Badge>
          <Badge tone={w.stage >= 4 ? 'green' : w.stage === 3 ? 'gold' : 'purple'}>{STAGES[w.stage]}</Badge>
        </div>
        <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 700, fontSize: 15, color: 'var(--text)', lineHeight: 1.25, minHeight: 38 }}>{w.title}</div>
        <div style={{ display: 'flex', gap: 4, margin: '12px 0 8px' }}>
          {w.milestones.map((m, i) => <div key={i} style={{ flex: 1, height: 4, borderRadius: 999, background: m.status === 'done' ? 'var(--gold)' : m.status === 'active' ? 'var(--gold-line)' : 'var(--panel)' }} />)}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, color: 'var(--dim)' }}>{done}/{w.milestones.length} milestones</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: -6 }}>
            {w.team.slice(0, 3).map((m, i) => (
              <span key={i} style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--panel)', border: '1.5px solid var(--surface)', marginLeft: i ? -7 : 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Bebas Neue, sans-serif', fontSize: 10, color: 'var(--muted)' }}>{m.you ? 'You'[0] : m.name[0]}</span>
            ))}
          </span>
        </div>
      </Card>
    </div>
  );
}

function MemberHome({ S }) {
  const active = S.workspaces.filter((w) => w.stage < 4);
  return (
    <div style={{ animation: 'screenIn .35s ease' }}>
      <TopBar S={S} />
      <BalanceHero S={S} />

      {/* Create hub CTA */}
      <Card hl pad={18} onClick={() => S.openSheet('create')} style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 16 }}>
        <div style={{ width: 46, height: 46, borderRadius: 13, background: 'var(--gold-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="plus" size={24} color="var(--gold)" stroke={2.4} /></div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 22, color: 'var(--text)', lineHeight: 1 }}>START SOMETHING</div>
          <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 12.5, color: 'var(--muted)', marginTop: 3 }}>Post work · host a program · book a space or service</div>
        </div>
        <Icon name="arrowR" size={20} color="var(--gold)" />
      </Card>

      {active.length > 0 && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '26px 0 14px' }}>
            <Eyebrow>Your projects</Eyebrow>
            <button className="tap" onClick={() => S.setTab('projects')} style={{ cursor: 'pointer', background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 600, fontSize: 12, color: 'var(--gold)' }}>All<Icon name="arrowR" size={14} color="var(--gold)" /></button>
          </div>
          <div style={{ display: 'flex', gap: 12, overflowX: 'auto', margin: '0 -22px', padding: '0 22px 4px', scrollbarWidth: 'none' }}>
            {active.map((w) => <MiniProjectCard key={w.id} S={S} w={w} />)}
          </div>
        </>
      )}

      <Eyebrow line style={{ margin: '26px 0 14px' }}>Explore</Eyebrow>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11 }}>
        <QuickTile icon="pool" label="Find work" sub="Join a team" onClick={() => S.go('findwork')} />
        <QuickTile icon="spark" label="Showcase" sub="Work & theory" onClick={() => S.setTab('showcase')} tone="var(--purple)" />
        <QuickTile icon="trophy" label="Leaders" sub="Top of the Camp" onClick={() => S.go('leaders')} />
        <QuickTile icon="calendar" label="Programs" sub="Workshops & learning" onClick={() => S.go('programs')} tone="var(--blue)" />
        <QuickTile icon="bag" label="The Store" sub="Drops & merch" onClick={() => S.go('store')} />
        <QuickTile icon="scan" label="Zones" sub="Check in · QR" onClick={() => S.go('scan')} tone="var(--green)" />
        <QuickTile icon="trophy" label="Challenges" sub="Play & earn" onClick={() => S.go('challenges')} tone="var(--purple)" />
      </div>

      {/* Community pulse */}
      <Eyebrow line style={{ margin: '26px 0 14px' }}>From the community</Eyebrow>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
        {PUBLICATIONS.slice(0, 2).map((p) => <PubRow key={p.id} S={S} p={p} />)}
      </div>
      <button className="tap" onClick={() => S.setTab('showcase')} style={{ cursor: 'pointer', width: '100%', marginTop: 12, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 13, padding: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 600, fontSize: 13, color: 'var(--gold)' }}>
        Open the Showcase<Icon name="arrowR" size={15} color="var(--gold)" />
      </button>
      <div style={{ height: 8 }} />
    </div>
  );
}

Object.assign(window, { MemberHome, WalletChip, TopBar, QuickTile, MiniProjectCard });
