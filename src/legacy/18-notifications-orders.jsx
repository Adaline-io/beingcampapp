// BeingCamp — Notifications, Referrals, Orders & tracking

const NOTIFS = [
  { id: 'n1', group: 'Today', ic: 'pool', tone: 'green', title: 'You were matched!', body: 'Brew Theory confirmed you as Lead Designer on “Launch Posters”. Workspace is open.', when: '9:12', unread: true, cta: 'projects' },
  { id: 'n2', group: 'Today', ic: 'check', tone: 'gold', title: 'Milestone released', body: 'Concept directions approved — 300 BC released from escrow to your wallet.', when: '10:40', unread: true, cta: 'wallet' },
  { id: 'n3', group: 'Today', ic: 'spark', tone: 'purple', title: 'Your project was scoped', body: 'Authority shortlisted 3 makers for “My Café Rebrand”. Confirm your team.', when: '11:30', unread: true, cta: 'projects' },
  { id: 'n4', group: 'Earlier', ic: 'bag', tone: 'blue', title: 'Order shipped', body: 'Camp Heavyweight Tee is on its way. Tap to track.', when: 'Yesterday', unread: false, cta: 'orders' },
  { id: 'n5', group: 'Earlier', ic: 'trophy', tone: 'gold', title: 'Almost Builder rank', body: 'You’re 240 BC of usage away. Keep moving coins.', when: '2d', unread: false },
  { id: 'n6', group: 'Earlier', ic: 'gift', tone: 'purple', title: 'Hisham sent you a gift', body: '+200 BC landed in your wallet.', when: '3d', unread: false, cta: 'wallet' },
];

function NotificationsScreen({ S }) {
  const groups = ['Today', 'Earlier'];
  const list = S.notifs || NOTIFS;
  const open = (n) => { S.markRead(n.id); if (n.cta) { ['wallet', 'orders'].includes(n.cta) ? S.go(n.cta) : S.setTab(n.cta); } };
  const anyUnread = list.some((n) => n.unread);
  return (
    <div style={{ animation: 'screenIn .3s ease' }}>
      <ScreenHead title="NOTIFICATIONS" sub="Your activity" onBack={S.back} right={
        <button className="tap" onClick={() => anyUnread && S.markAllRead()} style={{ cursor: anyUnread ? 'pointer' : 'default', opacity: anyUnread ? 1 : 0.4, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 11, padding: '9px 12px', fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 600, fontSize: 12, color: 'var(--muted)' }}>Mark read</button>
      } />
      {groups.map((g) => {
        const items = list.filter((n) => n.group === g);
        if (items.length === 0) return null;
        return (
        <div key={g} style={{ marginBottom: 22 }}>
          <Eyebrow line style={{ marginBottom: 12 }}>{g}</Eyebrow>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {items.map((n) => (
              <button key={n.id} className="tap" onClick={() => open(n)} style={{ cursor: n.cta ? 'pointer' : 'default', textAlign: 'left', width: '100%', background: n.unread ? 'linear-gradient(110deg, rgba(201,168,76,0.07), var(--surface))' : 'var(--surface)', border: `1px solid ${n.unread ? 'var(--gold-line)' : 'var(--line)'}`, borderRadius: 16, padding: 15, display: 'flex', gap: 13 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--panel)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={n.ic} size={20} color={`var(--${n.tone})`} /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: n.unread ? 700 : 600, fontSize: 14, color: n.unread ? 'var(--text)' : 'var(--muted)' }}>{n.title}</span>
                    {n.unread && <span style={{ width: 7, height: 7, borderRadius: 999, background: 'var(--gold)', flexShrink: 0 }} />}
                  </div>
                  <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.45, marginTop: 3 }}>{n.body}</div>
                  <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, color: 'var(--dim)', marginTop: 6 }}>{n.when}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
        );
      })}
      <div style={{ height: 8 }} />
    </div>
  );
}

// ── REFERRALS ───────────────────────────────────────────────────────
const REFERRED = [
  { name: 'Nikhil R.', status: 'Joined', bc: 0, note: 'Yet to buy a pack' },
  { name: 'Maria J.', status: 'Earned', bc: 300, note: 'Bought Starter Pack' },
  { name: 'Sami K.', status: 'Earned', bc: 300, note: 'Bought Builder Pack' },
];

