// BeingCamp — Wallet & Buy Coins

function txIcon(ref) {
  return { ritual: 'flame', zone: 'pin', pool: 'pool', store: 'bag', pack: 'plus', service: 'briefcase', gift: 'gift', admin: 'spark' }[ref] || 'wallet';
}

function WalletScreen({ S }) {
  return (
    <div style={{ animation: 'screenIn .3s ease' }}>
      <ScreenHead title="WALLET" sub="BeingCoin" onBack={S.back} />

      <Card hl pad={20} style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -50, right: -30, width: 170, height: 170, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.14), transparent 70%)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, position: 'relative' }}>
          <CoinMark size={46} glow />
          <div>
            <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 58, lineHeight: 0.82, color: 'var(--text)' }}>{fmt(S.balance)}</span>
            <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, letterSpacing: '0.16em', color: 'var(--gold)', marginTop: 4 }}>BEINGCOIN · BC</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 18, position: 'relative' }}>
          {[['Activity BC', S.activityCoins.toLocaleString('en-IN')], ['Loyalty', S.loyalty], ['Status', 'Active']].map(([l, v]) => (
            <div key={l} style={{ flex: 1, background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 12, padding: '10px 12px' }}>
              <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--dim)' }}>{l}</div>
              <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 700, fontSize: 14, color: 'var(--text)', marginTop: 3 }}>{v}</div>
            </div>
          ))}
        </div>
      </Card>

      <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
        <Btn variant="primary" full icon="plus" onClick={() => S.go('buy')}>Buy coins</Btn>
        <Btn variant="ghost" full icon="gift" onClick={() => S.openSheet('gift')}>Send · Gift</Btn>
      </div>

      <button className="tap" onClick={() => S.go('coinInfo')} style={{ cursor: 'pointer', width: '100%', marginTop: 12, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 13, padding: '13px 15px', display: 'flex', alignItems: 'center', gap: 11 }}>
        <Icon name="lock" size={18} color="var(--gold)" />
        <span style={{ flex: 1, textAlign: 'left', fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>How BeingCoin works</span>
        <Icon name="chevR" size={16} color="var(--dim)" />
      </button>

      <Eyebrow line style={{ margin: '26px 0 14px' }}>Ways to earn</Eyebrow>
      <div style={{ display: 'flex', gap: 11, overflowX: 'auto', margin: '0 -22px', padding: '0 22px 4px', scrollbarWidth: 'none' }}>
        {[
          { name: 'Join a team', desc: 'Apply to open work in the Pool', ic: 'pool', tag: 'Anytime' },
          { name: 'Complete milestones', desc: 'Escrow releases as you deliver', ic: 'check', tag: 'Per project' },
          { name: 'Post & deliver', desc: 'Run a project, build your rank', ic: 'briefcase', tag: 'Anytime' },
          { name: 'Refer a member', desc: 'Referee buys their first pack', ic: 'gift', tag: '+300 BC' },
          { name: 'Publish a case study', desc: 'Feature work on the Showcase', ic: 'spark', tag: 'Reputation' },
        ].map((e) => (
          <div key={e.name} style={{ flexShrink: 0, width: 160 }}>
            <Card pad={14} style={{ height: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--gold-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={e.ic} size={18} color="var(--gold)" /></div>
              </div>
              <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 700, fontSize: 13.5, color: 'var(--text)' }}>{e.name}</div>
              <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 11, color: 'var(--muted)', marginTop: 2, lineHeight: 1.4 }}>{e.desc}</div>
              <div style={{ marginTop: 8 }}><Badge>{e.tag}</Badge></div>
            </Card>
          </div>
        ))}
      </div>

      <Eyebrow line style={{ margin: '26px 0 12px' }}>Transactions</Eyebrow>
      <Card pad={4}>
        {S.txns.map((t, i) => (
          <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 12px', borderBottom: i < S.txns.length - 1 ? '1px solid var(--line)' : 'none' }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: 'var(--panel)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon name={txIcon(t.ref)} size={18} color={t.amount >= 0 ? 'var(--green)' : 'var(--muted)'} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 600, fontSize: 13.5, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.label}</div>
              <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, color: 'var(--dim)', marginTop: 2 }}>{t.when}</div>
            </div>
            <BC amount={t.amount} sign size={14} color={t.amount >= 0 ? 'var(--green)' : 'var(--text)'} coin={false} />
          </div>
        ))}
      </Card>
      <div style={{ height: 8 }} />
    </div>
  );
}

