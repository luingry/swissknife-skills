# Production Types — decide this first

Two productions, two different films. **Establish which one before writing the roteiro** — ask
the user if it is not stated, because the structure, pacing and even the fonts differ.

| | **A. Walkthrough** | **B. Pitch** |
|---|---|---|
| Goal | Teach how it works | Sell why it matters |
| Question answered | "How do I use this?" | "Why should I care?" |
| Structure | Continuous flow through the product | Alternating: statement card → demo of it |
| Audience | Already interested; evaluating or onboarding | Not yet interested; scrolling past |
| Captions | Label actions as they happen | Statement cards carry the message |
| Runtime | 30–120s | 15–45s |
| Typical use | Docs, onboarding, feature announcement, tutorial | Landing hero, social, ads, app-store |

## A. Walkthrough

The mode the skill has always handled. One continuous journey through the product in the order
a real user would take it, captions labelling actions as they land. Beats follow the seven-part
structure in [roteiro-and-pacing.md](roteiro-and-pacing.md), and everything in
[camera-zoom.md](camera-zoom.md) and [cursor-and-clicks.md](cursor-and-clicks.md) applies
directly.

## B. Pitch — alternating statement and proof

Each benefit gets **two compositions**:

```
[ StatementCard: "Sem cabo, sem nuvem" ]  →  [ Demo: connecting over LAN, really working ]
[ StatementCard: "Controle de qualquer lugar" ] → [ Demo: really controlling the device ]
```

The card **states the claim**; the demo **proves it**. That ordering matters — a claim the
viewer has just read creates the expectation that the next shot satisfies. Reversed, the demo
is just footage with no reason to watch.

### Rules for pitch productions

- **One benefit per pair.** Never two claims on one card.
- **The card is short.** One line, ideally 3–6 words. If it needs two lines, it is a
  positioning statement, not a benefit.
- **The demo must actually prove the claim.** If the card says "em 1 toque", the demo shows
  exactly one tap. A card whose demo does not deliver is the fastest way to lose trust — and
  it requires [real interaction](interaction-fidelity.md), not a staged overlay.
- **Card duration** follows the same reading-time model as captions (`captionHoldSeconds`),
  but cards are the sole focus, so they can sit at the computed value with no extra padding.
  Expect ~3s each.
- **Demo segments run 3–6s** — long enough for the proof to land, short enough to keep the
  alternation rhythmic.
- **Transition between card and demo:** `softCut` (the default). The card is not spatially
  related to the demo, so `containerZoom`/`circleReveal` would assert a relationship that does
  not exist. See [transitions.md](transitions.md).
- **Close on the strongest pair**, then a final card with the product name.

### The statement card design

Minimal, quiet, and consistent: a light surface, one short line in a refined typeface, and a
single vertical accent element on the left in the project's color. Implemented by
`StatementCard` (`assets/template/src/demo/StatementCard.tsx`); theme via `STATEMENT_THEME`.

The card sets up the payoff — it is **not** the payoff. Resist decorating it. No icons, no
gradients on the text, no second line of supporting copy.

## Fonts

Four vetted families, all **SIL Open Font License**, so they are safe to ship commercially.

### Sans

- **Inter** — *the default.* The reference UI typeface: unmatched legibility at any size,
  neutral and quietly elegant, enormous weight range, variable. It is the default precisely
  because it never fights the product on screen, and its even stroke weight survives video
  compression better than higher-contrast faces.
- **Geist** (Vercel) — more character than Inter, tighter and more geometric. Reach for it when
  the brand wants a modern developer-tool feel.

### Serif

- **Instrument Serif** — high-contrast display serif. Editorial and premium; use it large and
  sparingly, which makes it ideal for a single-line statement card.
- **Source Serif 4** — a workhorse text serif. Professional and highly readable; better than
  Instrument when the line runs longer or the size is smaller.

```tsx
<StatementCard text="Sem cabo, sem nuvem" />                      // Inter (default)
<StatementCard text="Sem cabo, sem nuvem" font="instrument" />    // override
```

**Load the family before rendering** (via `@remotion/google-fonts` or a local file). If it is
not loaded the renderer silently falls back to a system font and the card loses its identity —
and because it fails quietly, check a rendered still rather than assuming.

**Serif caveat:** high-contrast serifs (Instrument especially) have thin strokes that video
compression erodes. Use them at large sizes only, and verify legibility on a rendered frame at
the delivery bitrate, not in the Studio preview.

## Choosing when the user has not said

Signals that point to **pitch**: the words landing page, hero, social, Reels, ad, conversion,
"show why", "advantages", "benefits", a runtime under ~30s.

Signals that point to **walkthrough**: tutorial, docs, onboarding, "how it works", "show the
feature", "explain", a runtime over ~45s, or a request covering several features in sequence.

If genuinely ambiguous, ask — it is a one-line question that changes the entire structure.
