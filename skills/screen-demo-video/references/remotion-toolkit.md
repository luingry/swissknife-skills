# Remotion Toolkit — how the engine works

> **Do not retype this code.** The runnable engine lives in **`assets/template/`** — copy the
> folder and run `npm install` ([fast-workflow.md](fast-workflow.md) §1). Transcribing these
> listings into files is the single slowest step in building a demo and the main source of
> typecheck bugs.
>
> This file explains the **design and the invariants** so you can author timelines correctly
> and debug the engine when something looks wrong. Where a listing here differs from the
> template, **the template wins** — notably `Caption`, which the template renders as a light
> surface with a left accent bar and an auto-computed hold (see `readingTime.ts`).

A small, cohesive set of components + hooks that produce the Screen Studio look from **one
declarative `DemoEvent[]` timeline**. Everything is driven by a shared clock, so pointer,
camera, clicks, and captions stay in sync by construction.

**Template layout** (`assets/template/`):

| Path | Contents |
|---|---|
| `src/demo/types.ts` | `DemoEvent`, `Vec` |
| `src/demo/useCursorPosition.ts` | Pointer motion (distance-derived travel, arc, hold) |
| `src/demo/useCamera.ts` | Zoom/pan springs, focus clamp |
| `src/demo/normalizeEvents.ts` | Gesture expansion + contact state |
| `src/demo/Stage.tsx` | `DemoStage`, `Screen`, `DeviceFrame`, `Camera`, `Cursor`, `TouchPointer`, `ClickRipple`, `SourceSwap`, `CoordinateGrid` |
| `src/demo/Caption.tsx` | Caption box + `CAPTION_THEME` |
| `src/demo/readingTime.ts` | `captionHoldSeconds`, `captionBudgetSeconds` |
| `src/Root.tsx` | **The film — the only file you edit** |
| `scripts/verify.mjs` | Bundle-once checkpoint renderer |

> API note: written against Remotion v4 APIs (`useCurrentFrame`, `useVideoConfig`,
> `interpolate`, `spring`, `Easing`, `AbsoluteFill`, `OffthreadVideo`, `Img`, `staticFile`,
> `Sequence`, `Audio`) and `@remotion/motion-blur`. These are stable, but if the project
> pins a different major, verify names at remotion.dev before assuming.

---

## 1. The timeline type — `DemoEvent`

The single source of truth. Times are in **seconds** (the toolkit converts to frames using
the composition `fps`). One array expresses the whole roteiro.

```ts
// src/demo/types.ts
export type Vec = [number, number]; // [x, y] in composition pixels (the full canvas)

export type DemoEvent = {
  /** Seconds from the start of the composition. */
  at: number;

  /** Move the pointer to this point (spring-eased, human arc). Omit to hold.
   *  Desktop = arrow cursor; mobile = touch blob. Same field, different renderer. */
  cursor?: Vec;

  /** Register a tap/click at this point → ripple + optional frame "press". */
  click?: Vec;

  /** Mobile gestures. `swipe` drags from the current pointer position to `to`
   *  with the contact held down; `scroll` is a swipe whose payload is the
   *  content offset; `longPress` holds in place for `holdMs`. */
  swipe?: { to: Vec; holdMs?: number };
  scroll?: { to: Vec };
  longPress?: { at: Vec; holdMs: number };
  pinch?: { at: Vec; from: number; to: number };

  /** Change the camera. `scale` 1 = rest; `to` = focus point kept centered. */
  zoom?: { scale?: number; to?: Vec };

  /** Show/replace the caption. Pass null to clear it. */
  caption?: string | null;

  /** Anchor a caption near a point instead of the default lower-third. */
  captionAt?: Vec;
};
```

**Desktop vs mobile:** the timeline schema is identical; what changes is the **pointer
renderer** (`<Cursor>` vs `<TouchPointer>`), the **frame** (browser/window chrome vs phone
bezel), and which gesture fields you use. Pick the mode once at the `<DemoStage>` level via
`mode="desktop" | "mobile"`. See [devices-and-formats.md](devices-and-formats.md).

**Authoring rule:** keep events time-ordered. A typical beat is a run of 4–6 events:
`cursor` (move) → `zoom` (punch in, same target) → `click` → `caption` (a beat later) →
`zoom` (pull out). See the full example at the bottom.

### Timeline semantics — read this before authoring

`at` is a **trigger**, not a keyframe. `{ at: 1.5, zoom: { scale: 1.9 } }` means *"start the
punch at 1.5s"* — **not** *"be at 1.9× by 1.5s"*. Each transition then runs for its own fixed
length and **holds** until the next trigger:

| Transition | Length | Source |
|---|---|---|
| Cursor travel | 0.3s / 0.5s / 0.7s by distance | `useCursorPosition` |
| Zoom in | 0.7s (`ZOOM_IN_S`) | `useCamera` |
| Zoom out | 0.9s (`ZOOM_OUT_S`) | `useCamera` |

