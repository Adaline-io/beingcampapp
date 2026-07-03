
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#c9a84c",
  "rankIndex": 1,
  "newMember": false,
  "showFrame": true
}/*EDITMODE-END*/;

function Root() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [scale, setScale] = React.useState(1);

  React.useEffect(() => {
    const fit = () => {
      const pad = window.innerWidth <= 480 ? 0 : 48;
      const s = Math.min(1, (window.innerHeight - pad) / 874, (window.innerWidth - pad) / 402);
      setScale(s);
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);

  // apply accent live
  React.useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--gold', t.accent);
    const hex = t.accent.replace('#', '');
    const r = parseInt(hex.slice(0,2),16), g = parseInt(hex.slice(2,4),16), b = parseInt(hex.slice(4,6),16);
    root.style.setProperty('--gold-line', `rgba(${r},${g},${b},0.30)`);
    root.style.setProperty('--gold-dim', `rgba(${r},${g},${b},0.12)`);
  }, [t.accent]);

  const app = <BeingCampApp t={t} key={`${t.rankIndex}-${t.newMember}`} />;

  const device = t.showFrame
    ? <IOSDevice dark={true}>{app}</IOSDevice>
    : <div style={{ width: 402, height: 844, borderRadius: 22, overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,0.5)', background: 'var(--bg)' }}>{app}</div>;

  return (
    <>
      <div style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }}>
        {device}
      </div>
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
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<Root />);
