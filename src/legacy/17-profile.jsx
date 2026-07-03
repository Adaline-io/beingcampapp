// BeingCamp — Profile (unified membership)

function RankLadder({ S }) {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {RANK_PERKS.map((r) => {
        const reached = S.rankIndex >= r.i;
        const current = S.rankIndex === r.i;
        return (
          <div key={r.i} style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ height: 5, borderRadius: 999, background: reached ? 'var(--gold)' : 'var(--panel)', marginBottom: 8 }} />
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 13, lineHeight: 1, color: current ? 'var(--gold)' : reached ? 'var(--text)' : 'var(--dim)' }}>{r.name}</div>
          </div>
        );
      })}
    </div>
  );
}

function ProfileScreen({ S }) {
  const rank = RANK_PERKS[S.rankIndex];
  const next = RANK_PERKS[Math.min(S.rankIndex + 1, 4)];
  const atTop = S.rankIndex >= 4;
  const mine = (S.publications || []).filter((p) => p.mine || p.author === 'You');
  return (
    <div style={{ animation: 'screenIn .3s ease' }}>
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '8px 0 16px' }}>
        <div style={{ width: 58, height: 58, borderRadius: 17, background: `linear-gradient(140deg, ${S.user.accent}33, #141414)`, border: `1px solid ${S.user.accent}66`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 26, color: S.user.accent }}>{S.user.initials}</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 30, color: 'var(--text)', lineHeight: 1 }}>{S.user.name}</div>
          <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 12.5, color: 'var(--muted)', marginTop: 4 }}>{S.profile.headline}{S.profile.city ? ` · ${S.profile.city}` : ''}</div>
          <div style={{ display: 'flex', gap: 6, marginTop: 7 }}>
            <Badge tone="gold">{rank.name}</Badge>
            <Badge tone="grey">Member since {S.profile.since || "Jun '25"}</Badge>
          </div>
        </div>
        <button className="tap" onClick={() => S.openSheet('editProfile')} style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}><Icon name="edit" size={18} color="var(--muted)" /></button>
      </div>

      {S.profile.bio && <div style={{ fontFamily: 'DM Serif Display, serif', fontStyle: 'italic', fontSize: 15, color: 'var(--text)', lineHeight: 1.5, marginBottom: 18 }}>{S.profile.bio}</div>}

      {/* stats */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
        {[['BC moved', S.activityCoins.toLocaleString('en-IN')], ['Projects', String((S.workspaces || []).length)], ['Published', String(mine.length)]].map(([l, v]) => (
          <Card key={l} pad={14} style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 24, color: 'var(--text)', lineHeight: 1 }}>{v}</div>
            <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 8.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--dim)', marginTop: 5 }}>{l}</div>
          </Card>
        ))}
      </div>

      {/* unified rank + perks */}
      <Card pad={16} style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <Eyebrow>Your standing</Eyebrow>
          <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, color: 'var(--muted)' }}>by BeingCoin usage</span>
        </div>
        <RankLadder S={S} />
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <div style={{ flex: 1, background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 12, padding: '12px 14px' }}>
            <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--dim)' }}>When you do work</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}><span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 24, color: 'var(--gold)', lineHeight: 1 }}>{rank.earn}</span><span style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 11, color: 'var(--muted)' }}>earnings</span></div>
          </div>
          <div style={{ flex: 1, background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 12, padding: '12px 14px' }}>
            <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--dim)' }}>When you hire</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}><span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 24, color: 'var(--green)', lineHeight: 1 }}>{rank.discount}</span><span style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 11, color: 'var(--muted)' }}>off</span></div>
          </div>
        </div>
        <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 12, color: 'var(--muted)', marginTop: 14, lineHeight: 1.5 }}>{atTop ? 'You\u2019ve reached the top — Chief.' : <>Next: <strong style={{ color: 'var(--text)' }}>{next.name}</strong> — {next.commit}</>}</div>
      </Card>

      {/* published works */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <Eyebrow>Published</Eyebrow>
        <button className="tap" onClick={() => S.openSheet('publish')} style={{ cursor: 'pointer', background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 600, fontSize: 12, color: 'var(--gold)' }}><Icon name="plus" size={14} color="var(--gold)" />New</button>
      </div>
      {mine.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginBottom: 18 }}>
          {mine.map((p) => <PubRow key={p.id} S={S} p={p} />)}
        </div>
      ) : (
        <Card pad={4} style={{ marginBottom: 18 }}>
          <EmptyState icon="spark" title="Nothing published" body="Feature a finished project, share personal work, or post a piece of theory to the Showcase." cta="Publish something" onCta={() => S.openSheet('publish')} />
        </Card>
      )}

      {/* skills */}
      <Eyebrow line style={{ marginBottom: 12 }}>Skills</Eyebrow>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 22 }}>
        {(S.profile.skills && S.profile.skills.length ? S.profile.skills : ['Add your skills']).map((sk) => (
          <span key={sk} style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 600, fontSize: 12.5, padding: '8px 13px', borderRadius: 999, background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--text)' }}>{sk}</span>
        ))}
        <button className="tap" onClick={() => S.openSheet('editProfile')} style={{ cursor: 'pointer', fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 600, fontSize: 12.5, padding: '8px 13px', borderRadius: 999, background: 'var(--gold-dim)', border: '1px dashed var(--gold-line)', color: 'var(--gold)' }}>+ Edit</button>
      </div>

      {/* menu */}
      <Card pad={4}>
        {[['bag', 'Orders', `${(S.orders || []).length} total`, 'orders'], ['gift', 'Invite & earn', '+300 BC each', 'referrals'], ['scan', 'Zone access', `${rank.name} level`, 'scan'], ['briefcase', 'Services', 'Book the team', 'services'], ['bell', 'Notifications', S.unreadCount > 0 ? `${S.unreadCount} new` : '', 'notifications'], ['lock', 'Privacy & security', '', null]].map(([ic, t, d, dest], i, a) => (
          <button key={t} className="tap" onClick={() => dest ? S.go(dest) : S.toast({ msg: t, icon: ic })} style={{ width: '100%', cursor: 'pointer', background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 12px', borderBottom: i < a.length - 1 ? '1px solid var(--line)' : 'none' }}>
            <Icon name={ic} size={19} color="var(--muted)" />
            <span style={{ flex: 1, textAlign: 'left', fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{t}</span>
            {d && <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, color: 'var(--dim)' }}>{d}</span>}
            <Icon name="chevR" size={16} color="var(--dim)" />
          </button>
        ))}
      </Card>

      <button className="tap" onClick={() => S.signOut()} style={{ width: '100%', marginTop: 16, cursor: 'pointer', background: 'transparent', border: '1px solid var(--line)', borderRadius: 13, padding: '13px', fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 600, fontSize: 14, color: 'var(--muted)' }}>Sign out</button>
      <div style={{ textAlign: 'center', fontFamily: 'Space Mono, monospace', fontSize: 9.5, color: 'var(--dim)', marginTop: 16, letterSpacing: '0.08em', lineHeight: 1.6 }}>
        BEINGCAMP v1.0<br/>A subsidiary of Adaline The Agency
      </div>
      <a href="BeingCamp Authority.html" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 14, textDecoration: 'none', fontFamily: 'Space Mono, monospace', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)' }}>
        <Icon name="building" size={13} color="var(--gold)" />Open Authority dashboard<Icon name="arrowUR" size={12} color="var(--gold)" />
      </a>
      <div style={{ height: 8 }} />
    </div>
  );
}

