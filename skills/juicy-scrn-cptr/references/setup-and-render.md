# Setup, Sourcing & Rendering

## 1. Scaffold the project

```bash
npm create video@latest        # choose the "Blank" template
cd <project>
npm i @remotion/motion-blur
```

Layout:

```
src/
  index.ts                 # registerRoot(RemotionRoot)
  Root.tsx                 # <Composition> registrations (desktop + mobile)
  demo/
    types.ts               # DemoEvent, Vec
    useCursorPosition.ts
    useCamera.ts
    normalizeEvents.ts     # gesture expansion + contact state
    Screen.tsx  Camera.tsx  Cursor.tsx  TouchPointer.tsx
    DeviceFrame.tsx  ClickRipple.tsx  Caption.tsx  DemoStage.tsx
    beats.ts               # shared story
    timeline.desktop.ts    # geometry for landscape
    timeline.mobile.ts     # geometry for portrait
public/
  recording.mp4            # referenced via staticFile()
```

Media goes in `public/` and is referenced with `staticFile('recording.mp4')` — not an import
and not a relative path.

## 2. Sourcing the pixels

Three sources, trading authenticity against zoom fidelity. Pick per-beat if you like — hero
shots can be React while context shots are real footage.

### a) Real screen recording (most authentic)

Play it with `<OffthreadVideo>` (not `<Video>`) — it's the frame-accurate, render-correct
choice for compositions.

**Android:**
```bash
adb shell screenrecord --size 1080x2340 --bit-rate 12000000 /sdcard/cap.mp4
# Ctrl-C to stop, then:
adb pull /sdcard/cap.mp4 public/phone-capture.mp4
```
Note `screenrecord` caps around 3 minutes and won't capture at above-native resolution — record
the highest the device supports if you plan to punch in.

**iOS:** QuickTime (device connected) or the built-in screen recorder; `xcrun simctl io booted recordVideo out.mp4` for a simulator.

**Web/desktop:** a real recorder (Screen Studio, OBS) at **2× / high-DPI**, or Playwright's
video recording for a scripted, repeatable capture (that's the `ui-demo` skill's territory —
capture there, compose here).

**Always record at ≥ the resolution you'll punch to.** A 1× capture punched to 2× is mush.

### b) React-rebuilt screens (crispest)

Rebuild the key UI states as React components rendered directly in the composition. Vector at
any zoom, no capture step, trivially re-themeable, and you can animate the app's own UI. Best
for deep punches and hero shots. Cost: you're maintaining a replica — keep it to the 2–3 screens
that matter, and diff it against the real UI before shipping so the video doesn't advertise
something that doesn't exist.

### c) Static screenshots (simplest)

`<Img src={staticFile('screen-1.png')} />` plus camera movement. Surprisingly effective: a slow
push across a still screenshot with a cursor and a click ripple reads as a demo. Capture with
`adb exec-out screencap -p > shot.png` (Android), `xcrun simctl io booted screenshot` (iOS), or
Playwright `page.screenshot({ scale: 'css' })` at `deviceScaleFactor: 2`.

## 3. Coordinate mapping

`Vec` values are **composition pixels** on the full canvas. When the source is inset (by
`<Screen>` padding or a `<DeviceFrame>` bezel), an on-screen point maps as:

```
composition_x = inset_x + (source_x / source_width)  × displayed_width
composition_y = inset_y + (source_y / source_height) × displayed_height
```

> **This formula only holds when the source fills the display box exactly** — i.e.
> `objectFit: 'fill'`, or a capture whose aspect ratio already matches the frame. Every
> toolkit example uses `objectFit: 'cover'`, which **crops and offsets** when the ratios
> differ, silently shifting every coordinate. Web-page screenshots are usually far taller
> than a 16:9 frame, so a centered `cover` can crop the header and search bar off the top
> entirely — set `objectPosition: 'top'` and account for the crop, or capture at the frame's
> aspect ratio and use `fill`. Verify by rendering one still and checking the pointer lands
> on the intended element before authoring the rest of the timeline.

Write a tiny helper rather than doing this by hand per event:

```ts
const mapToCanvas = (p: Vec, inset: Vec, srcSize: Vec, dispSize: Vec): Vec => [
  inset[0] + (p[0] / srcSize[0]) * dispSize[0],
  inset[1] + (p[1] / srcSize[1]) * dispSize[1],
];
```

