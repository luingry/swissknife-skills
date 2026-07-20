---
name: screen-demo-video
description: >-
  Create polished, Screen Studio-style product demo videos programmatically with
  Remotion, for desktop AND mobile targets — animated cursor or touch gestures
  (tap/swipe/scroll/long-press), click ripples, dynamic auto-zoom/pan that follows
  the action, motion blur, phone/browser device frames, captions, and a
  director-grade script (roteiro). Drives motion from a declarative event timeline
  (or from a real tap/gesture log), so the whole video is code and re-renders
  headlessly with no manual editing. Handles landscape, square, and portrait
  (Reels/Shorts/app-store) cuts from one story. Use when asked to "create a product
  demo video", "screencast", "video de produto", "demo animation showing screens
  being used", "Screen Studio style", "animated cursor / clicks / zoom on a
  recording", "app demo video", "animate a component's parts", "present a component in isolation",
  "turn screenshots into a demo video", or
  "programmatic marketing video of an app".
---

# Screen Demo Video

Build product-demo videos that feel like they were captured with Screen Studio — a
recording (or synthetic screens) that **auto-zooms toward the action**, a **pointer
that moves like a hand**, **click/tap ripples**, motion blur, a framed canvas on a nice
background, and timed captions — except every frame is **React + Remotion**, driven by
a declarative timeline. Nothing is hand-edited in a video editor; it renders headlessly
and re-renders when the product changes.

Covers **desktop and mobile** targets: an arrow cursor in a browser/window frame, or a
touch blob with real gestures (tap, swipe, scroll, long-press) inside a phone bezel, in
landscape, square, or portrait. Same timeline schema either way — pick the mode and the
geometry. **Confirm the target format with the user before writing the roteiro** if it
isn't stated; a landing-page hero loop and a Reels cut are different films.

This skill exists because the "wow" is not the footage — it's the **choreography**:
where the camera looks, how the pointer arrives, when things breathe. Get that right and
even plain screenshots look premium. Get it wrong and a 4K capture looks robotic.

## When to use / not use

- **Use** for: marketing hero videos, landing-page loops, "how it works" walkthroughs,
  release announcements, social cuts (Reels/Shorts/TikTok), app-store previews — any
  "show the app being used" video, **desktop or mobile**, from a real screen recording
  **or** from static screenshots/React-rebuilt screens.
- **Not** for: recording the video in the first place from a live browser (that's the
  `ui-demo`/Playwright route — capture there, then compose here). Not for generic motion
  graphics with no "screen being operated" (use a plain Remotion setup). For pure UI
  micro-interaction motion in a real app, use `ui-animation`.

## The anatomy of the look (build every layer, in this order)

A Screen Studio-grade frame is a stack. Skipping a layer is why cheap versions look cheap.

1. **Background** — solid, gradient, or wallpaper. Never let the recording touch the edges.
2. **Framed screen** — desktop: the recording inset with **generous padding** (6–10% of the
   canvas), **rounded corners** (16–28px), and a **soft, large drop shadow** (optionally
   browser chrome). Mobile: a **phone bezel** with correct radius, notch/island, and shadow.
   This one layer reads "premium" more than anything else
   ([references/devices-and-formats.md](references/devices-and-formats.md)).
3. **Camera** — a zoom/pan transform on the framed screen that **follows the action**
   (see [references/camera-zoom.md](references/camera-zoom.md)). Rest at 1.0×, punches in to
   1.6–2.2× on desktop — but only **1.0–1.4× on mobile**, where deeper crops the bezel and
   breaks the device illusion.
4. **Pointer** — desktop: an arrow cursor moving in **human arcs with a settle**, dwelling
   before clicking. Mobile: a **touch blob** that presses on contact and stays down through
   swipes. Both carry **motion blur** on fast moves
   ([references/cursor-and-clicks.md](references/cursor-and-clicks.md)).
5. **Interaction feedback** — an expanding ripple at the click/tap point, plus an optional
   whole-frame "press" dip.
6. **Captions / callouts** — short labels that enter a beat *after* the action (spring +
   fade), never before it.
7. **Audio (optional)** — soft bed music + subtle whoosh/click SFX via `<Audio>`.

The copy-paste component library for all of this is in
[references/remotion-toolkit.md](references/remotion-toolkit.md).

## Director's principles (what makes it feel human, not generated)

These are non-negotiable taste rules. Most "AI-looking" demos violate 3+ of them.

- **One idea per beat.** Each beat demonstrates exactly one feature/action. If you can't
  name the beat in four words, split it.
- **Action first, label second.** Do the click, *then* the caption appears (~200–400ms
  later) to explain what just happened. Labeling before acting kills suspense and reads
  like a slideshow.
