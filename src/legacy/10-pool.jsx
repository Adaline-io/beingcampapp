// BeingCamp — The Pool, Projects, Gift wallet

const POOL_CATS = ['All', 'Branding', 'Production', 'Tech', 'Marketing'];

function PoolScreen({ S }) {
  const [cat, setCat] = React.useState('All');
  const list = BRIEFS.filter((b) => cat === 'All' || b.cat === cat);
  return (
    <div style={{ animation: 'screenIn .3s ease' }}>
      <ScreenHead title="THE POOL" sub="Brief marketplace" right={<WalletChip S={S} />} />
      <div style={{ fontFamily: 'DM Serif Display, serif', fontStyle: 'italic', fontSize: 15, color: 'var(--muted)', marginBottom: 18, lineHeight: 1.5 }}>
        Real briefs from real clients. Apply, get matched by Adaline, get paid in BeingCoin.
      </div>
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', margin: '0 -22px 18px', padding: '0 22px', scrollbarWidth: 'none' }}>
        {POOL_CATS.map((c) => (
          <button key={c} className="tap" onClick={() => setCat(c)} style={{ flexShrink: 0, cursor: 'pointer', fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 600, fontSize: 12.5, padding: '8px 14px', borderRadius: 999, border: `1px solid ${cat === c ? 'var(--gold)' : 'var(--line)'}`, background: cat === c ? 'var(--gold)' : 'var(--surface)', color: cat === c ? '#1a1407' : 'var(--muted)' }}>{c}</button>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {list.map((b) => {
          const applied = S.appliedBriefs.includes(b.id);
          const eligible = S.rankIndex >= b.minRank;
          return (
            <Card key={b.id} pad={16} onClick={() => S.openSheet('brief', { brief: b })}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  <Badge tone="grey">{b.cat}</Badge>
                  {applied ? <Badge tone="green">Applied</Badge> : !eligible && <Badge tone="red">Builder+</Badge>}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <BC amount={b.budget} size={16} color="var(--gold)" />
                </div>
              </div>
              <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 700, fontSize: 16, color: 'var(--text)', lineHeight: 1.3 }}>{b.title}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 10 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 12, color: 'var(--muted)' }}><Icon name="building" size={14} color="var(--dim)" />{b.client}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 12, color: 'var(--muted)' }}><Icon name="clock" size={14} color="var(--dim)" />{b.deadline}</span>
                <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, color: 'var(--dim)', marginLeft: 'auto' }}>{b.applicants} applied</span>
              </div>
            </Card>
          );
        })}
      </div>
      <div style={{ height: 8 }} />
    </div>
  );
}

function BriefSheet({ S, brief, onClose }) {
  const applied = S.appliedBriefs.includes(brief.id);
  const eligible = S.rankIndex >= brief.minRank;
  const [done, setDone] = React.useState(applied);
  const earn = Math.round(brief.budget * 0.85);
  const apply = () => { S.applyBrief(brief.id); setDone(true); };
  if (done) {
    return (
      <div style={{ textAlign: 'center', padding: '12px 0 8px' }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}><Icon name="checkCircle" size={64} color="var(--green)" /></div>
        <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 32, color: 'var(--text)', marginTop: 16 }}>PROPOSAL SENT</div>
        <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 13.5, color: 'var(--muted)', marginTop: 4, lineHeight: 1.5, padding: '0 8px' }}>
          Adaline reviews proposals and matches the best fit. You'll be notified if chosen. On approval, <strong style={{ color: 'var(--gold)' }}>{fmt(earn)} BC</strong> releases to your wallet after a 48-hour hold.
        </div>
        <div style={{ marginTop: 22 }}><Btn variant="primary" full size="lg" onClick={onClose}>Back to Pool</Btn></div>
      </div>
    );
  }
  return (
    <div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}><Badge tone="grey">{brief.cat}</Badge>{!eligible && <Badge tone="red">Needs Builder rank</Badge>}</div>
      <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 30, color: 'var(--text)', lineHeight: 1.05 }}>{brief.title}</div>
      <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 13, color: 'var(--muted)', marginTop: 6 }}>{brief.client} · {brief.applicants} Campers applied</div>

      <div style={{ display: 'flex', gap: 10, margin: '18px 0' }}>
        {[['Budget', `${fmt(brief.budget)} BC`, 'var(--gold)'], ['You earn', `${fmt(earn)} BC`, 'var(--green)'], ['Deadline', brief.deadline, 'var(--text)']].map(([l, v, c]) => (
          <div key={l} style={{ flex: 1, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12, padding: '12px' }}>
            <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--dim)' }}>{l}</div>
            <div style={{ fontFamily: 'Space Mono, monospace', fontWeight: 700, fontSize: 14, color: c, marginTop: 4 }}>{v}</div>
          </div>
        ))}
      </div>

      <Eyebrow style={{ marginBottom: 8 }}>The brief</Eyebrow>
      <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 16 }}>{brief.desc}</div>

      {eligible
        ? <Field label="Your pitch" value="" placeholder="Why you're the right Camper for this…" />
        : <Card pad={14} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14 }}><Icon name="lock" size={20} color="var(--red)" /><span style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 12.5, color: 'var(--muted)' }}>Reach Builder rank to apply. Keep earning activity BC.</span></Card>}

      <Btn variant="primary" size="lg" full disabled={!eligible} icon="arrowR" onClick={apply}>Submit proposal · free</Btn>
    </div>
  );
}