Two consequences that make authoring predictable:

- **Holds are automatic.** Leaving a 3s gap after a punch-in means the camera punches for
  0.7s and then sits perfectly still for 2.3s — which is exactly what the "camera must be
  motionless during the result" rule requires. You do **not** repeat keyframes to hold.
- **Dwell is automatic.** The pointer arrives early and waits, so `cursor` at 1.1s followed by
  `click` at 1.9s gives a real dwell. Repeating a waypoint is still fine when you want to
  document the pause explicitly.

If you ever see a slow continuous drift where you wanted a hold, the cause is a spring being
given the whole inter-event gap as its `durationInFrames` — see the CRITICAL comments in both
hooks. That was a real bug in an earlier version of this toolkit, caught in end-to-end testing.

---

## 2. Cursor position — `useCursorPosition`

Springs between waypoints and adds a **subtle arc** so travel reads like a hand, not a
linear tween.

```ts
// src/demo/useCursorPosition.ts
import { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import type { DemoEvent, Vec } from './types';

export function useCursorPosition(events: DemoEvent[]): { x: number; y: number } {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  const points = useMemo(
    () =>
      events
        .filter((e) => e.cursor)
        .map((e) => ({ frame: Math.round(e.at * fps), pos: e.cursor as Vec })),
    [events, fps],
  );

  if (points.length === 0) return { x: 0, y: 0 };
  if (frame <= points[0].frame) return { x: points[0].pos[0], y: points[0].pos[1] };

  // TRIGGER semantics: `{ at: T, cursor: P }` means "START moving toward P at T",
  // not "be at P by T". Find the most recent waypoint whose trigger has fired.
  let idx = 0;
  for (let k = 0; k < points.length; k++) if (frame >= points[k].frame) idx = k;

  const target = points[idx];
  const from = idx > 0 ? points[idx - 1].pos : target.pos;

  const dx = target.pos[0] - from[0];
  const dy = target.pos[1] - from[1];
  const dist = Math.hypot(dx, dy);
  if (dist === 0) return { x: target.pos[0], y: target.pos[1] };

  // CRITICAL: the move takes a *distance-derived* duration, then HOLDS until the next
  // trigger. Never pass "the gap to the next event" as durationInFrames — Remotion
  // stretches the spring across whatever duration you give it, so a long gap becomes one
  // slow continuous drift instead of "move, arrive, wait". Holding after arrival is also
  // what produces the dwell before a click, for free.
  const frac = dist / width;
  const travelS = frac < 0.15 ? 0.3 : frac < 0.4 ? 0.5 : 0.7; // cursor-and-clicks.md §1
  const gapToNext = idx + 1 < points.length ? points[idx + 1].frame - target.frame : Infinity;
  const durFrames = Math.max(1, Math.min(Math.round(travelS * fps), gapToNext));

  const local = frame - target.frame;
  const t = spring({ frame: local, fps, durationInFrames: durFrames, config: { damping: 26, stiffness: 120, mass: 1 } });

  const x = interpolate(t, [0, 1], [from[0], target.pos[0]]);
  const y = interpolate(t, [0, 1], [from[1], target.pos[1]]);

  // Subtle perpendicular arc, peaking mid-travel, capped so long moves don't swoop.
  const arc = Math.sin(Math.min(Math.max(t, 0), 1) * Math.PI) * Math.min(dist * 0.06, 40);
  const nx = -dy / dist; // unit normal
  const ny = dx / dist;

  return { x: x + nx * arc, y: y + ny * arc };
}
```

---

## 3. Camera state — `useCamera`

Springs between zoom keyframes. Returns `{ scale, focus }`; the `<Camera>` component turns
that into a transform that keeps `focus` centered. Zoom-in and zoom-out use **different**
spring configs (decisive in, calmer out).

