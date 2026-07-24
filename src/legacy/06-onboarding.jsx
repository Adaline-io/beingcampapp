// BeingCamp — Onboarding: Splash → Fork → Profile → Initiation.
// One simple sign-in for every member — your name is enough. The super admin
// later promotes chosen members into the internal team from the Admin dashboard.

function Splash({ onNext }) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '0 28px 40px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -80, right: -80, width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.16), transparent 65%)', filter: 'blur(8px)' }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
        <div style={{ marginBottom: 26 }}><CoinMark size={56} glow /></div>
        <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 14 }}>Welcome to</div>
        <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 76, lineHeight: 0.86, letterSpacing: '0.01em', color: 'var(--text)' }}>BEING<br/>CAMP</div>
        <div style={{ fontFamily: 'DM Serif Display, serif', fontStyle: 'italic', fontSize: 19, color: 'var(--muted)', marginTop: 20, lineHeight: 1.45, maxWidth: 300 }}>
          One space. One coin. A whole ecosystem of brands, work, and community.
        </div>
      </div>
      <div style={{ position: 'relative' }}>
        <Btn variant="primary" size="lg" full icon="arrowR" onClick={onNext}>Enter the Camp</Btn>
        <div style={{ textAlign: 'center', marginTop: 14, fontFamily: 'Space Mono, monospace', fontSize: 10, letterSpacing: '0.1em', color: 'var(--dim)' }}>
          A subsidiary of ADALINE THE AGENCY
        </div>
      </div>
    </div>
  );
}

function ForkStep({ onPick }) {
  const opt = (role, icon, title, line, points, tone) => (
    <button className="tap" onClick={() => onPick(role)} style={{ textAlign: 'left', width: '100%', cursor: 'pointer', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 20, padding: 20, display: 'block' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: 13, background: tone, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--line2)' }}><Icon name={icon} size={24} color="var(--gold)" stroke={2} /></div>
        <div>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 24, color: 'var(--text)', lineHeight: 1 }}>{title}</div>
          <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 12.5, color: 'var(--muted)', marginTop: 2 }}>{line}</div>
        </div>
        <Icon name="arrowR" size={20} color="var(--gold)" style={{ marginLeft: 'auto' }} />
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {points.map((p) => <Badge key={p}>{p}</Badge>)}
      </div>
    </button>
  );
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '24px 24px 36px' }}>
      <div style={{ paddingTop: 20, marginBottom: 24 }}>
        <Eyebrow>Step 03 — Your start</Eyebrow>
        <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 42, lineHeight: 0.95, color: 'var(--text)', margin: '14px 0 8px' }}>WHAT BRINGS<br/>YOU HERE?</div>
        <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 14, color: 'var(--muted)', lineHeight: 1.5 }}>You're a member of BeingCamp either way — post work and do work, whenever. This just sets your home.</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {opt('maker', 'bolt', "I'LL DO THE WORK", 'Join teams, get paid', ['Find work', 'Join teams', 'Earn coins', 'Rank up'], 'rgba(201,168,76,0.1)')}
        {opt('poster', 'building', "I'M HERE TO HIRE", 'Post work, build a team', ['Post work', 'Fund escrow', 'Get a team', 'Track delivery'], 'rgba(91,155,214,0.08)')}
      </div>
      <div style={{ marginTop: 'auto', textAlign: 'center', fontFamily: 'Space Mono, monospace', fontSize: 10, color: 'var(--dim)', letterSpacing: '0.08em', paddingTop: 20 }}>
        BeingCoin is a closed-loop utility token — not a cryptocurrency.
      </div>
    </div>
  );
}