- **Zoom to intent, not decoration.** Punch in *because* something small needs attention
  (a toggle, a field), and pull out to re-establish context. A camera that drifts for no
  reason is nausea, not polish.
- **Let results breathe.** After an action lands, **hold 0.6–1.5s** so the eye can read
  the result. Dead-air-elimination is for the *gaps*, not the payoffs.
- **Motion has weight.** Everything moves on a **spring**, never linear. Fast moves get
  **motion blur**. Arrivals **settle** (a hair of overshoot), they don't snap.
- **The pointer leads the eye.** The viewer looks where the pointer goes, then where the
  camera frames. Move the pointer *first*, let the camera follow it — not the reverse.
- **Hands hesitate.** A real operator arrives at a target, pauses ~150ms, *then* acts.
  Clicking on arrival is the clearest machine tell there is.
- **Vary the rhythm.** Not every beat is the same length or the same zoom. Sameness is the
  tell. A human operator lingers on hard parts and breezes through obvious ones.
- **Cut dead air, keep reading time.** Trim idle mouse wandering and load spinners; keep
  every moment a viewer needs to actually read text (reading-time formula in the roteiro).
- **Everything lands on the grid.** Element placement, framing, and camera focus points snap to
  a 12×8 grid ([references/grid-system.md](references/grid-system.md)). The eye reads alignment
  as intent long before conscious attention, so misalignment reads as amateur even when a viewer
  cannot say why. The exceptions are coordinates that come from reality — real click points, and
  a replicated component's internal parts — where fidelity outranks tidiness.

## Workflow

Copy and track this checklist:

```text
Demo video progress:
- [ ] Step 0a: Confirm production type — walkthrough or pitch
- [ ] Step 0: Confirm target — desktop or mobile, and aspect ratio
- [ ] Step 1: Write the roteiro (beats, order, one idea each, pacing)
- [ ] Step 2: Get the source (real recording, screenshots, or React-rebuilt screens)
- [ ] Step 3: Scaffold the Remotion project + drop in the toolkit components
- [ ] Step 4: Author the event timeline (pointer waypoints, gestures, zooms, captions)
- [ ] Step 5: Tune motion (spring configs, dwell, blur, camera follow)
- [ ] Step 6: Preview in Studio, then render headless
- [ ] Step 7: Validate against the taste checklist; iterate
```

0a. **Decide the production type.** **Walkthrough** (teach how it works — one continuous
   journey, captions labelling actions) or **pitch** (sell why it matters — alternating
   statement card → demo proving it)? They differ in structure, pacing, runtime and typography.
   See [references/production-types.md](references/production-types.md); ask if unstated.
0. **Decide the target.** Desktop or mobile? Landscape, square, or portrait? This changes beat
   count, zoom ceiling, caption size, and the pointer renderer — so settle it first. Table of
   formats in [references/devices-and-formats.md](references/devices-and-formats.md). Ask the
   user if unstated. If they want both, author the story once and the geometry twice (§4 there).
1. **Roteiro first, always.** Do not open code until the script exists. Use
   [references/roteiro-and-pacing.md](references/roteiro-and-pacing.md) to lay out beats,
   order them, assign each a duration, and write caption copy. The script is a table the
   user can approve before any rendering. **Ask the user for the feature list / the story**
   if it isn't obvious from the project.
2. **Capture the interaction — for real.** Default to `npm run capture <script>.capture.mjs`,
   which drives a **real browser** through a **real interaction script** with Playwright and
   records it, emitting a timeline of every action with timestamps and coordinates. Clicking an
   input really focuses it, typing really appears character by character, scrolling carries the
   site's real momentum and scroll-triggered animations. The overlay cursor is then driven by
   that timeline, so it lands exactly where the real pointer went — no coordinate guessing.
   Recording size is **pinned to the viewport** so every page in a production is framed
   identically. **Never fake an interaction with an overlay on a static screenshot** unless the
   user explicitly asked for a stylized effect. See
   [references/interaction-fidelity.md](references/interaction-fidelity.md).

   Lower-fidelity fallbacks, when real capture is impossible:
   - **React-rebuilt screens** (crispest — vector at any zoom; rebuild the key UI states as
     components). Best for hero shots you punch deep into.
   - **Real screen recording** via `<OffthreadVideo>` (most authentic; some softness at high
     zoom — keep punches ≤1.8× or record at 2× resolution).
   - **Static screenshots** as `<Img>` (simplest; combine with camera moves to add life).

   See [references/setup-and-render.md](references/setup-and-render.md) for how to capture each
   (adb for Android, simctl for iOS, Playwright for web, high-DPI export).
