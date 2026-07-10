
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#c9a84c",
  "rankIndex": 1,
  "newMember": false,
  "showFrame": true
}/*EDITMODE-END*/;

// ── Platform detection ──────────────────────────────────────────────
// The same build ships three ways:
//  · native   — inside the Capacitor iOS/Android shell  → full-bleed app
//  · phone    — mobile browser / installed PWA          → full-bleed app
//  · desktop  — web browser                             → sidebar desktop shell
// ?frame keeps the old centered phone presentation (for demos/screenshots).
// Design/debug tweaks are development chrome: desktop-only, behind ?debug.
function detectPlatform() {
  if (typeof window === 'undefined') return { fullBleed: false, debug: false, frame: false };
  const cap = window.Capacitor;
  const isNative = !!(cap && typeof cap.isNativePlatform === 'function' && cap.isNativePlatform());
  const isStandalone =
    (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
    window.navigator.standalone === true;
  const coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  const phoneSized = window.innerWidth <= 520;
  const touchPhone = coarse && window.innerWidth <= 820 && window.innerWidth <= window.innerHeight * 1.2;
  const fullBleed = isNative || isStandalone || phoneSized || touchPhone;
  const params = new URLSearchParams(window.location.search);
  const debug = !fullBleed && params.has('debug');
  const frame = !fullBleed && params.has('frame');
  return { fullBleed, debug, frame };
}

function useAccent(accent) {
  React.useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--gold', accent);
    const hex = accent.replace('#', '');
    const r = parseInt(hex.slice(0,2),16), g = parseInt(hex.slice(2,4),16), b = parseInt(hex.slice(4,6),16);
    root.style.setProperty('--gold-line', `rgba(${r},${g},${b},0.30)`);
    root.style.setProperty('--gold-dim', `rgba(${r},${g},${b},0.12)`);
  }, [accent]);
}

function Root() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [platform, setPlatform] = React.useState(detectPlatform);
  const [scale, setScale] = React.useState(1);

  useAccent(t.accent);

  React.useEffect(() => {
    const onChange = () => setPlatform(detectPlatform());
    window.addEventListener('resize', onChange);
    window.addEventListener('orientationchange', onChange);
    return () => {
      window.removeEventListener('resize', onChange);
      window.removeEventListener('orientationchange', onChange);
    };
  }, []);

  React.useEffect(() => {
    if (platform.fullBleed || !platform.frame) return;
    const fit = () => {
      const pad = window.innerWidth <= 480 ? 0 : 48;
      const s = Math.min(1, (window.innerHeight - pad) / 874, (window.innerWidth - pad) / 402);
      setScale(s);
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, [platform.fullBleed, platform.frame]);

  const app = <BeingCampApp t={t} key={`${t.rankIndex}-${t.newMember}`} />;

  // Real device (native shell, installed PWA, phone browser): the app IS the screen.
  if (platform.fullBleed) {
    return <div className="app-fullbleed">{app}</div>;
  }

  // Desktop web: sidebar shell (the ?frame presentation is handled below).
  if (!platform.frame) {
    return (
      <>
        <BeingCampDesktop t={t} key={`desk-${t.rankIndex}-${t.newMember}`} />
        {platform.debug && (
          <TweaksPanel>
            <TweakSection label="Brand" />
            <TweakColor label="Accent" value={t.accent}
              options={['#c9a84c', '#d98a3d', '#5b9bd6', '#7bbf6a', '#c77b9e']}
              onChange={(v) => setTweak('accent', v)} />
            <TweakSection label="Demo state" />
            <TweakToggle label="New member (empty start)" value={t.newMember}
              onChange={(v) => setTweak('newMember', v)} />
            <TweakRadio label="Your rank" value={String(t.rankIndex)}
              options={['0', '1', '2', '3', '4']}
              onChange={(v) => setTweak('rankIndex', parseInt(v))} />
            <TweakSection label="Demo data" />
            <TweakButton label="Reset demo data" onClick={() => { localStorage.removeItem('beingcamp_v3'); location.reload(); }} />
          </TweaksPanel>
        )}
      </>
    );
  }

  // ?frame: centered phone presentation for demos and screenshots.
  const device = t.showFrame
    ? <IOSDevice dark={true}>{app}</IOSDevice>
    : <div style={{ width: 402, height: 844, borderRadius: 22, overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,0.5)', background: 'var(--bg)' }}>{app}</div>;

  return (
    <>
      <div style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }}>
        {device}
      </div>
      {platform.debug && (
        <TweaksPanel>
          <TweakSection label="Brand" />
          <TweakColor label="Accent" value={t.accent}
            options={['#c9a84c', '#d98a3d', '#5b9bd6', '#7bbf6a', '#c77b9e']}
            onChange={(v) => setTweak('accent', v)} />
          <TweakSection label="Demo state" />
          <TweakToggle label="New member (empty start)" value={t.newMember}
            onChange={(v) => setTweak('newMember', v)} />
          <TweakRadio label="Your rank" value={String(t.rankIndex)}
            options={['0', '1', '2', '3', '4']}
            onChange={(v) => setTweak('rankIndex', parseInt(v))} />
          <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#888', padding: '2px 2px 8px' }}>
            0 Visitor · 1 Recruit · 2 Builder · 3 Maker · 4 Chief
          </div>
          <TweakSection label="Display" />
          <TweakToggle label="Show phone frame" value={t.showFrame}
            onChange={(v) => setTweak('showFrame', v)} />
          <TweakSection label="Demo data" />
          <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#888', padding: '0 2px 8px', lineHeight: 1.5 }}>
            Your balance, projects, publications & orders save automatically and survive refresh.
          </div>
          <TweakButton label="Reset demo data" onClick={() => { localStorage.removeItem('beingcamp_v3'); location.reload(); }} />
        </TweaksPanel>
      )}
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<Root />);