function ReferralsScreen({ S }) {
  const code = 'AMAN-CAMP';
  const earned = REFERRED.reduce((s, r) => s + r.bc, 0);
  return (
    <div style={{ animation: 'screenIn .3s ease' }}>
      <ScreenHead title="INVITE & EARN" sub="Referrals" onBack={S.back} />
      <Card hl pad={22} style={{ position: 'relative', overflow: 'hidden', textAlign: 'center' }}>
        <div style={{ position: 'absolute', top: -40, left: '50%', transform: 'translateX(-50%)', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.16), transparent 70%)' }} />
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}><Icon name="gift" size={36} color="var(--gold)" /></div>
          <div style={{ fontFamily: 'DM Serif Display, serif', fontStyle: 'italic', fontSize: 18, color: 'var(--text)', lineHeight: 1.4, marginBottom: 4 }}>Give 100, get 300.</div>
          <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 13, color: 'var(--muted)', lineHeight: 1.5, maxWidth: 280, margin: '0 auto' }}>They get 100 BC on their first pack. You get 300 BC when they do.</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 20, padding: '14px 16px', background: 'var(--panel)', border: '1px dashed var(--gold-line)', borderRadius: 14 }}>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--dim)' }}>Your code</div>
              <div style={{ fontFamily: 'Space Mono, monospace', fontWeight: 700, fontSize: 20, color: 'var(--gold)', letterSpacing: '0.04em' }}>{code}</div>
            </div>
            <button className="tap" onClick={() => S.toast({ msg: 'Code copied', icon: 'check' })} style={{ cursor: 'pointer', width: 42, height: 42, borderRadius: 11, background: 'var(--surface)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="share" size={18} color="var(--text)" /></button>
          </div>
          <Btn variant="primary" size="lg" full icon="share" style={{ marginTop: 12 }} onClick={() => S.toast({ msg: 'Share sheet opened', icon: 'share' })}>Share invite</Btn>
        </div>
      </Card>

      <div style={{ display: 'flex', gap: 11, marginTop: 16 }}>
        {[['Invited', REFERRED.length], ['Earned', `${earned} BC`]].map(([l, v]) => (
          <Card key={l} pad={16} style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 30, color: 'var(--gold)', lineHeight: 1 }}>{v}</div>
            <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--dim)', marginTop: 5 }}>{l}</div>
          </Card>
        ))}
      </div>

      <Eyebrow line style={{ margin: '24px 0 12px' }}>Your invites</Eyebrow>
      <Card pad={6}>
        {REFERRED.map((r, i) => (
          <div key={r.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 12px', borderBottom: i < REFERRED.length - 1 ? '1px solid var(--line)' : 'none' }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: 'var(--panel)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 15, color: 'var(--muted)' }}>{r.name.split(' ').map(w=>w[0]).join('')}</span></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 600, fontSize: 13.5, color: 'var(--text)' }}>{r.name}</div>
              <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 11.5, color: 'var(--muted)' }}>{r.note}</div>
            </div>
            {r.bc > 0 ? <BC amount={r.bc} sign size={13} color="var(--green)" /> : <Badge>Pending</Badge>}
          </div>
        ))}
      </Card>
      <div style={{ height: 8 }} />
    </div>
  );
}

// ── ORDERS & TRACKING ───────────────────────────────────────────────
const MY_ORDERS = [
  { id: '#BC-2041', item: 'B2G Field Jacket', source: 'Back2Ground', bc: 1200, tone: '#3a3024', type: 'physical', stage: 2, when: 'Today', eta: 'Arrives Thu' },
  { id: '#BC-2031', item: 'Camp Heavyweight Tee', source: 'BeingCamp', bc: 180, tone: '#242424', type: 'physical', stage: 3, when: '3d ago', eta: 'Delivered' },
  { id: '#BC-2018', item: 'Camp Day Pass', source: 'BeingCamp', bc: 30, tone: '#332b16', type: 'pass', stage: 4, when: '1w ago', eta: 'Used' },
];
const ORDER_STAGES = ['Confirmed', 'Packed', 'Shipped', 'Delivered'];

