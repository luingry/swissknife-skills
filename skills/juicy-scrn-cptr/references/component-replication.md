# Component Replication — animating a component's parts, not its picture

A screenshot of a component is one flat image, so the most you can animate is the whole
rectangle sliding in. **Replication decomposes the real component into its parts**, each
absolutely positioned and independently animatable — rows staggering, a badge scaling, a card
morphing, a button rippling, all on the same component, all at once. That is the difference
between "a picture that moves" and the rich component choreography this skill targets.

It is a **replica, not a redesign**: geometry, colors, radii, shadows and typography are read
off the live product, so the animation shows something the product actually looks like.

Use this whenever the user wants a **component presented in isolation** — a feature card, a
panel, a pricing table, a settings row — rather than a full-screen walkthrough.

## 1. Extract

```bash
node scripts/replicate.mjs <url> <selector> [--name card] [--depth 6] [--viewport 1440x900]
```

Walks the component's DOM subtree and emits `public/<name>.component.json`:

```jsonc
{
  "name": "card",
  "size": [310, 1337],
  "parts": [
    { "id": "p0", "parent": null, "depth": 0, "tag": "table", "isLeaf": false,
      "rect": [0, 0, 310, 1337],
      "style": { "background": "rgb(248,249,250)", "borderRadius": "8px", "boxShadow": "..." } },
    { "id": "p7", "parent": "p6", "tag": "#text", "text": "Produção", "isLeaf": true,
      "rect": [12, 402, 62, 16],
      "style": { "color": "rgb(51,102,204)", "fontSize": 14, "fontWeight": "700", ... } }
  ]
}
```

Two design decisions worth knowing, both learned from real extraction failures:

- **Every text run is its own part**, measured with a `Range` rather than attached to its
  parent element. Attaching text to the parent draws it across the parent's entire box,
  overlapping the children — and it forces a whole subtree to animate as one blob instead of
  letting each run move independently.
- **A node with both text and element children still recurses.** Treating "has text" as
  "is a leaf" silently drops everything nested below it.

`--depth` controls how far down it walks. Deeper means finer-grained animation control and more
parts; 5–6 is usually right. Inspect the emitted part list and pick the ids you want to
choreograph.

## 2. Render and animate

```tsx
import { ComponentReplica, type ComponentSpec } from './demo/ComponentReplica';
import { useGrid } from './demo/grid';
import spec from '../public/card.component.json';

const g = useGrid();

<ComponentReplica
  spec={spec as unknown as ComponentSpec}
  at={g.cell(3, 0, 6, 8)}          // snapped to the grid — see grid-system.md
  scale={0.62}
  reveal={{ order: 'top-down', perItemS: 0.03, atS: 0.2,
            from: { y: 20, opacity: 0, scale: 0.97 } }}
  ripples={[{ partId: 'p14', atS: 1.8 }]}
  morphs={[{ partId: 'p22', atS: 2.4, to: [40, 120, 260, 90] }]}
/>
```

| Prop | Effect |
|---|---|
| `reveal` | Staggered entrance. `order`: `top-down` (default), `bottom-up`, `left-right`, `center-out`, `dom`. `from`: `{x, y, scale, opacity, blur}` |
| `ripples` | Material-style ripple expanding from a part's center — the real "click feedback" on a replicated button |
| `morphs` | Part-level morph: animates one part's rect toward another. Container-transform, but per part |
| `scale` | Uniform scale of the whole replica |
| `at` | Center position on the canvas — **always** a grid point |

By default only **leaves** animate. Animating a container *and* its children double-transforms
and looks mushy; override with `reveal.select` only when you mean it.

## 3. Choreography that reads as designed

- **One gesture, not many.** A reveal should finish inside ~0.4s total (`staggerDelay` caps it).
  Past that the eye stops reading it as one component appearing and starts watching individual
  items arrive.
- **Order carries meaning.** `top-down` for lists and forms, `center-out` for a hero card,
  `left-right` for a row of items. Random order looks random.
- **Small distances.** Parts should travel 12–24px, not across the screen. The component is
  assembling, not flying in.
- **Ripple only on real interaction.** A ripple asserts a click happened; put it on the frame
  where the click actually happens (from the [capture timeline](interaction-fidelity.md) when
  the component came from a real page).
- **Morph between related rects only.** A part morphing into an unrelated position asserts a
  relationship that does not exist — the same rule as `containerZoom` in
  [transitions.md](transitions.md).
- **Never animate all 160 leaves.** Choose the 6–12 parts that carry the structure and let the
  rest appear with the container. Selecting is the craft.

## 4. Known limitations (verified, not theoretical)

- **Wrapped text gets one bounding box.** A `Range` across a text node that wraps onto several
  lines returns the union rect, so multi-line runs can overlap neighbors slightly. Prefer
  components with short labels, raise `--depth`, or nudge the offending part's rect by hand.
- **Images may not load.** `<img>` sources are captured as absolute URLs, but lazy-loaded,
  `srcset`-driven, or CORS-restricted images can render empty in the Remotion browser.
  Check a still; if an image is missing, download it into `public/` and point the part at the
  local file.
- **No pseudo-elements.** `::before`/`::after` content is not captured — decorative carets,
  custom bullets and some icon fonts will be missing.
- **Static snapshot.** The replica reflects the component's state at capture time. For a
  component whose own animation matters, capture it as video instead
  ([interaction-fidelity.md](interaction-fidelity.md)).

Always render one still and **look at it** before building the choreography. The replica is
close, not pixel-perfect, and the gaps are obvious on sight and invisible in the JSON.

## 5. The fidelity loop (mandatory for anything rebuilt)

A replica earns the right to be animated only after it survives a **side-by-side against the
real system**. This applies to `replicate.mjs` output and, doubly, to screens rebuilt by hand
for a [UI story](production-types.md):

1. Capture a reference screenshot of the real screen at the exact viewport the composition
   uses (Playwright/adb/simctl — see [setup-and-render.md](setup-and-render.md)).
2. Render a still of the rebuild at the same size.
3. Put them side by side (or difference them) and fix what differs: font family and weight,
   line-height, paddings, colors, radii, icon geometry, shadow softness. Colors must be
   sampled from the original, never eyeballed — this is also where the production's palette
   (caption accents etc.) is read from.
4. Repeat until a cold viewer could not say which is the product.

Only then choreograph. Fidelity outranks schedule: a beautiful animation of a screen that
doesn't quite exist is a worse deliverable than a plain animation of the real one.
