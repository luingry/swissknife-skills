# Fast Workflow — where the time actually goes

Measured on a real end-to-end run (a 10s, 2-beat desktop demo took ~52 minutes), the cost was
almost entirely **fixed overhead**, not video length:

| Cost | Why it was slow | Fix |
|---|---|---|
| Writing ~10 component files by hand, then chasing typecheck errors | Transcribing code from markdown into files, with transcription bugs | **Copy `assets/template/`** — never transcribe |
| ~12 separate `npx remotion still` calls | Each one re-bundles the project *and* boots a fresh Chromium | **`node scripts/verify.mjs`** — bundles once, one browser, N stills |
| Full-resolution renders while iterating | 1920×1080 at final quality to check timing | **Draft at `--scale=0.35`**, full res only at the end |
| Guess coordinates → render → adjust → render | No way to see content-space coordinates | **`--grid`** — read every coordinate off one still |

The important consequence: **a 60-second, 8-beat video is not 6× slower than a 10-second one.**
The fixed costs are paid once. Optimize them and long videos become cheap.

## 1. Never scaffold by hand

```bash
cp -r <skill>/assets/template <project>
cd <project> && npm install
```

`assets/template/` is the source of truth for the engine: `src/demo/` (types, hooks, Stage with
all components, Caption, readingTime), `src/Root.tsx` (the film — the only file you edit),
`package.json` with pinned versions, `tsconfig.json`, and `scripts/verify.mjs`.

The code listings in [remotion-toolkit.md](remotion-toolkit.md) are for **understanding**, not
for copying. Reading 800 lines of component code into context to retype it is slow, burns
tokens, and introduces bugs — the exact failure the template exists to prevent.

**Reuse one project across videos.** `npm install` (Remotion + Chromium) is the single biggest
fixed cost. Add a new `<Composition>` to an existing project rather than scaffolding again.

## 2. Get coordinates in one pass, not a loop

```bash
node scripts/verify.mjs --grid 0
```

Renders one still with a labelled 100px grid over your actual screenshot. Read off every target
coordinate at once — search box, button, result card — then author the whole timeline in a
single pass. This replaces the guess-render-adjust loop, which is the most common way an hour
disappears.

Even better when available: **drive coordinates from data.** If the app logs real taps
(`timestamp, x, y`), transform that log into `DemoEvent[]` and skip coordinate authoring
entirely (see [setup-and-render.md](setup-and-render.md) §3).

## 3. Verify with checkpoints, not with your eyes on a video

```bash
node scripts/verify.mjs                    # default checkpoints
node scripts/verify.mjs 1.0 2.2 6.3        # explicit moments
node scripts/verify.mjs --sheet            # tile them into ONE image
```

Aim one checkpoint at each beat's key moment: the punch, the click, the result, the caption.
Use `--sheet` so reviewing costs **one** image instead of N — that matters for both time and
context budget.

What each checkpoint proves: camera settled before the click, screen swapped at the right
frame, caption legible and not clipped, pointer on target, no background bleed.

## 4. Draft small, finish big

```bash
npm run draft    # --scale=0.35, fast
npm run final    # --crf=18, full resolution
```

Render time scales with pixel count, so a 0.35 draft is roughly **8× faster**. Timing, pacing,
and choreography are all judgeable at that scale. Only zoom sharpness needs full resolution —
check that once, at the end.

Frame rate: **finals render at 60fps** — that fluidity is part of the premium register this
skill targets and is non-negotiable for delivery. While iterating, drop the draft composition
to 30fps to halve render time; timing and choreography are still judgeable there. Just never
ship the 30fps cut.

## 5. Chunk long videos into scenes

For anything past ~30 seconds, do not re-render the whole film to check one beat.

- Give each scene its **own `<Composition>`** (`Scene1`, `Scene2`, …) with its own event array.
- Build and verify scenes independently — you only ever render the ~5s you are working on.
- Concatenate at the end with ffmpeg, or assemble with `<Series>` into a `Full` composition
  once the scenes are individually approved.

This keeps iteration cost flat as the video grows, which is the whole game for long demos.

## 6. Parallelism and render flags

```bash
npx remotion render src/index.ts Demo out/demo.mp4 --crf=18 --concurrency=8
```

- `--concurrency=<n>` — roughly the core count; the single biggest render-speed lever.
- `--frames=120-240` — render only the slice you are checking.
- `--crf` 18–20 for delivery; higher (23) for a smaller web loop.
- Skip `--scale=2` unless the deliverable genuinely needs it; it quadruples render cost.

## 7. Order of operations (the fast path end to end)

```text
1. Decide format + write roteiro (no code)          — minutes, no compute
2. Capture screenshots/recording                     — one pass
3. cp -r assets/template && npm install              — the one unavoidable wait
4. verify.mjs --grid 0  -> read all coordinates      — one render
5. Author the full timeline in Root.tsx              — one pass, no rendering
6. verify.mjs --sheet   -> check every beat at once  — one bundle, one browser
7. Fix the timeline, repeat 6 (cheap now)
8. npm run draft -> watch once, cold, full speed
9. npm run final
```

Steps 5–7 are where quality is won, and they are nearly free once 3 and 4 are done. Resist the
urge to render the final video until the checkpoints look right.
