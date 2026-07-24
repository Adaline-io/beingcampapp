// BeingCamp — Terms of Use & Privacy Policy.
// Plain, honest boilerplate for a closed-community beta. Reachable as a
// standalone route (?legal=terms | ?legal=privacy) so it works before sign-in,
// from the auth footer, and from the profile menu. This is a starting point —
// have it reviewed by a lawyer before a wide public launch.

const LEGAL_UPDATED = 'July 2026';

function LegalDoc({ which, onBack }) {
  const isTerms = which !== 'privacy';
  const H = ({ children }) => (
    <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 800, fontSize: 15, color: 'var(--text)', margin: '22px 0 8px' }}>{children}</div>
  );
  const P = ({ children }) => (
    <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 10 }}>{children}</div>
  );
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '36px 20px 60px' }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
          <button className="tap" aria-label="Back" onClick={onBack} style={{ width: 38, height: 38, borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Icon name="back" size={19} color="var(--text)" /></button>
          <CoinMark size={22} />
          <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 20, color: 'var(--text)', letterSpacing: '0.04em' }}>BEINGCAMP</span>
        </div>

        <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 40, color: 'var(--text)', lineHeight: 1, marginBottom: 6 }}>{isTerms ? 'TERMS OF USE' : 'PRIVACY POLICY'}</div>
        <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 10.5, color: 'var(--dim)', marginBottom: 8 }}>Last updated · {LEGAL_UPDATED}</div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <a href="?legal=terms" style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 700, fontSize: 12.5, color: isTerms ? 'var(--gold)' : 'var(--muted)' }}>Terms</a>
          <span style={{ color: 'var(--dim)' }}>·</span>
          <a href="?legal=privacy" style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 700, fontSize: 12.5, color: !isTerms ? 'var(--gold)' : 'var(--muted)' }}>Privacy</a>
        </div>

        {isTerms ? (
          <>
            <P>Welcome to BeingCamp, a creative-community platform operated by Adaline The Agency for its members and physical space in Kerala, India. By creating an account or using the app you agree to these Terms.</P>

            <H>1. Membership</H>
            <P>BeingCamp is a members’ community. You must provide accurate information, keep your login secure, and are responsible for activity on your account. We may suspend accounts that abuse the platform, other members, or the space.</P>

            <H>2. BeingCoin (BC)</H>
            <P><strong style={{ color: 'var(--text)' }}>BeingCoin is a closed-loop utility credit used only inside BeingCamp — it is not money, not a cryptocurrency, not a security, and not redeemable for cash.</strong> It has no value outside the platform and cannot be transferred off-platform. We may adjust balances to correct errors, fraud, or abuse. Coins earned through work are released from a project’s escrow as milestones are approved.</P>

            <H>3. Work &amp; the marketplace</H>
            <P>Members can post work and join teams. Payment for work is made in BeingCoin through the platform’s escrow: coins are locked when work is posted and released to the team as milestones are approved, with a platform fee retained by the house. BeingCamp facilitates these arrangements but is not a party to the work agreement between members and is not an employer. Members are responsible for the quality and legality of the work they deliver.</P>

            <H>4. Conduct</H>
            <P>Don’t post unlawful, harmful, infringing, or misleading content; don’t harass other members; don’t attempt to manipulate coin balances, ranks, or the escrow system. You retain ownership of work you create and grant BeingCamp a licence to display work you choose to publish to the Showcase.</P>

            <H>5. The physical space</H>
            <P>Check-ins, bookings, and access at the BeingCamp space are subject to the space’s house rules and capacity. Follow staff instructions and applicable safety guidelines while on site.</P>

            <H>6. Changes &amp; liability</H>
            <P>We may update the app, these Terms, and the economy over time; continued use means you accept the changes. The platform is provided “as is” during this beta. To the extent permitted by law, Adaline The Agency is not liable for indirect or consequential losses arising from use of the platform or BeingCoin.</P>

            <H>7. Contact</H>
            <P>Questions? Reach us at hello@beingcamp.com (or your BeingCamp admin).</P>
          </>
        ) : (
          <>
            <P>This Privacy Policy explains what we collect and how we use it. We aim to collect only what the community needs to run.</P>

            <H>1. What we collect</H>
            <P>Account details you provide (email, name, city, headline, skills, category, and profile bio); activity on the platform (coin transactions, projects, check-ins, challenge entries, publications); and basic technical data needed to run the app (such as your session). Your email is used to sign in and to send account emails like password resets.</P>

            <H>2. How we use it</H>
            <P>To run your account and wallet, match you with work and teams by your skills and category, show public profile and Showcase content you publish, operate the physical-space check-ins, and keep the platform secure. Your name, headline, skills, rank, published work, and track record are visible to other members by design — that’s how collaboration works. Your email, password, and private balances are not shown to other members.</P>

            <H>3. Where it lives</H>
            <P>Data is stored with our infrastructure provider (Supabase) and protected by row-level security so members can only access what they’re allowed to. We don’t sell your personal data.</P>

            <H>4. Your choices</H>
            <P>You can edit your profile at any time. To close your account or request deletion of your data, contact us at hello@beingcamp.com and we’ll remove your personal information, subject to records we must keep for integrity of the shared economy (e.g. anonymised transaction history).</P>

            <H>5. Cookies &amp; local storage</H>
            <P>We use your browser’s local storage to keep you signed in and to remember app state. We don’t use third-party advertising trackers.</P>

            <H>6. Changes &amp; contact</H>
            <P>We’ll update this policy as the platform grows. Questions or requests: hello@beingcamp.com (or your BeingCamp admin).</P>
          </>
        )}

        <div style={{ marginTop: 26 }}>
          <Btn variant="ghost" full onClick={onBack}>Back</Btn>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { LegalDoc });
