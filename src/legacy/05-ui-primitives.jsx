// BeingCamp — UI primitives, icon set, coin mark, sheets
// Loaded after React/Babel. Exports components to window.

// ── Icon set (stroke line icons, 24 grid) ───────────────────────────
const ICONS = {
  home:   'M3 11.5 12 4l9 7.5M5.5 10v9.5a.5.5 0 0 0 .5.5h4v-6h4v6h4a.5.5 0 0 0 .5-.5V10',
  bag:    'M6 8h12l-1 12H7L6 8Zm3 0V6a3 3 0 0 1 6 0v2',
  scan:   'M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16M7 12h10',
  pool:   'M12 3 3 8l9 5 9-5-9-5ZM3 13l9 5 9-5M3 17.5l9 5 9-5',
  user:   'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM5 20c0-3.3 3.1-6 7-6s7 2.7 7 6',
  wallet: 'M3 7.5A1.5 1.5 0 0 1 4.5 6H18a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7.5ZM16 12.5h2.5M3 8.5h13',
  bolt:   'M13 2 4 14h6l-1 8 9-12h-6l1-8Z',
  building:'M5 21V5a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v16M14 9h4a1 1 0 0 1 1 1v11M8 8h3M8 12h3M8 16h3M3 21h18',
  arrowR: 'M5 12h14M13 6l6 6-6 6',
  arrowUR:'M7 17 17 7M9 7h8v8',
  chevR:  'M9 6l6 6-6 6',
  chevD:  'M6 9l6 6 6-6',
  back:   'M19 12H5M11 6l-6 6 6 6',
  plus:   'M12 5v14M5 12h14',
  check:  'M5 12.5 10 17l9-10',
  checkCircle:'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM8 12l3 3 5-6',
  fire:   'M12 3c1 3-2 4-2 7a2 2 0 0 0 4 0c0-.7-.2-1.3-.5-1.8C16 10 18 12.5 18 15a6 6 0 0 1-12 0c0-4 3-6 6-12Z',
  trophy: 'M7 4h10v4a5 5 0 0 1-10 0V4ZM7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3M9 15h6M8 20h8M12 15v5',
  calendar:'M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1ZM8 3v4M16 3v4M4 11h16',
  lock:   'M6 11V8a6 6 0 0 1 12 0v3M5 11h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1Z',
  gift:   'M4 11h16v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-9ZM3 7h18v4H3V7ZM12 7V21M12 7C12 7 10 3 7.5 4S8 7 12 7ZM12 7s2-4 4.5-3-1.5 3-4.5 3',
  bell:   'M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6ZM10 20a2 2 0 0 0 4 0',
  qr:     'M4 4h6v6H4V4ZM14 4h6v6h-6V4ZM4 14h6v6H4v-6ZM14 14h2v2h-2v-2ZM18 14h2v2M14 18h2v2M18 18h2v2',
  spark:  'M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18',
  clock:  'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM12 7v5l3 2',
  pin:    'M12 21s7-5.7 7-11a7 7 0 1 0-14 0c0 5.3 7 11 7 11ZM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
  star:   'M12 3l2.6 5.6 6.1.8-4.5 4.2 1.2 6L12 17l-5.4 2.6 1.2-6L3.3 9.4l6.1-.8L12 3Z',
  briefcase:'M4 8h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1ZM8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18',
  swap:   'M7 4 3 8l4 4M3 8h13M17 20l4-4-4-4M21 16H8',
  phone:  'M5 4h4l2 5-3 2a12 12 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z',
  flame:  'M12 3c1 3-2 4-2 7a2 2 0 0 0 4 0c0-.7-.2-1.3-.5-1.8C16 10 18 12.5 18 15a6 6 0 0 1-12 0c0-4 3-6 6-12Z',
  edit:   'M4 20h4L19 9l-4-4L4 16v4ZM14 6l4 4',
  share:  'M8 12a3 3 0 1 0 0-.1ZM18 7a2.5 2.5 0 1 0 0-.1ZM18 19a2.5 2.5 0 1 0 0-.1ZM10.5 10.5l5-2.5M10.5 13.5l5 2.5',
};

