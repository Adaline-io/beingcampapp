// BeingCamp — Showcase: published case studies, works & theory

const PUB_TONE = { 'Case Study': 'gold', 'Work': 'blue', 'Theory': 'purple' };

function PubRow({ S, p }) {
  return (
    <Card pad={0} onClick={() => S.go('pubDetail', { id: p.id })} style={{ overflow: 'hidden', display: 'flex' }}>
      <Placeholder tone={p.tone} h={'auto'} radius={0} icon={p.type === 'Theory' ? 'edit' : p.type === 'Work' ? 'spark' : 'briefcase'} style={{ width: 88, minHeight: 96, flexShrink: 0 }} />
      <div style={{ padding: 14, flex: 1, minWidth: 0 }}>
        <Badge tone={PUB_TONE[p.type]}>{p.type}</Badge>
        <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 700, fontSize: 14.5, color: 'var(--text)', margin: '8px 0 4px', lineHeight: 1.25 }}>{p.title}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 11.5, color: 'var(--muted)' }}>{p.author}</span>
          <span style={{ width: 3, height: 3, borderRadius: 999, background: 'var(--dim)' }} />
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'Space Mono, monospace', fontSize: 10, color: 'var(--dim)' }}><Icon name="star" size={11} color="var(--dim)" />{p.claps}</span>
          <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, color: 'var(--dim)', marginLeft: 'auto' }}>{p.read}</span>
        </div>
      </div>
    </Card>
  );
}

function ShowcaseScreen({ S }) {
  const [type, setType] = React.useState('All');
  const [q, setQ] = React.useState('');
  const ql = q.trim().toLowerCase();
  const list = (S.publications || PUBLICATIONS)
    .filter((p) => type === 'All' || p.type === type)
    .filter((p) => !ql || [p.title, p.author, p.excerpt, p.type, (p.tags || []).join(' ')].join(' ').toLowerCase().includes(ql));
  const featured = list[0];
  return (
    <div style={{ animation: 'screenIn .3s ease' }}>
      <ScreenHead title="SHOWCASE" sub="Built by the community" right={
        <button className="tap" onClick={() => S.openSheet('publish')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, background: 'var(--gold)', border: 'none', borderRadius: 12, padding: '10px 14px', fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 700, fontSize: 13, color: '#1a1407' }}><Icon name="plus" size={16} color="#1a1407" stroke={2.4} />Publish</button>
      } />
      <SearchBar value={q} onChange={setQ} placeholder="Search work, theory, people…" />
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', margin: '0 -22px 18px', padding: '0 22px', scrollbarWidth: 'none' }}>
        {PUB_TYPES.map((c) => (
          <button key={c} className="tap" onClick={() => setType(c)} style={{ flexShrink: 0, cursor: 'pointer', fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 600, fontSize: 12.5, padding: '8px 14px', borderRadius: 999, border: `1px solid ${type === c ? 'var(--gold)' : 'var(--line)'}`, background: type === c ? 'var(--gold)' : 'var(--surface)', color: type === c ? '#1a1407' : 'var(--muted)' }}>{c}</button>
        ))}
      </div>

      {list.length === 0 && (
        <EmptyState icon="spark" title="Nothing found" body={`No publications match “${q}”. Try a different search or be the first to publish.`} cta="Publish something" onCta={() => S.openSheet('publish')} />
      )}

      {/* Featured */}
      {featured && (
        <Card pad={0} onClick={() => S.go('pubDetail', { id: featured.id })} style={{ overflow: 'hidden', marginBottom: 14 }}>
          <Placeholder tone={featured.tone} h={150} radius={0} icon={featured.type === 'Theory' ? 'edit' : featured.type === 'Work' ? 'spark' : 'briefcase'} label={`Featured · ${featured.type}`} />
          <div style={{ padding: 16 }}>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 24, color: 'var(--text)', lineHeight: 1.05 }}>{featured.title}</div>
            <div style={{ fontFamily: 'DM Serif Display, serif', fontStyle: 'italic', fontSize: 14, color: 'var(--muted)', lineHeight: 1.5, marginTop: 8 }}>{featured.excerpt}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14 }}>
              <div style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--panel)', border: '1px solid var(--line2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Bebas Neue, sans-serif', fontSize: 13, color: 'var(--gold)' }}>{featured.init}</div>
              <span style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>{featured.author}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'Space Mono, monospace', fontSize: 11, color: 'var(--dim)', marginLeft: 'auto' }}><Icon name="star" size={13} color="var(--gold)" />{featured.claps}</span>
            </div>
          </div>
        </Card>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {list.slice(1).map((p) => <PubRow key={p.id} S={S} p={p} />)}
      </div>
      <div style={{ height: 8 }} />
    </div>
  );
}

