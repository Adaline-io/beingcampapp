// BeingCamp — Zones / QR check-in, tied to the work loop

function ScanScreen({ S }) {
  const active = (S.workspaces || []).filter((w) => w.stage < 4);
  const bookable = ZONES.filter((z) => z.id === 'room' || z.id === 'camp' || z.id === 'inner');
  return (
    <div style={{ animation: 'screenIn .3s ease' }}>
      <ScreenHead title="ZONES" sub="Scan to enter" onBack={S.back} right={<WalletChip S={S} />} />

      {/* Book a space for a project */}
      {active.length > 0 && (
        <Card hl pad={16} onClick={() => S.openSheet('bookZone', { workspaces: active })} style={{ display: 'flex', alignItems: 'center', gap: 13, marginBottom: 18 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--gold-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="calendar" size={22} color="var(--gold)" /></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 21, color: 'var(--text)', lineHeight: 1 }}>BOOK A SPACE FOR YOUR TEAM</div>
            <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>Reserve The Room or The Camp — it lands in your project schedule</div>
          </div>
          <Icon name="arrowR" size={18} color="var(--gold)" />
        </Card>
      )}

      {/* Scanner viewfinder */}
      <Card pad={0} style={{ overflow: 'hidden', position: 'relative' }}>
        <div style={{ height: 200, position: 'relative', background: 'radial-gradient(120% 100% at 50% 40%, #1b1b1b, #0c0c0c)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.02) 0 1px, transparent 1px 18px), repeating-linear-gradient(90deg, rgba(255,255,255,0.02) 0 1px, transparent 1px 18px)' }} />
          <div style={{ position: 'relative', width: 130, height: 130 }}>
            {[[0,0,'tl'],[1,0,'tr'],[0,1,'bl'],[1,1,'br']].map(([x, y, k]) => (
              <div key={k} style={{ position: 'absolute', width: 30, height: 30, [y ? 'bottom' : 'top']: 0, [x ? 'right' : 'left']: 0, borderTop: y ? 'none' : '3px solid var(--gold)', borderBottom: y ? '3px solid var(--gold)' : 'none', borderLeft: x ? 'none' : '3px solid var(--gold)', borderRight: x ? '3px solid var(--gold)' : 'none', borderRadius: `${!x&&!y?12:0}px ${x&&!y?12:0}px ${x&&y?12:0}px ${!x&&y?12:0}px` }} />
            ))}
            <Icon name="qr" size={56} color="rgba(201,168,76,0.5)" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
            <div style={{ position: 'absolute', left: 6, right: 6, height: 2, background: 'linear-gradient(90deg, transparent, var(--gold), transparent)', animation: 'scanLine 2.4s ease-in-out infinite', boxShadow: '0 0 10px var(--gold)' }} />
          </div>
        </div>
        <div style={{ padding: 16, textAlign: 'center', borderTop: '1px solid var(--line)' }}>
          <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>Point at a zone QR to check in</div>
          <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>Coins deduct automatically · or pick a zone below</div>
        </div>
      </Card>

      <Eyebrow line style={{ margin: '24px 0 14px' }}>The six zones</Eyebrow>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
        {ZONES.map((z) => {
          const locked = S.rankIndex < z.minRank;
          return (
            <button key={z.id} className="tap" onClick={() => S.openSheet('checkin', { zone: z })} style={{ cursor: 'pointer', textAlign: 'left', width: '100%', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 16, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 22, color: z.accent, width: 28, flexShrink: 0 }}>{z.n}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>{z.name}</span>
                  <Badge>{z.layer}</Badge>
                </div>
                <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{z.desc}</div>
              </div>
              {locked
                ? <Icon name="lock" size={18} color="var(--red)" />
                : (z.cost === 0 ? <Badge tone="green">Free</Badge> : <BC amount={z.cost} size={13} />)}
            </button>
          );
        })}
      </div>
      <div style={{ height: 8 }} />
    </div>
  );
}

