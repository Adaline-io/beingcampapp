// BeingCamp — Work: Post flow, Projects list, Find Work (Pool)

function ProjectsScreen({ S }) {
  const [seg, setSeg] = React.useState('mine');
  const mine = S.workspaces || WORKSPACES;
  return (
    <div style={{ animation: 'screenIn .3s ease' }}>
      <ScreenHead title="PROJECTS" sub="Work & teams" right={<WalletChip S={S} />} />

      <div style={{ display: 'flex', gap: 4, background: 'var(--panel)', borderRadius: 999, padding: 4, border: '1px solid var(--line)', marginBottom: 18 }}>
        {[['mine', 'My projects'], ['find', 'Find work']].map(([id, l]) => (
          <button key={id} className="tap" onClick={() => setSeg(id)} style={{ flex: 1, cursor: 'pointer', fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 600, fontSize: 13, padding: '9px 0', borderRadius: 999, border: 'none', background: seg === id ? 'var(--gold)' : 'transparent', color: seg === id ? '#1a1407' : 'var(--muted)' }}>{l}</button>
        ))}
      </div>

      {seg === 'mine' ? (
        <>
          <Card hl pad={16} onClick={() => S.openSheet('postWork')} style={{ display: 'flex', alignItems: 'center', gap: 13, marginBottom: 16 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: 'var(--gold-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="plus" size={22} color="var(--gold)" stroke={2.4} /></div>
            <div style={{ flex: 1 }}><div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>Post new work</div><div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 12, color: 'var(--muted)' }}>Fund escrow · get a team</div></div>
            <Icon name="arrowR" size={18} color="var(--gold)" />
          </Card>
          {mine.length === 0 ? (
            <EmptyState icon="pool" title="No projects yet" body="Post work to get a team assembled for you, or jump into the Pool and join someone else's project." cta="Find work to join" onCta={() => setSeg('find')} />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {mine.map((w) => <WorkspaceRow key={w.id} S={S} w={w} />)}
            </div>
          )}
        </>
      ) : (
        <FindWorkList S={S} />
      )}
      <div style={{ height: 8 }} />
    </div>
  );
}

function WorkspaceRow({ S, w }) {
  const done = w.milestones.filter((m) => m.status === 'done').length;
  return (
    <Card pad={16} onClick={() => S.go('workspace', { id: w.id })}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
            <Badge tone={w.you === 'poster' ? 'blue' : 'gold'}>{w.you === 'poster' ? 'You posted' : w.role}</Badge>
            <Badge tone={w.stage >= 4 ? 'green' : w.stage === 3 ? 'gold' : 'purple'}>{STAGES[w.stage]}</Badge>
          </div>
          <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 700, fontSize: 16, color: 'var(--text)', lineHeight: 1.25 }}>{w.title}</div>
          <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{w.you === 'poster' ? `${w.team.length} on the team` : `for ${w.poster}`}</div>
        </div>
        <div style={{ textAlign: 'right' }}><BC amount={w.budget} size={14} color="var(--gold)" /><div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9.5, color: 'var(--dim)', marginTop: 3 }}>escrow</div></div>
      </div>
      <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
        {w.milestones.map((m, i) => <div key={i} style={{ flex: 1, height: 5, borderRadius: 999, background: m.status === 'done' ? 'var(--gold)' : m.status === 'active' ? 'var(--gold-line)' : 'var(--panel)' }} />)}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 10.5, color: 'var(--dim)' }}>{done}/{w.milestones.length} milestones · {w.deadline}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 12, fontWeight: 600, color: 'var(--gold)' }}>Open<Icon name="arrowR" size={13} color="var(--gold)" /></span>
      </div>
    </Card>
  );
}

