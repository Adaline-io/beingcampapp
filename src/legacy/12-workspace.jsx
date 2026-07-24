// BeingCamp — Project Workspace (the collaboration space)

function StageTracker({ stage }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {STAGES.map((st, i) => {
        const done = i <= stage;
        const current = i === stage;
        return (
          <React.Fragment key={st}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: done ? 'var(--gold)' : 'var(--panel)', border: `2px solid ${done ? 'var(--gold)' : 'var(--line2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: current ? '0 0 0 4px var(--gold-dim)' : 'none' }}>
                {i < stage && <Icon name="check" size={12} color="#1a1407" stroke={3} />}
                {current && <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#1a1407' }} />}
              </div>
              <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 7.5, letterSpacing: '0.04em', textTransform: 'uppercase', color: done ? 'var(--gold)' : 'var(--dim)', textAlign: 'center', width: 48, lineHeight: 1.2 }}>{st}</span>
            </div>
            {i < STAGES.length - 1 && <div style={{ flex: 1, height: 2, background: i < stage ? 'var(--gold)' : 'var(--line)', marginBottom: 18 }} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function DeliveredCard({ S, w }) {
  const [rated, setRated] = React.useState(0);
  const [submitted, setSubmitted] = React.useState(false);
  return (
    <Card hl pad={20} style={{ marginBottom: 14, position: 'relative', overflow: 'hidden', textAlign: 'center' }}>
      <div style={{ position: 'absolute', top: -40, left: '50%', transform: 'translateX(-50%)', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(76,201,122,0.18), transparent 70%)' }} />
      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}><Icon name="checkCircle" size={44} color="var(--green)" /></div>
        <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 28, color: 'var(--text)', lineHeight: 1 }}>DELIVERED</div>
        <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 13, color: 'var(--muted)', lineHeight: 1.5, marginTop: 6, marginBottom: 16 }}>All milestones approved · {fmt(w.budget)} BC released in full. {w.you === 'poster' ? 'Rate your team to close it out.' : 'Nice work — rate the collaboration.'}</div>
        {!submitted ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} className="tap" onClick={() => setRated(n)} style={{ cursor: 'pointer', background: 'none', border: 'none', padding: 2 }}>
                  <Icon name="star" size={30} color={n <= rated ? 'var(--gold)' : 'var(--line2)'} fill={n <= rated ? 'var(--gold)' : 'none'} />
                </button>
              ))}
            </div>
            <Btn variant="primary" full disabled={rated === 0} icon="check" onClick={() => { setSubmitted(true); S.toast({ msg: 'Rating submitted', icon: 'star' }); }}>Submit rating</Btn>
          </>
        ) : (
          <Btn variant="primary" full icon="arrowUR" onClick={() => { S.openSheet('publish', { project: w }); }}>Publish as a case study</Btn>
        )}
      </div>
    </Card>
  );
}

function ConfirmTeamCard({ S, w, setW }) {
  const [picked, setPicked] = React.useState([]);
  const toggle = (name) => setPicked((p) => p.includes(name) ? p.filter((x) => x !== name) : [...p, name]);
  const confirm = () => {
    const team = w.shortlist.filter((c) => picked.includes(c.name)).map((c, i) => ({ name: c.name, role: c.role, lead: i === 0 }));
    setW((prev) => ({
      ...prev, team, stage: 3, deadline: '2 weeks',
      milestones: prev.milestones.map((m, i) => i === 0 ? { ...m, status: 'active' } : m),
      schedule: [{ title: 'Kickoff call', when: 'Tomorrow · 3:00 PM', where: 'Video call' }],
      chat: [...prev.chat, { who: 'You', msg: `Confirmed the team — ${team.map((t) => t.name).join(', ')}. Let's go!`, when: 'Now', you: true }],
    }));
    S.toast({ msg: 'Team confirmed · project kicked off', icon: 'checkCircle' });
  };
  return (
    <Card hl pad={18} style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <Icon name="spark" size={20} color="var(--gold)" />
        <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 22, color: 'var(--text)', lineHeight: 1 }}>CONFIRM YOUR TEAM</div>
      </div>
      <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.5, marginBottom: 16 }}>Authority shortlisted these makers for your project. Pick who joins — escrow stays locked until you approve milestones.</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {w.shortlist.map((c) => {
          const on = picked.includes(c.name);
          return (
            <div key={c.name} style={{ background: on ? 'var(--gold-dim)' : 'var(--surface)', border: `1px solid ${on ? 'var(--gold-line)' : 'var(--line)'}`, borderRadius: 13, padding: 13 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--panel)', border: '1px solid var(--line2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 14, color: 'var(--gold)' }}>{c.name.split(' ').map((x) => x[0]).join('')}</span></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 600, fontSize: 13.5, color: 'var(--text)' }}>{c.name}</div>
                  <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, color: 'var(--muted)' }}>{c.role} · {c.rank}</div>
                </div>
                <div style={{ textAlign: 'right', marginRight: 4 }}><div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 17, color: c.match > 85 ? 'var(--green)' : 'var(--gold)', lineHeight: 1 }}>{c.match}%</div></div>
                <button className="tap" onClick={() => toggle(c.name)} style={{ cursor: 'pointer', width: 30, height: 30, borderRadius: '50%', border: `2px solid ${on ? 'var(--gold)' : 'var(--line2)'}`, background: on ? 'var(--gold)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{on && <Icon name="check" size={15} color="#1a1407" stroke={3} />}</button>
              </div>
              <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 11.5, color: 'var(--muted)', lineHeight: 1.45, fontStyle: 'italic', marginTop: 8 }}>“{c.pitch}”</div>
            </div>
          );
        })}
      </div>
      <Btn variant="primary" size="lg" full icon="check" disabled={picked.length === 0} style={{ marginTop: 14 }} onClick={confirm}>{picked.length === 0 ? 'Select your team' : `Confirm ${picked.length} & kick off`}</Btn>
    </Card>
  );
}

