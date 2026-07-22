# Pointer & Interaction — making it feel like a hand

The pointer is the actor. Viewers unconsciously read intent from how it moves, so this is where
"generated" is most detectable. Desktop uses an arrow cursor; mobile uses a touch blob — the
motion principles are shared, the rendering and gesture set are not.

## 1. How a real hand moves (and how to fake it)

Human pointing obeys a well-known profile: a fast ballistic launch, a long deceleration, and a
small corrective settle at the target. Never a constant-velocity slide.

| Property | Human | Implementation |
|---|---|---|
| Velocity profile | Fast start, long decel | `spring({ damping: 26, stiffness: 120, mass: 1 })` |
| Path | Slightly curved | Perpendicular arc, `sin(t·π) × min(dist × 0.06, 40)` |
| Arrival | Tiny overshoot then settle | The spring's natural overshoot — don't damp it away |
| Duration | Scales with distance | Longer gaps in the timeline for longer travel |
| Before acting | Brief hesitation | 120–250ms dwell between arriving and clicking |
| Idle | Never perfectly still | Optional ±1px drift on long holds |

All of this is in `useCursorPosition` in [remotion-toolkit.md](remotion-toolkit.md).

**Travel duration by distance** (author these as gaps between `cursor` waypoints):

| Distance (of canvas width) | Duration |
|---|---|
| < 15% (nudge) | 0.25–0.35s |
| 15–40% (typical) | 0.4–0.6s |
| > 40% (cross-screen) | 0.6–0.85s |

Anything under 0.2s reads as a teleport; anything over 1.0s reads as hesitation (use it
deliberately, not by accident).

## 2. The dwell — the most humanizing detail

A real person **arrives, pauses, then clicks.** Machines click on arrival.

The toolkit gives you this for free: travel takes a distance-derived duration and then
**holds**, so a `cursor` at 1.1s followed by a `click` at 1.9s already dwells. You only need to
leave the gap. Repeating the waypoint is still worth doing when you want the pause to be
explicit in the timeline:

```ts
{ at: 1.1, cursor: [1480, 360] },   // begin travel
{ at: 1.7, cursor: [1480, 360] },   // arrived — hold still (dwell)
{ at: 1.9, click: [1480, 360] },    // ~200ms later, act
```

Dwell longer (400–600ms) before a **non-obvious** action — it reads as the operator deciding,
and it's the single best trick for making a demo feel recorded rather than generated. Dwell
shorter (100ms) on obvious follow-ups.

## 3. Click / tap feedback

Two layers, both cheap, both in the toolkit:

1. **Ripple ring** — expands 12→92px over ~0.5s, opacity 0.55→0, `Easing.out(Easing.ease)`.
   On mobile scale it to ~1.4× the touch blob, not larger — big ripples look like a tutorial
   overlay, not a product video.
2. **Pointer press** — the arrow dips to ~0.84 scale (desktop) or the touch blob to ~0.82
   (mobile) for ~160ms, then settles (`useCursorPress`). Because the pointer's hotspot is its
   tip, scale it about the tip (`transformOrigin: 0 0`) so the tip stays put while the body
   dips — the press reads as a tap *at that point*, not as the cursor sliding.

**Never press the frame.** A click must scale **only the pointer** — never the framed screen.
Dipping the whole screen on each click (an old "frame press" trick) reads as the page
*bouncing*: it is motion the real product never makes, and at any zoom it wobbles the entire
composition. So `<Camera>` always gets `cam.scale` straight, and the dip goes to the cursor
alone. The ripple + the pointer dip + the UI responding under the tap already read
unmistakably as a click; the frame does not need to move at all.

Do **not** add a click sound louder than −18 dB, a colored flash, or a persistent marker.

## 3a. Pointer design (desktop)

The arrow is a **modern, minimalist** pointer, not a chunky OS cursor: slim geometry, rounded
joins, a hairline outline, and a **soft drop shadow** so it reads as floating just above the UI
— the single detail that makes an overlay cursor look designed rather than pasted on. Keep it
**white** (it must survive both dark and light UI; the outline + shadow carry it on white
backgrounds). Keep the **hotspot at the tip** (the SVG origin) so every `cursor`/`click`
coordinate still lands exactly under the tip. The drop-in implementation is in the toolkit
(`<Pointer>`, [remotion-toolkit.md](remotion-toolkit.md) §6).

