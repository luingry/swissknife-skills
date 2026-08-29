import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import test from 'node:test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const skillRoot = path.join(root, 'skills', 'delivery-closer');
const entrypoint = fs.readFileSync(path.join(skillRoot, 'SKILL.md'), 'utf8');

// These assertions protect the published written contract; they do not prove
// universal skill activation or model behavior in a host runtime.
test('delivery-closer has a narrow authorized terminal-delivery contract', () => {
  assert.match(entrypoint, /name: delivery-closer/);
  assert.match(entrypoint, /authorized by the full user request and Task Owner handoff/i);
  assert.match(entrypoint, /commit\/push; publish, release,\s*or deploy; install or update; runtime rollout, restart, or rebuild/i);
  assert.match(entrypoint, /Run a build or\s*test only when it is itself the requested terminal result/i);
  assert.match(entrypoint, /Skip for analysis, documentation, a local-only change, a deterministic check/i);
  assert.match(entrypoint, /confidence pass/i);
});

test('delivery-closer requires live preflight and preserves authority boundaries', () => {
  assert.match(entrypoint, /Reconcile live state before acting/i);
  assert.match(entrypoint, /Reuse valid evidence instead of\s*repeating it/i);
  assert.match(entrypoint, /Read authority from the full request and handoff, not keyword matching/i);
  assert.match(entrypoint, /Do not\s*ask again for an action already authorized there/i);
  assert.match(entrypoint, /Do not infer authority for a\s*push, deploy, release, install, restart, rebuild, deletion, login, secrets/i);
  assert.match(entrypoint, /Preserve unrelated work/i);
  assert.match(entrypoint, /reconcile ambiguous outcomes\s*before retrying/i);
});

test('delivery-closer stays separate from implementation, orchestration, and verification', () => {
  assert.match(entrypoint, /Do not edit implementation artifacts, delegate, reinvoke orchestration, or\s*automatically call delivery-verification/i);
  assert.match(entrypoint, /do not\s*broaden scope to repair implementation defects/i);
  for (const verdict of ['PASS', 'NEEDS_CORRECTION', 'BLOCKED']) {
    assert.match(entrypoint, new RegExp(`\\*\\*${verdict}\\*\\*`));
  }
});

test('delivery-closer keeps commit and push scope explicit', () => {
  assert.match(entrypoint, /For commit or push, inspect the diff first/i);
  assert.match(entrypoint, /stage only explicitly authorized\s*or named paths/i);
  assert.match(entrypoint, /Never use broad or global staging, including `git add -A`/i);
  assert.match(entrypoint, /If\s*the paths are not clear, return \*\*BLOCKED\*\*/i);
  assert.match(entrypoint, /Before pushing, verify that the\s*commit contains only the authorized scope/i);
});

test('delivery-closer exposes concise Codex metadata', () => {
  const manifest = fs.readFileSync(path.join(skillRoot, 'agents', 'openai.yaml'), 'utf8');
  assert.match(manifest, /display_name: "Delivery Closer"/);
  assert.match(manifest, /default_prompt: "Use \$delivery-closer/);
});