function PubDetailScreen({ S }) {
  const p = (S.publications || PUBLICATIONS).find((x) => x.id === S.topPayload.id) || PUBLICATIONS[0];
  const [clapped, setClapped] = React.useState(false);
  const claps = p.claps + (clapped ? 1 : 0);
  return (
    <div style={{ animation: 'screenIn .3s ease' }}>
      <ScreenHead title={p.type.toUpperCase()} sub="Showcase" onBack={S.back} />
      <Placeholder tone={p.tone} h={180} icon={p.type === 'Theory' ? 'edit' : p.type === 'Work' ? 'spark' : 'briefcase'} label={p.type} />
      <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 32, color: 'var(--text)', lineHeight: 1.05, margin: '18px 0 12px' }}>{p.title}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 18 }}>
        <button className="tap" onClick={() => p.author !== 'You' && S.go('memberProfile', { name: p.author })} style={{ flex: 1, cursor: p.author === 'You' ? 'default' : 'pointer', background: 'none', border: 'none', padding: 0, display: 'flex', alignItems: 'center', gap: 11, textAlign: 'left' }}>
          <div style={{ width: 38, height: 38, borderRadius: 11, background: 'var(--panel)', border: '1px solid var(--line2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Bebas Neue, sans-serif', fontSize: 16, color: 'var(--gold)' }}>{p.init}</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{p.author}</span>{p.author !== 'You' && <Icon name="chevR" size={14} color="var(--dim)" />}</div>
            <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, color: 'var(--dim)' }}>{p.read} · {p.tags.join(' · ')}</div>
          </div>
        </button>
        {p.project && <Badge tone="gold">From a project</Badge>}
      </div>
      <div style={{ fontFamily: 'DM Serif Display, serif', fontStyle: 'italic', fontSize: 17, color: 'var(--text)', lineHeight: 1.5, marginBottom: 16 }}>{p.excerpt}</div>
      <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 14, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 10 }}>
        {p.type === 'Theory'
          ? 'This is where the full essay would live — the writer\u2019s argument laid out in long form, pulled from their experience inside the Camp. Members can clap, save, and respond.'
          : p.type === 'Work'
          ? 'A gallery of the maker\u2019s personal work — images, process shots, and notes. No client, no brief: the things people make when the work is its own reward.'
          : 'The full case study: the brief, the team that was assembled, how the milestones and escrow worked, what shipped, and what the maker learned. The receipts behind the result.'}
      </div>
      <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 14, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 24 }}>
        Every publication ties back to a real member and, where relevant, a real project workspace — so the Showcase doubles as a portfolio and a body of proof for the whole community.
      </div>

      <div style={{ display: 'flex', gap: 10, position: 'sticky', bottom: 0 }}>
        <Btn variant={clapped ? 'primary' : 'ghost'} full icon="star" onClick={() => { if (!clapped) { setClapped(true); S.toast({ msg: 'You clapped for this', icon: 'star' }); } }}>{claps} claps</Btn>
        <Btn variant="ghost" icon="share" onClick={() => S.toast({ msg: 'Share link copied', icon: 'check' })}>Share</Btn>
      </div>
      <div style={{ height: 8 }} />
    </div>
  );
}