function OrdersScreen({ S }) {
  const orders = S.orders || MY_ORDERS;
  return (
    <div style={{ animation: 'screenIn .3s ease' }}>
      <ScreenHead title="ORDERS" sub="Store & passes" onBack={S.back} />
      {orders.length === 0 ? (
        <EmptyState icon="bag" title="No orders yet" body="Everything in the Store is priced in BeingCoin — drops, merch, passes. Your purchases and tracking show up here." cta="Open the Store" onCta={() => { S.back(); S.go('store'); }} />
      ) : (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {orders.map((o) => (
          <Card key={o.id} pad={0} onClick={() => S.go('orderDetail', { order: o })} style={{ overflow: 'hidden', display: 'flex' }}>
            <Placeholder tone={o.tone} h={'auto'} radius={0} icon={o.type === 'pass' ? 'qr' : 'bag'} style={{ width: 84, minHeight: 96, flexShrink: 0 }} />
            <div style={{ padding: 14, flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 10.5, color: 'var(--gold)' }}>{o.id}</span>
                <Badge tone={o.stage >= 3 ? 'green' : 'gold'}>{o.type === 'pass' ? (o.stage >= 4 ? 'Used' : 'Active') : ORDER_STAGES[o.stage] || 'Delivered'}</Badge>
              </div>
              <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 700, fontSize: 14.5, color: 'var(--text)' }}>{o.item}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                <span style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 11.5, color: 'var(--muted)' }}>{o.eta}</span>
                <BC amount={o.bc} size={12} />
              </div>
            </div>
          </Card>
        ))}
      </div>
      )}
      <div style={{ height: 8 }} />
    </div>
  );
}

function OrderDetailScreen({ S }) {
  const o = S.topPayload.order;
  const isPass = o.type === 'pass';
  return (
    <div style={{ animation: 'screenIn .3s ease' }}>
      <ScreenHead title="TRACK ORDER" sub={o.id} onBack={S.back} />
      <Card pad={0} style={{ overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: 14, padding: 16 }}>
          <Placeholder tone={o.tone} h={72} icon={isPass ? 'qr' : 'bag'} style={{ width: 72, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--dim)' }}>{o.source}</div>
            <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 700, fontSize: 16, color: 'var(--text)', margin: '3px 0 8px' }}>{o.item}</div>
            <BC amount={o.bc} size={14} />
          </div>
        </div>
      </Card>

      {isPass ? (
        <Card pad={22} style={{ marginTop: 14, textAlign: 'center' }}>
          <Eyebrow style={{ justifyContent: 'center', marginBottom: 16 }}>Show at the gate</Eyebrow>
          <div style={{ width: 168, height: 168, margin: '0 auto', borderRadius: 18, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
            <Icon name="qr" size={130} color="#0b0b0c" stroke={1.4} />
          </div>
          <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 12, color: 'var(--muted)', marginTop: 14, letterSpacing: '0.1em' }}>{o.id} · {o.stage >= 4 ? 'USED' : 'VALID TODAY'}</div>
        </Card>
      ) : (
        <Card pad={20} style={{ marginTop: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <Eyebrow>Delivery status</Eyebrow>
            <span style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 12.5, fontWeight: 600, color: 'var(--gold)' }}>{o.eta}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {ORDER_STAGES.map((st, i) => {
              const done = i <= o.stage;
              const current = i === o.stage;
              const labels = ['Order confirmed · paid in BC', 'Packed at the BeingCamp store', 'Out for delivery', 'Delivered to your address'];
              return (
                <div key={st} style={{ display: 'flex', gap: 14 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: 26, height: 26, borderRadius: '50%', background: done ? 'var(--gold)' : 'var(--panel)', border: `2px solid ${done ? 'var(--gold)' : 'var(--line2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: current ? '0 0 0 4px var(--gold-dim)' : 'none' }}>
                      {done && <Icon name="check" size={14} color="#1a1407" stroke={3} />}
                    </div>
                    {i < ORDER_STAGES.length - 1 && <div style={{ width: 2, flex: 1, minHeight: 28, background: i < o.stage ? 'var(--gold)' : 'var(--line)' }} />}
                  </div>
                  <div style={{ paddingBottom: 18 }}>
                    <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 700, fontSize: 14, color: done ? 'var(--text)' : 'var(--dim)' }}>{st}</div>
                    <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 11.5, color: 'var(--muted)', marginTop: 1 }}>{labels[i]}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <Card pad={16} style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
        <Icon name="phone" size={20} color="var(--muted)" />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>Need help with this order?</div>
          <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 11.5, color: 'var(--muted)' }}>Camp support replies within an hour</div>
        </div>
        <Btn variant="ghost" size="sm" onClick={() => S.toast({ msg: 'Support chat opened', icon: 'phone' })}>Contact</Btn>
      </Card>
      <div style={{ height: 8 }} />
    </div>
  );
}

Object.assign(window, { NotificationsScreen, ReferralsScreen, OrdersScreen, OrderDetailScreen, MY_ORDERS, ORDER_STAGES, NOTIFS });