3. **Scaffold by copying, never by transcribing.** `cp -r <skill>/assets/template <project>`
   then `npm install`. The template is the engine (all components, hooks, the verify script,
   pinned deps); `src/Root.tsx` is the only file you edit. Retyping the code listings out of
   the toolkit reference is slow, burns context, and introduces bugs — that is exactly what
   the template exists to prevent. See [references/fast-workflow.md](references/fast-workflow.md).
4. **Author the timeline.** The declarative `DemoEvent[]` *is* the roteiro made executable
   (schema + full example in the toolkit reference). One array drives cursor, camera,
   clicks, and captions on a shared clock, so they stay in sync by construction.
5. **Tune.** Apply [references/camera-zoom.md](references/camera-zoom.md) and
   [references/cursor-and-clicks.md](references/cursor-and-clicks.md). This is where good
   becomes great — springs, dwell, blur, follow.
6. **Verify with checkpoints, then render.** `node scripts/verify.mjs --sheet` renders one
   still per beat from a **single** bundle and a **single** browser, tiled into one image —
   the naive `npx remotion still` loop re-bundles and relaunches Chromium every call, which is
   where hours disappear. Then `npm run draft` (0.35 scale) to watch it, and `npm run final`
   only when the checkpoints look right. Rendering is headless — **no device or display
   needed**, which suits VM/CI.
7. **Validate** with the checklist below and re-render. Iterate on the *timeline*, not the
   components.

## Quick component reference

From [references/remotion-toolkit.md](references/remotion-toolkit.md) — drop-in, timeline-driven:

| Component / hook | Role |
|---|---|
| `<DemoStage events source mode device>` | Top-level: composes background → frame → camera → pointer → captions from one `events` array. `mode="desktop" \| "mobile"` |
| `<Screen>` | Desktop frame: background, padding, radius, shadow |
| `<DeviceFrame device>` | Mobile frame: phone bezel, radius, notch/island, shadow |
| `<Camera focus scale>` | Zoom/pan transform that keeps a focus point centered |
| `<Cursor>` | Desktop arrow pointer with settle, arc, motion blur |
| `<TouchPointer down>` | Mobile touch blob; presses on contact, stays down through drags |
| `<ClickRipple>` | Expanding ring + optional frame press on click/tap events |
| `<Caption>` | Timed label, spring-in / clean-out |
| `useCursorPosition(events)` | Current pointer x/y (spring between waypoints + arc) |
| `useCamera(events)` | Current `{scale, focus}` (spring between zoom keyframes) |
| `normalizeEvents(events)` | Expands `swipe`/`scroll`/`longPress` into waypoints + contact intervals |
| `useContactState(events)` | Is the finger down right now (drives `<TouchPointer>`) |

## Motion defaults (shared with `ui-animation`)

Use springs, not fixed beziers, for anything that should feel physical. Reach for these
Remotion `spring()` configs (all with `fps` from `useVideoConfig`):

| Purpose | `spring` config | Notes |
|---|---|---|
| Cursor travel | `{ damping: 26, stiffness: 120, mass: 1 }` | Gentle arrival, tiny settle |
| Camera zoom in | `{ damping: 30, stiffness: 90, mass: 1 }` | Weighty, decisive punch-in |
| Camera zoom out | `{ damping: 40, stiffness: 70, mass: 1 }` | Slower, calmer release |
| Caption / callout enter | `{ damping: 22, stiffness: 140, mass: 0.8 }` | Small overshoot, lively |
| Click ripple | `interpolate` + `Easing.out(Easing.ease)` | One-shot, not a spring |

## Caption identity and reading time

Captions use a **light surface with soft-dark text and a vertical accent bar on the left edge**
— a deliberate, recognizable object rather than a generic dark pill. Defaults live in
`CAPTION_THEME` (`assets/template/src/demo/Caption.tsx`); change `accent` to the product's
brand color and leave the rest alone.

| Token | Value | Note |
|---|---|---|
| `surface` | `#FAF9F6` | Warm off-white |
| `text` | `#2E2E38` | Soft dark, not pure black |
| `accent` | `#5B4BE8` | The left bar — swap per brand |
| `accentWidth` | `7px` | Flush to the left edge, full height |
| `radius` | `12px` | Box clips the bar's corners |

Contrast lands around 11:1 — well past WCAG AA's 4.5:1 while still reading as gentle rather
than stark. **Do not soften it further:** video compression eats fine text contrast, so
on-screen text needs *more* margin than a web page, not less.

**Hold duration is computed, never guessed** (`captionHoldSeconds`, `readingTime.ts`):

```
hold = max(3.0s, 0.4s + chars / 12 + 0.3s)
```

Modeled in **characters per second**, the subtitle-industry standard — more robust across
languages than words-per-minute, since Portuguese and German words run much longer than
English ones. 12 cps is deliberately conservative (Netflix permits 17 cps for adults, 13 for
children); the headroom pays for **split attention**, because a demo caption competes with the
UI it describes, which pure silent-reading figures (~238 wpm, Brysbaert 2019) never account
for. The **3.0s floor** dominates short captions — below it, text reads as a flash no matter
how few words it has. Captions auto-expire on this timer, so `caption: null` is only needed to
clear one early; `captionHold` overrides it when you really must.

