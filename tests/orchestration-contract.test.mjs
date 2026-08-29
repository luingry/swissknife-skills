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
