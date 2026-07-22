/**
 * Real-interaction capture.
 *
 * Drives a REAL browser through a REAL interaction script with Playwright, records the
 * session to video, and emits a timeline of what happened and when. The demo is then composed
 * from that footage, so every system reaction is genuine: focus rings appear because the
 * element was really focused, text appears character by character because it was really typed,
 * scrolling carries the site's real momentum and scroll-triggered animations, hover states
 * fire because the pointer really moved there.
 *
 * This replaces faking interaction with an overlay on a static screenshot. The overlay cursor
 * is still drawn by Remotion (the OS cursor is not in the recording), but it is driven by the
 * timeline this script emits, so it lands exactly where the real click happened.
 *
 * VIEWPORT CONSISTENCY: the recording size is pinned to the viewport, always. Playwright's
 * default scales video down to fit 800x800, which silently changes framing per page and is
 * why captures drift between screens. Set it once here and every page matches.
 *
 * Usage:
 *   node scripts/capture.mjs capture/home.capture.mjs
 *   node scripts/capture.mjs capture/home.capture.mjs --headed   # watch it run
 *
 * Outputs (into public/):
 *   <name>.webm         the recording
 *   <name>.timeline.json  actions with timestamps + coordinates
 */
import { chromium, devices } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';

const scriptArg = process.argv[2];
const headed = process.argv.includes('--headed');
if (!scriptArg) {
  console.error('usage: node scripts/capture.mjs <script.capture.mjs> [--headed]');
  process.exit(1);
}

const scriptPath = path.resolve(scriptArg);
const spec = (await import(pathToFileURL(scriptPath).href)).default;
const name = spec.name ?? path.basename(scriptPath).replace(/\.capture\.mjs$/, '');

const OUT_DIR = path.resolve('public');
const RAW_DIR = path.resolve('.capture-raw');
fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(RAW_DIR, { recursive: true });

/* ------------------------------------------------------------------ defaults */

const isMobile = spec.device != null;
const preset = isMobile ? devices[spec.device] : null;

const viewport = spec.viewport ?? preset?.viewport ?? { width: 1440, height: 900 };
// Recording size ALWAYS equals the viewport. Never let Playwright pick.
const recordSize = { width: viewport.width, height: viewport.height };

const browser = await chromium.launch({ headless: !headed });
const context = await browser.newContext({
  ...(preset ?? {}),
  viewport,
  deviceScaleFactor: spec.deviceScaleFactor ?? (preset?.deviceScaleFactor ?? 2),
  recordVideo: { dir: RAW_DIR, size: recordSize },
  reducedMotion: 'no-preference', // we WANT the site's real animations
  colorScheme: spec.colorScheme ?? 'light',
});

const page = await context.newPage();

/* ------------------------------------------------------------------ timeline */

const timeline = [];
let t0 = 0;
const now = () => (Date.now() - t0) / 1000;
const mark = (entry) => timeline.push({ t: Number(now().toFixed(3)), ...entry });

async function pointOf(action) {
  if (action.at) return { x: action.at[0], y: action.at[1] };
  const el = page.locator(action.selector).first();
  await el.waitFor({ state: 'visible', timeout: action.timeout ?? 10000 });
  const box = await el.boundingBox();
  if (!box) throw new Error(`no bounding box for ${action.selector}`);
  return { x: Math.round(box.x + box.width / 2), y: Math.round(box.y + box.height / 2) };
}

/* --------------------------------------------------------------- the actions */

await page.goto(spec.url, { waitUntil: spec.waitUntil ?? 'networkidle' });
if (spec.beforeActions) await spec.beforeActions(page);

// Settle, then start the clock so the recording's head isn't page load.
await page.waitForTimeout(spec.settleMs ?? 600);
t0 = Date.now();
let cursor = { x: Math.round(viewport.width / 2), y: Math.round(viewport.height * 0.7) };
await page.mouse.move(cursor.x, cursor.y);
mark({ kind: 'move', x: cursor.x, y: cursor.y });

