import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import test from 'node:test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const skillRoot = path.join(root, 'skills', 'orchestration');

function read(relativePath) {
  return fs.readFileSync(path.join(skillRoot, relativePath), 'utf8');
}

function assertLocalLinksResolve(relativePath) {
  const content = read(relativePath);
  for (const [, target] of content.matchAll(/\[[^\]]+\]\(([^)\s]+)\)/g)) {
    if (/^(https?:|mailto:|tel:|#)/.test(target)) continue;
    const withoutAnchor = decodeURIComponent(target.split('#')[0]);
    assert.ok(fs.existsSync(path.resolve(path.dirname(path.join(skillRoot, relativePath)), withoutAnchor)), `${relativePath} has a missing local link: ${target}`);
  }
}

function markdownFiles(directory, relativePrefix = '') {
  return fs.readdirSync(directory, {withFileTypes: true}).flatMap((entry) => {
    const relativePath = path.join(relativePrefix, entry.name);
    if (entry.isDirectory()) return markdownFiles(path.join(directory, entry.name), relativePath);
    return entry.isFile() && entry.name.endsWith('.md') ? [relativePath] : [];
  });
}

test('orchestration entrypoint requires routing and selects three host adapters', () => {
  const entrypoint = read('SKILL.md');
  assert.match(entrypoint, /description: "MANDATORY before every engineering or repository task:/);
  for (const [host, reference] of [
    ['Codex', 'references/codex.md'],
    ['Claude Code', 'references/claude-code.md'],
    ['Cursor', 'references/cursor.md'],
  ]) {
    assert.match(entrypoint, new RegExp(`\\*\\*${host}:\\*\\*`));
    assert.match(entrypoint, new RegExp(reference.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});

test('Codex adapter preserves Luna, six-point Spark gate, and CLI fallback', () => {
  const codex = read('references/codex.md');
  const gate = codex.slice(codex.indexOf('## Mandatory Spark gate'), codex.indexOf('## Sol Task Owner'));
  assert.equal((gate.match(/^\d+\. /gm) ?? []).length, 6, 'Spark gate must have exactly six numbered criteria');
  assert.match(codex, /when\s+Luna\s+is\s+available,\s+the\s+Task Owner MUST delegate to Luna/i);
  assert.match(codex, /\[CLI workers\]\(cli-workers\.md\)/);
  assert.match(codex, /If all six pass and Spark is available, delegation to Spark is mandatory/i);
  assert.match(codex, /If Spark is absent from both native delegation and the live CLI catalog/i);
});

test('Claude and Cursor adapters have host-local sequential fallback without Codex operational artifacts', () => {
  const claude = read('references/claude-code.md');
  const cursor = read('references/cursor.md');
  assert.match(claude, /Before \*\*any\*\* Agent\/subagent call, inspect the effective/i);
  assert.match(claude, /CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS/);
  assert.match(claude, /If the state cannot be confirmed disabled, remain\s+owner-sequential/i);
  assert.match(claude, /supports nested subagents up to three\s+layers below/i);
  assert.match(claude, /this skill deliberately\s+keeps a shallow topology/i);
  assert.match(cursor, /work sequentially/i);
  for (const adapter of [claude, cursor]) {
    assert.doesNotMatch(adapter, /spawn_agent|wait_agent|Start-CodexCliWorker|gpt-5\.|\bSol\b|\bTerra\b|\bLuna\b|\bSpark\b/);
  }
});

test('orchestration references resolve their essential local links', () => {
  for (const relativePath of [
    'SKILL.md',
    'references/codex.md',
    'references/shared-core.md',
    'references/claude-code.md',
    'references/cursor.md',
  ]) {
    assertLocalLinksResolve(relativePath);
  }
});

// These assertions protect the published written contract; they do not prove
// universal skill activation or model behavior in a host runtime.
test('orchestration discovers optional capabilities at their separate decision points', () => {
  const entrypoint = read('SKILL.md');
  assert.match(entrypoint, /During\s*significant visual work, discover `design-intelligence`\. Near conclusion,\s*discover `delivery-verification` and `delivery-closer`/i);
  assert.match(entrypoint, /A catalog entry alone\s*does not grant authority or make a capability mandatory/i);
  assert.match(entrypoint, /If one is absent or unavailable, the Task Owner performs the same applicable\s*contract proportionately/i);
  assert.match(entrypoint, /absence never skips visual acceptance, delivery\s*acceptance, or an authorized terminal close/i);
  assert.match(entrypoint, /These capabilities are independent/i);
  assert.match(entrypoint, /preserve the fast path when none\s*applies/i);
});

test('orchestration reserves delivery closure for full-request authority and a temporary specialist', () => {
  const routing = read('references/routing-details.md');
  assert.match(routing, /explicitly authorized terminal action remains after implementation/i);
  assert.match(routing, /authority from the full user request and Owner handoff, current state,\s*valid existing evidence, and changes that must be preserved/i);
  assert.match(routing, /suitable temporary specialist, dispatch it in fresh context/i);
  assert.match(routing, /Otherwise\s*the Owner performs the same closing protocol sequentially/i);
  assert.match(routing, /not persistent and does not delegate/i);
  assert.match(routing, /may be selected\s*separately, and neither is required for the fast path or depends on the other/i);
});

test('shared core keeps temporary delivery closure portable and non-recursive', () => {
  const sharedCore = read('references/shared-core.md');
  assert.match(sharedCore, /owner may select both only when their distinct triggers each\s*exist; neither calls the other automatically/i);
  assert.match(sharedCore, /suitable temporary specialist, the owner dispatches that specialist in fresh\s*context/i);
  assert.match(sharedCore, /not a\s*persistent agent and must not delegate/i);
  assert.match(sharedCore, /specialist or capability is\s*unavailable, the owner performs the same closing protocol sequentially/i);
});

test('orchestration is self-contained and has no links to sibling skills', () => {
  for (const relativePath of markdownFiles(skillRoot)) {
    const content = read(relativePath);
    for (const [, target] of content.matchAll(/\[[^\]]+\]\(([^)\s]+)\)/g)) {
      if (/^(https?:|mailto:|tel:|#)/.test(target)) continue;
      const resolved = path.resolve(path.dirname(path.join(skillRoot, relativePath)), decodeURIComponent(target.split('#')[0]));
      assert.ok(resolved.startsWith(`${skillRoot}${path.sep}`) || resolved === skillRoot, `${relativePath} links outside orchestration: ${target}`);
      assert.ok(fs.existsSync(resolved), `${relativePath} has a missing local link: ${target}`);
    }
  }
});
