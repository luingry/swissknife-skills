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

const retiredRouteName = String.fromCharCode(83, 112, 97, 114, 107);
const retiredModelSlug = ['gpt-5.3-codex-', retiredRouteName.toLowerCase()].join('');

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

test('Codex adapter preserves Luna Low reconnaissance and surgical routing, Luna Max default implementation, Terra High speed routing, the Astra/Sol decision tier, and CLI fallback', () => {
  const codex = read('references/codex.md');
  const decisionTier = codex.slice(codex.indexOf('### Astra and Sol'), codex.indexOf('### Luna Low'));
  const lunaLow = codex.slice(codex.indexOf('### Luna Low'), codex.indexOf('### Luna Max'));
  const gate = codex.slice(codex.indexOf('## Mandatory Luna Low surgical gate'), codex.indexOf('## Astra or Sol Task Owner'));
  assert.match(decisionTier, /Astra \(`gpt-6-astra`\) or Sol \(`gpt-5\.6-sol`\)/);
  assert.match(decisionTier, /for planning when the difficult\s+part is deciding what to do/i);
  assert.match(decisionTier, /They are equivalent for these functions/i);
  assert.match(decisionTier, /select one available, authorized model/i);
  assert.match(decisionTier, /Do not automatically\s+escalate Sol work to Astra, require dual review/i);
  assert.match(decisionTier, /Default effort is medium.*live host supports high for the selected\s+exact model/is);
  assert.equal((gate.match(/^\d+\. /gm) ?? []).length, 6, 'Luna Low surgical gate must have exactly six numbered criteria');
  assert.match(lunaLow, /Reconnaissance.*strictly read-only/is);
  assert.match(lunaLow, /Surgical implementation.*all\s+six criteria/is);
  assert.match(lunaLow, /authorized\s+write-enabled repository or workspace/is);
  assert.match(lunaLow, /scope exclusive.*serialize writes/is);
  assert.match(lunaLow, /isolated worktree when the native host provides it/is);
  assert.match(lunaLow, /shared native checkout is valid\s+when\s+its writes remain serialized/is);
  assert.doesNotMatch(lunaLow, /Use an isolated\s+repository worktree with `workspace-write`/i);
  assert.match(lunaLow, /explicitly set effort `low`/i);
  assert.match(lunaLow, /DirectPath remains strictly\s+read-only/i);
  assert.match(codex, /\[CLI workers\]\(cli-workers\.md\)/);
  assert.match(codex, /If all six pass and Luna Low is available, delegation to Luna Low is mandatory/i);
  assert.match(codex, /for Astra\/Sol, Luna Max, and Terra Task Owners/i);
  assert.match(codex, /verify that the exact intended model slug\s+and effort are exposed and supported/i);
  assert.match(codex, /semantic role such\s+as `reviewer` does not prove a fixed model or effort/i);
  assert.match(codex, /If Luna Low is absent from native delegation and the live CLI catalog/i);
  assert.match(codex, /If Luna Low is genuinely unavailable, a Luna Max or Terra Task Owner performs\s+the bounded change directly/is);
  const lunaMax = codex.slice(codex.indexOf('### Luna Max'), codex.indexOf('### Terra High'));
  const terraHigh = codex.slice(codex.indexOf('### Terra High'), codex.indexOf('## Mandatory Luna Low surgical gate'));
  assert.match(lunaMax, /`gpt-5\.6-luna`, effort `max`/);
  assert.match(lunaMax, /default substantive\s+implementation tier/i);
  assert.match(lunaMax, /user explicitly prioritizes speed/i);
  assert.match(lunaMax, /user-selected supported\s+model or effort\s+overrides/i);
  assert.match(lunaMax, /means lower wall-clock\s+latency for the agent\/orchestration work to complete/i);
  assert.match(lunaMax, /Do not infer that priority\s+solely because the requested product work is a performance, runtime-latency, or\s+throughput optimization/i);
  assert.match(terraHigh, /`gpt-5\.6-terra`, effort `high`/);
  assert.match(terraHigh, /Luna\s+Max is genuinely unavailable/i);
  assert.match(codex, /existing Luna Max or Terra\s+Task Owner\s+implements substantive work directly/i);
});