function Icon({ name, size = 22, color = 'currentColor', stroke = 2, fill = 'none', style }) {
  const d = ICONS[name];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'block', flexShrink: 0, ...style }}>
      <path d={d} stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" fill={fill === 'none' ? 'none' : color} />
    </svg>
  );
}

// ── Coin mark — tactile BeingCoin disc ──────────────────────────────
function CoinMark({ size = 22, glow = false }) {
  const id = React.useId();
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" style={{ display: 'block', flexShrink: 0, filter: glow ? 'drop-shadow(0 0 8px rgba(201,168,76,0.55))' : 'none' }}>
      <defs>
        <radialGradient id={`cg${id}`} cx="38%" cy="32%" r="75%">
          <stop offset="0%" stopColor="#f3df9e" />
          <stop offset="45%" stopColor="var(--gold)" />
          <stop offset="100%" stopColor="#8f7430" />
        </radialGradient>
      </defs>
      <circle cx="20" cy="20" r="19" fill={`url(#cg${id})`} />
      <circle cx="20" cy="20" r="19" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.8" />
      <circle cx="20" cy="20" r="15" fill="none" stroke="rgba(120,90,30,0.55)" strokeWidth="1" />
      <path d="M16 12.5h7.2c2.4 0 4 1.3 4 3.4 0 1.5-.9 2.6-2.2 3 1.6.4 2.7 1.6 2.7 3.4 0 2.3-1.8 3.7-4.5 3.7H16V12.5Zm3.1 5.7h3.3c1 0 1.6-.5 1.6-1.4 0-.8-.6-1.3-1.6-1.3h-3.3v2.7Zm0 5.9h3.6c1.1 0 1.8-.5 1.8-1.5 0-.9-.7-1.5-1.8-1.5h-3.6v3Z" fill="#5c4715" fillOpacity="0.9" />
    </svg>
  );
}

// ── BC amount ───────────────────────────────────────────────────────
const fmt = (n) => Math.abs(n).toLocaleString('en-IN');
function BC({ amount, size = 14, coin = true, weight = 700, color, sign = false }) {
  const neg = amount < 0;
  const c = color || (neg ? 'var(--muted)' : 'var(--text)');
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.28, fontFamily: 'Space Mono, monospace', fontWeight: weight, fontSize: size, color: c, lineHeight: 1, whiteSpace: 'nowrap' }}>
      {coin && <CoinMark size={size * 1.05} />}
      {sign ? (neg ? '−' : '+') : ''}{fmt(amount)}
    </span>
  );
}

// ── Eyebrow / section label ─────────────────────────────────────────
function Eyebrow({ children, color = 'var(--gold)', line = false, style }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'Space Mono, monospace', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color, ...style }}>
      <span>{children}</span>
      {line && <span style={{ flex: 1, height: 1, background: 'var(--line)' }} />}
    </div>
  );
}

// ── Card ────────────────────────────────────────────────────────────
function Card({ children, pad = 16, style, onClick, glow = false, hl = false }) {
  return (
    <div onClick={onClick} className={onClick ? 'tap' : ''} style={{
      background: hl ? 'linear-gradient(160deg, rgba(201,168,76,0.10), rgba(201,168,76,0.02))' : 'var(--surface)',
      border: `1px solid ${hl ? 'var(--gold-line)' : 'var(--line)'}`,
      borderRadius: 18, padding: pad,
      boxShadow: glow ? '0 0 0 1px var(--gold-line), 0 8px 30px rgba(201,168,76,0.08)' : 'none',
      cursor: onClick ? 'pointer' : 'default', ...style,
    }}>{children}</div>
  );
}