Use `captionBudgetSeconds([...])` while writing the roteiro to confirm the caption load fits
the target runtime **before** building the timeline. Standard beat pacing and the full timing
model are in the roteiro reference.

## Validation (produce evidence, not "looks good")

- **Taste pass:** re-read the Director's principles; name any beat that violates one and fix it.
- **Springs only:** grep the timeline/components for `linear` easing on pointer/camera — there
  should be none (ripples/opacity fades excepted).
- **Dwell:** confirm a 120–250ms pause exists before *every* click; machines click on arrival.
- **Reading time:** every caption satisfies the reading-time formula; pause the render on each
  caption frame and confirm it's actually legible at the target size for the format.
- **Follow order:** on each beat, confirm the pointer moves *before* the camera settles and
  *before* the caption appears.
- **Breathe:** confirm ≥0.6s hold after each payoff; confirm idle wandering is trimmed.
- **Blur on fast moves:** scrub a fast pointer move at 0.1× and confirm motion blur/trail is
  present; static holds have none.
- **Edges:** the recording never reaches the canvas edge; padding/bezel, radius, and shadow are
  intact at every zoom level.
- **Mobile-specific:** no arrow cursor anywhere; the touch blob stays *down* for the whole
  swipe/scroll; zoom never crops the bezel away; captions sit outside the phone; no personal
  data visible in a real device's status bar.
- **Muted cold watch:** view once at full speed with no audio — the story must land on motion
  and on-screen UI alone.
- **Reduced-motion variant (if the video is embedded interactively):** offer a shorter,
  lower-amplitude cut or a poster frame.

## Reference files

| File | Read when |
|---|---|
| **`assets/template/`** | **The runnable engine — copy it, don't retype it.** Validated end to end: typecheck clean, renders, `scripts/capture.mjs` (real interaction) and `scripts/verify.mjs` (fast checkpoints) both proven. You edit only `src/Root.tsx` |
| [references/production-types.md](references/production-types.md) | **Step 0a:** walkthrough vs pitch, the statement-card structure, and the four vetted fonts (default: Inter) |
| [references/interaction-fidelity.md](references/interaction-fidelity.md) | **Capture:** why interaction must be real, the capture-script format, viewport pinning, wiring a capture timeline into the film |
| [references/transitions.md](references/transitions.md) | Composition-to-composition transitions: `softCut` (default), `containerZoom`, `circleReveal`, `slidePush` — and when each applies |
| [references/component-replication.md](references/component-replication.md) | **Presenting a component in isolation:** extract a real component into independently-animatable parts, then stagger / morph / ripple them |
| [references/grid-system.md](references/grid-system.md) | The standing grid directive: what snaps, what must not, and why alignment carries so much perceived quality |
| [references/fast-workflow.md](references/fast-workflow.md) | **Read before building.** Where the time actually goes: template vs hand-scaffolding, bundle-once verification, coordinate grid, draft scale, scene chunking for long videos |
| [references/devices-and-formats.md](references/devices-and-formats.md) | **Step 0:** choosing desktop vs mobile, aspect ratio, phone/browser frames, gesture vocabulary, caption sizing, safe areas, sharing one roteiro across both |
| [references/roteiro-and-pacing.md](references/roteiro-and-pacing.md) | Writing the script: beat structure, ordering, durations, reading-time model, caption copy, storyboard table |
| [references/camera-zoom.md](references/camera-zoom.md) | Choreographing the auto-zoom: when/how much to punch in, anchor math, follow-the-action algorithm, settle |
| [references/cursor-and-clicks.md](references/cursor-and-clicks.md) | Making the pointer human: arcs, dwell, overshoot, ripple + press, mobile gestures, typing, motion blur |
| [references/remotion-toolkit.md](references/remotion-toolkit.md) | Building it: full copy-paste component library (desktop + mobile), `DemoEvent` schema, complete example compositions |
| [references/setup-and-render.md](references/setup-and-render.md) | Project scaffold, sourcing footage/screenshots (adb/simctl/Playwright/high-DPI), coordinate mapping, audio, render commands, headless/CI, web delivery |

## Related skills

- `ui-animation` — spring physics, easing curves, reverse-engineering motion from a recording.
  The motion vocabulary here is shared with it; consult it for curve-fitting a reference clip.
- `ui-demo` (Playwright, external) — *records* a live web app to video. Capture there, then
  compose/polish here.
- `frontend-design` / `ui-design` — visual direction for React-rebuilt screens and captions.