function BuyScreen({ S }) {
  const packs = S.packs;
  const [sel, setSel] = React.useState(null);
  const pack = packs.find((p) => p.id === sel) || packs.find((p) => p.popular) || packs[0];
  return (
    <div style={{ animation: 'screenIn .3s ease' }}>
      <ScreenHead title="BUY COINS" sub="Cash → BeingCoin" onBack={S.back} />
      <div style={{ fontFamily: 'DM Serif Display, serif', fontStyle: 'italic', fontSize: 15, color: 'var(--muted)', marginBottom: 20, lineHeight: 1.5 }}>
        Cash enters the ecosystem once. Coins never convert back — they only move within the Camp.
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {packs.map((p) => {
          const active = pack && pack.id === p.id;
          return (
            <button key={p.id} className="tap" onClick={() => setSel(p.id)} style={{ cursor: 'pointer', textAlign: 'left', background: active ? 'linear-gradient(150deg, rgba(201,168,76,0.12), var(--surface))' : 'var(--surface)', border: `1px solid ${active ? 'var(--gold)' : 'var(--line)'}`, borderRadius: 18, padding: 18, position: 'relative' }}>
              {p.popular && <div style={{ position: 'absolute', top: -9, right: 16 }}><Badge tone="gold" solid>Most popular</Badge></div>}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <CoinMark size={36} glow={active} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 30, color: 'var(--text)', lineHeight: 1 }}>{fmt(p.coins + p.bonus)}</span>
                    <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 12, color: 'var(--gold)' }}>BC</span>
                    {p.bonus > 0 && <Badge tone="green">+{p.bonus} bonus</Badge>}
                  </div>
                  <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>{p.name} · {p.rate}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'Space Mono, monospace', fontWeight: 700, fontSize: 18, color: 'var(--text)' }}>₹{p.inr.toLocaleString('en-IN')}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      <div style={{ marginTop: 20, padding: '14px 16px', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
        <Icon name="lock" size={18} color="var(--muted)" />
        <span style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 12, color: 'var(--muted)', lineHeight: 1.4 }}>Secured by Razorpay · INR only · non-refundable</span>
      </div>
      <div style={{ marginTop: 16 }}>
        <Btn variant="primary" size="lg" full icon="arrowR" onClick={() => S.openSheet('pay', { pack })}>Pay ₹{pack.inr.toLocaleString('en-IN')} · get {fmt(pack.coins + pack.bonus)} BC</Btn>
      </div>
      <div style={{ height: 8 }} />
    </div>
  );
}

// ── Payment sheet (Razorpay sim) ────────────────────────────────────
function PaySheet({ S, pack, onClose }) {
  const [phase, setPhase] = React.useState('confirm'); // confirm | processing | done
  const total = pack.coins + pack.bonus;
  React.useEffect(() => {
    if (phase === 'processing') {
      const t = setTimeout(() => { S.buyPack(pack); setPhase('done'); }, 1500);
      return () => clearTimeout(t);
    }
  }, [phase]);
  if (phase === 'done') {
    return (
      <div style={{ textAlign: 'center', padding: '12px 0 8px' }}>
        <div style={{ animation: 'coinPop .6s cubic-bezier(.2,1.3,.4,1)', display: 'flex', justifyContent: 'center' }}><CoinMark size={72} glow /></div>
        <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 44, color: 'var(--gold)', marginTop: 16 }}>+{fmt(total)} BC</div>
        <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 14, color: 'var(--text)', marginTop: 2 }}>Credited to your wallet</div>
        <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 12, color: 'var(--muted)', marginTop: 14 }}>New balance · {fmt(S.balance)} BC</div>
        <div style={{ marginTop: 22 }}><Btn variant="primary" full size="lg" onClick={onClose}>Done</Btn></div>
      </div>
    );
  }
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '4px 0 18px' }}>
        <CoinMark size={42} glow />
        <div>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 28, color: 'var(--text)', lineHeight: 1 }}>{pack.name}</div>
          <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 13, color: 'var(--muted)', marginTop: 3 }}>{fmt(total)} BC{pack.bonus ? ` · incl. ${pack.bonus} bonus` : ''}</div>
        </div>
      </div>
      {[['Coins', `${fmt(pack.coins)} BC`], ...(pack.bonus ? [['Bonus', `+${pack.bonus} BC`]] : []), ['Rate', pack.rate], ['Total', `₹${pack.inr.toLocaleString('en-IN')}`]].map(([l, v], i, a) => (
        <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: i < a.length - 1 ? '1px solid var(--line)' : 'none' }}>
          <span style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 13.5, color: 'var(--muted)' }}>{l}</span>
          <span style={{ fontFamily: 'Space Mono, monospace', fontWeight: 700, fontSize: 13.5, color: l === 'Total' ? 'var(--gold)' : 'var(--text)' }}>{v}</span>
        </div>
      ))}
      <div style={{ marginTop: 20 }}>
        <Btn variant="primary" size="lg" full disabled={phase === 'processing'} onClick={() => setPhase('processing')}>
          {phase === 'processing' ? 'Processing…' : `Pay ₹${pack.inr.toLocaleString('en-IN')} with Razorpay`}
        </Btn>
      </div>
    </div>
  );
}

