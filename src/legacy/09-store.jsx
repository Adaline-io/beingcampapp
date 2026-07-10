// BeingCamp — The Store & Services

function StoreScreen({ S }) {
  const [cat, setCat] = React.useState('All');
  const items = S.products.filter((p) => cat === 'All' || p.cat === cat);
  return (
    <div style={{ animation: 'screenIn .3s ease' }}>
      <ScreenHead title="THE STORE" sub="Priced in BeingCoin" onBack={S.back} right={<WalletChip S={S} />} />
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', margin: '0 -22px 18px', padding: '0 22px', scrollbarWidth: 'none' }}>
        {S.storeCats.map((c) => (
          <button key={c} className="tap" onClick={() => setCat(c)} style={{ flexShrink: 0, cursor: 'pointer', fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 600, fontSize: 12.5, padding: '8px 14px', borderRadius: 999, border: `1px solid ${cat === c ? 'var(--gold)' : 'var(--line)'}`, background: cat === c ? 'var(--gold)' : 'var(--surface)', color: cat === c ? '#1a1407' : 'var(--muted)' }}>{c}</button>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {items.map((p) => (
          <Card key={p.id} pad={0} onClick={() => S.openSheet('product', { product: p })} style={{ overflow: 'hidden' }}>
            <div style={{ position: 'relative' }}>
              <Placeholder tone={p.tone} h={130} radius={0} icon={p.type === 'pass' || p.type === 'ticket' ? 'qr' : 'bag'} />
              <div style={{ position: 'absolute', top: 8, left: 8 }}><Badge>{p.tag}</Badge></div>
              {p.stock > 0 && p.stock <= 5 && <div style={{ position: 'absolute', top: 8, right: 8 }}><Badge tone="red">{p.stock} left</Badge></div>}
            </div>
            <div style={{ padding: 12 }}>
              <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--dim)' }}>{p.source}</div>
              <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 700, fontSize: 14, color: 'var(--text)', margin: '3px 0 9px', lineHeight: 1.25 }}>{p.name}</div>
              <BC amount={p.bc} size={15} />
            </div>
          </Card>
        ))}
      </div>
      <div style={{ height: 8 }} />
    </div>
  );
}

function ProductSheet({ S, product, onClose }) {
  const [done, setDone] = React.useState(false);
  const afford = S.balance >= product.bc;
  const buy = () => {
    if (!afford) { onClose(); S.go('buy'); S.toast({ msg: 'Top up to complete this purchase', icon: 'wallet' }); return; }
    S.spend(product.bc, product.name, 'store');
    S.addOrder(product);
    setDone(true);
  };
  if (done) {
    return (
      <div style={{ textAlign: 'center', padding: '12px 0 8px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', animation: 'coinPop .5s ease' }}><Icon name="checkCircle" size={64} color="var(--green)" /></div>
        <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 32, color: 'var(--text)', marginTop: 16 }}>ORDER CONFIRMED</div>
        <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 13.5, color: 'var(--muted)', marginTop: 4, lineHeight: 1.5 }}>
          {product.type === 'physical' ? 'Ships in 3–5 days · track in Profile → Orders' : 'Fulfilled instantly · check your wallet'}
        </div>
        <div style={{ marginTop: 22 }}><Btn variant="primary" full size="lg" onClick={onClose}>Done</Btn></div>
      </div>
    );
  }
  return (
    <div>
      <Placeholder tone={product.tone} h={180} icon={product.type === 'pass' || product.type === 'ticket' ? 'qr' : 'bag'} label={product.source} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginTop: 16 }}>
        <div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}><Badge>{product.tag}</Badge><Badge tone="grey">{product.type}</Badge></div>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 30, color: 'var(--text)', lineHeight: 1 }}>{product.name}</div>
        </div>
        <BC amount={product.bc} size={20} />
      </div>
      <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.6, margin: '14px 0' }}>
        A limited piece from {product.source}, exchangeable only in BeingCoin. {product.stock > 0 ? `${product.stock} in stock.` : 'Always available.'} {product.type === 'physical' ? 'Delivered across India in 3–5 days.' : 'Digital — fulfilled the moment you confirm.'}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', marginBottom: 18 }}>
        <span style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 13, color: 'var(--muted)' }}>Your balance</span>
        <BC amount={S.balance} size={14} color={afford ? 'var(--text)' : 'var(--red)'} />
      </div>
      <Btn variant="primary" size="lg" full icon={afford ? 'bag' : 'wallet'} onClick={buy}>{afford ? `Buy · ${fmt(product.bc)} BC` : 'Top up to buy'}</Btn>
    </div>
  );
}