```ts
// src/demo/useCamera.ts
import { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import type { DemoEvent, Vec } from './types';

type Key = { frame: number; scale: number; focus: Vec };

const ZOOM_IN_S = 0.7;   // punch-in transition length
const ZOOM_OUT_S = 0.9;  // release is slower/calmer (see camera-zoom.md §5)

/** Keep the framed screen filling the canvas — never let background bleed in at high zoom. */
function clampFocus(focus: Vec, scale: number, width: number, height: number): Vec {
  if (scale <= 1) return [width / 2, height / 2];
  const halfW = width / (2 * scale);
  const halfH = height / (2 * scale);
  return [
    Math.min(Math.max(focus[0], halfW), width - halfW),
    Math.min(Math.max(focus[1], halfH), height - halfH),
  ];
}

export function useCamera(events: DemoEvent[]): { scale: number; focus: Vec } {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const keys = useMemo<Key[]>(() => {
    const out: Key[] = [];
    let scale = 1;
    let focus: Vec = [width / 2, height / 2];
    for (const e of events) {
      if (!e.zoom) continue;
      if (e.zoom.scale != null) scale = e.zoom.scale;
      if (e.zoom.to) focus = e.zoom.to;
      out.push({ frame: Math.round(e.at * fps), scale, focus: clampFocus(focus, scale, width, height) });
    }
    if (out.length === 0 || out[0].frame > 0) {
      out.unshift({ frame: 0, scale: 1, focus: [width / 2, height / 2] });
    }
    return out;
  }, [events, fps, width, height]);

  if (frame <= keys[0].frame) return { scale: keys[0].scale, focus: keys[0].focus };

  // TRIGGER semantics, same as the cursor: `{ at: T, zoom: {...} }` means "START the
  // move at T". Find the most recent keyframe whose trigger has fired.
  let idx = 0;
  for (let k = 0; k < keys.length; k++) if (frame >= keys[k].frame) idx = k;

  const target = keys[idx];
  const from = idx > 0 ? keys[idx - 1] : target;
  if (target.scale === from.scale && target.focus === from.focus) {
    return { scale: target.scale, focus: target.focus };
  }

  const zoomingIn = target.scale >= from.scale;
  const config = zoomingIn
    ? { damping: 30, stiffness: 90, mass: 1 }
    : { damping: 40, stiffness: 70, mass: 1 };

  // CRITICAL: fixed transition length, then HOLD until the next trigger.
  // Stretching the spring over the gap to the next keyframe is what turns a punch-in
  // plus a release 3s later into one continuous 3s drift — leaving the camera still
  // moving during the click, which breaks the whole beat.
  const gapToNext = idx + 1 < keys.length ? keys[idx + 1].frame - target.frame : Infinity;
  const durFrames = Math.max(1, Math.min(Math.round((zoomingIn ? ZOOM_IN_S : ZOOM_OUT_S) * fps), gapToNext));

  const local = frame - target.frame;
  const t = spring({ frame: local, fps, durationInFrames: durFrames, config });
  const scale = interpolate(t, [0, 1], [from.scale, target.scale]);
  const fx = interpolate(t, [0, 1], [from.focus[0], target.focus[0]]);
  const fy = interpolate(t, [0, 1], [from.focus[1], target.focus[1]]);
  return { scale, focus: [fx, fy] };
}
```

---

## 4. Framed screen — `<Screen>`

The premium container: background, padding, radius, shadow. Put the recording/screens inside.

```tsx
// src/demo/Screen.tsx
import React from 'react';
import { AbsoluteFill } from 'remotion';

export const Screen: React.FC<{
  children: React.ReactNode;
  background?: React.ReactNode;
  padding?: number;   // px inside the canvas before the frame starts
  radius?: number;
}> = ({ children, background, padding = 120, radius = 24 }) => (
  <AbsoluteFill>
    {/* Background layer */}
    <AbsoluteFill>
      {background ?? (
        <AbsoluteFill style={{ background: 'linear-gradient(135deg,#1b1030 0%,#0b1030 55%,#04122a 100%)' }} />
      )}
    </AbsoluteFill>

    {/* Framed screen */}
    <AbsoluteFill style={{ padding, boxSizing: 'border-box' }}>
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: radius,
          overflow: 'hidden',
          boxShadow: '0 40px 120px rgba(0,0,0,0.55), 0 8px 24px rgba(0,0,0,0.35)',
          background: '#000',
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  </AbsoluteFill>
);
```

---

## 5. Camera wrapper — `<Camera>`

Applies the zoom/pan so `focus` maps to the canvas center. Math: with
`transform-origin: 0 0` and `translate(t) scale(s)`, a point `p` maps to `p·s + t`; to put
`focus` at center, `t = center − focus·s`.

```tsx
// src/demo/Camera.tsx
import React from 'react';
import { AbsoluteFill, useVideoConfig } from 'remotion';
import type { Vec } from './types';

export const Camera: React.FC<{ scale: number; focus: Vec; children: React.ReactNode }> = ({
  scale, focus, children,
}) => {
  const { width, height } = useVideoConfig();
  const tx = width / 2 - focus[0] * scale;
  const ty = height / 2 - focus[1] * scale;
  return (
    <AbsoluteFill style={{ transformOrigin: '0 0', transform: `translate(${tx}px, ${ty}px) scale(${scale})` }}>
      {children}
    </AbsoluteFill>
  );
};
```

> The camera transform is applied to the framed screen **and** the cursor together (they
> share one coordinate space), so the pointer stays glued to the pixel it's over while the
> camera moves. In the example below, `<Cursor>` lives inside `<Camera>` for this reason.

---

## 6. Cursor — `<Cursor>` (with motion blur)

