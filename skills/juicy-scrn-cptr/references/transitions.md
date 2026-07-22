# Transitions — never cut hard between compositions

Whenever two compositions meet, a transition is applied. A hard cut reads as an editing
mistake, not a choice. **`softCut` is the default**; the user can override per boundary.

## The four kinds

Chosen for genuine synergy with screen-demo footage, drawn from what the major platforms ship
rather than from social-media trend effects (whip pans, glitch wipes, and zoom-blur smashes
are deliberately excluded — they read as cheap and fight the calm, premium register this skill
targets).

### `softCut` — DEFAULT · 0.28s

Short crossfade + a 1.02× scale drift + a touch of blur peaking mid-transition. The
Apple-keynote / Screen Studio idiom: the cut is buried inside movement, so the viewer registers
**continuity** rather than a transition.

It is the default for three reasons: it never competes with the content, it needs **no shared
element** so it works between any two shots, and it is short enough to keep pace. When in
doubt, this is the right answer.

### `containerZoom` — 0.55s

Material Design's **container transform**: the element you clicked expands to become the next
screen. The highest-craft option and the most spatially honest — the viewer sees *where* the
new screen came from.

Use whenever composition B is literally the result of clicking something in A (a card opening
into a detail view, a button opening a panel). Requires `fromRect` — the source element's
rect in content space, which the capture timeline already gives you.

### `circleReveal` — 0.5s

Material's **circular reveal**: a clip-path circle grows from the click point, uncovering the
next composition. Natural for *tap → new screen*, and especially strong on mobile where the
touch point is the obvious origin.

Pass `origin` (the click coordinate). The radius must reach the farthest corner or the reveal
visibly stops short — the component computes this for you.

### `slidePush` — 0.42s

iOS/Material **navigation push**: B slides in from the direction matching the spatial model
(forward = right-to-left; `direction: 'back'` reverses). The outgoing screen trails at 25% and
dims slightly, which is how iOS conveys depth rather than a flat swap.

For wizards, stepped flows, and paged navigation — anywhere the UI itself has a spatial order.

## In-canvas continuity (scroll) — for UI-story productions

Not a composition-to-composition transition but the **absence of one**: in a UI story
([production-types.md](production-types.md) §C) the next beat arrives by the content
**scrolling vertically inside the same frame** — the old beat exits top, the new one enters
bottom, exactly as a live session would scroll. Motion-blur the fast portion (the
`<CameraMotionBlur>` wrapper already covers content that moves inside it) and ease with a
weighty spring, never linear.

Use it when both beats live in the *same* reconstructed UI (a chat stream advancing, a feed
appending). The moment the story changes surface — different screen, different app state that
scrolling can't reach — fall back to `softCut`. A scroll that teleports to unrelated content
reads as broken, not smooth.

Anatomy of one continuity move (~0.6–0.9s total):

1. Hold the finished beat 0.8–1.5s (let the payoff breathe).
2. Scroll the content column up with a spring (damping ~30, stiffness ~90); fast middle,
   soft settle. New elements may begin their staggered entrances during the settle.
3. Never scroll while a caption is being read or mid-typing — finish the moment first.

## Choosing

| Situation | Use |
|---|---|
| Anything, no strong reason otherwise | `softCut` |
| B is the result of clicking a specific element in A | `containerZoom` |
| Tap → new screen, especially mobile | `circleReveal` |
| Steps, wizards, paged navigation | `slidePush` |
| Statement card → demo (pitch productions) | `softCut` |
| Same UI advancing (UI story: chat stream, feed) | In-canvas scroll continuity |

## Usage

```tsx
import { Transition } from './demo/Transitions';

<Transition from={<SceneA />} to={<SceneB />} startS={4.2} />                    // default
<Transition from={<SceneA />} to={<SceneB />} startS={4.2}
            spec={{ kind: 'circleReveal', origin: [1180, 300] }} />
<Transition from={<SceneA />} to={<SceneB />} startS={4.2}
            spec={{ kind: 'containerZoom', fromRect: [820, 420, 300, 180] }} />
```

## Rules

- **One transition kind per production**, with at most one deliberate exception for a hero
  moment. Mixing four kinds looks like a demo reel of transitions, not a product video.
- **Match the origin to the action.** `circleReveal` from anywhere but the click point, or
  `containerZoom` from a rect that is not the clicked element, is worse than `softCut` — it
  asserts a spatial relationship that did not happen.
- **Never transition mid-beat.** Transitions sit *between* beats, never during a punch-in or
  while a caption is being read.
- **Keep them short.** Everything here is under 0.6s. A transition the viewer has time to
  admire is a transition that interrupted the story.
- **Do not stack.** A transition plus a simultaneous camera move plus a caption entering is
  three things competing; let the transition finish first.