function WSOverview({ S, w, setW }) {
  const releasedPct = Math.round((w.escrowReleased / w.budget) * 100);
  const isPoster = w.you === 'poster';
  const needsConfirm = isPoster && w.team.length === 0 && w.shortlist && w.shortlist.length > 0;
  const delivered = w.stage >= 4;
  return (
    <div>
      {delivered && <DeliveredCard S={S} w={w} />}
      {needsConfirm && <ConfirmTeamCard S={S} w={w} setW={setW} />}
      {/* stage */}
      <Card pad={18} style={{ marginBottom: 14 }}>
        <Eyebrow style={{ marginBottom: 16 }}>Status</Eyebrow>
        <StageTracker stage={w.stage} />
      </Card>

      {/* escrow */}
      <Card hl pad={18} style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <Eyebrow>BeingCoin escrow</Eyebrow>
          <Icon name="lock" size={16} color="var(--gold)" />
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, marginBottom: 14 }}>
          <div><div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--dim)' }}>Locked</div><div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 3 }}><CoinMark size={22} /><span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 34, color: 'var(--text)', lineHeight: 0.9 }}>{fmt(w.budget)}</span></div></div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}><div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--dim)' }}>Released</div><div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 24, color: 'var(--green)', lineHeight: 0.9, marginTop: 3 }}>{fmt(w.escrowReleased)}</div></div>
        </div>
        <Progress value={w.escrowReleased} max={w.budget} color="var(--green)" h={7} />
        <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 11.5, color: 'var(--muted)', marginTop: 10, lineHeight: 1.4 }}>{releasedPct}% released · funds unlock to the team as you approve each milestone.</div>
      </Card>

      {/* crew seats: who the dispatch system is still calling for */}
      {(w.seats || []).length > 0 && (
        <Card pad={16} style={{ marginBottom: 14 }}>
          <Eyebrow style={{ marginBottom: 10 }}>Crew seats</Eyebrow>
          {w.seats.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: i < w.seats.length - 1 ? '1px solid var(--line)' : 'none' }}>
              <Icon name={s.filled ? 'checkCircle' : 'clock'} size={15} color={s.filled ? 'var(--green)' : 'var(--dim)'} />
              <span style={{ flex: 1, fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 13, color: 'var(--text)' }}>{s.role}</span>
              <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 10.5, color: 'var(--dim)' }}>{s.sharePct}% share</span>
              <Badge tone={s.filled ? 'green' : 'grey'}>{s.filled ? 'Filled' : 'Open'}</Badge>
            </div>
          ))}
          <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 11.5, color: 'var(--muted)', marginTop: 10, lineHeight: 1.4 }}>Open seats appear as crew calls in Find work. Each release splits by these shares.</div>
        </Card>
      )}

      {/* client window: share a read-only progress link, no account needed */}
      {isPoster && w.clientToken && (
        <Card pad={14} style={{ marginBottom: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
          <Icon name="arrowUR" size={18} color="var(--blue)" />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 700, fontSize: 13.5, color: 'var(--text)' }}>Client link</div>
            <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 11.5, color: 'var(--muted)' }}>Read-only progress page — safe to share.</div>
          </div>
          <Btn variant="outline" size="sm" onClick={() => {
            const url = `${location.origin}${location.pathname}?client=${w.clientToken}`;
            const done = () => S.toast({ msg: 'Client link copied', icon: 'check' });
            if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done, done); else { window.prompt('Copy the client link:', url); done(); }
          }}>Copy</Btn>
        </Card>
      )}

      {/* team */}
      {w.team.length > 0 && (<>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '20px 0 12px' }}>
        <Eyebrow>Team · {w.team.length}</Eyebrow>
        {isPoster && <span style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 11.5, fontWeight: 600, color: 'var(--gold)' }}>You confirmed</span>}
      </div>
      <Card pad={6} style={{ marginBottom: 14 }}>
        {w.team.map((m, i) => (
          <button key={i} className="tap" onClick={() => !m.you && S.go('memberProfile', { name: m.name })} style={{ width: '100%', textAlign: 'left', cursor: m.you ? 'default' : 'pointer', background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: 12, padding: '11px 12px', borderBottom: i < w.team.length - 1 ? '1px solid var(--line)' : 'none' }}>
            <div style={{ width: 36, height: 36, borderRadius: 11, background: m.you ? 'var(--gold-dim)' : 'var(--panel)', border: '1px solid var(--line2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 14, color: m.you ? 'var(--gold)' : 'var(--muted)' }}>{m.you ? 'YOU' : m.name.split(' ').map(x=>x[0]).join('')}</span></div>
            <div style={{ flex: 1 }}><div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 600, fontSize: 13.5, color: 'var(--text)' }}>{m.you ? 'You' : m.name}</div><div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 11.5, color: 'var(--muted)' }}>{m.role}</div></div>
            {m.lead && <Badge tone="gold">Lead</Badge>}
            {!m.you && <Icon name="chevR" size={15} color="var(--dim)" />}
          </button>
        ))}
      </Card>
      </>)}

      {/* schedule */}
      {w.schedule.length > 0 && (
        <>
          <Eyebrow line style={{ margin: '20px 0 12px' }}>Schedule</Eyebrow>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {w.schedule.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '13px 15px', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14 }}>
                <div style={{ width: 38, height: 38, borderRadius: 11, background: 'var(--panel)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="calendar" size={18} color="var(--blue)" /></div>
                <div style={{ flex: 1 }}><div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 600, fontSize: 13.5, color: 'var(--text)' }}>{s.title}</div><div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 11.5, color: 'var(--muted)' }}>{s.where}</div></div>
                <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, color: 'var(--gold)' }}>{s.when}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function WSTasks({ S, w, setW }) {
  const isPoster = w.you === 'poster';
  const approve = (idx) => {
    setW((prev) => {
      const ms = prev.milestones.map((m, i) => i === idx ? { ...m, status: 'done' } : (i === idx + 1 && m.status === 'todo' ? { ...m, status: 'active' } : m));
      const allDone = ms.every((m) => m.status === 'done');
      return { ...prev, milestones: ms, escrowReleased: Math.min(prev.budget, prev.escrowReleased + prev.milestones[idx].bc), stage: allDone ? 4 : prev.stage };
    });
    // Server-backed milestones settle escrow in the database as well.
    const dbId = w.milestones[idx] && w.milestones[idx].dbId;
    const BE = typeof window !== 'undefined' && window.BeingCampBackend;
    if (dbId && BE && BE.enabled) BE.releaseMilestone(dbId).catch((e) => console.warn('[beingcamp] milestone release sync failed:', e));
    S.toast({ msg: `Milestone released · ${fmt(w.milestones[idx].bc)} BC`, coin: w.milestones[idx].bc });
  };
  return (
    <div>
      <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 13, color: 'var(--muted)', marginBottom: 16, lineHeight: 1.5 }}>
        {isPoster ? 'Approve a milestone to release its BeingCoin from escrow to the team.' : 'Milestones release escrow as the poster approves your work.'}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {w.milestones.map((m, i) => {
          const prevDone = i === 0 || w.milestones[i - 1].status === 'done';
          return (
            <Card key={i} pad={16} style={{ borderColor: m.status === 'active' ? 'var(--gold-line)' : 'var(--line)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: m.status === 'done' ? 'var(--gold)' : 'var(--panel)', border: `2px solid ${m.status === 'done' ? 'var(--gold)' : m.status === 'active' ? 'var(--gold-line)' : 'var(--line2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {m.status === 'done' ? <Icon name="check" size={15} color="#1a1407" stroke={3} /> : <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 14, color: m.status === 'active' ? 'var(--gold)' : 'var(--dim)' }}>{i + 1}</span>}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 700, fontSize: 14.5, color: 'var(--text)' }}>{m.name}</div>
                  <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 11.5, color: m.status === 'done' ? 'var(--green)' : 'var(--muted)', marginTop: 1 }}>{m.status === 'done' ? 'Released' : m.status === 'active' ? 'In progress' : 'Upcoming'}</div>
                </div>
                <BC amount={m.bc} size={14} color={m.status === 'done' ? 'var(--green)' : 'var(--gold)'} />
              </div>
              {isPoster && m.status === 'active' && (
                <Btn variant="primary" size="sm" full icon="check" style={{ marginTop: 12 }} onClick={() => approve(i)}>Approve & release {fmt(m.bc)} BC</Btn>
              )}
              {!isPoster && m.status === 'active' && (
                <Btn variant="ghost" size="sm" full icon="arrowUR" style={{ marginTop: 12 }} onClick={() => S.toast({ msg: 'Marked ready for review', icon: 'check' })}>Submit for review</Btn>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function WSChat({ S, w, setW }) {
  const [text, setText] = React.useState('');
  const send = () => {
    if (!text.trim()) return;
    setW((prev) => ({ ...prev, chat: [...prev.chat, { who: 'You', msg: text.trim(), when: 'Now', you: true }] }));
    setText('');
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 380 }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 14 }}>
        {w.chat.map((c, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: c.you ? 'flex-end' : 'flex-start' }}>
            {!c.you && <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 9.5, color: 'var(--dim)', marginBottom: 4, marginLeft: 4 }}>{c.who}</span>}
            <div style={{ maxWidth: '80%', padding: '11px 14px', borderRadius: c.you ? '14px 14px 4px 14px' : '14px 14px 14px 4px', background: c.you ? 'var(--gold)' : 'var(--surface)', border: c.you ? 'none' : '1px solid var(--line)' }}>
              <span style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 13.5, color: c.you ? '#1a1407' : 'var(--text)', lineHeight: 1.45 }}>{c.msg}</span>
            </div>
            <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 8.5, color: 'var(--dim)', marginTop: 4, padding: '0 4px' }}>{c.when}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, position: 'sticky', bottom: 0, background: 'var(--bg)', paddingTop: 4 }}>
        <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder="Message the team…" style={{ flex: 1, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12, padding: '12px 14px', fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 13.5, color: 'var(--text)', outline: 'none' }} />
        <button className="tap" onClick={send} style={{ cursor: 'pointer', width: 46, flexShrink: 0, borderRadius: 12, background: 'var(--gold)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="arrowR" size={20} color="#1a1407" stroke={2.4} /></button>
      </div>
    </div>
  );
}