function PublishSheet({ S, onClose }) {
  const [type, setType] = React.useState('Case Study');
  const [fromProject, setFromProject] = React.useState(null);
  const [done, setDone] = React.useState(false);
  const delivered = (S.workspaces || WORKSPACES).filter((w) => w.stage >= 4);
  const publish = () => {
    S.addPublication({ type, title: fromProject ? `${fromProject.title} — case study` : 'My new ' + type.toLowerCase(), project: !!fromProject });
    setDone(true);
  };
  if (done) {
    return (
      <div style={{ textAlign: 'center', padding: '12px 0 8px' }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}><Icon name="checkCircle" size={60} color="var(--green)" /></div>
        <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 32, color: 'var(--text)', marginTop: 14 }}>PUBLISHED</div>
        <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 13.5, color: 'var(--muted)', marginTop: 4, lineHeight: 1.5, padding: '0 8px' }}>It's live on the Showcase and linked to your profile. The community can clap, save, and respond.</div>
        <div style={{ marginTop: 22 }}><Btn variant="primary" full size="lg" onClick={onClose}>Done</Btn></div>
      </div>
    );
  }
  return (
    <div>
      <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 28, color: 'var(--text)', marginBottom: 6 }}>PUBLISH TO SHOWCASE</div>
      <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 13, color: 'var(--muted)', marginBottom: 18, lineHeight: 1.5 }}>Feature a finished project, share personal work, or post a piece of theory.</div>

      <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--dim)', marginBottom: 8 }}>Type</div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
        {['Case Study', 'Work', 'Theory'].map((t) => (
          <button key={t} className="tap" onClick={() => { setType(t); if (t !== 'Case Study') setFromProject(null); }} style={{ flex: 1, cursor: 'pointer', padding: '12px 6px', borderRadius: 12, border: `1px solid ${type === t ? 'var(--gold)' : 'var(--line)'}`, background: type === t ? 'var(--gold-dim)' : 'var(--surface)', fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 600, fontSize: 12.5, color: type === t ? 'var(--gold)' : 'var(--muted)' }}>{t}</button>
        ))}
      </div>

      {type === 'Case Study' && delivered.length > 0 && (
        <>
          <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--dim)', marginBottom: 8 }}>From a delivered project</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 18 }}>
            {delivered.map((w) => (
              <button key={w.id} className="tap" onClick={() => setFromProject(w)} style={{ cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 12, padding: 13, borderRadius: 12, border: `1px solid ${fromProject?.id === w.id ? 'var(--gold)' : 'var(--line)'}`, background: fromProject?.id === w.id ? 'var(--gold-dim)' : 'var(--surface)' }}>
                <Icon name="briefcase" size={18} color="var(--gold)" />
                <div style={{ flex: 1 }}><div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 600, fontSize: 13.5, color: 'var(--text)' }}>{w.title}</div><div style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, color: 'var(--dim)' }}>{w.role} · Delivered</div></div>
                <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${fromProject?.id === w.id ? 'var(--gold)' : 'var(--line2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{fromProject?.id === w.id && <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--gold)' }} />}</div>
              </button>
            ))}
          </div>
        </>
      )}

      <Field label="Title" value="" placeholder={type === 'Theory' ? 'e.g. Why the brief matters most' : 'Give it a name'} />
      <Field label={type === 'Theory' ? 'Your argument' : 'Short description'} value="" placeholder="A line that makes people want to read more…" />

      <Btn variant="primary" size="lg" full icon="arrowUR" onClick={publish}>Publish to Showcase</Btn>
      <div style={{ textAlign: 'center', fontFamily: 'Space Mono, monospace', fontSize: 10, color: 'var(--dim)', marginTop: 12 }}>Published works appear on your profile</div>
    </div>
  );
}

Object.assign(window, { ShowcaseScreen, PubRow, PubDetailScreen, PublishSheet, PUB_TONE });