Renders an SVG pointer at the live position, scales down briefly on nearby clicks (the
"tap"), and blurs on fast moves. Two blur strategies — pick one:

- **Preferred:** wrap the whole moving scene in `<CameraMotionBlur>` from
  `@remotion/motion-blur` (directional blur from real per-frame movement).
- **Fallback (always works):** the manual trail below — a few ghost copies sampled from the
  last N frames with decaying opacity. Use if you don't want scene-wide blur.

```tsx
// src/demo/Cursor.tsx
import React from 'react';
import { AbsoluteFill } from 'remotion';

const Pointer: React.FC<{ scale?: number }> = ({ scale = 1 }) => (
  // Classic arrow; hotspot at (0,0) = the tip.
  <svg width={28} height={28} viewBox="0 0 28 28" style={{ transform: `scale(${scale})`, transformOrigin: '0 0' }}>
    <path d="M2 2 L2 22 L7.5 16.5 L11 24 L14.5 22.5 L11 15 L18 15 Z"
      fill="#fff" stroke="rgba(0,0,0,0.5)" strokeWidth={1.2} strokeLinejoin="round" />
  </svg>
);

export const Cursor: React.FC<{ x: number; y: number; pressScale?: number }> = ({ x, y, pressScale = 1 }) => (
  <AbsoluteFill style={{ pointerEvents: 'none' }}>
    <div style={{ position: 'absolute', left: 0, top: 0, transform: `translate(${x}px, ${y}px)`, willChange: 'transform' }}>
      <Pointer scale={pressScale} />
    </div>
  </AbsoluteFill>
);
```

Manual trail wrapper (fallback blur), if not using `<CameraMotionBlur>`:

```tsx
// src/demo/CursorTrail.tsx — optional
import React from 'react';
import { useCurrentFrame } from 'remotion';
import { Cursor } from './Cursor';
import type { DemoEvent } from './types';
import { sampleCursorAt } from './sampleCursorAt'; // small helper: cursor pos at an arbitrary frame

export const CursorTrail: React.FC<{ events: DemoEvent[]; x: number; y: number; pressScale?: number }> = ({
  events, x, y, pressScale,
}) => {
  const frame = useCurrentFrame();
  const ghosts = [3, 2, 1]; // frames back
  return (
    <>
      {ghosts.map((back, idx) => {
        const p = sampleCursorAt(events, frame - back);
        return (
          <div key={back} style={{ position: 'absolute', left: 0, top: 0, opacity: 0.12 * (idx + 1), filter: 'blur(1.5px)', transform: `translate(${p.x}px, ${p.y}px)` }}>
            <Cursor x={0} y={0} />
          </div>
        );
      })}
      <Cursor x={x} y={y} pressScale={pressScale} />
    </>
  );
};
```

---

## 7. Click ripple + frame press — `<ClickRipple>`

An expanding ring at each `click`. Returns the ring layer; the "press" (a tiny whole-frame
scale dip) is handled by `usePressScale` so you can apply it to the camera or cursor.

```tsx
// src/demo/ClickRipple.tsx
import React, { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';
import type { DemoEvent, Vec } from './types';

export const ClickRipple: React.FC<{ events: DemoEvent[] }> = ({ events }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const clicks = useMemo(
    () => events.filter((e) => e.click).map((e) => ({ frame: Math.round(e.at * fps), pos: e.click as Vec })),
    [events, fps],
  );
  const dur = Math.round(fps * 0.5); // ripple lifetime

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {clicks.map((c, i) => {
        const local = frame - c.frame;
        if (local < 0 || local > dur) return null;
        const p = local / dur;
        const size = interpolate(p, [0, 1], [12, 92], { easing: Easing.out(Easing.ease) });
        const opacity = interpolate(p, [0, 1], [0.55, 0], { easing: Easing.out(Easing.ease) });
        return (
          <div key={i} style={{
            position: 'absolute', left: c.pos[0], top: c.pos[1],
            width: size, height: size, marginLeft: -size / 2, marginTop: -size / 2,
            borderRadius: '50%', opacity,
            // Concentric light+dark ring so it stays visible on ANY backdrop.
            // A plain white border vanishes on light UI (a white input, a docs page).
            boxShadow: 'inset 0 0 0 1.5px rgba(255,255,255,0.95), inset 0 0 0 3.5px rgba(0,0,0,0.45)',
          }} />
        );
      })}
    </AbsoluteFill>
  );
};

// Whole-frame "press": returns a scale that dips to ~0.985 right at each click.
export function usePressScale(events: DemoEvent[]): number {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const clicks = events.filter((e) => e.click).map((e) => Math.round(e.at * fps));
  let s = 1;
  const dur = Math.round(fps * 0.16);
  for (const cf of clicks) {
    const local = frame - cf;
    if (local >= 0 && local <= dur) {
      const p = local / dur; // 0→1: down then back up
      s = Math.min(s, 1 - Math.sin(p * Math.PI) * 0.02);
    }
  }
  return s;
}
```