## 4. Mobile gestures

Desktop demos are travel + click. Mobile demos are mostly **drags**, and the giveaway of a fake
one is contact state: the finger must stay **down** for the whole drag.

**Scroll / swipe.** Use `scroll: { to }` or `swipe: { to, holdMs }`. `normalizeEvents` expands
these into cursor waypoints plus a contact interval so `<TouchPointer>` renders pressed
throughout. Real swipes have **follow-through**: the content keeps gliding after the finger
lifts. If your source is a real recording this is free; if you're animating synthetic screens,
give the content its own spring that outlasts the finger by ~250ms.

**Long-press.** `longPress: { at, holdMs }` with `holdMs ≥ 500`. Anything shorter reads as a
tap. The payoff (context menu) should appear at ~`holdMs`, not before.

**Pinch.** Render **two** contact blobs moving apart/together. A one-finger pinch is
instantly wrong. If the toolkit's single `<TouchPointer>` is in use, render a second instance
mirrored about the pinch center.

**No hover.** Mobile has no hover state. If a beat depends on a tooltip appearing on hover,
that beat is desktop-only — rewrite it for mobile as a tap.

**Where the finger comes from.** Real thumbs enter from the bottom edge of the phone, not from
off-screen left. Start and end mobile pointer positions low (~80–90% of screen height) so
travel reads naturally.

## 5. Motion blur

Fast pointer travel without blur strobes — the eye sees discrete positions. Two options:

- **`<CameraMotionBlur shutterAngle={180} samples={8}>`** around the moving scene (camera +
  pointer). Preferred: physically-derived directional blur, one wrapper, done.
- **Manual trail** (`<CursorTrail>`): 3 ghost copies sampled 1–3 frames back at 12/24/36%
  opacity with a 1.5px blur. Use when you don't want scene-wide blur or the motion-blur package
  isn't available.

Blur should be **invisible on holds** — it only appears because the thing is moving. If you see
it in a still frame at rest, something's wrong.

## 6. Typing

Never animate real character-by-character typing at true speed; it's dead air. Options, best
first:

1. **Cut to the filled field** — the viewer infers the typing. Fastest and usually correct.
2. **Speed-ramp** — show the first ~3 characters at natural cadence, then jump to complete.
3. **Full typing** only when the *content* being typed is the point (e.g. a prompt demo). Use
   a variable cadence (60–140ms per character, slower on punctuation), never a fixed interval —
   monospaced timing is the tell.

A blinking caret at ~530ms period adds realism at near-zero cost.

## 7. Anti-patterns

| Anti-pattern | Why it fails | Fix |
|---|---|---|
| Linear cursor movement | Nothing in nature moves at constant velocity | Spring |
| Clicking on arrival | Machines do this; hands don't | 120–250ms dwell |
| Perfectly straight paths | Reads as scripted | Subtle perpendicular arc |
| Arrow cursor in a mobile demo | Immediately breaks the illusion | `<TouchPointer>` |
| Finger lifting mid-swipe | Contact state wrong | Model with `swipe`/`scroll`, not two `cursor` moves |
| Ripple on every pointer stop | Implies clicks that didn't happen | Ripple only on real `click` |
| Cursor jumping between beats | Teleporting breaks continuity | Always animate; if you must cut, cut the camera, not the pointer |
| Identical dwell everywhere | Metronome | Vary 100ms (obvious) to 600ms (deliberate) |
| Cursor visible during a pure-result hold | Distracts from what changed | Park it away from the changing region |

## 8. Validating the pointer

- Scrub a long travel at **0.1×**: velocity must be visibly non-uniform (fast then slow), the
  path slightly curved, and blur present mid-travel only.
- Confirm a dwell exists before **every** click; measure it in frames.
- Mobile: confirm the blob renders pressed for the entire drag, and that ripples appear only on
  taps.
- Confirm the pointer never overlaps a caption or leaves the framed screen.
- Watch once at full speed with the pointer hidden: the beats should still be legible. If they
  aren't, the camera work is doing too little and the cursor is carrying the film.