// ── Badge ───────────────────────────────────────────────────────────
const BADGE_TONES = {
  gold:  ['rgba(201,168,76,0.12)', 'var(--gold)', 'var(--gold-line)'],
  green: ['rgba(76,201,122,0.12)', 'var(--green)', 'rgba(76,201,122,0.25)'],
  blue:  ['rgba(91,155,214,0.12)', 'var(--blue)', 'rgba(91,155,214,0.25)'],
  purple:['rgba(155,127,212,0.12)', 'var(--purple)', 'rgba(155,127,212,0.25)'],
  red:   ['rgba(210,86,79,0.12)', 'var(--red)', 'rgba(210,86,79,0.25)'],
  grey:  ['rgba(138,134,127,0.10)', 'var(--muted)', 'var(--line2)'],
};
function Badge({ children, tone = 'grey', solid = false, style }) {
  const [bg, fg, bd] = BADGE_TONES[tone] || BADGE_TONES.grey;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontFamily: 'Space Mono, monospace', fontSize: 9.5, fontWeight: 700,
      letterSpacing: '0.08em', textTransform: 'uppercase',
      padding: '4px 9px', borderRadius: 999,
      background: solid ? fg : bg, color: solid ? 'var(--bg)' : fg,
      border: `1px solid ${solid ? fg : bd}`, ...style,
    }}>{children}</span>
  );
}

// ── Button ──────────────────────────────────────────────────────────
function Btn({ children, onClick, variant = 'primary', full = false, size = 'md', disabled = false, icon, style }) {
  const sizes = { sm: [10, 14, 12.5], md: [14, 18, 14], lg: [17, 22, 15.5] };
  const [py, px, fs] = sizes[size] || sizes.md;
  const base = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 600, fontSize: fs,
    padding: `${py}px ${px}px`, borderRadius: 13, border: '1px solid transparent',
    width: full ? '100%' : 'auto', cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.4 : 1, letterSpacing: '0.01em', transition: 'transform .12s ease, filter .15s ease',
  };
  const variants = {
    primary: { background: 'var(--gold)', color: '#1a1407', borderColor: 'var(--gold)' },
    dark:    { background: 'var(--text)', color: 'var(--bg)' },
    outline: { background: 'transparent', color: 'var(--text)', borderColor: 'var(--line2)' },
    ghost:   { background: 'var(--panel)', color: 'var(--text)', borderColor: 'var(--line)' },
    danger:  { background: 'rgba(210,86,79,0.12)', color: 'var(--red)', borderColor: 'rgba(210,86,79,0.3)' },
  };
  return (
    <button className="tap" onClick={disabled ? undefined : onClick} style={{ ...base, ...variants[variant], ...style }}>
      {icon && <Icon name={icon} size={fs + 3} stroke={2.2} />}
      {children}
    </button>
  );
}