---

## 8. Caption — `<Caption>`

Shows whichever caption is currently "active" (last `caption` event at or before now, until
a `null` clears it). Enters with spring + fade, exits with a quick fade.

```tsx
// src/demo/Caption.tsx
import React, { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import type { DemoEvent, Vec } from './types';

export const Caption: React.FC<{
  events: DemoEvent[];
  /** Live camera state, so a content-space `captionAt` can be projected to screen space. */
  cam: { scale: number; focus: Vec };
}> = ({ events, cam }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const segments = useMemo(() => {
    const cap = events.filter((e) => e.caption !== undefined);
    return cap.map((e, i) => ({
      start: Math.round(e.at * fps),
      end: i + 1 < cap.length ? Math.round(cap[i + 1].at * fps) : Infinity,
      text: e.caption,
      at: e.captionAt as Vec | undefined,
    }));
  }, [events, fps]);

  const active = segments.find((s) => frame >= s.start && frame < s.end && s.text);
  if (!active) return null;

  const local = frame - active.start;
  const enter = spring({ frame: local, fps, config: { damping: 22, stiffness: 140, mass: 0.8 } });
  const fadeOut = active.end === Infinity ? 1 : interpolate(frame, [active.end - 8, active.end], [1, 0], { extrapolateLeft: 'clamp' });
  const y = interpolate(enter, [0, 1], [18, 0]);

  // Project the content-space anchor through the camera (the caption itself never scales).
  const screenAt: Vec | undefined = active.at
    ? [
        width / 2 + (active.at[0] - cam.focus[0]) * cam.scale,
        height / 2 + (active.at[1] - cam.focus[1]) * cam.scale,
      ]
    : undefined;

  const pos: React.CSSProperties = screenAt
    ? { left: screenAt[0], top: screenAt[1], transform: `translate(-50%, calc(-100% - 16px)) translateY(${y}px)` }
    : { left: '50%', bottom: height * 0.09, transform: `translate(-50%, ${y}px)` };

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div style={{
        position: 'absolute', ...pos, opacity: Math.min(enter, fadeOut),
        padding: '14px 22px', borderRadius: 14, background: 'rgba(15,15,20,0.72)',
        backdropFilter: 'blur(8px)', color: '#fff', fontSize: 34, fontWeight: 600,
        fontFamily: 'Inter, system-ui, sans-serif', letterSpacing: -0.2, whiteSpace: 'nowrap',
        boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
      }}>
        {active.text}
      </div>
    </AbsoluteFill>
  );
};
```

---

## 9. Top-level — `<DemoStage>`

Wires it all together. The `source` prop is your pixels: `<OffthreadVideo>`, `<Img>`, or a
React-rebuilt screen. Cursor lives **inside** `<Camera>` so it tracks pixels under zoom;
captions and ripples live **outside** the camera (screen-space UI).

```tsx
// src/demo/DemoStage.tsx
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { CameraMotionBlur } from '@remotion/motion-blur';
import { Screen } from './Screen';
import { Camera } from './Camera';
import { Cursor } from './Cursor';
import { TouchPointer } from './TouchPointer';
import { DeviceFrame, type DeviceSpec } from './DeviceFrame';
import { Caption } from './Caption';
import { ClickRipple, usePressScale } from './ClickRipple';
import { useCursorPosition } from './useCursorPosition';
import { useCamera } from './useCamera';
import { useContactState } from './normalizeEvents';
import type { DemoEvent } from './types';

export const DemoStage: React.FC<{
  events: DemoEvent[];
  source: React.ReactNode;
  background?: React.ReactNode;
  /** 'desktop' → arrow cursor + wide frame. 'mobile' → touch blob + phone bezel. */
  mode?: 'desktop' | 'mobile';
  /** Mobile only: phone frame geometry. See devices-and-formats.md */
  device?: DeviceSpec;
}> = ({ events, source, background, mode = 'desktop', device }) => {
  const cursor = useCursorPosition(events);
  const cam = useCamera(events);
  const press = usePressScale(events);
  const contact = useContactState(events); // down/up state for taps, swipes, long-press

  const framed =
    mode === 'mobile' ? (
      <DeviceFrame device={device}>{source}</DeviceFrame>
    ) : (
      <Screen background={background}>{source}</Screen>
    );

  return (
    <AbsoluteFill>
      {mode === 'mobile' && <AbsoluteFill>{background}</AbsoluteFill>}

      {/* Blur the moving scene (camera + pointer) directionally. Remove if you prefer CursorTrail. */}
      <CameraMotionBlur shutterAngle={180} samples={8}>
        <Camera scale={cam.scale * press} focus={cam.focus}>
          {framed}
          {mode === 'mobile' ? (
            <TouchPointer x={cursor.x} y={cursor.y} down={contact.down} />
          ) : (
            <Cursor x={cursor.x} y={cursor.y} pressScale={press < 1 ? 0.9 : 1} />
          )}
          {/* Ripples are authored in CONTENT coordinates, so they must live inside
              <Camera> or they detach from the pointer whenever scale !== 1. */}
          <ClickRipple events={events} />
        </Camera>
      </CameraMotionBlur>

      {/* Screen-space overlay. Captions must NOT scale (legibility), so <Caption>
          projects its content-space anchor through the live camera itself. */}
      <Caption events={events} cam={cam} />
    </AbsoluteFill>
  );
};
```

