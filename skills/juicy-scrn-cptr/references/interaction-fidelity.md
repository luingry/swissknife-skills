# Interaction Fidelity — the interaction must be real

**The default is real interaction.** Faking it with an overlay on a static screenshot produces
a video that advertises behavior the product may not have — the cursor "clicks" and nothing
truly happens, because nothing truly happened. That is both a craft failure and an honesty
failure: the output must be faithful to the product it depicts.

## What "real" means concretely

`scripts/capture.mjs` drives a real browser through a real script with Playwright and records
it. Consequently:

| Interaction | What actually happens | What a fake would have lost |
|---|---|---|
| Click an input | The element really receives focus | The real focus ring, caret, label float, active border |
| Type text | Each character is really typed (`keyboard.type` with delay) | Character-by-character appearance, autocomplete, validation, counters |
| Scroll | Real wheel events in increments | Scroll momentum, sticky headers, parallax, scroll-triggered reveals |
| Hover | The pointer really moves through the page | Hover states, tooltips, menu open-on-hover |
| Click a button | A real click with real handlers | The product's own transition, loading state, resulting screen |

The overlay cursor is still drawn by Remotion — the OS cursor is not in the recording — but it
is **driven by the capture timeline**, so it sits exactly where the real pointer was. Nothing
about the pointer is invented; only its appearance is.

## The one exception: explicitly requested stylization

Stylized, non-literal effects are allowed **only when the user asks for them** — for example
"on click, a circle grows from the click point to reveal the next screen". That is a
[transition](transitions.md) applied on top of real footage, not a substitute for real
interaction. Never invent one to paper over an interaction you did not actually capture.

## Capture script format

```js
// capture/search.capture.mjs
export default {
  name: 'search',
  url: 'https://example.com',
  viewport: { width: 1440, height: 900 },   // recording size is pinned to this
  deviceScaleFactor: 2,
  // device: 'iPhone 13',                   // mobile: use a Playwright device preset
  actions: [
    { type: 'moveTo', selector: '#search' },
    { type: 'click',  selector: '#search' },          // real focus
    { type: 'type',   text: 'xsharect', delayMs: 85 },// real typing, char by char
    { type: 'press',  key: 'Enter' },
    { type: 'waitFor', selector: '.results' },        // wait for the REAL response
    { type: 'marker', label: 'results-shown' },       // beat boundary for authoring
    { type: 'scroll', deltaY: 700 },                  // real momentum + scroll animations
    { type: 'click',  selector: '.result:first-child' },
  ],
};
```

Run it:

```bash
npm run capture capture/search.capture.mjs
npm run capture capture/search.capture.mjs -- --headed   # watch it drive
```

Outputs into `public/`: `search.webm` (the footage) and `search.timeline.json` (every action
with its timestamp and coordinates).

## Viewport consistency (why captures used to drift)

Playwright's `recordVideo` **scales video down to fit 800×800 by default**, so framing silently
changed per page and captures did not match each other. `capture.mjs` pins
`recordVideo.size` to the viewport, always. Set the viewport once in the script and every page
in the production is captured identically.

The same rule applies to screenshots: capture at the **viewport**, never `fullPage: true`.
A full-page screenshot's height follows the content, so each page yields a different aspect
ratio and the framing jumps between shots.

## Wiring the capture into the film

```ts
import { timelineToEvents } from './demo/timelineToEvents';
import timeline from '../public/search.timeline.json';

const events = timelineToEvents(timeline, {
  inset: [120, 120],           // where the recording sits on the canvas
  displaySize: [1680, 840],    // its displayed size there
  autoZoom: { scale: 1.8, leadS: 0.3, releaseAfterS: 1.6 },  // optional
});
```

Then use `<OffthreadVideo src={staticFile('search.webm')} />` as `source`. Pointer and ripples
now land exactly on the real interactions, in sync with the footage, with no coordinate
authoring at all.

`autoZoom` is **off by default on purpose**: zooming on every click is the "drifting camera"
anti-pattern from [camera-zoom.md](camera-zoom.md). Turn it on for quick drafts, then replace
it with deliberate `zoom` events for the final cut.

## Editing real footage

Real capture includes dead air — page loads, waits, your own script's settling delays. Trim it:

- Author beats against timestamps from the timeline (`markersOf()` gives the boundaries you
  marked).
- Use `<Sequence>`/`<Series>` or per-scene compositions to cut out the gaps between beats.
- Keep every frame where the product is *reacting*. Cut only the frames where nothing happens.

## Checklist

- [ ] Every interaction shown was really performed — no overlay-only clicks
- [ ] Typed text appears character by character, from real typing
- [ ] Scrolls are real wheel events, carrying the site's own motion
- [ ] Recording size is pinned to the viewport; all pages in the production match
- [ ] Pointer positions come from the capture timeline, not hand-authored guesses
- [ ] Any stylized effect was explicitly requested by the user
