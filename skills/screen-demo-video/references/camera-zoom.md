# Camera & Zoom — the Screen Studio signature

The auto-zoom is what people actually recognize. Done well it directs attention and makes a
flat recording feel shot. Done badly it's motion sickness. This file is the rulebook.

## 1. Zoom levels

| State | Scale | When |
|---|---|---|
| Rest / establishing | **1.0×** | Start, end, and between beats. The eye needs to re-orient |
| Soft emphasis | **1.25–1.4×** | A region (a panel, a list), or **any** mobile punch-in |
| Standard punch | **1.6–2.0×** | Desktop: a specific control, field, or toggle |
| Deep punch | **2.0–2.6×** | Desktop only, tiny targets, only if source resolution allows |

**Resolution ceiling:** a punch to `N×` needs source pixels at `N×` the display size or it goes
soft. Recording at 2× (Retina/high-DPI) buys you clean 2× punches; a 1080p capture rendered to
1080p canvas starts visibly degrading past ~1.5×. If you need deep zooms, either record at
higher resolution or rebuild those screens in React (vector — infinite zoom, always crisp).

**Mobile ceiling is much lower** — 1.0–1.4×. The phone frame is already large on canvas and
punching in crops the bezel, which destroys the "this is a phone" read. See
[devices-and-formats.md](devices-and-formats.md).

## 2. When to zoom — the intent test

Zoom **only** when you can answer: *"what small thing must the viewer see that they can't at
1.0×?"* If there's no answer, hold. Legitimate reasons:

- A control is small relative to the frame (a toggle, an icon, a menu item).
- Text must be read (a value, a label, a result).
- The result of an action is subtle (a badge changes, a status flips).

Illegitimate reasons (all produce the "drifting camera" nausea): to add energy, to hide that
nothing is happening, to transition between beats, because the last beat had a zoom.

## 3. The follow-the-action algorithm

For each beat, in this order:

1. **Pointer starts moving toward the target.**
2. **~150–250ms later, the camera starts its punch** toward the same target. The camera
   *follows* attention — it never arrives first.
3. **Camera settles before the action.** The click lands on a stable frame; clicking mid-zoom
   makes the moment illegible.
4. **Hold through the result.** Camera is motionless while the UI responds. Do not zoom on the
   result — the viewer is reading.
5. **Release after the caption is up** (or as it clears), back to 1.0×.

In the timeline this reads as `cursor` → `zoom` (≈0.2s later) → `click` (after settle) →
`caption` → `zoom` back:

```ts
{ at: 1.1, cursor: [1480, 360] },                   // 1. pointer leads
{ at: 1.5, zoom: { scale: 1.9, to: [1480, 360] } }, // 2. camera follows, ~0.4s behind
{ at: 2.1, click: [1480, 360] },                    // 3. settled, then act
{ at: 2.4, caption: 'Ative o low-latency' },        // 4. label after result
{ at: 4.1, zoom: { scale: 1.0, to: [960, 540] } },  // 5. release
```

## 4. Anchor math (why the toolkit does what it does)

The camera keeps a **focus point** centered while scaling. With `transform-origin: 0 0` and
`transform: translate(t) scale(s)`, a point `p` maps to `p·s + t`. To pin `focus` at the canvas
center:

```
t = center − focus · s
```

which is exactly `<Camera>`'s `tx = width/2 − focus.x·scale`. Consequences worth knowing:

- **Focus point = the thing you're zooming to**, in composition pixels — usually identical to
  the click coordinate. Reuse the same `Vec` for `zoom.to` and `click` so they can't drift.
- **Interpolating focus and scale together** produces a natural dolly. The toolkit springs both,
  so a punch that also moves across the screen curves rather than tracking in a straight line.
- **Edge overshoot:** zooming to a point near the canvas edge pushes empty space into frame.
  The toolkit's `useCamera` **already clamps focus by default** (`clampFocus`) because the
  common case — a search bar, header, or top-nav near the top edge, punched to 1.8× — always
  violates the bound. The math, for reference or if you reimplement:

```ts
const halfW = width / (2 * scale);
const halfH = height / (2 * scale);
const fx = Math.min(Math.max(focus[0], halfW), width - halfW);
const fy = Math.min(Math.max(focus[1], halfH), height - halfH);
```

Consequence worth knowing: when clamping kicks in, the target is no longer perfectly centered.
That's correct — a framed screen with no background bleed beats a perfectly centered target.

## 5. Motion character

- **Springs, never linear.** Linear zoom is the most robotic thing a demo can do.
- **Asymmetric in/out.** Punching in is *decisive* (`damping: 30, stiffness: 90`); releasing is
  *calmer and slower* (`damping: 40, stiffness: 70`). Symmetric zooms feel mechanical. This
  mirrors the general animation rule that enter and exit are never mirror images.
- **Duration by distance and depth.** A 1.0→1.4× nudge takes ~0.5s; a 1.0→2.2× punch across the
  canvas takes ~0.8–0.9s. Scale the segment length in the timeline accordingly — don't give
  every zoom the same gap.
- **Motion blur on the punch.** `<CameraMotionBlur shutterAngle={180} samples={8}>` around the
  camera is what makes a fast move read as *cinematic* instead of *stuttery*. It's the cheapest
  large quality win available.
- **Settle, don't snap.** A spring with `damping` in the 30s lands with a hair of overshoot.
  That micro-settle is the difference between "animated" and "filmed".

## 6. Anti-patterns

| Anti-pattern | Why it fails | Fix |
|---|---|---|
| Camera arrives before the pointer | Reverses causality; feels prescient and fake | Delay zoom 150–250ms behind the cursor |
| Clicking mid-zoom | The key moment is a blur | Settle first, then act |
| Zooming on the result | Viewer is reading; motion blocks comprehension | Hold motionless through the result |
| Zoom on every beat | Nausea; nothing feels important | Hold at least one beat wide |
| Same scale every punch | Metronome effect | Vary 1.5×/2.1×/1.7× |
| Never returning to 1.0× | Viewer loses spatial context | Release between beats |
| Deep punch on soft footage | Visible mush | Cap by source resolution, or rebuild in React |
| Punching past the phone bezel (mobile) | Breaks the device illusion | Cap mobile at ~1.4×; keep bezel partly visible |

## 7. Advanced: continuous drift

For long holds (a beat where the user reads a lot), a **very slow** continuous push — 1.0× to
1.06× over 4s — adds life without drawing attention. Use sparingly, and never combine it with a
punch in the same beat. Implement as an extra `zoom` keyframe pair with a long gap; the spring
will make it imperceptibly smooth.

## 8. Validating the camera

- Scrub at **0.1×** through each punch: the pointer must start first, the camera must settle
  before the click, and the frame must be motionless during the result.
- Check every punch at 100% render scale for softness; if it's mushy, lower the scale or raise
  the source resolution.
- Confirm no frame shows canvas background bleeding into the framed screen (edge overshoot).
- Count zooms: if every beat has one, remove the weakest.
