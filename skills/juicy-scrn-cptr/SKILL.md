---
name: juicy-scrn-cptr
description: >-
  Create polished, Screen Studio-style product demo videos AND device-framed
  screenshots programmatically with Remotion, for desktop and mobile targets —
  animated cursor or touch gestures (tap/swipe/scroll/long-press), click ripples,
  dynamic auto-zoom/pan that follows the action, motion blur, subtle film grain,
  phone/browser device frames over a blurred-self backdrop, typewriter caption
  boxes, element-level UI choreography (staggered reveals, in-UI typing, highlight
  rings), and a director-grade script (roteiro). Drives motion from a declarative
  event timeline (or from a real tap/gesture log), so the whole video is code and
  re-renders headlessly with no manual editing. Handles landscape, square, and
  portrait (Reels/Shorts/app-store) cuts from one story. Use when asked to "create
  a product demo video", "screencast", "video de produto", "demo animation showing
  screens being used", "Screen Studio style", "animated cursor / clicks / zoom on
  a recording", "app demo video", "animate a component's parts", "present a
  component in isolation", "turn screenshots into a demo video", "mobile mockup
  screenshot", or "programmatic marketing video of an app".
---

# Juicy Scrn Cptr

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

Besides videos, the same stack produces **polished static screenshots** — a capture inside
the device/browser frame on the blurred backdrop, rendered as a single still
(`npx remotion still`). A mobile screenshot is always wrapped in the phone frame so it
visually reads as a device; same layer stack, no timeline needed.

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

1. **Background** — **default: a frame of the capture itself, scaled past the edges and
   heavily, diffusely blurred** (`<BlurBackdrop>`), with a light scrim. This ties the backdrop
   to the product's palette automatically and is what premium demos actually do. A solid /
   gradient / wallpaper backdrop only when the user asks for one. If the user opts out of a
   backdrop entirely, the capture renders **fullscreen and frameless** — no padding, no
   radius, no shadow, no bezel (`backdrop="none"`). Never let a framed recording touch the
   edges.
2. **Framed screen** — desktop: the recording inset with **generous padding** (6–10% of the
   canvas), **rounded corners** (16–28px), and a **soft, large drop shadow** (optionally
   browser chrome). Mobile: a **phone bezel** with correct radius, notch/island, and shadow.
   This one layer reads "premium" more than anything else
   ([references/devices-and-formats.md](references/devices-and-formats.md)).
3. **Camera** — a zoom/pan transform on the framed screen that **follows the action**
   (see [references/camera-zoom.md](references/camera-zoom.md)). Rest at 1.0×, punches in to
   1.6–2.2× on desktop — but only **1.0–1.4× on mobile**, where deeper crops the bezel and
   breaks the device illusion.
4. **Pointer** — desktop: a **modern, minimalist arrow** (slim, rounded joins, soft drop
   shadow) moving in **human arcs with a settle**, dwelling before clicking. Mobile: a **touch
   blob** that presses on contact and stays down through swipes. Both carry **motion blur** on
   fast moves ([references/cursor-and-clicks.md](references/cursor-and-clicks.md)).
5. **Interaction feedback** — an expanding ripple at the click/tap point, plus a brief **press
   dip on the pointer only**. A click never scales the framed screen — a whole-frame dip reads
   as the page bouncing, not as a tap ([references/cursor-and-clicks.md](references/cursor-and-clicks.md) §3).
6. **Captions / callouts** — short labels that enter a beat *after* the action, never before
   it. The box is **squared (no rounded corners), shadowed**, and enters by **expanding its
   width while the text types itself in, character by character, with no caret** (see
   "Caption identity" below).
7. **Film grain** — a subtle, animated, luminance-only grain over the **whole frame,
   captions included** (`<FilmGrain>`, on by default). Natural and restrained — noticeable
   on flat areas at 100%, never gritty — it is the finishing texture that separates
   award-site motion work from a sterile screen render. Turn it off only if the user asks.
8. **Audio (optional)** — soft bed music + subtle whoosh/click SFX via `<Audio>`.

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
- **The subject project's palette rules the frame.** Every element the production adds —
  caption accents, statement cards, custom backdrops, highlight rings — draws its colors from
  the palette of the product being demoed, not from this skill's defaults. Read the palette
  off the product's real UI (surface, text, brand accent) before authoring, and set
  `accent` in the caption/statement themes to the product's brand color. The blurred-self
  backdrop follows the palette automatically; anything hand-colored must too.
- **Rebuilt screens are replicas, not impressions.** When a screen is reconstructed to enable
  animation, its fidelity to the original must be maximal: render a still of the rebuild and
  compare it **side by side with a screenshot of the real system at the same viewport** —
  fonts, spacing, colors, radii, icons, shadows — and iterate until the pair is hard to tell
  apart. A demo of a screen that doesn't quite exist reads as fake instantly.

## Workflow

Copy and track this checklist:

```text
Demo video progress:
- [ ] Step 0a: Confirm production type — walkthrough, pitch, or UI story
- [ ] Step 0: Confirm target — desktop or mobile, aspect ratio, video or still screenshot
- [ ] Step 0b: Ask the user — caption/text font, and contrast (light | dark)
- [ ] Step 1: Write the roteiro (beats, order, one idea each, pacing)
- [ ] Step 2: Get the source (real recording, screenshots, or React-rebuilt screens)
- [ ] Step 3: Scaffold the Remotion project + drop in the toolkit components
- [ ] Step 4: Author the event timeline (pointer waypoints, gestures, zooms, captions)
- [ ] Step 5: Tune motion (spring configs, dwell, blur, camera follow)
- [ ] Step 6: Preview in Studio, then render headless
- [ ] Step 7: Validate against the taste checklist; iterate
```

