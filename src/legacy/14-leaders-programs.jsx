// BeingCamp — Leaders (leaderboard) & Programs (workshops)

function LeadersScreen({ S }) {
  const [board, setBoard] = React.useState('month');
  const list = S.leaders || LEADERS;
  const top3 = list.slice(0, 3);
  const podiumOrder = [top3[1], top3[0], top3[2]]; // 2nd, 1st, 3rd
  const heights = [70, 92, 56];
  return (
    <div style={{ animation: 'screenIn .3s ease' }}>
      <ScreenHead title="LEADERS" sub="Top of the Camp" onBack={S.back} />
      <div style={{ fontFamily: 'DM Serif Display, serif', fontStyle: 'italic', fontSize: 15, color: 'var(--muted)', marginBottom: 18, lineHeight: 1.5 }}>
        The members moving the most — by BeingCoin earned and work delivered.
      </div>

      <div style={{ display: 'flex', gap: 4, background: 'var(--panel)', borderRadius: 999, padding: 4, border: '1px solid var(--line)', marginBottom: 22 }}>
        {[['month', 'This month'], ['all', 'All-time']].map(([id, l]) => (
          <button key={id} className="tap" onClick={() => setBoard(id)} style={{ flex: 1, cursor: 'pointer', fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 600, fontSize: 13, padding: '9px 0', borderRadius: 999, border: 'none', background: board === id ? 'var(--gold)' : 'transparent', color: board === id ? '#1a1407' : 'var(--muted)' }}>{l}</button>
        ))}
      </div>

      {/* Podium */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 10, marginBottom: 26 }}>
        {podiumOrder.map((m, i) => {
          const place = i === 0 ? 2 : i === 1 ? 1 : 3;
          const mult = board === 'all' ? 3.2 : 1;
          return (
            <button key={m.rank} className="tap" onClick={() => !m.you && S.go('memberProfile', { name: m.name })} style={{ cursor: m.you ? 'default' : 'pointer', background: 'none', border: 'none', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div style={{ position: 'relative' }}>
                <div style={{ width: place === 1 ? 58 : 48, height: place === 1 ? 58 : 48, borderRadius: 16, background: m.you ? 'var(--gold-dim)' : 'linear-gradient(140deg,#2a2418,#161616)', border: `1px solid ${place === 1 ? 'var(--gold)' : 'var(--gold-line)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: place === 1 ? 24 : 20, color: 'var(--gold)' }}>{m.init}</span>
                </div>
                {place === 1 && <Icon name="trophy" size={20} color="var(--gold)" style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)' }} />}
              </div>
              <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 700, fontSize: 12.5, color: m.you ? 'var(--gold)' : 'var(--text)', whiteSpace: 'nowrap' }}>{m.name}</div>
              <div style={{ width: '100%', height: heights[i], background: place === 1 ? 'linear-gradient(180deg, var(--gold-dim), transparent)' : 'var(--surface)', border: '1px solid var(--line)', borderBottom: 'none', borderRadius: '12px 12px 0 0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', paddingTop: 10 }}>
                <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 26, color: place === 1 ? 'var(--gold)' : 'var(--muted)', lineHeight: 1 }}>{place}</span>
                <BC amount={Math.round(m.earned * mult)} size={11} coin={false} color="var(--text)" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Rest of the list */}
      <Card pad={6}>
        {list.slice(3).map((m, i, arr) => (
          <button key={m.rank} className="tap" onClick={() => !m.you && S.go('memberProfile', { name: m.name })} style={{ width: '100%', textAlign: 'left', cursor: m.you ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: 12, padding: '11px 12px', borderRadius: 10, background: m.you ? 'var(--gold-dim)' : 'transparent', border: m.you ? '1px solid var(--gold-line)' : '1px solid transparent', borderBottom: i < arr.length - 1 && !m.you ? '1px solid var(--line)' : undefined, margin: m.you ? '2px 0' : 0 }}>
            <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 20, color: 'var(--muted)', width: 24 }}>{m.rank}</span>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--panel)', border: '1px solid var(--line2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 13, color: m.you ? 'var(--gold)' : 'var(--muted)' }}>{m.init}</span></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: m.you ? 700 : 600, fontSize: 14, color: m.you ? 'var(--gold)' : 'var(--text)' }}>{m.name}</div>
              <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, color: 'var(--dim)' }}>{m.delivered} delivered</div>
            </div>
            <BC amount={board === 'all' ? Math.round(m.earned * 3.2) : m.earned} size={13} coin={false} />
          </button>
        ))}
      </Card>
      <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, color: 'var(--dim)', textAlign: 'center', marginTop: 12, lineHeight: 1.5 }}>Resets on the 1st · climb by earning and delivering work</div>
      <div style={{ height: 8 }} />
    </div>
  );
}

function ProgramsScreen({ S }) {
  const attending = S.attending || [];
  const list = S.programs || WORKSHOPS;
  return (
    <div style={{ animation: 'screenIn .3s ease' }}>
      <ScreenHead title="PROGRAMS" sub="Learn at the Camp" onBack={S.back} right={<WalletChip S={S} />} />
      <Card hl pad={16} onClick={() => S.openSheet('hostProgram')} style={{ display: 'flex', alignItems: 'center', gap: 13, marginBottom: 18 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--gold-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="spark" size={22} color="var(--gold)" /></div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 21, color: 'var(--text)', lineHeight: 1 }}>HOST A PROGRAM</div>
          <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>Book a zone, set a session — members attend and you earn</div>
        </div>
        <Icon name="arrowR" size={18} color="var(--gold)" />
      </Card>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {list.map((w) => {
          const isOn = attending.includes(w.id);
          const full = w.taken >= w.seats && !isOn;
          const left = w.seats - w.taken;
          return (
            <Card key={w.id} pad={0} onClick={() => S.openSheet('rsvp', { workshop: w })} style={{ overflow: 'hidden' }}>
              <div style={{ position: 'relative' }}>
                <Placeholder tone={w.tone} h={96} radius={0} icon={w.tag === 'Film' ? 'spark' : w.tag === 'Tech' ? 'pool' : 'briefcase'} />
                <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 6 }}>
                  <Badge tone="gold">{w.tag}</Badge>
                  {w.mine && <Badge tone="blue">You host</Badge>}
                  {isOn && <Badge tone="green">Going</Badge>}
                  {full && <Badge tone="red">Full</Badge>}
                </div>
                <div style={{ position: 'absolute', bottom: 10, right: 10 }}>{w.cost === 0 ? <Badge tone="green">Free</Badge> : <BC amount={w.cost} size={12} />}</div>
              </div>
              <div style={{ padding: 14 }}>
                <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 700, fontSize: 16, color: 'var(--text)', lineHeight: 1.25 }}>{w.title}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10, flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 12, color: 'var(--muted)' }}><Icon name="user" size={13} color="var(--dim)" />{w.host}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 12, color: 'var(--muted)' }}><Icon name="clock" size={13} color="var(--dim)" />{w.when}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'Space Mono, monospace', fontSize: 11, color: left <= 3 ? 'var(--red)' : 'var(--dim)', marginLeft: 'auto' }}>{isOn ? 'Reserved' : full ? 'No seats' : `${left} left`}</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      <div style={{ height: 8 }} />
    </div>
  );
}

function RsvpSheet({ S, workshop, onClose }) {
  const w = workshop;
  const attending = S.attending || [];
  const isOn = attending.includes(w.id);
  const full = w.taken >= w.seats && !isOn;
  const afford = S.balance >= w.cost;
  const [done, setDone] = React.useState(false);
  const reserve = () => {
    if (isOn) { S.cancelRsvp(w.id); onClose(); S.toast({ msg: 'Reservation cancelled', icon: 'back' }); return; }
    if (full) return;
    if (w.cost > 0 && !afford) { onClose(); S.go('buy'); S.toast({ msg: 'Top up to reserve a seat', icon: 'wallet' }); return; }
    if (w.cost > 0) S.spend(w.cost, `${w.title} · seat`, 'service');
    S.rsvp(w.id);
    setDone(true);
  };
  if (done) {
    return (
      <div style={{ textAlign: 'center', padding: '12px 0 8px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', animation: 'coinPop .5s ease' }}><Icon name="checkCircle" size={60} color="var(--green)" /></div>
        <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 32, color: 'var(--text)', marginTop: 14 }}>SEAT RESERVED</div>
        <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 13.5, color: 'var(--muted)', marginTop: 4, lineHeight: 1.5, padding: '0 8px' }}>{w.title} · {w.when} at {w.zone}. We'll remind you before it starts.</div>
        <div style={{ marginTop: 22 }}><Btn variant="primary" full size="lg" onClick={onClose}>Done</Btn></div>
      </div>
    );
  }
  return (
    <div>
      <Placeholder tone={w.tone} h={150} icon={w.tag === 'Film' ? 'spark' : w.tag === 'Tech' ? 'pool' : 'briefcase'} label={w.tag} />
      <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 30, color: 'var(--text)', lineHeight: 1.05, margin: '16px 0 6px' }}>{w.title}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 16 }}>
        <div style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--panel)', border: '1px solid var(--line2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Bebas Neue, sans-serif', fontSize: 13, color: 'var(--gold)' }}>{w.init}</div>
        <span style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 13, color: 'var(--text)' }}>Led by {w.host}</span>
      </div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        {[['When', w.when, 'clock'], ['Where', w.zone, 'pin'], ['Seats', `${w.seats - w.taken} left`, 'user']].map(([l, v, ic]) => (
          <div key={l} style={{ flex: 1, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12, padding: 12 }}>
            <Icon name={ic} size={14} color="var(--gold)" />
            <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 8.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--dim)', marginTop: 6 }}>{l}</div>
            <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 600, fontSize: 12.5, color: 'var(--text)', marginTop: 2 }}>{v}</div>
          </div>
        ))}
      </div>
      <Eyebrow style={{ marginBottom: 8 }}>About</Eyebrow>
      <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 18 }}>{w.desc}</div>
      <Btn variant={isOn ? 'danger' : 'primary'} size="lg" full icon={isOn ? 'back' : full ? 'lock' : 'check'} disabled={full} onClick={reserve}>
        {isOn ? 'Cancel reservation' : full ? 'Fully booked' : (w.cost === 0 ? 'Reserve a seat · free' : `Reserve · ${fmt(w.cost)} BC`)}
      </Btn>
    </div>
  );
}

function HostProgramSheet({ S, onClose }) {
  const rooms = ZONES.filter((z) => ['camp', 'room', 'stage', 'den', 'inner'].includes(z.id));
  const slots = ['Sat · 4:00 PM', 'Sun · 11:00 AM', 'Tue · 6:00 PM', 'Thu · 5:00 PM'];
  const tags = ['Branding', 'Film', 'Tech', 'Business', 'Onboarding'];
  const [step, setStep] = React.useState(0);
  const [tag, setTag] = React.useState('Branding');
  const [zone, setZone] = React.useState(rooms[1]);
  const [slot, setSlot] = React.useState(slots[0]);
  const [cost, setCost] = React.useState(0);
  const [seats, setSeats] = React.useState(12);
  const locked = S.rankIndex < zone.minRank;
  const afford = S.balance >= zone.cost;
  const tone = zone.id === 'room' ? '#1f2733' : zone.id === 'stage' ? '#2a2438' : '#332b16';
  const publish = () => {
    if (locked) return;
    if (!afford) { onClose(); S.go('buy'); S.toast({ msg: 'Top up to book the zone', icon: 'wallet' }); return; }
    if (zone.cost > 0) S.spend(zone.cost, `${zone.name} · hosting`, 'zone');
    S.addProgram({ title: 'Your new session', when: slot, zone: zone.name, cost, seats, tag, tone, desc: 'A member-led session you\u2019re hosting at the Camp.' });
    setStep(2);
  };
  if (step === 2) {
    return (
      <div style={{ textAlign: 'center', padding: '12px 0 8px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', animation: 'coinPop .5s ease' }}><Icon name="checkCircle" size={60} color="var(--green)" /></div>
        <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 32, color: 'var(--text)', marginTop: 14 }}>PROGRAM LIVE</div>
        <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 13.5, color: 'var(--muted)', marginTop: 4, lineHeight: 1.5, padding: '0 8px' }}>{zone.name} · {slot} is booked and your session is now open for members to reserve. You\u2019ll earn {cost === 0 ? 'reputation' : `${fmt(cost)} BC a seat`}.</div>
        <div style={{ marginTop: 22 }}><Btn variant="primary" full size="lg" onClick={onClose}>Done</Btn></div>
      </div>
    );
  }
  if (step === 1) {
    return (
      <div>
        <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 28, color: 'var(--text)', marginBottom: 6 }}>BOOK THE SPACE</div>
        <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 13, color: 'var(--muted)', marginBottom: 18, lineHeight: 1.5 }}>Reserve a zone to host in. Hosting fee is the zone\u2019s booking cost — you keep what attendees pay.</div>
        <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--dim)', marginBottom: 8 }}>Zone</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {rooms.map((z) => {
            const zl = S.rankIndex < z.minRank;
            return (
              <button key={z.id} className="tap" disabled={zl} onClick={() => setZone(z)} style={{ cursor: zl ? 'not-allowed' : 'pointer', opacity: zl ? 0.45 : 1, padding: '10px 13px', borderRadius: 12, border: `1px solid ${zone.id === z.id ? 'var(--gold)' : 'var(--line)'}`, background: zone.id === z.id ? 'var(--gold-dim)' : 'var(--surface)', textAlign: 'left' }}>
                <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 600, fontSize: 13, color: zone.id === z.id ? 'var(--gold)' : 'var(--text)' }}>{z.name}</div>
                <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: 'var(--dim)', marginTop: 2 }}>{zl ? `Needs ${RANK_PERKS[z.minRank].name}` : z.cost === 0 ? 'Free' : `${z.cost} BC`}</div>
              </button>
            );
          })}
        </div>
        <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--dim)', marginBottom: 8 }}>Slot</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {slots.map((s) => (
            <button key={s} className="tap" onClick={() => setSlot(s)} style={{ cursor: 'pointer', fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 600, fontSize: 12.5, padding: '9px 13px', borderRadius: 999, border: `1px solid ${slot === s ? 'var(--gold)' : 'var(--line)'}`, background: slot === s ? 'var(--gold-dim)' : 'var(--surface)', color: slot === s ? 'var(--gold)' : 'var(--muted)' }}>{s}</button>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0', borderTop: '1px solid var(--line)', marginBottom: 16 }}>
          <span style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 13, color: 'var(--muted)' }}>Booking fee · {zone.name}</span>
          {zone.cost === 0 ? <Badge tone="green">Free</Badge> : <BC amount={zone.cost} size={14} color="var(--gold)" />}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Btn variant="ghost" icon="back" onClick={() => setStep(0)}>Back</Btn>
          <Btn variant="primary" full icon={locked ? 'lock' : 'check'} disabled={locked} onClick={publish}>{locked ? 'Zone locked' : (zone.cost === 0 ? 'Publish program' : `Book & publish · ${fmt(zone.cost)} BC`)}</Btn>
        </div>
      </div>
    );
  }
  return (
    <div>
      <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 28, color: 'var(--text)', marginBottom: 6 }}>HOST A PROGRAM</div>
      <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 13, color: 'var(--muted)', marginBottom: 18, lineHeight: 1.5 }}>Share what you know — run a workshop or session for the community.</div>
      <Field label="Title" value="" placeholder="e.g. Brand Systems Masterclass" />
      <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--dim)', marginBottom: 8 }}>Topic</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 16 }}>
        {tags.map((c) => (
          <button key={c} className="tap" onClick={() => setTag(c)} style={{ cursor: 'pointer', fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 600, fontSize: 12.5, padding: '8px 13px', borderRadius: 999, border: `1px solid ${tag === c ? 'var(--gold)' : 'var(--line)'}`, background: tag === c ? 'var(--gold-dim)' : 'var(--surface)', color: tag === c ? 'var(--gold)' : 'var(--muted)' }}>{c}</button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--dim)', marginBottom: 8 }}>Seat price</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[0, 20, 50].map((c) => (
              <button key={c} className="tap" onClick={() => setCost(c)} style={{ flex: 1, cursor: 'pointer', padding: '10px 0', borderRadius: 10, border: `1px solid ${cost === c ? 'var(--gold)' : 'var(--line)'}`, background: cost === c ? 'var(--gold-dim)' : 'var(--surface)', fontFamily: 'Space Mono, monospace', fontWeight: 700, fontSize: 12, color: cost === c ? 'var(--gold)' : 'var(--muted)' }}>{c === 0 ? 'Free' : c}</button>
            ))}
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--dim)', marginBottom: 8 }}>Seats</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[8, 12, 20].map((c) => (
              <button key={c} className="tap" onClick={() => setSeats(c)} style={{ flex: 1, cursor: 'pointer', padding: '10px 0', borderRadius: 10, border: `1px solid ${seats === c ? 'var(--gold)' : 'var(--line)'}`, background: seats === c ? 'var(--gold-dim)' : 'var(--surface)', fontFamily: 'Space Mono, monospace', fontWeight: 700, fontSize: 12, color: seats === c ? 'var(--gold)' : 'var(--muted)' }}>{c}</button>
            ))}
          </div>
        </div>
      </div>
      <Btn variant="primary" size="lg" full icon="arrowR" onClick={() => setStep(1)}>Next · book a zone</Btn>
    </div>
  );
}

// ── CREATE — adaptive hub: post work, host, book space, services ────
function CreateSheet({ S, onClose }) {
  const active = (S.workspaces || []).filter((w) => w.stage < 4);
  const opts = [
    { ic: 'pool', tone: 'var(--gold)', title: 'Post work', desc: 'Fund escrow · we scope it · you confirm a team', go: () => S.openSheet('postWork') },
    { ic: 'spark', tone: 'var(--purple)', title: 'Host a program', desc: 'Run a workshop or session — book a zone, set seats', go: () => S.openSheet('hostProgram') },
    { ic: 'calendar', tone: 'var(--blue)', title: 'Book a space', desc: active.length ? 'Reserve a zone for a project session' : 'Check in or reserve a zone', go: () => active.length ? S.openSheet('bookZone', { workspaces: active }) : (onClose(), S.go('scan')) },
    { ic: 'briefcase', tone: 'var(--green)', title: 'Book a service', desc: 'Commission the agency — brand, film, build', go: () => { onClose(); S.go('services'); } },
  ];
  return (
    <div>
      <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 28, color: 'var(--text)', marginBottom: 4 }}>START SOMETHING</div>
      <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 13, color: 'var(--muted)', marginBottom: 18, lineHeight: 1.5 }}>Post work for a team, host a session, book a space, or commission the agency.</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
        {opts.map((o) => (
          <button key={o.title} className="tap" onClick={o.go} style={{ cursor: 'pointer', textAlign: 'left', width: '100%', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 16, padding: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 46, height: 46, borderRadius: 13, background: 'var(--panel)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={o.ic} size={23} color={o.tone} /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>{o.title}</div>
              <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 12.5, color: 'var(--muted)', marginTop: 2, lineHeight: 1.4 }}>{o.desc}</div>
            </div>
            <Icon name="arrowR" size={19} color="var(--dim)" />
          </button>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { LeadersScreen, ProgramsScreen, RsvpSheet, HostProgramSheet, CreateSheet });