function FindWorkList({ S }) {
  const [q, setQ] = React.useState('');
  const ql = q.trim().toLowerCase();
  const list = S.openWork.filter((o) => !ql || [o.title, o.poster, o.cat, o.need, o.desc].join(' ').toLowerCase().includes(ql));
  return (
    <div>
      <div style={{ fontFamily: 'DM Serif Display, serif', fontStyle: 'italic', fontSize: 15, color: 'var(--muted)', marginBottom: 16, lineHeight: 1.5 }}>
        Open work, posted by the community. Apply to join — Authority matches the team.
      </div>
      <SearchBar value={q} onChange={setQ} placeholder="Search work by skill, brand, type…" />
      {list.length === 0 && (
        <EmptyState icon="pool" title="No matches" body={`Nothing open matches “${q}” right now. Check back soon — new work is posted often.`} />
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {list.map((o) => {
          const applied = S.appliedWork.includes(o.id);
          const eligible = S.rankIndex >= o.minRank;
          return (
            <Card key={o.id} pad={16} onClick={() => S.openSheet('applyWork', { work: o })}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  <Badge tone="grey">{o.cat}</Badge>
                  {applied ? <Badge tone="green">Applied</Badge> : !eligible && <Badge tone="red">Builder+</Badge>}
                </div>
                <BC amount={o.pay} size={15} color="var(--gold)" />
              </div>
              <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 700, fontSize: 16, color: 'var(--text)', lineHeight: 1.3 }}>{o.title}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 10, flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 12, color: 'var(--muted)' }}><Icon name="user" size={14} color="var(--dim)" />{o.need}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 12, color: 'var(--muted)' }}><Icon name="clock" size={14} color="var(--dim)" />{o.deadline}</span>
                <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, color: 'var(--dim)', marginLeft: 'auto' }}>{o.applicants} applied</span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function FindWorkScreen({ S }) {
  return (
    <div style={{ animation: 'screenIn .3s ease' }}>
      <ScreenHead title="FIND WORK" sub="Open in the Pool" onBack={S.back} right={<WalletChip S={S} />} />
      <FindWorkList S={S} />
      <div style={{ height: 8 }} />
    </div>
  );
}

function ApplyWorkSheet({ S, work, onClose }) {
  const applied = S.appliedWork.includes(work.id);
  const eligible = S.rankIndex >= work.minRank;
  const [done, setDone] = React.useState(applied);
  const apply = () => { S.applyWork(work.id); setDone(true); };
  if (done) {
    return (
      <div style={{ textAlign: 'center', padding: '12px 0 8px' }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}><Icon name="checkCircle" size={60} color="var(--green)" /></div>
        <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 32, color: 'var(--text)', marginTop: 14 }}>APPLICATION IN</div>
        <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 13.5, color: 'var(--muted)', marginTop: 4, lineHeight: 1.5, padding: '0 8px' }}>
          Authority shortlists applicants and the poster confirms the team. You'll get a notification if you're picked — and a workspace opens automatically.
        </div>
        <div style={{ marginTop: 22 }}><Btn variant="primary" full size="lg" onClick={onClose}>Back to work</Btn></div>
      </div>
    );
  }
  return (
    <div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}><Badge tone="grey">{work.cat}</Badge>{!eligible && <Badge tone="red">Needs Builder rank</Badge>}</div>
      <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 30, color: 'var(--text)', lineHeight: 1.05 }}>{work.title}</div>
      <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 13, color: 'var(--muted)', marginTop: 6 }}>{work.poster} · seeking {work.need} · team of {work.team}</div>
      <div style={{ display: 'flex', gap: 10, margin: '18px 0' }}>
        {[['Your share', `${fmt(work.pay)} BC`, 'var(--gold)'], ['Role', work.need, 'var(--text)'], ['Deadline', work.deadline, 'var(--text)']].map(([l, v, c]) => (
          <div key={l} style={{ flex: 1, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12, padding: 12 }}>
            <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--dim)' }}>{l}</div>
            <div style={{ fontFamily: 'Space Mono, monospace', fontWeight: 700, fontSize: 13, color: c, marginTop: 4 }}>{v}</div>
          </div>
        ))}
      </div>
      <Eyebrow style={{ marginBottom: 8 }}>The work</Eyebrow>
      <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 16 }}>{work.desc}</div>
      {eligible
        ? <Field label="Why you?" value="" placeholder="A line on your fit + a link to past work…" />
        : <Card pad={14} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14 }}><Icon name="lock" size={20} color="var(--red)" /><span style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 12.5, color: 'var(--muted)' }}>Reach Builder rank to apply. Keep moving BeingCoin.</span></Card>}
      <Btn variant="primary" size="lg" full disabled={!eligible} icon="arrowR" onClick={apply}>Apply to join · free</Btn>
    </div>
  );
}