0a. **Decide the production type.** **Walkthrough** (teach how it works — one continuous
   journey, captions labelling actions), **pitch** (sell why it matters — alternating
   statement card → demo proving it), or **UI story** (reconstructed UI, element-level
   choreography, no pointer — the premium hero-loop register)? They differ in structure,
   pacing, runtime and typography.
   See [references/production-types.md](references/production-types.md); ask if unstated.
0. **Decide the target.** Desktop or mobile? Landscape, square, or portrait? **Video or a
   static screenshot** (a framed still uses the same stack minus the timeline)? This changes
   beat count, zoom ceiling, caption size, and the pointer renderer — so settle it first.
   Table of formats in [references/devices-and-formats.md](references/devices-and-formats.md).
   Ask the user if unstated. If they want both, author the story once and the geometry twice
   (§4 there).
0b. **Ask the user two things before any production starts** (do not skip, do not assume):
   1. **Which font** should the capture's texts (captions, statement cards) use — offer the
      vetted families in [references/production-types.md](references/production-types.md)
      but accept any loadable family.
   2. **Which contrast — light or dark** — which themes the caption box: **light** → light
      beige surface with a soft dark pastel orange-brown text (Claude-like palette, gentle
      by design); **dark** → dark warm surface with warm off-white text. Tokens live in
      `CAPTION_THEMES` (`assets/template/src/demo/Caption.tsx`).
   Also confirm here if they want the default blurred-self backdrop or no backdrop
   (= fullscreen, frameless capture).
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
     components). Best for hero shots you punch deep into. **Fidelity is non-negotiable:**
     capture a reference screenshot of the real system first, rebuild against it, then render
     a still of the rebuild and compare the two side by side at the same viewport until fonts,
     spacing, colors, radii, icons and shadows match. Iterate before animating anything.
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
| `<DemoStage events source mode device backdrop contrast fontFamily grain>` | Top-level: composes backdrop → frame → camera → pointer → captions → grain from one `events` array. `mode="desktop" \| "mobile"`; `backdrop="blur"` (default) \| `"none"` (fullscreen frameless) \| custom node |
| `<BlurBackdrop>` | Default backdrop: the capture itself, over-scaled and heavily blurred, plus scrim |
| `<FilmGrain>` | Subtle animated luminance grain over the whole frame (top layer, on by default) |
| `<Screen>` | Desktop frame: background, padding, radius, shadow |
| `<DeviceFrame device>` | Mobile frame: phone bezel, radius, notch/island, shadow |
| `<Camera focus scale>` | Zoom/pan transform that keeps a focus point centered |
| `<Cursor>` | Desktop arrow pointer (modern, minimalist) with settle, arc, motion blur, click press dip |
| `<TouchPointer down>` | Mobile touch blob; presses on contact, stays down through drags |
| `<ClickRipple>` | Expanding ring at click/tap points (pairs with `useCursorPress`, which dips the pointer only) |
| `<Caption>` | Timed label: squared shadowed box that expands its width while the text types in (no caret) |
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

The caption box is a deliberate, recognizable object: **squared corners (no border radius),
no border, a soft shadow, and a vertical accent bar on the left edge** in the subject
project's brand color. It **enters by expanding its width left-to-right while the text is
revealed character by character, as if being typed — with no caret** (reveal speed:
`CAPTION_REVEAL_CPS`, 28 cps). Width and letters share one progress, so the box edge and the
last visible letter arrive together.

The colors come from the **contrast the user chose in Step 0b**; themes live in
`CAPTION_THEMES` (`assets/template/src/demo/Caption.tsx`); swap `accent` to the product's
brand color and leave the rest alone.

| Token | `light` | `dark` | Note |
|---|---|---|---|
| `surface` | `#F0EEE6` | `#262624` | Light beige / dark warm surface |
| `text` | `#8F5B3C` | `#F0EEE6` | Soft dark pastel orange-brown / warm off-white |
| `accent` | `#C96442` | `#C96442` | The left bar — swap for the project's brand color |
| `accentWidth` | `7px` | `7px` | Flush to the left edge, full height |
| radius | none | none | Squared corners are the identity — never round them |

The light theme's text contrast is deliberately gentle (Claude-like register). Because video
compression erodes fine text, **always confirm legibility on a rendered frame at the delivery
bitrate** — if a caption stops being readable at the target size, darken the text a step
rather than shrinking the font.

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

The typewriter reveal needs no extra term in the formula: it runs at 28 cps while reading runs
at 12 cps, so the reveal always finishes well inside the computed hold and the viewer reads
along as it types.

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
- **Edges:** a framed recording never reaches the canvas edge; padding/bezel, radius, and
  shadow are intact at every zoom level. (Fullscreen mode — user opted out of the backdrop —
  is the deliberate exception: edge-to-edge, no frame.)
- **Backdrop:** the default blurred-self backdrop is present and diffuse enough that no UI
  detail is recognizable in it; it never distracts from the framed capture.
- **Typewriter captions:** the box has squared corners and a shadow; width expansion and
  letter reveal stay in sync (scrub the entrance at 0.1×); no caret is visible.
- **Palette:** every added element (caption accent, statement cards, rings, custom backdrop)
  uses the subject project's palette — nothing ships with this skill's placeholder colors.
- **Replication fidelity:** for any rebuilt screen, the side-by-side against the real system's
  screenshot has been done and the differences resolved.
- **Film grain:** visible on a flat area at 100% zoom, invisible as "noise" at a glance —
  opacity ~0.04–0.06; it animates (not a frozen pattern) and covers captions too.
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
| [references/production-types.md](references/production-types.md) | **Step 0a:** walkthrough vs pitch vs UI story (element choreography), the statement-card structure, and the four vetted fonts (default: Inter) |
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