function CheckinSheet({ S, zone, onClose }) {
  const locked = S.rankIndex < zone.minRank;
  const afford = S.balance >= zone.cost;
  const [done, setDone] = React.useState(false);
  const checkin = () => {
    if (locked) return;
    if (!afford) { onClose(); S.go('buy'); S.toast({ msg: 'Top up to check in', icon: 'wallet' }); return; }
    S.checkinZone(zone);
    setDone(true);
  };
  if (done) {
    return (
      <div style={{ textAlign: 'center', padding: '12px 0 8px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', animation: 'coinPop .5s ease' }}><Icon name="checkCircle" size={64} color="var(--green)" /></div>
        <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 34, color: 'var(--text)', marginTop: 16 }}>YOU'RE IN</div>
        <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 14, color: 'var(--muted)', marginTop: 4 }}>{zone.name} · checked in {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
        <div style={{ marginTop: 22 }}><Btn variant="primary" full size="lg" onClick={onClose}>Done</Btn></div>
      </div>
    );
  }
  return (
    <div>
      <Placeholder tone="#1c1c1c" h={130} icon="pin" label={`Zone ${zone.n}`} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '16px 0 6px' }}>
        <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 32, color: 'var(--text)', lineHeight: 1 }}>{zone.name}</span>
        <Badge>{zone.layer}</Badge>
      </div>
      <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.5, marginBottom: 16 }}>{zone.desc}</div>

      {/* checks */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
        <CheckRow ok={!locked} label="Rank requirement" value={locked ? `Needs ${RANK_PERKS[zone.minRank].name}` : 'Met'} />
        <CheckRow ok={afford} label="Coin balance" value={zone.cost === 0 ? 'Free entry' : (afford ? `${fmt(zone.cost)} BC` : 'Insufficient')} />
      </div>

      <Btn variant={locked ? 'ghost' : 'primary'} size="lg" full disabled={locked} icon={locked ? 'lock' : 'scan'} onClick={checkin}>
        {locked ? `Locked — reach ${RANK_PERKS[zone.minRank].name}` : (zone.cost === 0 ? 'Check in · free' : `Check in · ${fmt(zone.cost)} BC`)}
      </Btn>
    </div>
  );
}

function CheckRow({ ok, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12 }}>
      <div style={{ width: 22, height: 22, borderRadius: '50%', background: ok ? 'rgba(76,201,122,0.14)' : 'rgba(210,86,79,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={ok ? 'check' : 'lock'} size={13} color={ok ? 'var(--green)' : 'var(--red)'} stroke={2.6} />
      </div>
      <span style={{ flex: 1, fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 13, color: 'var(--text)' }}>{label}</span>
      <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 11.5, color: ok ? 'var(--muted)' : 'var(--red)' }}>{value}</span>
    </div>
  );
}

