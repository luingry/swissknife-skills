/**
 * Component replication.
 *
 * Reads a REAL component out of a REAL page and emits a structured spec describing its parts:
 * the tree, each part's geometry relative to the component root, and the visual properties
 * needed to redraw it (colors, radii, borders, shadows, typography, text).
 *
 * Why this exists: a screenshot of a component is one flat image, so the most you can animate
 * is the whole rectangle. Decomposed into parts, every row, icon, badge and button becomes
 * independently animatable — stagger, translate, scale, morph, ripple. That is the difference
 * between "a picture that slides in" and the rich component choreography this skill targets.
 *
 * It is a REPLICA, not a redesign: geometry and styles come from the live product, so the
 * animation shows something the product actually looks like.
 *
 * Usage:
 *   node scripts/replicate.mjs <url> <selector> [--name card] [--depth 4] [--viewport 1440x900]
 *
 * Output: public/<name>.component.json
 */
import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';

const [url, selector] = process.argv.slice(2);
if (!url || !selector) {
  console.error('usage: node scripts/replicate.mjs <url> <selector> [--name x] [--depth n] [--viewport WxH]');
  process.exit(1);
}
const arg = (flag, fallback) => {
  const i = process.argv.indexOf(flag);
  return i > -1 ? process.argv[i + 1] : fallback;
};
const name = arg('--name', 'component');
const maxDepth = Number(arg('--depth', 5));
const [vw, vh] = arg('--viewport', '1440x900').split('x').map(Number);

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: vw, height: vh }, deviceScaleFactor: 2 });
const page = await context.newPage();
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(600);

const root = page.locator(selector).first();
await root.waitFor({ state: 'visible', timeout: 15000 });

const spec = await root.evaluate((el, depthLimit) => {
  const rootRect = el.getBoundingClientRect();

  const px = (v) => (v ? Math.round(parseFloat(v) * 100) / 100 : 0);

  const visible = (node, rect, cs) => {
    if (rect.width < 1 || rect.height < 1) return false;
    if (cs.visibility === 'hidden' || cs.display === 'none') return false;
    if (parseFloat(cs.opacity) === 0) return false;
    return true;
  };

  // Each direct text node is measured on its own with a Range and emitted as its own part.
  // Attaching text to its parent element instead would draw it across the parent's whole box,
  // overlapping the children — and it would make a whole subtree animate as one blob rather
  // than letting each text run move independently.
  const textRuns = (node) => {
    const runs = [];
    for (const n of node.childNodes) {
      if (n.nodeType !== Node.TEXT_NODE) continue;
      const content = n.textContent.replace(/\s+/g, ' ').trim();
      if (!content) continue;
      const range = document.createRange();
      range.selectNodeContents(n);
      const r = range.getBoundingClientRect();
      range.detach?.();
      if (r.width < 1 || r.height < 1) continue;
      runs.push({ text: content, rect: r });
    }
    return runs;
  };

  let idc = 0;
  const parts = [];

  const walk = (node, depth, parentId) => {
    const rect = node.getBoundingClientRect();
    const cs = getComputedStyle(node);
    if (!visible(node, rect, cs)) return;

    const runs = textRuns(node);
    const children = Array.from(node.children);
    // A node with BOTH text and element children must still recurse, or the children are
    // silently dropped. Leafness is about having no children, not about having text.
    const isLeaf = children.length === 0 || depth >= depthLimit;
    const img = node.tagName === 'IMG' ? node.currentSrc || node.src : undefined;

    const id = `p${idc++}`;
    parts.push({
      id,
      parent: parentId,
      depth,
      tag: node.tagName.toLowerCase(),
      role: node.getAttribute('role') ?? undefined,
      // Absolute URL so the replica can load it directly; <img> has no computed background.
      img: img ? new URL(img, location.href).href : undefined,
      isLeaf,
      // Geometry relative to the component root — the whole point, so parts can be placed
      // absolutely and moved independently.
      rect: [
        Math.round(rect.x - rootRect.x),
        Math.round(rect.y - rootRect.y),
        Math.round(rect.width),
        Math.round(rect.height),
      ],
      style: {
        background: cs.backgroundColor,
        backgroundImage: cs.backgroundImage !== 'none' ? cs.backgroundImage : undefined,
        color: cs.color,
        fontFamily: cs.fontFamily,
        fontSize: px(cs.fontSize),
        fontWeight: cs.fontWeight,
        lineHeight: cs.lineHeight === 'normal' ? undefined : px(cs.lineHeight),
        letterSpacing: cs.letterSpacing === 'normal' ? undefined : px(cs.letterSpacing),
        textAlign: cs.textAlign,
        borderRadius: cs.borderRadius,
        border: cs.borderWidth !== '0px' ? `${cs.borderWidth} ${cs.borderStyle} ${cs.borderColor}` : undefined,
        boxShadow: cs.boxShadow !== 'none' ? cs.boxShadow : undefined,
        opacity: parseFloat(cs.opacity),
        overflow: cs.overflow,
      },
    });

    // Emit each measured text run as its own leaf part, so text never overlaps siblings and
    // every run can be choreographed independently.
    for (const run of runs) {
      parts.push({
        id: `p${idc++}`,
        parent: id,
        depth: depth + 1,
        tag: '#text',
        text: run.text,
        isLeaf: true,
        rect: [
          Math.round(run.rect.x - rootRect.x),
          Math.round(run.rect.y - rootRect.y),
          Math.round(run.rect.width),
          Math.round(run.rect.height),
        ],
        style: {
          color: cs.color,
          fontFamily: cs.fontFamily,
          fontSize: px(cs.fontSize),
          fontWeight: cs.fontWeight,
          lineHeight: cs.lineHeight === 'normal' ? undefined : px(cs.lineHeight),
          letterSpacing: cs.letterSpacing === 'normal' ? undefined : px(cs.letterSpacing),
          textAlign: cs.textAlign,
          opacity: 1,
        },
      });
    }

    if (!isLeaf) for (const c of children) walk(c, depth + 1, id);
  };

  walk(el, 0, null);

  return {
    size: [Math.round(rootRect.width), Math.round(rootRect.height)],
    parts,
  };
}, maxDepth);

await browser.close();

const out = {
  name,
  url,
  selector,
  capturedAt: new Date().toISOString(),
  viewport: { width: vw, height: vh },
  ...spec,
};

const outPath = path.resolve('public', `${name}.component.json`);
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(out, null, 2));

const leaves = out.parts.filter((p) => p.isLeaf).length;
console.log(`\nComponent : ${name}`);
console.log(`Size      : ${out.size[0]}x${out.size[1]}`);
console.log(`Parts     : ${out.parts.length} (${leaves} leaves — these are what animate)`);
console.log(`Spec      : ${outPath}`);
console.log(`\nInspect the part list and give the ones you want to choreograph stable ids/groups.`);