// ── POST WORK (multi-step) ──────────────────────────────────────────
function PostWorkSheet({ S, onClose }) {
  const [step, setStep] = React.useState(0); // 0 details, 1 fund, 2 done
  const [industryId, setIndustryId] = React.useState((S.myIndustries && S.myIndustries[0]) || 'design');
  const [size, setSize] = React.useState('small');
  const ind = industryOf(industryId);
  const presets = size === 'big' ? [2400, 5000, 9000, 15000] : [300, 600, 1200, 2000];
  const [budget, setBudget] = React.useState(1200);
  const cat = ind.name;
  const afford = S.balance >= budget;
  const fund = () => {
    if (!afford) { onClose(); S.go('buy'); S.toast({ msg: 'Top up to fund the escrow', icon: 'wallet' }); return; }
    S.spend(budget, 'Project escrow funded', 'pool');
    S.addPostedWork({ cat, budget, template: ind });
    setStep(2);
  };
  if (step === 2) {
    return (
      <div style={{ textAlign: 'center', padding: '12px 0 8px' }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}><Icon name="clock" size={58} color="var(--gold)" /></div>
        <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 32, color: 'var(--text)', marginTop: 14 }}>POSTED · SCOPING</div>
        <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 13.5, color: 'var(--muted)', marginTop: 4, lineHeight: 1.5, padding: '0 6px' }}>
          Your {fmt(budget)} BC is held in escrow. Authority is scoping the work and shortlisting a team — you'll confirm who joins. Track it in Projects.
        </div>
        <div style={{ marginTop: 22, display: 'flex', gap: 10 }}>
          <Btn variant="ghost" full onClick={onClose}>Done</Btn>
          <Btn variant="primary" full icon="arrowR" onClick={() => { onClose(); S.setTab('projects'); }}>View project</Btn>
        </div>
      </div>
    );
  }
  if (step === 1) {
    return (
      <div>
        <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 28, color: 'var(--text)', marginBottom: 6 }}>FUND THE ESCROW</div>
        <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 13, color: 'var(--muted)', marginBottom: 18, lineHeight: 1.5 }}>Your coins are locked safely and released to the team only as milestones are approved by you.</div>
        <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--dim)', marginBottom: 10 }}>Project budget</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {presets.map((a) => (
            <button key={a} className="tap" onClick={() => setBudget(a)} style={{ flex: 1, cursor: 'pointer', padding: '13px 4px', borderRadius: 12, border: `1px solid ${budget === a ? 'var(--gold)' : 'var(--line)'}`, background: budget === a ? 'var(--gold-dim)' : 'var(--surface)', fontFamily: 'Space Mono, monospace', fontWeight: 700, fontSize: 13, color: budget === a ? 'var(--gold)' : 'var(--muted)' }}>{a >= 1000 ? (a/1000) + 'k' : a}</button>
          ))}
        </div>
        <Card pad={16} style={{ marginBottom: 16 }}>
          {[['Escrow held', `${fmt(budget)} BC`], ['Platform fee (15%)', `${fmt(Math.round(budget * 0.15))} BC`], ['To the team', `${fmt(Math.round(budget * 0.85))} BC`]].map(([l, v], i, arr) => (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--line)' : 'none' }}>
              <span style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 13, color: 'var(--muted)' }}>{l}</span>
              <span style={{ fontFamily: 'Space Mono, monospace', fontWeight: 700, fontSize: 13, color: l.startsWith('To') ? 'var(--gold)' : 'var(--text)' }}>{v}</span>
            </div>
          ))}
        </Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, padding: '0 2px' }}>
          <span style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 12.5, color: 'var(--muted)' }}>Your balance</span>
          <BC amount={S.balance} size={13} color={afford ? 'var(--text)' : 'var(--red)'} />
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Btn variant="ghost" icon="back" onClick={() => setStep(0)}>Back</Btn>
          <Btn variant="primary" full icon={afford ? 'lock' : 'wallet'} onClick={fund}>{afford ? `Lock ${fmt(budget)} BC` : 'Top up'}</Btn>
        </div>
      </div>
    );
  }
  return (
    <div>
      <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 28, color: 'var(--text)', marginBottom: 6 }}>POST WORK</div>
      <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 13, color: 'var(--muted)', marginBottom: 18, lineHeight: 1.5 }}>Describe what you need. Authority scopes it and builds you a team — you stay in control.</div>
      <Field label="What do you need?" value="" placeholder="e.g. Rebrand for our new café" />
      <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--dim)', marginBottom: 8 }}>Industry</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7, marginBottom: 14 }}>
        {INDUSTRIES.map((x) => (
          <button key={x.id} className="tap" onClick={() => setIndustryId(x.id)} style={{ cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 11px', borderRadius: 10, border: `1px solid ${industryId === x.id ? 'var(--gold)' : 'var(--line)'}`, background: industryId === x.id ? 'var(--gold-dim)' : 'var(--surface)' }}>
            <Icon name={x.icon} size={15} color={industryId === x.id ? 'var(--gold)' : x.tone} />
            <span style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 700, fontSize: 12, color: industryId === x.id ? 'var(--gold)' : 'var(--text)' }}>{x.name}</span>
          </button>
        ))}
      </div>
      <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--dim)', marginBottom: 8 }}>Project size</div>
      <div style={{ display: 'flex', gap: 7, marginBottom: 14 }}>
        {[['small', 'Small gig', ind.sizes.small], ['big', 'Big production', ind.sizes.big]].map(([id, label, sub]) => (
          <button key={id} className="tap" onClick={() => { setSize(id); setBudget(id === 'big' ? 5000 : 1200); }} style={{ flex: 1, cursor: 'pointer', textAlign: 'left', padding: '11px 12px', borderRadius: 10, border: `1px solid ${size === id ? 'var(--gold)' : 'var(--line)'}`, background: size === id ? 'var(--gold-dim)' : 'var(--surface)' }}>
            <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 700, fontSize: 12.5, color: size === id ? 'var(--gold)' : 'var(--text)' }}>{label}</div>
            <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 10.5, color: 'var(--muted)', marginTop: 2 }}>{sub}</div>
          </button>
        ))}
      </div>
      <Card pad={14} style={{ marginBottom: 14 }}>
        <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 8 }}>This project will need</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
          {ind.roles.map((r) => <Badge key={r}>{r}</Badge>)}
        </div>
        {ind.requirements.map((r) => (
          <div key={r} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0' }}>
            <Icon name="check" size={13} color="var(--green)" />
            <span style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 12.5, color: 'var(--muted)' }}>{r}</span>
          </div>
        ))}
        <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9.5, color: 'var(--dim)', marginTop: 8 }}>
          Milestones: {ind.milestones.map((m) => m.name).join(' → ')}
        </div>
      </Card>
      <Field label="Details" value="" placeholder="Goals, scope, references, timeline…" />
      <Btn variant="primary" size="lg" full icon="arrowR" onClick={() => setStep(1)}>Continue to escrow</Btn>
    </div>
  );
}

Object.assign(window, { ProjectsScreen, WorkspaceRow, FindWorkList, FindWorkScreen, ApplyWorkSheet, PostWorkSheet });