**Coordinate-space rule (easy to get wrong):** every `Vec` in the timeline —
`cursor`, `click`, `zoom.to`, `captionAt` — is in **content space**. Anything drawn in that
space must either live inside `<Camera>` (pointer, ripples: they should scale with the
content) or explicitly project to screen space (captions: they must stay a fixed, legible
size). Putting `<ClickRipple>` outside the camera is the classic bug — the ripple renders at
the un-zoomed position and visibly detaches from the click.

For `mode="mobile"` the background is rendered **behind the phone** (the device floats on
it), whereas on desktop `<Screen>` owns its own background. That's the only structural
difference between the two modes.

> If `@remotion/motion-blur`'s `CameraMotionBlur` isn't available in your pinned version,
> drop that wrapper and swap `<Cursor>` for `<CursorTrail events={events} .../>`. The demo
> still works; only the blur strategy changes.

---

## 10. A complete composition (worked example)

One beat: rest → move to a toggle → punch in → click → caption → hold → pull out.

```tsx
// src/Root.tsx
import React from 'react';
import { Composition, OffthreadVideo, staticFile, AbsoluteFill } from 'remotion';
import { DemoStage } from './demo/DemoStage';
import type { DemoEvent } from './demo/types';

const FPS = 60;
const WIDTH = 1920;
const HEIGHT = 1080;

const events: DemoEvent[] = [
  { at: 0.0, cursor: [960, 620], caption: null },
  { at: 0.6, cursor: [960, 620] },                          // settle at rest
  { at: 1.1, cursor: [1480, 360] },                         // move toward the toggle
  { at: 1.5, zoom: { scale: 1.9, to: [1480, 360] } },       // punch in on it
  { at: 2.1, click: [1480, 360] },                          // click
  { at: 2.4, caption: 'Ative o modo low-latency', captionAt: [1480, 360] }, // label AFTER the click
  { at: 3.9, caption: null },
  { at: 4.1, zoom: { scale: 1.0, to: [960, 540] } },        // pull back out
  { at: 5.0, cursor: [960, 620] },
];

const DURATION_S = 5.6;

export const RemotionRoot: React.FC = () => (
  <Composition
    id="Demo"
    component={() => (
      <DemoStage
        events={events}
        background={<AbsoluteFill style={{ background: 'radial-gradient(120% 120% at 30% 20%, #241a4a 0%, #0a1130 60%, #050b1f 100%)' }} />}
        source={<OffthreadVideo src={staticFile('recording.mp4')} muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
      />
    )}
    durationInFrames={Math.round(DURATION_S * FPS)}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
  />
);
```

Register it in `src/index.ts` with `registerRoot(RemotionRoot)`.

**Coordinate tip:** all `Vec` values are in **composition pixels** (0..WIDTH, 0..HEIGHT) —
i.e. the full canvas, *before* the `<Screen>` padding insets the recording. When your
recording is inside padding, add the padding offset to on-recording coordinates, or author
against a Studio preview by scrubbing to the frame and reading the cursor position visually.
The cleanest workflow is a **data-driven timeline**: if the app logs tap coordinates +
timestamps, transform them straight into `DemoEvent[]` (map device px → composition px,
device time → `at`), and cursor/clicks land exactly on the real touches with zero manual
placement.

---

## 10b. Multi-screen stories — `<SourceSwap>`

Screenshot-sourced demos almost always need the screen's **content to change** mid-timeline
(click search → results page). `source` is a single node, so wrap your screens in a
frame-aware swap. Cut on the click frame; a 2–3 frame blur-crossfade hides the seam without
reading as a transition effect.

