# Grid System — a standing directive

**Every dynamic element position, every camera focus point, and every framing decision snaps to
the composition grid.** This is not a styling preference; it is what makes a sequence of shots
read as one designed piece rather than a series of separately-improvised frames.

The reason is perceptual: the eye detects alignment and symmetry far below conscious
attention. Aligned elements read as *intent*, and intent reads as competence and care.
Arbitrary coordinates read as sloppiness even when a viewer cannot say why the video feels
amateur. Two demos with identical content and identical motion curves will be judged
differently purely on whether things line up.

## The grid

12 columns × 8 rows inside a margin of 5.5% of the smaller canvas dimension.

Twelve columns because it divides cleanly by 2, 3, 4 and 6 — halves, thirds, quarters and
sixths all land on real column lines, so the common compositions are all available without
inventing offsets. Eight rows for the same reason vertically.

```ts
import { useGrid } from './demo/grid';

const g = useGrid();

g.x(3)                    // x of column line 3
g.y(2)                    // y of row line 2
g.cell(3, 1, 6, 4)        // center point of a 6x4 block starting at col 3, row 1
g.rect(3, 1, 6, 4)        // [x, y, w, h] of that block
g.snap([812, 431])        // nearest grid intersection
g.snapNear([812, 431], 24)// snap only if within 24px — keeps genuinely off-grid targets honest
g.bounds                  // { left, top, right, bottom } of the safe area
```

## What must snap

| Thing | Rule |
|---|---|
| Component/replica placement | `at={g.cell(...)}` — always |
| Statement card and caption anchors | Grid points, or the standard lower-third |
| Camera focus (`zoom.to`) | `g.snapNear(target)` — snap when close, keep exact when the target genuinely sits off-grid |
| Device frame / screen placement | Centered on grid, or aligned to a column block |
| Multi-element layouts | Equal column spans; never eyeball the gaps |

## What must NOT snap

- **Click and cursor coordinates from a real capture.** These come from where the pointer
  actually went. Snapping them would move the pointer off the element it really clicked,
  breaking [interaction fidelity](interaction-fidelity.md). Fidelity beats tidiness.
- **Parts inside a replicated component.** Their rects come from the real component's own
  internal layout. Re-snapping them would distort the product's design.

The grid governs *where you place things on the canvas*, not *where the product put its own
pixels*.

## Rhythm is grid too

Timing follows the same discipline. Stagger delays come from `staggerDelay(index)` rather than
hand-picked numbers, transitions use the per-kind durations in [transitions.md](transitions.md),
and camera moves use the fixed `ZOOM_IN_S` / `ZOOM_OUT_S`. Consistent intervals do for time what
alignment does for space.

Deliberate variation still applies — beats vary in length, zoom depths vary
([roteiro-and-pacing.md](roteiro-and-pacing.md) §8). Vary the *choices*, not the *units*.

## Checking it

Render one still with the coordinate grid overlay and look at whether things land on lines:

```bash
node scripts/verify.mjs --grid 0
```

If an element sits 7px off a column line, that offset is visible in aggregate across a whole
video even though no single frame looks wrong.
