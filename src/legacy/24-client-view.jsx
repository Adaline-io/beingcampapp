// BeingCamp — Client window: a read-only progress page reached by share link
// (?client=<token>). The token is the only secret — no account, no sign-in.
// Live mode resolves it through the anon-callable client_project RPC; the
// special token "demo" renders sample data so the page can be previewed.

const CLIENT_DEMO_SNAPSHOT = {
  title: 'Café rebrand — Fort Kochi',
  cat: 'Design',
  stage: 3,
  budget: 2000,
  milestones: [
    { label: 'Concept directions', amount: 600, released: true },
    { label: 'Refinement', amount: 600, released: false },
    { label: 'Final delivery', amount: 800, released: false },
  ],
  team: [
    { role: 'Lead designer', filled: true },
    { role: 'Illustrator', filled: true },
    { role: 'Copywriter', filled: false },
  ],
};

function ClientProjectView({ token }) {
  const [snap, setSnap] = React.useState(undefined); // undefined = loading · null = bad link
  React.useEffect(() => {
    let alive = true;
    if (token === 'demo') { setSnap(CLIENT_DEMO_SNAPSHOT); return undefined; }
    const BE = window.BeingCampBackend;
    if (!BE || !BE.enabled || !BE.clientProject) { setSnap(null); return undefined; }
    BE.clientProject(token)
      .then((s) => { if (alive) setSnap(s || null); })
      .catch(() => { if (alive) setSnap(null); });
    return () => { alive = false; };
  }, [token]);

  const shell = (body) => (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '40px 20px' }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 26 }}>
          <CoinMark size={26} />
          <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 22, color: 'var(--text)', letterSpacing: '0.04em' }}>BEINGCAMP</span>
          <span style={{ marginLeft: 'auto', fontFamily: 'Space Mono, monospace', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--dim)' }}>Client view</span>
        </div>
        {body}
      </div>
    </div>
  );

  if (snap === undefined) {
    return shell(
      <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 14, color: 'var(--muted)' }}>Loading your project…</div>
    );
  }
  if (!snap) {
    return shell(
      <Card pad={20}>
        <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 700, fontSize: 16, color: 'var(--text)', marginBottom: 6 }}>This link isn't active</div>
        <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>Ask the project owner to share a fresh client link from their workspace.</div>
      </Card>
    );
  }

  const released = (snap.milestones || []).filter((m) => m.released).reduce((s, m) => s + Number(m.amount || 0), 0);
  const filled = (snap.team || []).filter((t) => t.filled).length;
  return shell(
    <div style={{ animation: 'screenIn .3s ease' }}>
      <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
        <Badge tone="grey">{snap.cat}</Badge>
        <Badge tone={snap.stage >= 4 ? 'green' : 'gold'}>{STAGES[Math.max(0, Math.min(4, snap.stage))]}</Badge>
      </div>
      <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 34, color: 'var(--text)', lineHeight: 1.05, marginBottom: 18 }}>{snap.title}</div>

      <Card hl pad={18} style={{ marginBottom: 14 }}>
        <Eyebrow style={{ marginBottom: 12 }}>Budget progress</Eyebrow>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 10 }}>
          <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 30, color: 'var(--green)', lineHeight: 1 }}>{fmt(released)}</span>
          <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 12, color: 'var(--dim)' }}>/ {fmt(snap.budget)} BC released</span>
        </div>
        <Progress value={released} max={snap.budget || 1} color="var(--green)" h={7} />
      </Card>

      <Card pad={16} style={{ marginBottom: 14 }}>
        <Eyebrow style={{ marginBottom: 10 }}>Milestones</Eyebrow>
        {(snap.milestones || []).map((m, i, arr) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--line)' : 'none' }}>
            <Icon name={m.released ? 'checkCircle' : 'clock'} size={16} color={m.released ? 'var(--green)' : 'var(--dim)'} />
            <span style={{ flex: 1, fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 13.5, color: 'var(--text)' }}>{m.label}</span>
            <BC amount={Number(m.amount || 0)} size={12.5} color={m.released ? 'var(--green)' : 'var(--muted)'} />
          </div>
        ))}
      </Card>

      {(snap.team || []).length > 0 && (
        <Card pad={16} style={{ marginBottom: 14 }}>
          <Eyebrow style={{ marginBottom: 10 }}>Team · {filled}/{snap.team.length} seats filled</Eyebrow>
          {snap.team.map((t, i, arr) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--line)' : 'none' }}>
              <span style={{ flex: 1, fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 13, color: 'var(--text)' }}>{t.role}</span>
              <Badge tone={t.filled ? 'green' : 'grey'}>{t.filled ? 'On board' : 'Recruiting'}</Badge>
            </div>
          ))}
        </Card>
      )}

      <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 11.5, color: 'var(--dim)', textAlign: 'center', marginTop: 22, lineHeight: 1.5 }}>
        This page updates live as the team hits milestones.<br />Powered by BeingCamp · Kochi
      </div>
    </div>
  );
}

Object.assign(window, { ClientProjectView });