```tsx
// src/demo/SourceSwap.tsx
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export type Shot = { at: number; node: React.ReactNode }; // `at` in seconds

export const SourceSwap: React.FC<{ shots: Shot[]; crossfadeFrames?: number }> = ({
  shots, crossfadeFrames = 3,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cuts = shots.map((s) => ({ ...s, frame: Math.round(s.at * fps) }));

  let idx = 0;
  for (let k = 0; k < cuts.length; k++) if (frame >= cuts[k].frame) idx = k;

  const cur = cuts[idx];
  const prev = idx > 0 ? cuts[idx - 1] : null;
  const local = frame - cur.frame;
  const t = crossfadeFrames > 0
    ? interpolate(local, [0, crossfadeFrames], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : 1;

  return (
    <AbsoluteFill>
      {prev && t < 1 && <AbsoluteFill>{prev.node}</AbsoluteFill>}
      <AbsoluteFill style={{ opacity: t, filter: t < 1 ? `blur(${(1 - t) * 2}px)` : undefined }}>
        {cur.node}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
```

Usage — the swap time is the click time, so the new state appears *as* the result:

```tsx
<DemoStage
  events={events}
  source={
    <SourceSwap shots={[
      { at: 0,   node: <Img src={staticFile('home.png')}    style={shotStyle} /> },
      { at: 2.1, node: <Img src={staticFile('results.png')} style={shotStyle} /> }, // == click time
    ]} />
  }
/>
```