**Best path: data-driven.** If the app can log real taps (`timestamp, x, y`) during the capture,
transform that log straight into `DemoEvent[]` — device px → composition px via `mapToCanvas`,
device time → `at` relative to recording start. Pointer and ripples then land exactly on the
real touches, with zero manual placement and perfect sync with the footage. Any app with an
input/gesture layer can emit this; it's an afternoon of work that removes the most tedious part
of the whole process.

Otherwise: scrub in Studio, read positions visually, iterate. Fine for a handful of beats.

## 4. Preview

```bash
npx remotion studio
```

Scrub the timeline, tweak `DemoEvent`s, hot-reload. Do all choreography tuning here — rendering
to check timing is slow and unnecessary.

## 5. Render

```bash
# Desktop cut
npx remotion render src/index.ts DemoDesktop out/demo-desktop.mp4

# Mobile cut
npx remotion render src/index.ts DemoMobile out/demo-mobile.mp4

# Higher quality / transparency / GIF
npx remotion render src/index.ts DemoDesktop out/demo.mp4 --crf=16
npx remotion render src/index.ts DemoDesktop out/demo.webm --codec=vp8
npx remotion render src/index.ts DemoDesktop out/demo.gif --codec=gif --every-nth-frame=2
```

Useful flags: `--crf` (quality, lower = better, 16–20 for marketing), `--scale` (render at 2× for
a downsampled-crisp result), `--concurrency`, `--frames=0-120` (render a slice while iterating).

**Headless:** Remotion renders through its own headless Chromium — **no display, no device, no
emulator required**. It works in a VM or CI. If Chrome isn't present it downloads one; in CI
call `npx remotion browser ensure` in a setup step. On bare Linux images install the usual
Chromium shared libs (`libnss3`, `libatk-1.0-0`, `libgbm1`, …) or the render fails at launch
with a missing-library error.

## 6. Web delivery

For a landing page (the pattern Replit and most SaaS sites use):

```html
<video src="/demo.mp4" autoplay loop muted playsinline
       class="w-full h-full object-cover" preload="metadata"></video>
```

`muted` + `playsinline` are **required** for autoplay on iOS and most browsers. Encode:

- **H.264 MP4** for universal support; add a **WebM/VP9** source for smaller files where supported.
- Target **≤2–3 MB** for a hero loop — `--crf=23` plus a short runtime usually gets there.
- Serve a **poster** frame so nothing pops in: `--frames=0-0` renders frame 0 to an image.
- Consider `preload="metadata"` (not `auto`) so the loop doesn't fight the page's LCP.

## 7. Audio

```tsx
import { Audio, staticFile, Sequence } from 'remotion';

<Audio src={staticFile('bed.mp3')} volume={0.22} />
<Sequence from={clickFrame} durationInFrames={20}>
  <Audio src={staticFile('click.mp3')} volume={0.12} />
</Sequence>
```

Only licensed audio. If the video autoplays muted on a landing page, skip audio entirely.

## 8. Iteration loop

1. Change the **timeline** (`DemoEvent[]`), not the components — the components are the engine,
   the timeline is the film.
2. Scrub in Studio at 0.1× through each beat.
3. Run the validation checklists in [camera-zoom.md](camera-zoom.md) and
   [cursor-and-clicks.md](cursor-and-clicks.md).
4. Render a slice (`--frames`) to confirm quality, then the full cut.
5. Watch it **once at full speed, muted, cold** — the way a real viewer will. That pass catches
   pacing problems that frame-by-frame scrubbing hides.

## 9. Common failures

| Symptom | Cause | Fix |
|---|---|---|
| Video plays but pointer is out of sync | Timeline `at` is in seconds; frames assumed | Confirm `Math.round(at * fps)` conversion; check composition `fps` matches source |
| Blurry at zoom | Source resolution below punch level | Record higher, cap zoom, or rebuild in React |
| Pointer drifts off the target under zoom | Pointer rendered outside `<Camera>` | Pointer must be **inside** `<Camera>`, captions outside |
| Frame shows background bleed at high zoom | Focus point too near the edge | Clamp focus (see camera-zoom.md §4) |
| Motion blur on static holds | Blur applied to a layer that's transformed every frame | Wrap only the moving scene; check for a per-frame transform on a "static" layer |
| Render fails in CI at browser launch | Missing Chromium libs | Install shared libs; `npx remotion browser ensure` |
| Audio out of sync after render | Variable-frame-rate source | Re-encode the capture to CFR before importing |
| Mobile capture has personal data in status bar | Real device capture | Crop or overlay a neutral status bar before publishing |