function CoinInfoScreen({ S }) {
  const steps = [
    { ic: 'plus', tone: 'gold', t: 'Money comes in once', d: 'Buy BeingCoin with cash, one time. That\u2019s the only door in — it funds your whole experience.' },
    { ic: 'swap', tone: 'blue', t: 'It only moves inside', d: 'Spend it on work, the Store, services and zones. Earn it back by doing work. It circulates — it never leaves.' },
    { ic: 'lock', tone: 'purple', t: 'Escrow keeps it fair', d: 'Posted work is funded up front and locked. Coin releases to the team only as you approve milestones.' },
    { ic: 'trophy', tone: 'green', t: 'Usage builds your rank', d: 'The more you move, the higher you climb — earn more when you work, save more when you hire.' },
  ];
  return (
    <div style={{ animation: 'screenIn .3s ease' }}>
      <ScreenHead title="HOW IT WORKS" sub="BeingCoin" onBack={S.back} />
      <Card hl pad={22} style={{ textAlign: 'center', position: 'relative', overflow: 'hidden', marginBottom: 20 }}>
        <div style={{ position: 'absolute', top: -40, left: '50%', transform: 'translateX(-50%)', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.16), transparent 70%)' }} />
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}><CoinMark size={56} glow /></div>
          <div style={{ fontFamily: 'DM Serif Display, serif', fontStyle: 'italic', fontSize: 19, color: 'var(--text)', lineHeight: 1.45 }}>A closed-loop currency for one community.</div>
          <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 13, color: 'var(--muted)', lineHeight: 1.55, marginTop: 8 }}>BeingCoin is a utility token — not a cryptocurrency, and not cashable-out. Its value is the trust it carries inside the Camp.</div>
        </div>
      </Card>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
        {steps.map((s, i) => (
          <Card key={s.t} pad={16} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: 'var(--panel)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative' }}>
              <Icon name={s.ic} size={20} color={`var(--${s.tone})`} />
              <span style={{ position: 'absolute', top: -7, left: -7, width: 20, height: 20, borderRadius: '50%', background: 'var(--bg)', border: '1px solid var(--line2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Space Mono, monospace', fontSize: 10, fontWeight: 700, color: 'var(--muted)' }}>{i + 1}</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>{s.t}</div>
              <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.5, marginTop: 3 }}>{s.d}</div>
            </div>
          </Card>
        ))}
      </div>

      <Card pad={16} style={{ marginBottom: 14 }}>
        <Eyebrow style={{ marginBottom: 12 }}>The rate</Eyebrow>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, padding: '4px 0' }}>
          <div style={{ textAlign: 'center' }}><div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 28, color: 'var(--text)', lineHeight: 1 }}>₹8</div><div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: 'var(--dim)', marginTop: 3 }}>AVG / BC</div></div>
          <Icon name="arrowR" size={18} color="var(--gold)" />
          <div style={{ textAlign: 'center', display: 'flex', alignItems: 'center', gap: 6 }}><CoinMark size={24} /><span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 28, color: 'var(--gold)', lineHeight: 1 }}>1 BC</span></div>
        </div>
        <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 11.5, color: 'var(--muted)', textAlign: 'center', marginTop: 10, lineHeight: 1.5 }}>Bigger packs carry better rates and bonus coin. Prices are in INR via Razorpay.</div>
      </Card>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 15px', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 13, marginBottom: 16 }}>
        <Icon name="lock" size={18} color="var(--muted)" />
        <span style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 11.5, color: 'var(--muted)', lineHeight: 1.45 }}>Non-refundable and non-withdrawable. Spend it within BeingCamp — that\u2019s what keeps the economy whole.</span>
      </div>

      <Btn variant="primary" size="lg" full icon="plus" onClick={() => { S.back(); S.go('buy'); }}>Buy BeingCoin</Btn>
      <div style={{ height: 8 }} />
    </div>
  );
}

Object.assign(window, { WalletScreen, BuyScreen, PaySheet, txIcon, CoinInfoScreen });