**`shotStyle` matters.** Use `objectFit: 'cover'` **plus** an explicit `objectPosition` (usually
`'top'` for web pages, so the header/search bar isn't cropped away), or `objectFit: 'fill'` when
you captured at the exact frame aspect ratio. Whatever you pick, it changes coordinate mapping —
see [setup-and-render.md](setup-and-render.md) §3.

---

## 11. Gesture normalization — `normalizeEvents` + `useContactState`

Mobile gestures (`swipe`, `scroll`, `longPress`) are sugar: they expand into ordinary cursor
waypoints **plus a contact interval** (finger down → up). Normalize once, then every other
hook works unchanged.

```ts
// src/demo/normalizeEvents.ts
import { useCurrentFrame, useVideoConfig } from 'remotion';
import type { DemoEvent, Vec } from './types';

export type Contact = { start: number; end: number }; // seconds

export function normalizeEvents(
  events: DemoEvent[],
  opts?: { swipeDurationS?: number },
): { events: DemoEvent[]; contacts: Contact[] } {
  const swipeDur = opts?.swipeDurationS ?? 0.45;
  const out: DemoEvent[] = [];
  const contacts: Contact[] = [];
  let last: Vec | null = null;

  for (const e of events) {
    if (e.cursor) last = e.cursor;

    const drag = e.swipe ?? e.scroll;
    if (drag) {
      const from = last ?? drag.to;
      const hold = (e.swipe?.holdMs ?? 0) / 1000;
      out.push({ at: e.at, cursor: from });
      out.push({ at: e.at + swipeDur, cursor: drag.to });
      contacts.push({ start: e.at, end: e.at + swipeDur + hold });
      last = drag.to;
      const { swipe, scroll, cursor, ...rest } = e;
      if (rest.zoom || rest.caption !== undefined) out.push({ ...rest });
      continue;
    }

    if (e.longPress) {
      out.push({ at: e.at, cursor: e.longPress.at });
      contacts.push({ start: e.at, end: e.at + e.longPress.holdMs / 1000 });
      last = e.longPress.at;
      continue;
    }

    if (e.click) contacts.push({ start: e.at, end: e.at + 0.12 });
    out.push(e);
  }

  return { events: out.sort((a, b) => a.at - b.at), contacts };
}

/** Is the finger currently touching the glass? Drives TouchPointer's pressed look. */
export function useContactState(events: DemoEvent[]): { down: boolean } {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { contacts } = normalizeEvents(events);
  const t = frame / fps;
  return { down: contacts.some((c) => t >= c.start && t <= c.end) };
}
```

> Feed `normalizeEvents(events).events` into `useCursorPosition` / `useCamera` /
> `ClickRipple` when the timeline uses gestures. For pure-desktop timelines it's a no-op and
> you can pass `events` directly.

---

## 12. Touch pointer — `<TouchPointer>`

Mobile demos must **not** show an arrow. Use a translucent contact blob that shrinks and
brightens on touch-down — the visual language every phone-demo video uses.

```tsx
// src/demo/TouchPointer.tsx
import React from 'react';
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const TouchPointer: React.FC<{ x: number; y: number; down: boolean; size?: number }> = ({
  x, y, down, size = 64,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // Smooth the press so down/up isn't a hard cut.
  const press = spring({ frame: down ? frame : 0, fps, config: { damping: 20, stiffness: 200, mass: 0.6 } });
  const s = down ? interpolate(press, [0, 1], [1, 0.82], { extrapolateRight: 'clamp' }) : 1;
  const opacity = down ? 0.55 : 0.32;

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div style={{
        position: 'absolute', left: x, top: y,
        width: size, height: size, marginLeft: -size / 2, marginTop: -size / 2,
        borderRadius: '50%',
        background: `radial-gradient(circle at 40% 35%, rgba(255,255,255,${opacity + 0.2}), rgba(255,255,255,${opacity}) 60%, rgba(255,255,255,0) 72%)`,
        border: '1.5px solid rgba(255,255,255,0.55)',
        transform: `scale(${s})`, willChange: 'transform',
      }} />
    </AbsoluteFill>
  );
};
```

---

## 13. Device frames — `<DeviceFrame>`

Wraps the screen in a phone bezel (mobile) so the video reads as "an app", not "a video".
Geometry is data so you can swap devices without touching JSX.

```tsx
// src/demo/DeviceFrame.tsx
import React from 'react';
import { AbsoluteFill } from 'remotion';

export type DeviceSpec = {
  /** Screen size in composition px (the app pixels). */
  screen: { width: number; height: number };
  bezel?: number;        // px of body around the screen
  radius?: number;       // outer body corner radius
  screenRadius?: number; // inner screen corner radius
  body?: string;         // bezel color/gradient
  notch?: 'none' | 'island' | 'notch';
};

export const PHONE: DeviceSpec = {
  screen: { width: 720, height: 1560 },
  bezel: 16, radius: 68, screenRadius: 54,
  body: 'linear-gradient(160deg,#3a3a3f,#111114)', notch: 'island',
};

export const DeviceFrame: React.FC<{ device?: DeviceSpec; children: React.ReactNode }> = ({
  device = PHONE, children,
}) => {
  const { screen, bezel = 16, radius = 68, screenRadius = 54, body, notch = 'island' } = device;
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        width: screen.width + bezel * 2, height: screen.height + bezel * 2,
        borderRadius: radius, padding: bezel, boxSizing: 'border-box', background: body,
        boxShadow: '0 60px 140px rgba(0,0,0,0.6), 0 10px 30px rgba(0,0,0,0.45), inset 0 0 0 1.5px rgba(255,255,255,0.10)',
        position: 'relative',
      }}>
        <div style={{ width: '100%', height: '100%', borderRadius: screenRadius, overflow: 'hidden', background: '#000', position: 'relative' }}>
          {children}
          {notch !== 'none' && (
            <div style={{
              position: 'absolute', top: notch === 'island' ? 14 : 0, left: '50%', transform: 'translateX(-50%)',
              width: notch === 'island' ? 108 : 168, height: notch === 'island' ? 32 : 26,
              borderRadius: notch === 'island' ? 999 : '0 0 18px 18px', background: '#000',
            }} />
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};
```

Desktop equivalent: `<Screen>` already gives the framed-window look. For explicit browser
chrome (URL bar + traffic lights), see [devices-and-formats.md](devices-and-formats.md).

---

## 14. Mobile worked example (portrait, gestures)

A vertical 1080×1920 cut — scroll a feed, tap an item, punch in, caption.

```tsx
// src/MobileRoot.tsx
import React from 'react';
import { Composition, OffthreadVideo, staticFile, AbsoluteFill } from 'remotion';
import { DemoStage } from './demo/DemoStage';
import { PHONE } from './demo/DeviceFrame';
import { normalizeEvents } from './demo/normalizeEvents';
import type { DemoEvent } from './demo/types';

const FPS = 60, WIDTH = 1080, HEIGHT = 1920;

const raw: DemoEvent[] = [
  { at: 0.0, cursor: [540, 1250] },
  { at: 0.8, scroll: { to: [540, 780] } },                 // swipe up through the feed
  { at: 1.7, cursor: [540, 900] },
  { at: 2.2, click: [540, 900] },                          // tap the card
  { at: 2.4, zoom: { scale: 1.5, to: [540, 900] } },
  { at: 2.6, caption: 'Espelhe a tela em 1 toque', captionAt: [540, 900] },
  { at: 4.2, caption: null },
  { at: 4.4, zoom: { scale: 1.0, to: [540, 960] } },
];

const events = normalizeEvents(raw).events;

export const MobileRoot: React.FC = () => (
  <Composition
    id="DemoMobile"
    component={() => (
      <DemoStage
        mode="mobile"
        device={PHONE}
        events={raw}
        background={<AbsoluteFill style={{ background: 'radial-gradient(120% 100% at 50% 0%, #2a1c52 0%, #0b1030 60%, #05081c 100%)' }} />}
        source={<OffthreadVideo src={staticFile('phone-capture.mp4')} muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
      />
    )}
    durationInFrames={Math.round(5.2 * FPS)}
    fps={FPS} width={WIDTH} height={HEIGHT}
  />
);
```

> Pass the **raw** array to `<DemoStage>` (it normalizes internally via `useContactState`);
> use `normalizeEvents(...).events` directly only if you're calling the hooks yourself.
> Register both compositions in the same `RemotionRoot` to render desktop and mobile cuts
> from one project — see [devices-and-formats.md](devices-and-formats.md) for sharing one
> roteiro across both aspect ratios.
