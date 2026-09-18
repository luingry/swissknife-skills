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

function section(content, heading, nextHeading) {
  const start = content.indexOf(heading);
  assert.ok(start >= 0, `missing section: ${heading}`);
  const end = nextHeading ? content.indexOf(nextHeading, start + heading.length) : content.length;
  assert.ok(end > start, `missing section boundary: ${nextHeading ?? 'EOF'}`);
  return content.slice(start, end);
}

const retiredRouteName = String.fromCharCode(83, 112, 97, 114, 107);
const retiredModelSlug = ['gpt-5.3-codex-', retiredRouteName.toLowerCase()].join('');
const retiredEditorArtifact = ['cursor', 'editions.md'].join('-');

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

test('Codex preference gate is persistent, pausable, and request-precedence aware', () => {
  const codex = read('references/codex.md');
  const projectRules = fs.readFileSync(path.join(root, 'AGENTS.md'), 'utf8');

  assert.match(projectRules, /^## Orchestration preference$/m);
  const preferenceFields = projectRules.match(/^- Delivery priority: (speed|cost-efficiency)$/gm) ?? [];
  assert.equal(preferenceFields.length, 1, 'project must contain exactly one canonical delivery-priority field');
  assert.match(preferenceFields[0], /^- Delivery priority: (speed|cost-efficiency)$/);
  assert.match(codex, /At the start of every use.*read the applicable\s+project rules.*most specific `AGENTS\.md`/is);
  assert.match(codex, /canonical field is present.*one short reminder.*before doing any work/is);
  assert.match(codex, /If the field is absent, ask exactly:\s*`Você prioriza velocidade das entregas ou eficiência de custo\?`/is);
  assert.match(codex, /PAUSE.*exploration, delegation, edits, and tests.*until the user\s+answers/is);
  assert.match(codex, /record `speed` or `cost-efficiency`.*most\s+specific applicable `AGENTS\.md`/is);
  assert.match(codex, /never duplicate either/is);
  assert.match(codex, /explicit priority in the current request has\s+precedence.*does not change the persistent preference/is);
});

test('Codex consultation is same-model, effort-bounded, concrete-question driven, and shallow', () => {
  const codex = read('references/codex.md');
  const consultation = section(codex, '## Adaptive same-model consultation (Codex only)', '## Mandatory Luna Low surgical gate').replace(/\s+/g, ' ');

  assert.match(consultation, /medium Astra owner.*`gpt-6-astra`.*`high` or `xhigh`/is);
  assert.match(consultation, /medium Sol owner.*`gpt-5\.6-sol`.*`high` or `xhigh`/is);
  assert.match(consultation, /Never switch Astra and Sol automatically/is);
  assert.match(consultation, /owner remains at medium/is);
  assert.match(consultation, /Do not use `low`, `max`, or `ultra`/i);
  assert.match(consultation, /Use `high` only for an exact unresolved decision/is);
  for (const trigger of ['non-local architecture', 'difficult causal analysis', 'materially different interpretations', 'conflicting evidence', 'consequential trade-off', 'impact beyond']) {
    assert.match(consultation, new RegExp(trigger.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
  }
  assert.match(consultation, /Use `xhigh` for material security/is);
  for (const trigger of ['authorization', 'credential', 'data integrity', 'loss', 'migration', 'distributed concurrency', 'consistency', 'ownership', 'critical', 'difficult-to-reverse', 'two substantive approaches', 'persistent conflict', 'high` did not resolve']) {
    assert.match(consultation, new RegExp(trigger.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
  }
  assert.match(consultation, /Do not consult merely because.*large.*slow.*many files.*long build.*first failure.*first correction.*mechanical\s+review.*collecting logs.*generic uncertainty/is);
  assert.match(consultation, /Preciso decidir X entre A e B porque as evidências Y e Z entram em conflito\./);
  assert.match(consultation, /verify that the exact same model slug.*selected `high` or `xhigh` effort/is);
  assert.match(consultation, /generic temporary subagent.*`fork_turns: "none"`.*few turns when indispensable/is);
  assert.match(consultation, /do not assume a cache or pass the full conversation history/is);
  for (const field of ['Goal', 'Exact decision required', 'Relevant evidence', 'Attempts already made', 'Known options', 'Owner recommendation', 'Risk if wrong', 'Acceptance criteria affected']) {
    assert.match(consultation, new RegExp(`\\b${field.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}\\b`));
  }
  for (const field of ['Decision', 'Rationale', 'Material risks', 'Missing evidence', 'Required acceptance adjustments']) {
    assert.match(consultation, new RegExp(`\\b${field.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}\\b`));
  }
  assert.match(consultation, /Only one consultant.*one decision.*at most one focal follow-up/is);
  assert.match(consultation, /does not implement, delegate, accept, broaden scope, or review the whole change/is);
  assert.match(consultation, /Create this escalation block only when the same-model consultation actually occurs/is);
  for (const field of ['Owner model/effort', 'Consultant model/effort', 'Objective trigger', 'Decision', 'whether the recommendation changed', 'Tokens per participant', 'Consultation duration', 'Correction avoided or provoked']) {
    assert.match(consultation, new RegExp(field.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
  }
  assert.match(consultation, /never invent unavailable telemetry/is);
  assert.match(consultation, /Keep consultation metrics separate from product\/runtime acceptance evidence/is);
  assert.match(consultation, /If the exact same-model route is unavailable, do not switch models or pretend/is);
  assert.match(consultation, /existing Luna Max\/Terra -> Astra\/Sol consultation route semantically/is);
});

test('Codex-only preference and consultation rules do not leak into Claude or Cursor adapters', () => {
  for (const relativePath of ['references/claude-code.md', 'references/cursor.md']) {
    const adapter = read(relativePath);
    assert.doesNotMatch(adapter, /Delivery priority|same-model consultation|fork_turns|Você prioriza/i, `${relativePath} contains Codex-only policy`);
  }
});

test('acceptance documents evidence boundaries, resident-process proof, and delta contracts', () => {
  const acceptance = read('references/acceptance-workflows.md').replace(/\s+/g, ' ');

  assert.match(acceptance, /Higher reasoning effort does not substitute for absent observable evidence/is);
  assert.match(acceptance, /Exercise the real boundary.*before consulting or\s+accepting/is);
  assert.match(acceptance, /service, worker, agent, daemon.*runtime evidence is valid only after proving.*loaded the new version/is);
  assert.match(acceptance, /restart or reload.*PID\/start time.*version or hash.*startup log.*version marker/is);
  assert.match(acceptance, /new subsystem or system boundary.*reopen only the delta.*preserve criteria already satisfied.*recalculate.*do not retransmit.*history/is);
  assert.match(acceptance, /Keep the cost, corrections, and evidence.*new slice separate/is);
  assert.doesNotMatch(acceptance, /Codex consultation record|Owner model\/effort|Consultant model\/effort|Tokens per participant/i);
});

test('host evidence labels the dated Codex consultation policy without claiming capability or global preference', () => {
  const evidence = read('references/host-capability-evidence.md');
  assert.match(evidence, /\*\*User-directed policy \(2026-09-17\)\./);
  assert.match(evidence, /medium Astra\s+or Sol owner.*same-model temporary consultation.*`high` or\s+`xhigh`/is);
  assert.match(evidence, /dated\s+user-directed routing policy, not a benchmark, a fact about host\/model\s+capability, or a global personal preference/is);
  assert.match(evidence, /no quality, speed, cost,\s+or availability claim/is);
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
  assert.match(routing, /Astra owner -> Astra higher-effort consultation -> same Astra owner continues\./);
  assert.match(routing, /Sol owner -> Sol higher-effort consultation -> same Sol owner continues\./);
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
    'references/cost-efficiency.md',
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
    assert.doesNotMatch(content, new RegExp(retiredEditorArtifact, 'i'), `${relativePath} still names the retired editor artifact`);
  }
  for (const relativePath of ['docs/compatibility.md', 'skills/catalog.json', 'CHANGELOG.md']) {
    const content = fs.readFileSync(path.join(root, relativePath), 'utf8');
    assert.doesNotMatch(content, new RegExp(retiredRouteName, 'i'), `${relativePath} still names the retired route`);
    assert.doesNotMatch(content, new RegExp(retiredModelSlug, 'i'), `${relativePath} still names the retired model`);
    assert.doesNotMatch(content, new RegExp(retiredEditorArtifact, 'i'), `${relativePath} still names the retired editor artifact`);
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
    'references/cost-efficiency.md',
    'references/shared-core.md',
    'references/claude-code.md',
    'references/cursor.md',
  ]) {
    assertLocalLinksResolve(relativePath);
  }
});

test('owner handoff closes a complete behavior contract before substantive work', () => {
  const sharedCore = read('references/shared-core.md');
  const routing = read('references/routing-details.md');
  const contract = section(sharedCore, '## Execution contract before delegation', '## Delegation and parallelism');
  const handoff = section(routing, '## Handoff contract', '## Shallow topology');

  assert.match(contract, /smallest complete execution contract/i);
  for (const field of [
    /Goal:.*observable user\/product outcome/is,
    /Scope:.*authorized files.*dependencies.*affected\s+user flows/is,
    /Existing behavior\/invariants/is,
    /Constraints:/,
    /explicit requested behavior.*logically\/product-derived behavior.*preserved\s+behavior/is,
    /material assumptions and ambiguities/is,
    /Validation\/evidence:.*exact checks.*reachable flows.*observable proof/is,
    /worker return format/is,
  ]) {
    assert.match(contract, field);
  }
  assert.match(contract, /not a dump of\s+irrelevant history/i);
  assert.match(handoff, /\[shared core\]\(shared-core\.md\).*smallest complete execution\s+contract/is);
  assert.match(handoff, /Luna Max\s+and every substantive implementer/i);
  assert.match(handoff, /Goal:.*Scope:.*Context:.*Constraints:.*Acceptance:.*Validation\/evidence:.*Return format/is);
  assert.doesNotMatch(handoff, /Provide only the necessary context/i);
  assert.doesNotMatch(handoff, /when active, reveal\/show\/enable X/i);
  assert.doesNotMatch(handoff, /compact state\/transition matrix|conditional visibility or enablement/i);
});

test('shared core closes complementary UI behavior and routes worker-discovered gaps to the owner', () => {
  const contract = section(read('references/shared-core.md'), '## Execution contract before delegation', '## Delegation and parallelism');

  assert.match(contract, /compact state\/transition matrix.*initial state.*changed\s+transition/is);
  assert.match(contract, /complementary\/negative state.*conditional visibility or\s+enablement/is);
  assert.match(contract, /disabled.*loading.*error.*empty.*responsive.*accessibility/is);
  assert.match(contract, /when active, reveal\/show\/enable X.*inactive\/complementary state.*hidden\/disabled/is);
  assert.match(contract, /unless existing product evidence or an explicit requirement\s+says it persists/is);
  assert.match(contract, /neither owner nor worker may silently treat an omitted\s+complementary state as unrestricted/is);
  assert.match(contract, /product intent\/evidence/i);
  assert.doesNotMatch(contract, /must (?:enumerate|test) every (?:possible )?state/i);
});

test('workers report newly discovered behavior-contract gaps without asking users directly', () => {
  const contract = section(read('references/shared-core.md'), '## Execution contract before delegation', '## Delegation and parallelism');

  assert.match(contract, /Workers do not ask the user\s+directly/i);
  assert.match(contract, /discovers repository evidence, dependencies,\s+outcome-changing states\/flows, or a material ambiguity missing from the handoff/is);
  assert.match(contract, /update\/report that contract gap to the owner and pause only the affected\s+decision/is);
  assert.match(contract, /The owner asks the user only when the ambiguity is material and cannot\s+be resolved safely in scope/is);
  assert.doesNotMatch(contract, /worker(?:s)? (?:may|should|must) ask the user directly/i);
});

test('shared core treats waits as progress-aware wake-ups and preserves fresh recovery', () => {
  const sharedCore = read('references/shared-core.md');
  const waiting = section(sharedCore, '## Progress-aware waiting and recovery', '## Execution contract before delegation').replace(/\s+/g, ' ');

  assert.match(waiting, /event-oriented wake-up.*never isolated proof.*stuck/i);
  assert.match(waiting, /typically 5-10 minutes/i);
  assert.match(waiting, /initial lease of ~10 minutes.*debugging, build, and runtime tasks.*~20 minutes/is);
  assert.match(waiting, /checkpoint, tool activity, diff or file change, or active test\/build\/runtime process.*renew the wait/is);
  assert.match(waiting, /Do not create a turn, commentary, or owner snapshot for an unchanged state/i);
  assert.match(waiting, /lease expires.*request a concrete checkpoint.*~5-minute checkpoint window/is);
  assert.match(waiting, /two consecutive windows show no observable progress and no relevant process is active/is);
  assert.match(waiting, /Preserve workspace\/state and partial work.*truly new worker.*open finding.*affected files\/hunks/is);
  assert.match(waiting, /following up with the interrupted worker as fresh context/i);
  assert.match(waiting, /review and acceptance advance only on new evidence or a final result/i);
});

test('Codex cost loop binds timeout recovery to real control and a new agent', () => {
  const cost = read('references/cost-efficiency.md');
  const waiting = section(cost, '## Progress-aware Codex wait loop', '## Ledger and acceptance').replace(/\s+/g, ' ');

  assert.match(waiting, /host's event-oriented wait primitive.*wait_threads/is);
  assert.match(waiting, /5-10 minutes.*initial lease.*10 minutes.*20 minutes.*debugging, builds, or runtime work/is);
  assert.match(waiting, /send_message_to_thread.*request a concrete checkpoint.*about 5 minutes/is);
  assert.match(waiting, /second consecutive no-progress window.*no relevant process is active.*interrupting/is);
  assert.match(waiting, /create a truly new agent.*minimal finding-only brief/is);
  assert.match(waiting, /Never use `followup_task` on the interrupted agent.*fresh context/is);
});

test('Codex routes substantive work through authoritative contract and acceptance sections', () => {
  const codex = section(read('references/codex.md'), '## Invariants', '## Completion and verification');

  assert.match(codex, /Before routing Luna Max or any substantive implementer, read \[shared core\]\(shared-core\.md\)/is);
  assert.match(codex, /smallest complete execution contract/i);
  assert.match(codex, /partial handoff or irrelevant history/i);
  assert.match(codex, /apply the shared core's worker gap rule/i);
  assert.match(codex, /Acceptance follows \[acceptance workflows\]\(acceptance-workflows\.md\)/is);
  assert.match(codex, /contract-to-evidence mapping for every criterion.*full affected-flow rule/is);
  assert.match(codex, /mounting\/rendering or compiling.*not functional proof/is);
  assert.doesNotMatch(codex, /compact matrix.*initial.*changed.*disabled.*loading.*error/is);
});

test('acceptance workflow owns evidence mapping, full-flow proof, and proportional limits', () => {
  const acceptance = section(read('references/acceptance-workflows.md'), '## Contract-to-evidence acceptance', '## Bug fixes');

  assert.match(acceptance, /Before delegation, apply \[shared core\]\(shared-core\.md\)'s execution contract for\s+closure, state\/complement inference, and owner\/worker gap handling/is);
  assert.match(acceptance, /Every new or changed deterministic behavior contract must map to passing\s+evidence/is);
  assert.match(acceptance, /worker return maps each acceptance item to evidence.*owner\s+re-derives acceptance/is);
  assert.match(acceptance, /changed UI control or component that affects an action.*full affected\s+flow/is);
  assert.match(acceptance, /reachable preconditions through interaction\s+to observable outcome/is);
  assert.match(acceptance, /Mount\/render, snapshots, typecheck, lint, build, HTTP\s+success, or isolated handler calls alone are not functional proof/is);
  assert.match(acceptance, /If suitable automation\/infrastructure is unavailable or disproportionate/is);
  assert.match(acceptance, /name\s+the unautomated contract and why.*substitute real-flow evidence/is);
  assert.match(acceptance, /Required checks may not be failing.*unrelated pre-existing failures/is);
  assert.match(acceptance, /no mandatory E2E or screenshot.*no exhaustive state matrix.*no automatic user question/is);
  assert.match(acceptance, /Preserve the existing fast path/i);
  assert.doesNotMatch(acceptance, /Wording such as “when active, reveal\/show\/enable X”/i);
});

test('cost-efficient scenarios route execution and correction without moving acceptance from the owner', () => {
  const cost = read('references/cost-efficiency.md');
  const routing = read('references/routing-details.md');
  const ownership = section(cost, '## Non-negotiable ownership', '## Compact contract before implementation').replace(/\s+/g, ' ');
  const freshContext = section(cost, '## Fresh-context phase transitions', '## Ledger and acceptance').replace(/\s+/g, ' ');
  const routingBoundaries = section(cost, '## Routing boundaries').replace(/\s+/g, ' ');

  const defaultExecutor = routingBoundaries.match(/keeps (Luna Max) as the default substantive executor/i)?.[1];
  const correctionExecutor = freshContext.match(/Substantive correction returns to fresh-context (Luna Max)/i)?.[1];
  const speedExecutor = routing.match(/Route to (Terra High).*instead when the user\s+explicitly prioritizes speed/is)?.[1];
  assert.ok(defaultExecutor && correctionExecutor && speedExecutor, 'routing roles must be derivable from the written policy');

  const selectExecutor = ({priority, phase}) => {
    if (phase === 'substantive-correction') return correctionExecutor;
    if (priority === 'speed') return speedExecutor;
    return defaultExecutor;
  };
  assert.deepEqual([
    selectExecutor({priority: 'cost-efficiency', phase: 'implementation'}),
    selectExecutor({priority: 'cost-efficiency', phase: 'substantive-correction'}),
    selectExecutor({priority: 'speed', phase: 'implementation'}),
  ], ['Luna Max', 'Luna Max', 'Terra High']);

  const effectivePriority = ({projectPriority, requestPriority}) => requestPriority ?? projectPriority;
  const profileIsActive = (priorities) => effectivePriority(priorities) === 'cost-efficiency';
  assert.equal(profileIsActive({projectPriority: 'cost-efficiency'}), true);
  assert.equal(profileIsActive({projectPriority: 'cost-efficiency', requestPriority: 'speed'}), false);
  assert.equal(
    selectExecutor({priority: effectivePriority({projectPriority: 'cost-efficiency', requestPriority: 'speed'}), phase: 'implementation'}),
    'Terra High',
  );
  assert.match(cost, /effective Codex priority is `cost-efficiency`.*current request has taken precedence/is);
  assert.match(cost, /current-request `speed` priority therefore disables\s+this profile/is);

  for (const responsibility of [
    'understand the request',
    'close the contract',
    'make material decisions',
    'inspect the candidate diff and evidence',
    'proportionate independent acceptance',
    'final acceptance',
  ]) assert.match(ownership, new RegExp(responsibility, 'i'));
  assert.match(ownership, /There is no round limit that permits accepting incomplete work/i);
  assert.match(ownership, /all material findings are resolved.*genuine external\/user blocker/is);
});

test('cost-efficient handoff and early contract are structured, bounded, and evidence-oriented', () => {
  const cost = read('references/cost-efficiency.md');
  const contract = section(cost, '## Compact contract before implementation', '## Compact handoff').replace(/\s+/g, ' ');
  const handoff = section(cost, '## Compact handoff', '## Fresh-context phase transitions');
  const items = [...handoff.matchAll(/^\d+\.\s+(.+?);?$/gm)].map((match) => match[1]);

  assert.equal(items.length, 8, 'compact handoff must expose exactly eight evidence fields');
  const handoffShape = items.join(' ').toLowerCase();
  for (const concept of ['fixed point', 'material files', 'material decisions', 'tests and results', 'validations', 'not proven', 'open findings', 'next action']) {
    assert.ok(handoffShape.includes(concept), `compact handoff is missing ${concept}`);
  }
  assert.match(handoff, /at most approximately 1,200 tokens/i);
  assert.match(handoff, /references replacing dumps/i);
  assert.match(handoff, /not a diary, full history, repeated prompt, or imported raw\s+tool\/log output/i);

  for (const concern of [
    'functional outcome and happy path',
    'authority, ownership of consumed resources',
    'downstream contracts and consumers',
    'tools, plugins, MCP servers, network access',
    'concurrency, cancellation, retries, timeouts',
    'exact tests and expected results',
    'repository docs/instructions',
    'runtime proof at the real boundary',
  ]) assert.match(contract, new RegExp(concern, 'i'));
});

test('cost-efficient later phases use fresh bounded context, delta review, and a fallback ledger', () => {
  const cost = read('references/cost-efficiency.md');
  const fresh = section(cost, '## Fresh-context phase transitions', '## Ledger and acceptance').replace(/\s+/g, ' ');
  const ledger = section(cost, '## Ledger and acceptance', '## Routing boundaries').replace(/\s+/g, ' ');
  const acceptance = read('references/acceptance-workflows.md').replace(/\s+/g, ' ');

  assert.match(fresh, /reviewer receives the contract, fixed point, candidate\/diff ID, and minimum references/i);
  assert.match(fresh, /fixer receives only the open findings, files\s+and hunks, affected criteria, and required checks/i);
  assert.match(fresh, /`fork_turns: "none"` by\s+default.*never use `fork_turns:\s+"all"` merely for convenience/is);
  assert.match(fresh, /fresh-context Luna Max \(`gpt-5\.6-luna`,\s+effort `max`\)/i);
  assert.match(fresh, /Owner may correct\s+directly only when.*surgical.*demonstrably cheaper/is);
  assert.match(fresh, /bounded event-oriented window.*interrupt and redispatch a fresh\s+context.*preserved worktree\/state/is);
  assert.match(fresh, /Do not discard partial work/i);
  assert.match(fresh, /timeout with no state change creates no new\s+finding, polling loop, or narrative recap/i);

  assert.match(ledger, /subagents or history controls are unavailable.*execute sequentially/is);
  assert.match(ledger, /Work only on open findings and affected criteria/i);
  assert.match(ledger, /criteria \(`pending`, `proven`,\s+or `open`\).*findings.*evidence/is);
  assert.match(ledger, /Owner independently consolidates the ledger.*accepts only after/is);
  assert.match(ledger, /Static repository tests can verify the written invariants.*cannot prove those runtime\s+effects/is);
  assert.match(acceptance, /Owner reviews the correction delta and repeats the\s+tests and invariants it can affect/i);
  assert.match(acceptance, /Repeat full validation only when the change\s+can invalidate other criteria/is);
});

test('higher-effort consultation remains conditional and uses the owner model', () => {
  const consultation = section(read('references/codex.md'), '## Adaptive same-model consultation (Codex only)', '## Mandatory Luna Low surgical gate').replace(/\s+/g, ' ');
  const pairs = [...consultation.matchAll(/medium (Astra|Sol) owner \(`([^`]+)`\) may consult only `([^`]+)` at\s+effort `high` or `xhigh`/gi)]
    .map(([, owner, ownerModel, consultantModel]) => ({owner, ownerModel, consultantModel}));

  assert.deepEqual(pairs, [
    {owner: 'Astra', ownerModel: 'gpt-6-astra', consultantModel: 'gpt-6-astra'},
    {owner: 'Sol', ownerModel: 'gpt-5.6-sol', consultantModel: 'gpt-5.6-sol'},
  ]);
  assert.match(consultation, /Do not consult merely because.*first correction.*mechanical\s+review/is);
  assert.match(consultation, /one concrete question/i);
  assert.match(consultation, /does not implement, delegate, accept, broaden scope, or review the whole change/i);
  assert.doesNotMatch(consultation, /Sol.*effort `low`/i);
});

// These assertions protect the cohesive published written contract; they do not
// prove universal skill activation, runtime/model behavior, or functional acceptance.
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
