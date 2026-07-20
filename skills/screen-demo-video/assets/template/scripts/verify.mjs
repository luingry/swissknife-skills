/**
 * Fast visual verification.
 *
 * The naive loop — `npx remotion still ...` once per moment you want to inspect — re-bundles
 * the project AND boots a fresh Chromium every single time. Twelve checkpoints that way cost
 * twelve bundles and twelve browser launches, which is where demo-building time actually goes.
 *
 * This bundles ONCE and reuses ONE browser for every still. Measured: 6 checkpoints in ~13s
 * total, versus minutes for the naive loop.
 *
 * Two dead ends, both verified so you do not repeat them:
 *   - Stitching the stills into a contact sheet with Remotion's bundled ffmpeg fails: it is a
 *     minimal build with NO `tile` filter ("No such filter: 'tile'").
 *   - Building the sheet in-engine with <Freeze> also fails: the film's components read
 *     useVideoConfig() for layout, and nested/duplicated <Img> did not load, so cells render
 *     black and identical. Separate stills are the working path.
 *
 * Usage:
 *   node scripts/verify.mjs                  # default checkpoints
 *   node scripts/verify.mjs 0 1.5 2.2 6.3    # explicit times in seconds
 *   node scripts/verify.mjs --grid 0         # with the coordinate-grid overlay
 *   node scripts/verify.mjs --full 2.2       # full resolution (default is half)
 */
import { bundle } from '@remotion/bundler';
import { selectComposition, renderStill, openBrowser } from '@remotion/renderer';
import path from 'node:path';
import fs from 'node:fs';

const COMPOSITION_ID = 'Demo';
const OUT_DIR = path.resolve('out/checks');

/** Default checkpoints, in seconds. Aim one at each beat's key moment. */
const CHECKPOINTS = [0, 1.0, 1.6, 2.2, 2.6, 6.3];

const argv = process.argv.slice(2);
const wantGrid = argv.includes('--grid');
const scale = argv.includes('--full') ? 1 : 0.5;
const times = argv.filter((a) => !a.startsWith('--')).map(Number).filter((n) => !Number.isNaN(n));
const checkpoints = times.length ? times : CHECKPOINTS;

// Names are index-based, so leftovers from a previous run with a different checkpoint list
// survive and quietly corrupt the review.
fs.rmSync(OUT_DIR, { recursive: true, force: true });
fs.mkdirSync(OUT_DIR, { recursive: true });

console.log('Bundling once...');
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts') });
const inputProps = wantGrid ? { grid: true } : {};

const composition = await selectComposition({ serveUrl, id: COMPOSITION_ID, inputProps });

console.log('Opening one browser for all stills...');
const browser = await openBrowser('chrome');
try {
  for (const [i, t] of checkpoints.entries()) {
    const frame = Math.min(Math.round(t * composition.fps), composition.durationInFrames - 1);
    const output = path.join(OUT_DIR, `c${String(i).padStart(2, '0')}_t${t}s.png`);
    await renderStill({
      composition, serveUrl, output, frame, scale,
      puppeteerInstance: browser, inputProps, overwrite: true,
    });
    console.log(`  t=${t}s (frame ${frame}) -> ${path.basename(output)}`);
  }
} finally {
  // Remotion's HeadlessBrowser.close destructures its argument — it is NOT optional.
  await browser.close({ silent: true });
}

console.log(`\n${checkpoints.length} checkpoints in ${OUT_DIR}`);