function InitiationCamper({ onDone, path }) {
  const [stage, setStage] = React.useState(0); // 0 intro, 1 reveal
  const hire = path === 'poster';
  const points = hire
    ? [['plus', 'Post work in minutes', 'Describe what you need — Authority scopes it and shortlists a team.'],
       ['lock', 'Fund escrow, stay in control', 'Coin is locked up front and releases only as you approve milestones.'],
       ['spark', 'Save more as you go', 'The more you commission, the bigger your loyalty discount.']]
    : [['plus', 'Post or do work', 'Post a project, or join a team on someone else\u2019s.'],
       ['pool', 'Collaborate in workspaces', 'Milestones, chat, files — paid in BeingCoin escrow.'],
       ['trophy', 'Rise by usage', 'Move coins, build rank — earn more when you work, save more when you hire.']];
  if (stage === 0) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '24px 28px 36px' }}>
        <div style={{ paddingTop: 24 }}>
          <Eyebrow>The Initiation</Eyebrow>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 42, lineHeight: 0.95, color: 'var(--text)', margin: '14px 0 14px' }}>BEFORE YOU<br/>BEGIN</div>
          <div style={{ fontFamily: 'DM Serif Display, serif', fontStyle: 'italic', fontSize: 17, color: 'var(--muted)', lineHeight: 1.5, marginBottom: 24 }}>
            {hire ? 'Get great work done by a vetted team — funded safely, delivered in the open.' : 'The Camp runs on three things — presence, contribution, and the coin that ties them together.'}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {points.map(([ic, t, d]) => (
            <Card key={t} pad={14} style={{ display: 'flex', gap: 13, alignItems: 'flex-start' }}>
              <div style={{ width: 38, height: 38, borderRadius: 11, background: 'var(--gold-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={ic} size={20} color="var(--gold)" /></div>
              <div>
                <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>{t}</div>
                <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.5, marginTop: 2 }}>{d}</div>
              </div>
            </Card>
          ))}
        </div>
        <div style={{ marginTop: 'auto', paddingTop: 22 }}>
          <Btn variant="primary" size="lg" full icon="arrowR" onClick={() => setStage(1)}>Complete Initiation</Btn>
        </div>
      </div>
    );
  }
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '28px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '28%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.2), transparent 65%)', animation: 'pulseGlow 2.5s ease-in-out infinite' }} />
      <div style={{ position: 'relative', animation: 'coinPop .7s cubic-bezier(.2,1.3,.4,1)' }}><CoinMark size={92} glow /></div>
      <div style={{ position: 'relative', fontFamily: 'Bebas Neue, sans-serif', fontSize: 56, color: 'var(--gold)', lineHeight: 1, marginTop: 24 }}>+100 BC</div>
      <div style={{ position: 'relative', fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 15, color: 'var(--text)', marginTop: 6 }}>Initiation reward credited</div>
      <div style={{ position: 'relative', fontFamily: 'DM Serif Display, serif', fontStyle: 'italic', fontSize: 17, color: 'var(--muted)', marginTop: 20, maxWidth: 280, lineHeight: 1.5 }}>
        {hire ? "You're a member now. Post your first work whenever you're ready." : "You're a Recruit now. The Camp is yours to climb."}
      </div>
      <div style={{ position: 'relative', width: '100%', marginTop: 34 }}>
        <Btn variant="primary" size="lg" full icon="arrowR" onClick={onDone}>Enter BeingCamp</Btn>
      </div>
    </div>
  );
}