function ServicesScreen({ S }) {
  const perk = RANK_PERKS[S.rankIndex];
  const rankDiscount = S.rankIndex >= 2;
  return (
    <div style={{ animation: 'screenIn .3s ease' }}>
      <ScreenHead title="SERVICES" sub="Book the agency" onBack={S.back} right={<WalletChip S={S} />} />
      {rankDiscount && (
        <Card hl pad={14} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <Icon name="spark" size={22} color="var(--gold)" />
          <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 13, color: 'var(--text)' }}>
            <strong style={{ color: 'var(--gold)' }}>{perk.name} perk</strong> — {perk.discount} off all Adaline services
          </div>
        </Card>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {S.services.map((s) => (
          <Card key={s.id} pad={0} onClick={() => S.openSheet('booking', { service: s })} style={{ overflow: 'hidden', display: 'flex' }}>
            <Placeholder tone={s.tone} h={'auto'} radius={0} icon="briefcase" style={{ width: 92, minHeight: 104, flexShrink: 0 }} />
            <div style={{ padding: 14, flex: 1 }}>
              <Badge tone={s.div === 'Adaline' ? 'gold' : s.div === 'Motiontape' ? 'purple' : s.div === 'BreakIT' ? 'blue' : 'grey'}>{s.div}</Badge>
              <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 700, fontSize: 15, color: 'var(--text)', margin: '8px 0 8px', lineHeight: 1.25 }}>{s.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, color: 'var(--muted)' }}>Deposit</span>
                <BC amount={s.deposit} size={13} color="var(--gold)" />
                <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, color: 'var(--dim)', marginLeft: 'auto' }}>{s.timeline}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <div style={{ height: 8 }} />
    </div>
  );
}

function BookingSheet({ S, service, onClose }) {
  const [done, setDone] = React.useState(false);
  const afford = S.balance >= service.deposit;
  const book = () => {
    if (!afford) { onClose(); S.go('buy'); S.toast({ msg: 'Top up to pay the deposit', icon: 'wallet' }); return; }
    S.spend(service.deposit, `${service.name} · deposit`, 'service');
    setDone(true);
  };
  if (done) {
    return (
      <div style={{ textAlign: 'center', padding: '12px 0 8px' }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}><Icon name="checkCircle" size={64} color="var(--green)" /></div>
        <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 32, color: 'var(--text)', marginTop: 16 }}>BOOKING IN</div>
        <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 13.5, color: 'var(--muted)', marginTop: 4, lineHeight: 1.5, padding: '0 10px' }}>
          A Deal was created in Zoho CRM. Aslam (CSO) is assigned — expect a call within 48 hours to scope the project.
        </div>
        <div style={{ marginTop: 22 }}><Btn variant="primary" full size="lg" onClick={onClose}>Done</Btn></div>
      </div>
    );
  }
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
        <Badge tone={service.div === 'Adaline' ? 'gold' : service.div === 'Motiontape' ? 'purple' : service.div === 'BreakIT' ? 'blue' : 'grey'}>{service.div}</Badge>
        <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 24, color: 'var(--text)', lineHeight: 1 }}>{service.name}</div>
      </div>
      <Field label="Your name / company" value={S.user.name} />
      <Field label="One-line brief" value="" placeholder="e.g. Rebrand for our new café" />
      <Field label="Timeline preference" value={service.timeline} />
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0', borderTop: '1px solid var(--line)', marginTop: 8, marginBottom: 4 }}>
        <span style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 13.5, color: 'var(--muted)' }}>Discovery deposit</span>
        <BC amount={service.deposit} size={15} color="var(--gold)" />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18 }}>
        <span style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 12, color: 'var(--dim)' }}>Project starts from</span>
        <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 12, color: 'var(--muted)' }}>{fmt(service.from)} BC · quoted after scope</span>
      </div>
      <Btn variant="primary" size="lg" full icon={afford ? 'arrowR' : 'wallet'} onClick={book}>{afford ? `Pay deposit · ${fmt(service.deposit)} BC` : 'Top up to book'}</Btn>
    </div>
  );
}

function Field({ label, value, placeholder }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--dim)', marginBottom: 6 }}>{label}</div>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12, padding: '13px 14px', fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 14, color: value ? 'var(--text)' : 'var(--dim)' }}>{value || placeholder}</div>
    </div>
  );
}

Object.assign(window, { StoreScreen, ProductSheet, ServicesScreen, BookingSheet, Field });
