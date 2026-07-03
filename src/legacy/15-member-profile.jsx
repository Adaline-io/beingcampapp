// BeingCamp — public member profile (viewable portfolio)

function MemberProfileScreen({ S }) {
  const name = S.topPayload.name;
  const p = (PROFILES && PROFILES[name]) || { init: name ? name.split(' ').map((x) => x[0]).join('') : '?', rank: 'Recruit', loc: 'BeingCamp', tone: '#242424', rating: 4.5, projects: 1, bio: 'A member of the BeingCamp community.', skills: [] };
  const works = (S.publications || PUBLICATIONS).filter((x) => x.author === name);
  return (
    <div style={{ animation: 'screenIn .3s ease' }}>
      <ScreenHead title={name || 'Member'} sub="Member profile" onBack={S.back} />

      {/* identity */}
      <Card pad={20} style={{ position: 'relative', overflow: 'hidden', marginBottom: 14 }}>
        <div style={{ position: 'absolute', top: -50, right: -40, width: 170, height: 170, borderRadius: '50%', background: `radial-gradient(circle, ${p.tone}, transparent 70%)`, opacity: 0.6 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 15, position: 'relative' }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: 'linear-gradient(140deg,#2a2418,#161616)', border: '1px solid var(--gold-line)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 28, color: 'var(--gold)' }}>{p.init}</span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 30, color: 'var(--text)', lineHeight: 1 }}>{name}</div>
            <div style={{ display: 'flex', gap: 6, marginTop: 7 }}>
              <Badge tone="gold">{p.rank}</Badge>
              <Badge tone="grey">{p.loc}</Badge>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 18, position: 'relative' }}>
          {[['Rating', p.rating.toFixed(1), 'star'], ['Projects', String(p.projects), 'briefcase'], ['Published', String(works.length), 'spark']].map(([l, v, ic]) => (
            <div key={l} style={{ flex: 1, background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 12, padding: '11px 12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Icon name={ic} size={13} color="var(--gold)" /><span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 20, color: 'var(--text)', lineHeight: 1 }}>{v}</span></div>
              <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 8.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--dim)', marginTop: 4 }}>{l}</div>
            </div>
          ))}
        </div>
      </Card>

      <div style={{ fontFamily: 'DM Serif Display, serif', fontStyle: 'italic', fontSize: 16, color: 'var(--text)', lineHeight: 1.5, marginBottom: 18, padding: '0 2px' }}>{p.bio}</div>

      {p.skills.length > 0 && (
        <>
          <Eyebrow line style={{ marginBottom: 12 }}>Skills</Eyebrow>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 22 }}>
            {p.skills.map((sk) => (
              <span key={sk} style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 600, fontSize: 12.5, padding: '8px 13px', borderRadius: 999, background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--text)' }}>{sk}</span>
            ))}
          </div>
        </>
      )}

      {works.length > 0 && (
        <>
          <Eyebrow line style={{ marginBottom: 12 }}>Published</Eyebrow>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginBottom: 22 }}>
            {works.map((w) => <PubRow key={w.id} S={S} p={w} />)}
          </div>
        </>
      )}

      <div style={{ display: 'flex', gap: 10 }}>
        <Btn variant="primary" full icon="plus" onClick={() => S.toast({ msg: `Invited ${name} to a project`, icon: 'checkCircle' })}>Invite to project</Btn>
        <Btn variant="ghost" icon="wallet" onClick={() => S.openSheet('gift', { to: name })}>Send coins</Btn>
      </div>
      <div style={{ height: 8 }} />
    </div>
  );
}

Object.assign(window, { MemberProfileScreen });