function PostBriefSheet({ S, onClose }) {
  const [done, setDone] = React.useState(false);
  const afford = S.balance >= 50;
  const post = () => {
    if (!afford) { onClose(); S.go('buy'); S.toast({ msg: 'Top up to post a brief', icon: 'wallet' }); return; }
    S.spend(50, 'Pool brief deposit (refundable)', 'pool');
    setDone(true);
  };
  if (done) {
    return (
      <div style={{ textAlign: 'center', padding: '12px 0 8px' }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}><Icon name="clock" size={60} color="var(--gold)" /></div>
        <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 32, color: 'var(--text)', marginTop: 16 }}>UNDER REVIEW</div>
        <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 13.5, color: 'var(--muted)', marginTop: 4, lineHeight: 1.5, padding: '0 8px' }}>
          Adaline reviews every brief within 24 hours. Once approved it goes live to eligible Campers. Your 50 BC deposit is refunded on completion — or if rejected.
        </div>
        <div style={{ marginTop: 22 }}><Btn variant="primary" full size="lg" onClick={onClose}>Done</Btn></div>
      </div>
    );
  }
  return (
    <div>
      <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 28, color: 'var(--text)', marginBottom: 16 }}>POST A BRIEF</div>
      <Field label="Title" value="" placeholder="e.g. Rebrand for our new café" />
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--dim)', marginBottom: 6 }}>Category</div>
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
          {['Branding', 'Tech', 'Production', 'Marketing'].map((c, i) => (
            <span key={c} style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 12.5, fontWeight: 600, padding: '8px 13px', borderRadius: 999, border: `1px solid ${i === 0 ? 'var(--gold)' : 'var(--line)'}`, background: i === 0 ? 'var(--gold-dim)' : 'var(--surface)', color: i === 0 ? 'var(--gold)' : 'var(--muted)' }}>{c}</span>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ flex: 1 }}><Field label="Budget (BC)" value="" placeholder="2,400" /></div>
        <div style={{ flex: 1 }}><Field label="Deadline" value="" placeholder="2 weeks" /></div>
      </div>
      <Field label="Description" value="" placeholder="What do you need delivered?" />
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0', borderTop: '1px solid var(--line)', marginBottom: 16 }}>
        <span style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 13, color: 'var(--muted)' }}>Posting deposit (refundable)</span>
        <BC amount={50} size={14} color="var(--gold)" />
      </div>
      <Btn variant="primary" size="lg" full icon="arrowR" onClick={post}>Submit for review</Btn>
    </div>
  );
}

function ProjectsScreen__poolLegacy({ S }) {
  return (
    <div style={{ animation: 'screenIn .3s ease' }}>
      <ScreenHead title="PROJECTS" sub="Your briefs & work" right={<WalletChip S={S} />} />
      <Btn variant="primary" full size="lg" icon="plus" onClick={() => S.openSheet('postBrief')} style={{ marginBottom: 22 }}>Post a new brief</Btn>

      <Eyebrow line style={{ marginBottom: 12 }}>Active projects</Eyebrow>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginBottom: 24 }}>
        {PROJECTS.map((p) => (
          <Card key={p.id} pad={16}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>{p.name}</div>
                <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginTop: 2 }}>{p.div}</div>
              </div>
              <Badge tone={p.stage === 'Review' ? 'purple' : 'gold'}>{p.stage}</Badge>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {PROJECT_STAGES.map((st, i) => <div key={st} style={{ flex: 1, height: 4, borderRadius: 999, background: i <= p.stageIdx ? 'var(--gold)' : 'var(--panel)' }} />)}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
              {PROJECT_STAGES.map((st) => <span key={st} style={{ fontFamily: 'Space Mono, monospace', fontSize: 8.5, color: 'var(--dim)' }}>{st}</span>)}
            </div>
          </Card>
        ))}
      </div>

      <Eyebrow line style={{ marginBottom: 12 }}>Posted briefs</Eyebrow>
      <Card pad={16}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 700, fontSize: 14.5, color: 'var(--text)' }}>Launch poster series</div>
            <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>19 Campers applied · Adaline matching</div>
          </div>
          <Badge tone="blue">Open</Badge>
        </div>
      </Card>
      <div style={{ height: 8 }} />
    </div>
  );
}