const FILE_ICON = { pdf: 'briefcase', fig: 'spark', img: 'bag', zip: 'briefcase' };
function WSFiles({ S, w }) {
  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
        {w.files.map((f, i) => (
          <Card key={i} pad={14} onClick={() => S.toast({ msg: `Opening ${f.name}`, icon: 'bag' })} style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
            <div style={{ width: 42, height: 42, borderRadius: 11, background: 'var(--panel)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={FILE_ICON[f.kind] || 'briefcase'} size={20} color="var(--gold)" /></div>
            <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 600, fontSize: 13.5, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.name}</div><div style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, color: 'var(--dim)', marginTop: 2 }}>{f.size} · {f.by} · {f.when}</div></div>
            <Icon name="arrowUR" size={16} color="var(--dim)" />
          </Card>
        ))}
      </div>
      <Btn variant="ghost" full icon="plus" style={{ marginTop: 14 }} onClick={() => S.toast({ msg: 'Upload a file', icon: 'plus' })}>Upload a file</Btn>
    </div>
  );
}

function WorkspaceScreen({ S }) {
  const base = (S.workspaces || WORKSPACES).find((x) => x.id === S.topPayload.id) || WORKSPACES[0];
  const [w, setW] = React.useState(base);
  const [tab, setTab] = React.useState('overview');
  // persist milestone/escrow/chat changes up to controller
  React.useEffect(() => { if (S.updateWorkspace) S.updateWorkspace(w); }, [w]);
  const tabs = [['overview', 'Overview'], ['tasks', 'Tasks'], ['chat', 'Chat'], ['files', 'Files']];
  return (
    <div style={{ animation: 'screenIn .3s ease' }}>
      <ScreenHead title={w.title} sub={w.you === 'poster' ? 'You posted · escrow' : `${w.role} · ${w.poster}`} onBack={S.back} />
      <div style={{ display: 'flex', gap: 4, background: 'var(--panel)', borderRadius: 999, padding: 4, border: '1px solid var(--line)', marginBottom: 18 }}>
        {tabs.map(([id, l]) => (
          <button key={id} className="tap" onClick={() => setTab(id)} style={{ flex: 1, cursor: 'pointer', fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 600, fontSize: 12.5, padding: '8px 0', borderRadius: 999, border: 'none', background: tab === id ? 'var(--gold)' : 'transparent', color: tab === id ? '#1a1407' : 'var(--muted)' }}>{l}</button>
        ))}
      </div>
      {tab === 'overview' && <WSOverview S={S} w={w} setW={setW} />}
      {tab === 'tasks' && <WSTasks S={S} w={w} setW={setW} />}
      {tab === 'chat' && <WSChat S={S} w={w} setW={setW} />}
      {tab === 'files' && <WSFiles S={S} w={w} />}
      <div style={{ height: 8 }} />
    </div>
  );
}

Object.assign(window, { WorkspaceScreen, StageTracker });