for (const action of spec.actions) {
  switch (action.type) {
    case 'wait':
      await page.waitForTimeout(action.ms ?? 500);
      break;

    case 'waitFor':
      await page.locator(action.selector).first().waitFor({
        state: action.state ?? 'visible',
        timeout: action.timeout ?? 10000,
      });
      mark({ kind: 'waitFor', selector: action.selector });
      break;

    case 'moveTo':
    case 'hover': {
      const p = await pointOf(action);
      // Real move in steps: triggers real hover/mouseover handlers along the way.
      await page.mouse.move(p.x, p.y, { steps: action.steps ?? 24 });
      cursor = p;
      mark({ kind: 'move', x: p.x, y: p.y, selector: action.selector });
      if (action.type === 'hover') await page.waitForTimeout(action.holdMs ?? 400);
      break;
    }

    case 'click': {
      const p = await pointOf(action);
      if (p.x !== cursor.x || p.y !== cursor.y) {
        await page.mouse.move(p.x, p.y, { steps: action.steps ?? 24 });
        cursor = p;
        mark({ kind: 'move', x: p.x, y: p.y, selector: action.selector });
      }
      // Dwell before acting — matches how a hand behaves, and lets hover states render.
      await page.waitForTimeout(action.dwellMs ?? 180);
      await page.mouse.click(p.x, p.y, { button: action.button ?? 'left' });
      mark({ kind: 'click', x: p.x, y: p.y, selector: action.selector });
      break;
    }

    case 'type': {
      // Real typing: focus is real, each character really lands, the site's own input
      // handlers (validation, autocomplete, counters) run exactly as a user would see.
      mark({ kind: 'typeStart', text: action.text });
      await page.keyboard.type(action.text, { delay: action.delayMs ?? 85 });
      mark({ kind: 'typeEnd', text: action.text });
      break;
    }

    case 'press':
      await page.keyboard.press(action.key);
      mark({ kind: 'press', key: action.key });
      break;

    case 'scroll': {
      // Real wheel events in increments: preserves the site's scroll momentum, sticky
      // headers, parallax and scroll-triggered reveals. A CSS transform fakes none of that.
      const total = action.deltaY ?? 600;
      const steps = action.steps ?? 18;
      const per = total / steps;
      mark({ kind: 'scrollStart', deltaY: total, x: cursor.x, y: cursor.y });
      for (let i = 0; i < steps; i++) {
        await page.mouse.wheel(0, per);
        await page.waitForTimeout(action.stepMs ?? 16);
      }
      await page.waitForTimeout(action.settleMs ?? 400);
      mark({ kind: 'scrollEnd', deltaY: total });
      break;
    }

    case 'marker': // pure annotation: a caption anchor, a beat boundary
      mark({ kind: 'marker', label: action.label });
      break;

    default:
      throw new Error(`unknown action type: ${action.type}`);
  }
}

await page.waitForTimeout(spec.tailMs ?? 700);
const duration = now();

/* -------------------------------------------------------------------- finish */

const video = page.video();
await context.close();
await browser.close();

const rawPath = await video.path();
const webmPath = path.join(OUT_DIR, `${name}.webm`);
fs.copyFileSync(rawPath, webmPath);
fs.rmSync(RAW_DIR, { recursive: true, force: true });

const meta = {
  name,
  url: spec.url,
  viewport,
  recordSize,
  durationSeconds: Number(duration.toFixed(3)),
  events: timeline,
};
const timelinePath = path.join(OUT_DIR, `${name}.timeline.json`);
fs.writeFileSync(timelinePath, JSON.stringify(meta, null, 2));

console.log(`\nRecording : ${webmPath}`);
console.log(`Timeline  : ${timelinePath}`);
console.log(`Duration  : ${meta.durationSeconds}s`);
console.log(`Capture   : ${recordSize.width}x${recordSize.height} (pinned to viewport)`);
console.log(`Actions   : ${timeline.length}`);