// ── Placeholder image (textured, no external asset) ─────────────────
function Placeholder({ tone = '#242424', label, h = 120, radius = 14, icon = 'bag', style }) {
  const numH = typeof h === 'number' ? h : 120;
  return (
    <div style={{
      position: 'relative', height: h, borderRadius: radius, overflow: 'hidden',
      background: `radial-gradient(120% 120% at 30% 20%, ${tone}, #0d0d0d)`,
      border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', ...style,
    }}>
      <div style={{ position: 'absolute', inset: 0, opacity: 0.5, backgroundImage: 'repeating-linear-gradient(135deg, rgba(255,255,255,0.025) 0 1px, transparent 1px 9px)' }} />
      <Icon name={icon} size={Math.min(34, numH * 0.3)} color="rgba(240,237,232,0.16)" stroke={1.5} />
      {label && <div style={{ position: 'absolute', bottom: 8, left: 10, fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(240,237,232,0.3)' }}>{label}</div>}
    </div>
  );
}

// ── Progress bar ────────────────────────────────────────────────────
function Progress({ value, max = 100, color = 'var(--gold)', h = 6 }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div style={{ height: h, borderRadius: 999, background: 'var(--panel)', overflow: 'hidden', border: '1px solid var(--line)' }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 999, transition: 'width .5s cubic-bezier(.2,.8,.2,1)' }} />
    </div>
  );
}

// ── Bottom sheet ────────────────────────────────────────────────────
function Sheet({ open, onClose, children, title, full = false }) {
  const [mounted, setMounted] = React.useState(open);
  const [show, setShow] = React.useState(false);
  React.useEffect(() => {
    if (open) { setMounted(true); requestAnimationFrame(() => requestAnimationFrame(() => setShow(true))); }
    else { setShow(false); const t = setTimeout(() => setMounted(false), 280); return () => clearTimeout(t); }
  }, [open]);
  if (!mounted) return null;
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 200, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)', opacity: show ? 1 : 0, transition: 'opacity .28s ease' }} />
      <div style={{
        position: 'relative', background: 'var(--deep)', borderTop: '1px solid var(--line2)',
        borderRadius: '26px 26px 0 0', maxHeight: full ? '92%' : '82%', display: 'flex', flexDirection: 'column',
        transform: show ? 'translateY(0)' : 'translateY(100%)', transition: 'transform .32s cubic-bezier(.2,.85,.25,1)',
        boxShadow: '0 -20px 60px rgba(0,0,0,0.5)',
      }}>
        <div style={{ padding: '10px 0 4px', display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
          <div style={{ width: 38, height: 4, borderRadius: 999, background: 'var(--line2)' }} />
        </div>
        {title && (
          <div style={{ padding: '6px 20px 12px', flexShrink: 0 }}>
            <Eyebrow>{title}</Eyebrow>
          </div>
        )}
        <div style={{ overflowY: 'auto', padding: '4px 20px calc(28px + env(safe-area-inset-bottom))', WebkitOverflowScrolling: 'touch' }}>{children}</div>
      </div>
    </div>
  );
}

// ── Toast ───────────────────────────────────────────────────────────
function Toast({ data }) {
  if (!data) return null;
  return (
    <div key={data.key} style={{
      position: 'absolute', top: 64, left: '50%', transform: 'translateX(-50%)', zIndex: 300,
      background: 'var(--panel)', border: '1px solid var(--gold-line)', borderRadius: 14,
      padding: '11px 16px', display: 'flex', alignItems: 'center', gap: 10,
      boxShadow: '0 12px 30px rgba(0,0,0,0.5)', animation: 'toastIn .4s cubic-bezier(.2,.85,.25,1)', maxWidth: 320,
    }}>
      {data.coin != null
        ? <BC amount={data.coin} size={15} sign={data.coin > 0 || data.coin < 0} color={data.coin >= 0 ? 'var(--green)' : 'var(--text)'} />
        : <Icon name={data.icon || 'checkCircle'} size={18} color="var(--gold)" />}
      <span style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{data.msg}</span>
    </div>
  );
}

// ── Screen header (in-app, contextual) ──────────────────────────────
function ScreenHead({ title, sub, onBack, right, balance }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 0 18px' }}>
      {onBack && (
        <button className="tap" onClick={onBack} style={{ width: 38, height: 38, borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
          <Icon name="back" size={19} color="var(--text)" />
        </button>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        {sub && <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 3 }}>{sub}</div>}
        <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 32, lineHeight: 0.95, letterSpacing: '0.01em', color: 'var(--text)' }}>{title}</div>
      </div>
      {right}
    </div>
  );
}

// ── Empty state ─────────────────────────────────────────────────────
function EmptyState({ icon = 'spark', title, body, cta, onCta, tone = 'var(--gold)' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '36px 24px' }}>
      <div style={{ width: 64, height: 64, borderRadius: 18, background: 'var(--surface)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
        <Icon name={icon} size={30} color={tone} stroke={1.7} />
      </div>
      <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 26, color: 'var(--text)', lineHeight: 1, marginBottom: 8 }}>{title}</div>
      <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.55, maxWidth: 270, marginBottom: cta ? 20 : 0 }}>{body}</div>
      {cta && <Btn variant="primary" icon="arrowR" onClick={onCta}>{cta}</Btn>}
    </div>
  );
}

// ── Search bar ──────────────────────────────────────────────────────
function SearchBar({ value, onChange, placeholder = 'Search…' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 13, padding: '11px 14px', marginBottom: 14 }}>
      <Icon name="scan" size={16} color="var(--dim)" />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 13.5, color: 'var(--text)' }} />
      {value && <button className="tap" onClick={() => onChange('')} style={{ cursor: 'pointer', background: 'none', border: 'none', padding: 0, display: 'flex' }}><Icon name="plus" size={16} color="var(--muted)" style={{ transform: 'rotate(45deg)' }} /></button>}
    </div>
  );
}

Object.assign(window, {
  Icon, CoinMark, BC, fmt, Eyebrow, Card, Badge, Btn, Placeholder, Progress, Sheet, Toast, ScreenHead, EmptyState, SearchBar,
});