function InitiationClient({ onDone }) {
  const [region, setRegion] = React.useState(null);
  const regions = [['local', 'Local', 'Calicut & Kerala'], ['gulf', 'Gulf', 'UAE / diaspora'], ['brand', 'Brand', 'Sponsor / partner']];
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '24px 28px 36px' }}>
      <div style={{ paddingTop: 24 }}>
        <Eyebrow color="var(--blue)">Client Setup</Eyebrow>
        <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 42, lineHeight: 0.95, color: 'var(--text)', margin: '14px 0 12px' }}>WHERE ARE<br/>YOU BASED?</div>
        <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 14, color: 'var(--muted)', lineHeight: 1.5, marginBottom: 22 }}>This sets your currency display and payment options.</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
        {regions.map(([id, t, d]) => (
          <button key={id} className="tap" onClick={() => setRegion(id)} style={{ cursor: 'pointer', textAlign: 'left', background: region === id ? 'var(--gold-dim)' : 'var(--surface)', border: `1px solid ${region === id ? 'var(--gold-line)' : 'var(--line)'}`, borderRadius: 16, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div>
              <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 22, color: 'var(--text)', lineHeight: 1 }}>{t}</div>
              <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 12.5, color: 'var(--muted)', marginTop: 3 }}>{d}</div>
            </div>
            <div style={{ marginLeft: 'auto', width: 22, height: 22, borderRadius: '50%', border: `2px solid ${region === id ? 'var(--gold)' : 'var(--line2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {region === id && <div style={{ width: 11, height: 11, borderRadius: '50%', background: 'var(--gold)' }} />}
            </div>
          </button>
        ))}
      </div>
      <div style={{ marginTop: 'auto', paddingTop: 22 }}>
        <Btn variant="primary" size="lg" full disabled={!region} icon="arrowR" onClick={onDone}>Enter BeingCamp</Btn>
      </div>
    </div>
  );
}

const SETUP_ACCENTS = ['#c9a84c', '#5b9bd6', '#9b7fd4', '#4cc97a', '#d2564f'];
const SKILL_BANK = {
  maker: ['Branding', 'Illustration', 'Motion', 'Film', 'Photography', 'Copywriting', 'Web Dev', 'UI/UX', 'Strategy', '3D', 'Sound', 'Editing'],
  poster: ['Branding', 'Marketing', 'Web', 'Film', 'Packaging', 'Events', 'Strategy', 'Social', 'Print', 'Product'],
};

function OnbInput({ value, onChange, placeholder, area = false }) {
  const common = { width: '100%', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 13, padding: '14px 15px', fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 15, color: 'var(--text)', outline: 'none', boxSizing: 'border-box' };
  return area
    ? <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={3} style={{ ...common, resize: 'none', lineHeight: 1.5 }} />
    : <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={common} />;
}

function ProfileSetup({ path, onDone }) {
  const [sub, setSub] = React.useState(0);
  const [name, setName] = React.useState('');
  const [accent, setAccent] = React.useState('#c9a84c');
  const [city, setCity] = React.useState('');
  const [headline, setHeadline] = React.useState('');
  const [skills, setSkills] = React.useState([]);
  const [category, setCategory] = React.useState(null); // primary discipline (agile category)
  const [bio, setBio] = React.useState('');
  const hire = path === 'poster';
  const initials = (name || '').trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase() || '?';
  const toggleSkill = (s) => setSkills((p) => p.includes(s) ? p.filter((x) => x !== s) : (p.length < 6 ? [...p, s] : p));
  const disciplines = (typeof INDUSTRIES !== 'undefined') ? INDUSTRIES : [];

  const finish = () => onDone({ name: name.trim() || 'New Member', accent, city: city.trim() || 'BeingCamp', headline: headline.trim() || (hire ? 'Building a brand' : 'Member of the Camp'), bio: bio.trim(), skills, category, path, since: new Date().toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }).replace(' ', " '") });

  const dots = (
    <div style={{ display: 'flex', gap: 7, marginBottom: 20 }}>
      {[0, 1, 2].map((i) => <div key={i} style={{ flex: 1, height: 4, borderRadius: 999, background: i <= sub ? 'var(--gold)' : 'var(--panel)' }} />)}
    </div>
  );
  const header = (eyebrow, title) => (
    <div style={{ marginBottom: 22 }}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 38, lineHeight: 0.95, color: 'var(--text)', marginTop: 12, whiteSpace: 'pre-line' }}>{title}</div>
    </div>
  );
  const label = (t) => <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--dim)', margin: '16px 0 8px' }}>{t}</div>;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '20px 28px 32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        {sub > 0 && <button className="tap" onClick={() => setSub(sub - 1)} style={{ width: 36, height: 36, borderRadius: 11, background: 'var(--surface)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}><Icon name="back" size={18} color="var(--text)" /></button>}
        <div style={{ flex: 1 }}>{dots}</div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none' }}>
        {sub === 0 && (
          <div style={{ animation: 'screenIn .3s ease' }}>
            {header('Profile · 1 of 3', 'WHO ARE YOU?')}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
              <div style={{ width: 84, height: 84, borderRadius: 24, background: `linear-gradient(140deg, ${accent}33, #141414)`, border: `1px solid ${accent}66`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 38, color: accent }}>{initials}</span>
              </div>
            </div>
            {label('Your name')}
            <OnbInput value={name} onChange={setName} placeholder="e.g. Aman Kurikkal" />
            {label('Pick your colour')}
            <div style={{ display: 'flex', gap: 12 }}>
              {SETUP_ACCENTS.map((c) => (
                <button key={c} className="tap" onClick={() => setAccent(c)} style={{ cursor: 'pointer', width: 44, height: 44, borderRadius: 14, background: c, border: accent === c ? '3px solid var(--text)' : '3px solid transparent', boxShadow: accent === c ? `0 0 0 1px ${c}` : 'none' }} />
              ))}
            </div>
          </div>
        )}

        {sub === 1 && (
          <div style={{ animation: 'screenIn .3s ease' }}>
            {header('Profile · 2 of 3', hire ? 'YOUR\nORGANISATION' : 'YOUR\nCRAFT')}
            {label('Where are you based?')}
            <OnbInput value={city} onChange={setCity} placeholder="e.g. Calicut, Kerala" />
            {label(hire ? 'What do you do?' : 'Your one-liner')}
            <OnbInput value={headline} onChange={setHeadline} placeholder={hire ? 'e.g. We run a specialty café' : 'e.g. Brand & motion designer'} />
            <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 12, color: 'var(--dim)', marginTop: 8, lineHeight: 1.5 }}>This shows on your public profile and on teams you join.</div>
          </div>
        )}

        {sub === 2 && (
          <div style={{ animation: 'screenIn .3s ease' }}>
            {header('Profile · 3 of 3', hire ? 'FOCUS AREAS' : 'YOUR CATEGORY')}
            {/* Category (agile discipline): sets the member's professional lane —
                the work, crew seats, and challenges matched to them follow it. */}
            <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 13, color: 'var(--muted)', marginBottom: 12, lineHeight: 1.5 }}>{hire ? 'What kind of work will you mostly post? This sets your home lane.' : 'Pick your main category — this decides the work and teams you get access to.'}</div>
            {disciplines.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 18 }}>
                {disciplines.map((d) => {
                  const on = category === d.id;
                  return (
                    <button key={d.id} className="tap" onClick={() => setCategory(on ? null : d.id)} style={{ cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 9, padding: '11px 12px', borderRadius: 12, border: `1px solid ${on ? 'var(--gold)' : 'var(--line)'}`, background: on ? 'var(--gold-dim)' : 'var(--surface)' }}>
                      <Icon name={d.icon} size={17} color={on ? 'var(--gold)' : d.tone} />
                      <span style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 700, fontSize: 12.5, color: on ? 'var(--gold)' : 'var(--text)' }}>{d.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
            <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--dim)', margin: '4px 0 8px' }}>{hire ? 'Focus areas' : 'Your skills'}</div>
            <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 12.5, color: 'var(--muted)', marginBottom: 12, lineHeight: 1.5 }}>{hire ? 'Pick up to 6.' : 'Pick up to 6 — this is how teams find you.'}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {SKILL_BANK[hire ? 'poster' : 'maker'].map((s) => {
                const on = skills.includes(s);
                return (
                  <button key={s} className="tap" onClick={() => toggleSkill(s)} style={{ cursor: 'pointer', fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 600, fontSize: 13, padding: '9px 14px', borderRadius: 999, border: `1px solid ${on ? 'var(--gold)' : 'var(--line)'}`, background: on ? 'var(--gold-dim)' : 'var(--surface)', color: on ? 'var(--gold)' : 'var(--muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    {on && <Icon name="check" size={13} color="var(--gold)" stroke={2.6} />}{s}
                  </button>
                );
              })}
            </div>
            {label('A line about you (optional)')}
            <OnbInput value={bio} onChange={setBio} placeholder="What you care about, what you're great at…" area />
          </div>
        )}
      </div>

      <div style={{ paddingTop: 16 }}>
        {sub < 2
          ? <Btn variant="primary" size="lg" full icon="arrowR" disabled={sub === 0 && !name.trim()} onClick={() => setSub(sub + 1)}>Continue</Btn>
          : <Btn variant="primary" size="lg" full icon="arrowR" onClick={finish}>Finish setup</Btn>}
      </div>
    </div>
  );
}