test('routing keeps product performance work distinct from agent delivery-speed priority', () => {
  const routing = read('references/routing-details.md');
  assert.match(routing, /means lower wall-clock\s+latency for the agent\/orchestration work to complete/i);
  assert.match(routing, /Do not infer that priority\s+solely because the requested product work is a performance, runtime-latency, or\s+throughput optimization/i);
  assert.match(routing, /performance, runtime-latency, or\s+throughput optimization: such work still uses Luna Max by default/i);
  assert.match(routing, /Luna Low investigating, architecting, or replacing Luna Max\/Terra for complex\s+work/i);
  assert.match(routing, /Luna Low surgical.*mandatory executor/is);
  assert.match(routing, /native route\s+uses an authorized write-enabled repository\/workspace.*exclusive scope.*serialized writes/is);
  assert.match(routing, /shared native checkout is valid\s+when\s+its writes remain serialized/is);
  assert.match(routing, /CLI\s+fallback remains stricter:\s+its surgical.*isolated\s+worktree/is);
  assert.match(routing, /Luna Low is\s+unavailable.*Luna Max by default.*Terra High/is);
});

test('CLI worker fallback separates Luna Low direct reconnaissance, surgical writes, and Luna Max repository implementation', () => {
  const cliWorkers = read('references/cli-workers.md');
  const launcher = read('scripts/Start-CodexCliWorker.ps1');
  assert.match(cliWorkers, /Luna Low \(`gpt-5\.6-luna`, effort `low`\)/);
  assert.match(cliWorkers, /surgical\s+repository edit.*all six Mandatory Luna Low surgical criteria/is);
  assert.match(cliWorkers, /surgical repository implementation.*isolated worktree/is);
  assert.match(cliWorkers, /surgical.*`workspace-write`.*explicit low effort/is);
  assert.match(cliWorkers, /Luna Max \(`gpt-5\.6-luna`, effort `max`\)/);
  assert.match(cliWorkers, /Luna Max repository implementation/i);
  assert.match(cliWorkers, /-AccessMode workspace-write/);
  assert.match(cliWorkers, /direct mode.*effort `low` and `read-only`/is);
  assert.match(cliWorkers, /repository `low` value must be explicit\s+for the surgical route/is);
  assert.match(launcher, /\[string\]\$ReasoningEffort,/);
  assert.match(launcher, /\$ReasoningEffort = 'max'/);
  assert.match(launcher, /\[ValidateSet\('gpt-5\.6-luna'\)\]/);
  assert.match(launcher, /DirectPath mode is restricted to Luna Low \(reasoning effort low\)/);
  assert.match(launcher, /DirectPath mode is restricted to read-only access/);
});

test('current Codex operational artifacts contain no retired route or model slug', () => {
  const files = [
    'references/codex.md',
    'references/routing-details.md',
    'references/cli-workers.md',
    'references/acceptance-workflows.md',
    'references/host-capability-evidence.md',
    'scripts/Start-CodexCliWorker.ps1',
  ];
  for (const relativePath of files) {
    const content = read(relativePath);
    assert.doesNotMatch(content, new RegExp(retiredRouteName, 'i'), `${relativePath} still names the retired route`);
    assert.doesNotMatch(content, new RegExp(retiredModelSlug, 'i'), `${relativePath} still names the retired model`);
  }
  for (const relativePath of ['docs/compatibility.md', 'skills/catalog.json', 'CHANGELOG.md']) {
    const content = fs.readFileSync(path.join(root, relativePath), 'utf8');
    assert.doesNotMatch(content, new RegExp(retiredRouteName, 'i'), `${relativePath} still names the retired route`);
    assert.doesNotMatch(content, new RegExp(retiredModelSlug, 'i'), `${relativePath} still names the retired model`);
  }
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
    assert.doesNotMatch(adapter, /spawn_agent|wait_agent|Start-CodexCliWorker|gpt-(?:5\.|6-astra)|\bAstra\b|\bSol\b|\bTerra\b|\bLuna\b/);
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