function GiftSheet({ S, onClose, to }) {
  const [mode, setMode] = React.useState(to ? 'send' : 'gift'); // gift | send | request
  const [amt, setAmt] = React.useState(200);
  const [done, setDone] = React.useState(false);
  const afford = S.balance >= amt;
  const outgoing = mode !== 'request';

  const act = () => {
    if (outgoing && !afford) { onClose(); S.go('buy'); S.toast({ msg: 'Top up first', icon: 'wallet' }); return; }
    if (mode === 'gift') S.spend(amt, 'Gift wallet sent', 'gift');
    else if (mode === 'send') S.spend(amt, 'Coins sent to member', 'gift');
    else S.toast({ msg: `Requested ${fmt(amt)} BC`, icon: 'arrowUR' });
    setDone(true);
  };

  if (done) {
    const cfg = {
      gift: ['gift', 'var(--purple)', 'GIFT SENT', `${fmt(amt)} BC is on its way. They'll get an SMS to claim it.`],
      send: ['arrowUR', 'var(--green)', 'COINS SENT', `${fmt(amt)} BC moved to their wallet instantly.`],
      request: ['arrowUR', 'var(--blue)', 'REQUEST SENT', `They'll get a notification to send you ${fmt(amt)} BC.`],
    }[mode];
    return (
      <div style={{ textAlign: 'center', padding: '12px 0 8px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', animation: 'coinPop .5s ease' }}><Icon name={cfg[0]} size={56} color={cfg[1]} /></div>
        <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 32, color: 'var(--text)', marginTop: 14 }}>{cfg[2]}</div>
        <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 13.5, color: 'var(--muted)', marginTop: 4, lineHeight: 1.5, padding: '0 10px' }}>{cfg[3]}</div>
        <div style={{ marginTop: 22 }}><Btn variant="primary" full size="lg" onClick={onClose}>Done</Btn></div>
      </div>
    );
  }

  const tabs = [['gift', 'Gift'], ['send', 'Send'], ['request', 'Request']];
  const labels = {
    gift: ['GIFT BEINGCOIN', 'Recipient phone', 'Gift to anyone — they get an SMS to claim. Non-refundable once activated.', 'gift', 'Send {a} BC'],
    send: ['SEND BEINGCOIN', 'Member phone or name', 'Instant transfer to another member\u2019s wallet.', 'arrowUR', 'Send {a} BC'],
    request: ['REQUEST BEINGCOIN', 'Request from (phone or name)', 'Ask a member to send you coins — they approve from their wallet.', 'arrowUR', 'Request {a} BC'],
  };
  const L = labels[mode];

  return (
    <div>
      <div style={{ display: 'flex', gap: 4, background: 'var(--panel)', borderRadius: 999, padding: 4, border: '1px solid var(--line)', marginBottom: 18 }}>
        {tabs.map(([id, l]) => (
          <button key={id} className="tap" onClick={() => setMode(id)} style={{ flex: 1, cursor: 'pointer', fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 600, fontSize: 13, padding: '9px 0', borderRadius: 999, border: 'none', background: mode === id ? 'var(--gold)' : 'transparent', color: mode === id ? '#1a1407' : 'var(--muted)' }}>{l}</button>
        ))}
      </div>

      <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 26, color: 'var(--text)', marginBottom: 6 }}>{L[0]}</div>
      <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 12.5, color: 'var(--muted)', marginBottom: 16, lineHeight: 1.5 }}>{L[2]}</div>
      <Field label={L[1]} value={to || ''} placeholder={mode === 'gift' ? '+91 ·····' : 'e.g. Devika S. / +91 ·····'} />

      <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--dim)', margin: '4px 0 8px' }}>Amount</div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        {[100, 200, 500, 1000].map((a) => (
          <button key={a} className="tap" onClick={() => setAmt(a)} style={{ flex: 1, cursor: 'pointer', padding: '13px 0', borderRadius: 12, border: `1px solid ${amt === a ? 'var(--gold)' : 'var(--line)'}`, background: amt === a ? 'var(--gold-dim)' : 'var(--surface)', fontFamily: 'Space Mono, monospace', fontWeight: 700, fontSize: 14, color: amt === a ? 'var(--gold)' : 'var(--muted)' }}>{a}</button>
        ))}
      </div>
      {outgoing && (
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 2px 16px' }}>
          <span style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 12, color: 'var(--dim)' }}>Your balance</span>
          <BC amount={S.balance} size={12} color={afford ? 'var(--muted)' : 'var(--red)'} />
        </div>
      )}
      {!outgoing && <div style={{ height: 8 }} />}
      <Btn variant="primary" size="lg" full icon={L[3]} onClick={act}>{outgoing && !afford ? 'Top up first' : L[4].replace('{a}', fmt(amt))}</Btn>
    </div>
  );
}

Object.assign(window, { PoolScreen, BriefSheet, PostBriefSheet, GiftSheet });