function Onboarding({ onComplete, authed }) {
  // Everyone signs in with email + password — one account, every device. New
  // accounts are created on first sign-in, then complete a professional profile
  // (category → skills). The super admin is crowned automatically by email.
  const BE = (typeof window !== 'undefined') ? window.BeingCampBackend : null;
  const needAuth = !!(BE && BE.enabled) && !authed; // demo/local mode skips auth
  const [step, setStep] = React.useState('splash');
  const [path, setPath] = React.useState('maker');
  const [profile, setProfile] = React.useState(null);
  return (
    <div key={step} style={{ height: '100%', paddingTop: 38, animation: 'screenIn .4s ease' }}>
      {step === 'splash' && <Splash onNext={() => setStep(needAuth ? 'auth' : 'fork')} />}
      {step === 'auth' && <AuthStep onBack={() => setStep('splash')} />}
      {step === 'fork' && <ForkStep onPick={(r) => { setPath(r); setStep('setup'); }} />}
      {step === 'setup' && <ProfileSetup path={path} onDone={(prof) => { setProfile(prof); setStep('init'); }} />}
      {step === 'init' && <InitiationCamper path={path} onDone={() => onComplete(profile)} />}
    </div>
  );
}

// ── Sign in / create account: email + password for every member. First
// sign-in with a new email creates the account; returning members land in the
// app. The super admin is auto-crowned by email (0016). ───────────────────
function AuthStep({ onBack }) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState(null);
  const go = async () => {
    if (!email.includes('@') || password.length < 6) { setErr('Enter a valid email and a password of 6+ characters.'); return; }
    setBusy(true); setErr(null);
    try {
      const ok = await window.BeingCampBackend.teamSignIn(email.trim().toLowerCase(), password);
      if (ok) {
        location.reload(); // boot() hydrates the account (wallet + role) and routes to profile/app
      } else {
        setErr('Sign-in failed. A new account is created automatically on first sign-in — check the password is 6+ characters.');
      }
    } catch (e) {
      const m = String((e && e.message) || 'Sign-in failed');
      setErr(/confirm/i.test(m) ? 'This project still needs “Confirm email” turned off in Supabase Auth.'
        : /invalid login/i.test(m) ? 'Wrong password for this email. Try again.'
        : m);
    }
    setBusy(false);
  };
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '64px 26px 30px', animation: 'screenIn .3s ease' }}>
      <button className="tap" aria-label="Back" onClick={onBack} style={{ width: 38, height: 38, borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginBottom: 20 }}><Icon name="back" size={19} color="var(--text)" /></button>
      <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)' }}>BeingCamp</div>
      <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 800, fontSize: 30, letterSpacing: '-0.01em', color: 'var(--text)', margin: '10px 0 6px' }}>Sign in or join</div>
      <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 13, color: 'var(--muted)', marginBottom: 24, lineHeight: 1.5 }}>Your email is your BeingCamp account — one login, every device. New here? Just enter an email and pick a password to create it.</div>
      <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--dim)', marginBottom: 6 }}>Email</div>
      <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" placeholder="you@example.com" onKeyDown={(e) => e.key === 'Enter' && go()}
        style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--line2)', borderRadius: 10, padding: '13px 14px', color: 'var(--text)', fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 14.5, outline: 'none', marginBottom: 14, boxSizing: 'border-box' }} />
      <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--dim)', marginBottom: 6 }}>Password</div>
      <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" autoComplete="current-password" placeholder="6+ characters" onKeyDown={(e) => e.key === 'Enter' && go()}
        style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--line2)', borderRadius: 10, padding: '13px 14px', color: 'var(--text)', fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 14.5, outline: 'none', marginBottom: 12, boxSizing: 'border-box' }} />
      {err && <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 12.5, color: 'var(--red)', marginBottom: 10, lineHeight: 1.4 }}>{err}</div>}
      <div style={{ flex: 1 }} />
      <Btn variant="primary" size="lg" full icon="arrowR" disabled={busy} onClick={go}>{busy ? 'Signing in…' : 'Continue'}</Btn>
    </div>
  );
}

Object.assign(window, { Onboarding });