// ── Book a zone for a project session ───────────────────────────────
function BookZoneSheet({ S, workspaces, onClose }) {
  const rooms = ZONES.filter((z) => ['camp', 'room', 'inner'].includes(z.id));
  const slots = ['Today · 4:00 PM', 'Tomorrow · 11:00 AM', 'Tomorrow · 3:00 PM', 'Fri · 10:00 AM'];
  const [proj, setProj] = React.useState(workspaces[0]);
  const [zone, setZone] = React.useState(rooms[1]);
  const [slot, setSlot] = React.useState(slots[0]);
  const [done, setDone] = React.useState(false);
  const locked = S.rankIndex < zone.minRank;
  const afford = S.balance >= zone.cost;
  const book = () => {
    if (locked) return;
    if (!afford) { onClose(); S.go('buy'); S.toast({ msg: 'Top up to book the space', icon: 'wallet' }); return; }
    if (zone.cost > 0) S.spend(zone.cost, `${zone.name} · ${proj.title}`, 'zone');
    if (S.addSchedule) S.addSchedule(proj.id, { title: `${zone.name} session`, when: slot, where: zone.name });
    setDone(true);
  };
  if (done) {
    return (
      <div style={{ textAlign: 'center', padding: '12px 0 8px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', animation: 'coinPop .5s ease' }}><Icon name="checkCircle" size={60} color="var(--green)" /></div>
        <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 32, color: 'var(--text)', marginTop: 14 }}>SPACE BOOKED</div>
        <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 13.5, color: 'var(--muted)', marginTop: 4, lineHeight: 1.5, padding: '0 8px' }}>{zone.name} · {slot}. Added to <strong style={{ color: 'var(--text)' }}>{proj.title}</strong>'s schedule and the team's notified.</div>
        <div style={{ marginTop: 22, display: 'flex', gap: 10 }}>
          <Btn variant="ghost" full onClick={onClose}>Done</Btn>
          <Btn variant="primary" full icon="arrowR" onClick={() => { onClose(); S.go('workspace', { id: proj.id }); }}>Open project</Btn>
        </div>
      </div>
    );
  }
  return (
    <div>
      <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 28, color: 'var(--text)', marginBottom: 6 }}>BOOK A SPACE</div>
      <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 13, color: 'var(--muted)', marginBottom: 18, lineHeight: 1.5 }}>Reserve a working space for a project session. It's added to the workspace schedule.</div>

      <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--dim)', marginBottom: 8 }}>For project</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
        {workspaces.map((w) => (
          <button key={w.id} className="tap" onClick={() => setProj(w)} style={{ cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 11, padding: 12, borderRadius: 12, border: `1px solid ${proj.id === w.id ? 'var(--gold)' : 'var(--line)'}`, background: proj.id === w.id ? 'var(--gold-dim)' : 'var(--surface)' }}>
            <Icon name="briefcase" size={17} color="var(--gold)" />
            <span style={{ flex: 1, fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 600, fontSize: 13.5, color: 'var(--text)' }}>{w.title}</span>
            <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${proj.id === w.id ? 'var(--gold)' : 'var(--line2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{proj.id === w.id && <div style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--gold)' }} />}</div>
          </button>
        ))}
      </div>

      <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--dim)', marginBottom: 8 }}>Space</div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {rooms.map((z) => {
          const zl = S.rankIndex < z.minRank;
          return (
            <button key={z.id} className="tap" disabled={zl} onClick={() => setZone(z)} style={{ flex: 1, cursor: zl ? 'not-allowed' : 'pointer', opacity: zl ? 0.45 : 1, padding: '12px 6px', borderRadius: 12, border: `1px solid ${zone.id === z.id ? 'var(--gold)' : 'var(--line)'}`, background: zone.id === z.id ? 'var(--gold-dim)' : 'var(--surface)', textAlign: 'center' }}>
              <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 17, color: zone.id === z.id ? 'var(--gold)' : 'var(--text)', lineHeight: 1 }}>{z.name.replace('The ', '')}</div>
              <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: 'var(--dim)', marginTop: 4 }}>{zl ? 'Locked' : z.cost === 0 ? 'Free' : `${z.cost} BC`}</div>
            </button>
          );
        })}
      </div>

      <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--dim)', marginBottom: 8 }}>Slot</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
        {slots.map((s) => (
          <button key={s} className="tap" onClick={() => setSlot(s)} style={{ cursor: 'pointer', fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 600, fontSize: 12.5, padding: '9px 13px', borderRadius: 999, border: `1px solid ${slot === s ? 'var(--gold)' : 'var(--line)'}`, background: slot === s ? 'var(--gold-dim)' : 'var(--surface)', color: slot === s ? 'var(--gold)' : 'var(--muted)' }}>{s}</button>
        ))}
      </div>

      <Btn variant="primary" size="lg" full icon={locked ? 'lock' : 'calendar'} disabled={locked} onClick={book}>{locked ? `${zone.name} needs ${RANK_PERKS[zone.minRank].name}` : (zone.cost === 0 ? 'Book · free' : `Book · ${fmt(zone.cost)} BC`)}</Btn>
    </div>
  );
}

Object.assign(window, { ScanScreen, CheckinSheet, BookZoneSheet, CheckRow });
