# BeingCamp — Design direction

## Reference

OnlyGenius algorithmic-trading dashboard (ZeeFrames, awwwards) — chosen by the
founder as the target register: refined dark SaaS, quiet surfaces, data-first.

## The read of the reference

- True near-black ground; cards one step lighter with 1px hairline borders and
  ~14px radius. Depth comes from borders and tone, not shadows.
- Numbers are the heroes: large semibold numerals, small quiet uppercase
  labels, delta chips ("+15% from last month") in semantic green/red.
- One primary accent used sparingly (active nav pill, primary CTA). Charts get
  their own vivid categorical colors; UI chrome stays monochrome.
- Sidebar nav: icon + label rows, active item is a filled pill.
- Smooth gradient-filled area charts, rounded bars, clean data tables with
  status chips.

## BeingCamp translation (tokens live in src/styles/global.css)

- Ground `#0a0a0b` → surface `#141417` → panel `#1b1b1f`; hairlines at
  6–10% white. Text cools from cream toward neutral `#f2f2f4`.
- **Gold stays the accent** — it is the coin and the brand — but used the way
  the reference uses blue: active pill, primary button, coin moments only.
- Semantic: green = earn/release, red = spend-alert/danger, blue/purple =
  informational tags. Chart categorical set: gold, green, blue, purple, pink.
- Type: Hanken Grotesk carries everything on desktop (800 for numerals,
  700 headings, 500 body, tabular numerals for money). Space Mono only for
  tiny uppercase labels. Bebas Neue is reserved for the wordmark and the
  phone app's display moments (phone identity migrates in a later pass).
- Motion: GSAP via src/lib/motion.ts tokens (150–300ms, power2), reduced
  motion respected. Charts draw in once; no ambient looping.

## Rules

- Contrast ≥4.5:1 for body text — verify, don't eyeball.
- Money numbers always tabular; deltas always signed with a chip.
- No new hues outside the token set; no shadows heavier than 30% black.