function EditProfileSheet({ S, onClose }) {
  const p = S.profile;
  const [name, setName] = React.useState(p.name);
  const [accent, setAccent] = React.useState(p.accent || '#c9a84c');
  const [city, setCity] = React.useState(p.city || '');
  const [headline, setHeadline] = React.useState(p.headline || '');
  const [bio, setBio] = React.useState(p.bio || '');
  const [skills, setSkills] = React.useState(p.skills || []);
  const accents = ['#c9a84c', '#5b9bd6', '#9b7fd4', '#4cc97a', '#d2564f'];
  const bank = ['Branding', 'Illustration', 'Motion', 'Film', 'Photography', 'Copywriting', 'Web Dev', 'UI/UX', 'Strategy', '3D', 'Sound', 'Editing', 'Marketing', 'Product'];
  const initials = (name || '').trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase() || '?';
  const toggle = (s) => setSkills((x) => x.includes(s) ? x.filter((y) => y !== s) : (x.length < 6 ? [...x, s] : x));
  const inp = { width: '100%', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12, padding: '13px 14px', fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 14, color: 'var(--text)', outline: 'none', boxSizing: 'border-box' };
  const lbl = (t) => <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--dim)', margin: '14px 0 7px' }}>{t}</div>;
  const save = () => { S.updateProfile({ name: name.trim() || p.name, accent, city: city.trim(), headline: headline.trim(), bio: bio.trim(), skills }); onClose(); S.toast({ msg: 'Profile updated', icon: 'check' }); };
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
        <div style={{ width: 72, height: 72, borderRadius: 20, background: `linear-gradient(140deg, ${accent}33, #141414)`, border: `1px solid ${accent}66`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 32, color: accent }}>{initials}</span>
        </div>
      </div>
      {lbl('Name')}
      <input value={name} onChange={(e) => setName(e.target.value)} style={inp} />
      {lbl('Colour')}
      <div style={{ display: 'flex', gap: 11 }}>
        {accents.map((c) => <button key={c} className="tap" onClick={() => setAccent(c)} style={{ cursor: 'pointer', width: 40, height: 40, borderRadius: 12, background: c, border: accent === c ? '3px solid var(--text)' : '3px solid transparent' }} />)}
      </div>
      {lbl('City')}
      <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Calicut" style={inp} />
      {lbl('Headline')}
      <input value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="e.g. Brand designer" style={inp} />
      {lbl('Bio')}
      <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} placeholder="A line about you…" style={{ ...inp, resize: 'none', lineHeight: 1.5 }} />
      {lbl('Skills · up to 6')}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 8 }}>
        {bank.map((s) => {
          const on = skills.includes(s);
          return <button key={s} className="tap" onClick={() => toggle(s)} style={{ cursor: 'pointer', fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 600, fontSize: 12.5, padding: '8px 12px', borderRadius: 999, border: `1px solid ${on ? 'var(--gold)' : 'var(--line)'}`, background: on ? 'var(--gold-dim)' : 'var(--surface)', color: on ? 'var(--gold)' : 'var(--muted)' }}>{s}</button>;
        })}
      </div>
      <Btn variant="primary" size="lg" full icon="check" style={{ marginTop: 14 }} onClick={save}>Save profile</Btn>
    </div>
  );
}

Object.assign(window, { ProfileScreen, RankLadder, EditProfileSheet });
