# Codex adapter: preserved operational contract

Use only when Codex is the active orchestration surface. This reference preserves
the complete pre-portability routing contract. Do not reinterpret Astra, Sol, Terra,
Luna, the CLI catalog, worktrees, or JSONL for Claude Code or Cursor.

Optimize quality, throughput, reliability, model cost, and elapsed time. The
model receiving the user request is the **Task Owner** and remains responsible
for the original goal, integration, independent validation, and final report.

## Project preference gate (Codex only)

At the start of every use of this Codex adapter, first read the applicable
project rules, including the most specific `AGENTS.md` governing the project.
Recognize these canonical values only:

- `- Delivery priority: speed`
- `- Delivery priority: cost-efficiency`

When the canonical field is present, give the user one short reminder of the
stored preference before doing any work. If the field is absent, ask exactly:
`Você prioriza velocidade das entregas ou eficiência de custo?`
Then **PAUSE** all work—exploration, delegation, edits, and tests—until the user
answers. After the answer, record `speed` or `cost-efficiency` in the most
specific applicable `AGENTS.md` at the project root; if none exists, create a
minimal one. Reuse one `## Orchestration preference` section and one canonical
field; never duplicate either. An explicit priority in the current request has
precedence for that task and does not change the persistent preference unless
the user explicitly asks to update it.

## Cost-efficient owner loop

When the effective priority is `cost-efficiency` after applying the
current-request precedence above, read and apply
[cost-efficient owner loop](cost-efficiency.md) before substantive delegation.
An explicit current-request `speed` priority does not activate this profile.
The Task Owner closes the acceptance contract, makes material decisions,
reviews the candidate diff/evidence, runs proportionate independent acceptance,
and alone decides final acceptance. Extensive investigation, substantive
implementation, prolonged correction, and repetitive exploration belong to the
appropriate economical executor when delegation is available.

## Mandatory routing assessment

Before exploration, repository/engineering tool calls, edits, or delegation,
the Task Owner MUST classify the task under this skill. Read-only work is
included.

For bounded read-only repository reconnaissance or evidence collection, when
Luna Low is available, the Task Owner MUST delegate to Luna Low before doing that work
and MUST NOT perform it itself. If native Luna is unavailable, use the guarded
CLI fallback. Only concrete unavailability permits direct owner work and the
final report MUST state it. This restriction covers the task's reconnaissance
or evidence collection, not the Owner's required direct inspection of worker
diff/evidence or independent acceptance checks.

Read the applicable first-level reference before delegating:

- [Routing details](routing-details.md): roles, handoffs, escalation,
  parallelism, and workflow selection.
- [CLI workers](cli-workers.md): required whenever Luna Low or Luna Max is not exposed
  by the native subagent tool.
- [Acceptance workflows](acceptance-workflows.md): required for bug,
  performance, runtime, browser, integration, or worker acceptance work.

## Visual significance routing

For a new page or screen, landing, dashboard, redesign, significant component
or layout, UI/UX improvement, or screenshot/reference-driven work, use the
available `design-intelligence` capability alongside the chosen engineering
route. Do not add a parallel pipeline or invoke specialized design skills
automatically. For a trivial exact visual adjustment or pure backend work, do
not route it through design intelligence.

When delegating significant visual work, include a compact handoff: user/job;
whether to preserve or replace; direction/thesis; must-preserve details;
references; and target viewports/acceptance. The Task Owner still owns routing,
review, and acceptance under this skill.

## Invariants

- Keep delegation one level deep. A supporting worker MUST NOT spawn or invoke
  another worker. It returns out-of-scope needs to the Task Owner.
- Use one implementation worker by default. Parallelize only independent,
  non-overlapping scopes that materially reduce elapsed time.
- Before routing Luna Max or any substantive implementer, read [shared core](shared-core.md)
  and close its smallest complete execution contract. Do not delegate with a
  partial handoff or irrelevant history; apply the shared core's worker gap rule.
- A worker returns completed work, files, validation evidence, and genuine
  concerns—not a diary. Acceptance follows [acceptance workflows](acceptance-workflows.md):
  require contract-to-evidence mapping for every criterion, independently
  re-derive it from the request
  and existing behavior, and apply the full affected-flow rule for action UI.
- A worker saying `done`, or a component merely mounting/rendering or compiling,
  is not functional proof; use the shared core and acceptance workflow's
  complementary-state and proportional evidence rules.
- When review finds a defect, return specific feedback to the appropriate
  worker and repeat worker -> review -> correction while it remains the
  appropriate tier. Under `cost-efficiency`, use the fresh-context correction
  and compact-ledger rules in [cost-efficient owner loop](cost-efficiency.md);
  outside that profile, reuse the same worker when practical. Never use an
  elapsed round count to accept unresolved material findings;
  default next-pass review is targeted to re-verify the finding(s), adjacent
  regressions around the correction, and that previously satisfied criteria were
  not obviously invalidated. Broader review happens only if the correction
  materially expands risk or new concrete evidence justifies it. If the failure
  crosses a role boundary, reclassify and reroute under this skill until
  acceptable or genuinely blocked.
- Integrate only accepted work. The Task Owner owns final acceptance even when
  another agent implemented everything.
- Proceed autonomously with safe, in-scope reads, edits, tests, builds, and
  correction loops. Ask only for destructive effects, production-data risk,
  missing access, material ambiguity, consequential scope expansion, or another
  decision outside granted authority.

## Completion and verification

- Preserve existing behavior unless the task requires a change. Prefer the
  smallest coherent solution that fully solves the goal; a minimal diff must
  not trade away correctness, robustness, or necessary investigation.
- Scope discipline is not passivity: investigate dependencies, root causes,
  adjacent behavior, and supporting changes that are necessary to the goal;
  defer unrelated, speculative, or opportunistic work.
- Treat existing tests as contracts. Do not weaken their expectations merely to
  pass; change them only when the task/specification justifies it or their prior
  expectation is demonstrated invalid.
- Before acceptance, reuse available context to run relevant validation, verify
  the requested behavior, inspect the final delta, catch obvious unintended
  behavior changes, and assess unresolved material risk.
- Finish when requested behavior is demonstrated, relevant checks pass, there
  is no unexplained behavior change, and no unresolved material risk remains.
  Do not begin another review merely to seek more confidence or findings.
- Risk signals prompt assessment, not automatic worker calls. Start with cheap,
  reliable self-verification; invoke the available `delivery-verification`
  capability only when independent or specialized verification has enough
  expected value.
  Signals include changed test expectations; meaningful existing, public, or
  shared behavior changes; unexpectedly broad changes; persistence, schema,
  migration, auth, concurrency, or shared-state effects; multiple substantial
  failed attempts; conflicting or ambiguous validation; or concrete regression
  suspicion.

## Roles

Before each native worker dispatch, verify that the exact intended model slug
and effort are exposed and supported by the current host. A semantic role such
as `reviewer` does not prove a fixed model or effort. For CLI workers, retain
the live-catalog verification in [CLI workers](cli-workers.md).

### Astra and Sol

Use Astra (`gpt-6-astra`) or Sol (`gpt-5.6-sol`) for planning when the difficult
part is deciding what to do: architecture, ambiguity, difficult causal analysis,
consequential tradeoffs, security, data integrity, concurrency/distributed
behavior, high-risk production changes, critical review, acceptance, or
materially low confidence. They are equivalent for these functions.

Keep a user-selected or already-suitable Task Owner when available; otherwise
select one available, authorized model for the decision. Do not automatically
escalate Sol work to Astra, require dual review, or imply a cost, speed, or
quality hierarchy. Default effort is medium. Use high only when deeper reasoning
materially changes the outcome and the live host supports high for the selected
exact model.

### Luna Low

Use Luna Low (`gpt-5.6-luna`, effort `low`) in one of two tightly bounded modes:

- **Reconnaissance:** strictly read-only repository evidence collection such as
  locating files, definitions, callers, routes, configs, tests, patterns, logs,
  failures, and concise context packages. For broad reconnaissance, use
  sequential narrow follow-ups with the same Luna Low worker.
- **Surgical implementation:** an already-understood, low-risk edit when all
  six criteria in the Mandatory Luna Low surgical gate pass. Use an authorized
  write-enabled repository or workspace, keep the scope exclusive, and
  serialize writes. Use an isolated worktree when the native host provides it or
  when concurrent work requires isolation; a shared native checkout is valid
  when its writes remain serialized. Explicitly set effort `low`, and give exact
  targets, final state, constraints, and one focused deterministic validation.
  If judgment, exploration, or iterative debugging becomes necessary, stop the
  surgical route and return findings to the Task Owner.

Luna Low must not choose architecture or engineering, substantively test or
debug, or replace Astra, Sol, Luna Max, or Terra. DirectPath remains strictly
read-only reconnaissance; surgical Luna Low work uses an authorized
write-enabled repository/workspace and never DirectPath. Repository Luna
defaults to effort `max`; effort `low` must be explicit for the surgical route.

### Luna Max

An explicit priority of speed or shortest delivery time means lower wall-clock
latency for the agent/orchestration work to complete. Do not infer that priority
solely because the requested product work is a performance, runtime-latency, or
throughput optimization: such work still uses Luna Max by default unless the
user also asks for faster agent delivery.

Use Luna Max (`gpt-5.6-luna`, effort `max`) as the default substantive
implementation tier when the surgical Luna Low gate does not apply. It
handles features, multi-file or multi-subsystem changes, substantive bugs,
refactoring, new tests, API/database/application logic, performance
implementation, routine debugging, and iterative code/test/fix work in an
authorized write-enabled workspace.

Use Terra High instead when the user explicitly prioritizes speed or the
shortest delivery time. Use Terra High as the implementation fallback only when
Luna Max is genuinely unavailable. A user-selected supported model or effort
overrides the default route. Luna Max does not replace Astra or Sol for planning,
architecture, difficult causal analysis, critical review, or acceptance.

### Terra High

Use Terra High (`gpt-5.6-terra`, effort `high`) for normal software-engineering execution when the
user explicitly prioritizes speed or the shortest delivery time, or when Luna
Max is genuinely unavailable. It handles features,
multi-file or multi-subsystem changes, substantive bugs, refactoring, new tests,
API/database/application logic, performance implementation, routine debugging,
and iterative code/test/fix work. Terra High is an alternate executor, not the
default when no speed priority was requested.

Terra High also remains available as a read-only reviewer when independent
review is warranted by substantial security, authentication, concurrency, or
resident-process risk. That review route does not make Terra the default
implementer or transfer final acceptance away from the Task Owner.

## Adaptive same-model consultation (Codex only)

This consultation route is exclusive to the Codex adapter. It is a temporary,
read-only consultation by the same model as the medium-effort owner, never a
model switch or a second owner:

- A medium Astra owner (`gpt-6-astra`) may consult only `gpt-6-astra` at
  effort `high` or `xhigh`.
- A medium Sol owner (`gpt-5.6-sol`) may consult only `gpt-5.6-sol` at effort
  `high` or `xhigh`.
- Never switch Astra and Sol automatically. The owner remains at medium while
  the temporary consultation runs. Do not use `low`, `max`, or `ultra` for this
  policy.

Use `high` only for an exact unresolved decision about non-local architecture,
difficult causal analysis, materially different interpretations, conflicting
evidence after focal verification, a consequential trade-off, or impact beyond
the current subsystem. Use `xhigh` for material security/authorization/
credential risk, data integrity/loss/migration, complex distributed
concurrency/consistency/ownership, critical or difficult-to-reverse production
work, two substantive approaches that failed, persistent conflict after focal
investigation, or when `high` did not resolve the decision. A medium owner may
move directly to `xhigh` when one of those conditions applies.

Do not consult merely because the task is large, slow, has many files, has a
long build, encountered a first failure or first correction, needs mechanical
review, is collecting logs, or carries generic uncertainty. Before a call,
form one concrete question in exactly this shape:
`Preciso decidir X entre A e B porque as evidências Y e Z entram em conflito.`
If that question cannot be stated, gather evidence, explore, test, or implement
instead of escalating.

Before dispatch, verify that the exact same model slug and selected `high` or
`xhigh` effort are available on the current host. Use one generic temporary
subagent with the explicit slug and effort; `fork_turns: "none"` is the default,
with only a few turns when indispensable. Start from fresh context and do not
assume a cache or pass the full conversation history.

The consultation input contains exactly: `Goal`, `Exact decision required`,
`Relevant evidence`, `Attempts already made`, `Known options`, `Owner
recommendation`, `Risk if wrong`, and `Acceptance criteria affected`. The
consultant returns exactly: `Decision`, `Rationale`, `Material risks`, `Missing
evidence`, and `Required acceptance adjustments`.

Only one consultant may be active for one decision. It is consultative and
read-only, covers one decision, and allows at most one focal follow-up. It does
not implement, delegate, accept, broaden scope, or review the whole change. The
owner applies or rejects the advice and remains responsible for implementation,
validation, and acceptance.

### Conditional escalation record

Create this escalation block only when the same-model consultation actually
occurs. Keep consultation metrics separate from product/runtime acceptance
evidence and never invent unavailable telemetry:

- Owner model/effort.
- Consultant model/effort.
- Objective trigger (`high` or `xhigh`) and the concrete decision question.
- Decision and whether the recommendation changed.
- Tokens per participant and type, only if telemetry exposes them.
- Consultation duration, only if observed.
- Correction avoided or provoked, only when observable.
- Missing evidence and required acceptance adjustments.

If the exact same-model route is unavailable, do not switch models or pretend a
consultation occurred. Run cheap targeted checks; continue as owner when the
evidence resolves the decision. If material risk remains unresolved, do not
accept the work and record that the consultation route was unavailable. Preserve
the existing Luna Low, Luna Max, and Terra routes; in particular, preserve the
existing Luna Max/Terra -> Astra/Sol consultation route semantically. This
same-model rule applies only when the owner is Astra or Sol; it does not change
those existing routes.

## Mandatory Luna Low surgical gate

Before any Task Owner implements or delegates implementation, evaluate every
criterion. This applies to every implementation request, including trivial,
fully localized edits.

1. Exact target file(s), modification, and desired final state are known before
   writing.
2. Work is bounded to one application/source/configuration file plus only
   required changelog, metadata, or documentation entries, or an equivalently
   localized explicitly identified diff.
3. No repository exploration is needed beyond confirming the named target and
   exact existing construct.
4. No architectural, security, data-integrity, concurrency, migration, or
   consequential product judgment is required.
5. Failure is low-risk, reversible, and detectable by one focused deterministic
   existing validation that Luna Low is expected to run.
6. No new/regression test, broad build/runtime/browser/benchmark/integration
   validation, or iterative debug/fix loop is required.

If all six pass and Luna Low is available, delegation to Luna Low is mandatory
for Astra/Sol, Luna Max, and Terra Task Owners. This surgical route is the only
write-enabled exception to the normal Luna Max/Terra ownership rule; overhead or
convenience is not unavailability.

If Luna Low is absent from native delegation and the live CLI catalog, or has a
real outage/rate/capacity failure, apply the owner-specific fallback below. When
apparently eligible work does not use Luna Low, the final report MUST identify
the failed numbered criterion or concrete unavailability.

## Astra or Sol Task Owner

Apply the Mandatory Luna Low surgical gate before editing application code. If
all six criteria pass and Luna Low is available, delegate the surgical change to
Luna Low. If the gate does not require surgical Luna Low, delegate substantive
implementation to Luna Max when any substantial indicator
holds:

- more than one application file or subsystem;
- frontend and backend work;
- new/regression tests or iterative code/test/fix;
- feature, performance, refactoring, or non-trivial bug work;
- build, runtime, browser, benchmark, or integration validation beyond one
  focused check;
- uncertainty that every direct-implementation condition below passes.

The applicability of this skill or an `AGENTS.md` delegation rule is explicit
authorization to route the worker. If all six criteria pass but Luna Low is
unavailable, route to Luna Max by default, or Terra High when the user explicitly
prioritizes speed or Luna Max is genuinely unavailable. Astra or Sol may
implement directly only when the surgical gate does not require delegation, the
exact tiny modification and location are known, no meaningful exploration is
needed, and no substantial validation or debugging is expected. Record the
direct exception, failed Luna Low criterion, or concrete Luna Low unavailability
in the final report.

Astra or Sol owns strategy, difficult judgment, critical review, and
acceptance. Neither should become the default implementation worker. Route to
Terra High instead only when the user explicitly prioritizes speed or Luna Max
is genuinely unavailable. Honor any supported model or effort explicitly
selected by the user.

## Luna Max or Terra Task Owner

Apply the Mandatory Luna Low surgical gate first. If all six criteria pass and
Luna Low is available, delegation to Luna Low is mandatory even for a Luna Max
or Terra Task Owner. Otherwise the existing Luna Max or Terra Task Owner
implements substantive work directly; this includes the concrete fallback when
Luna Low is genuinely unavailable. Outside that mandatory surgical route, a
Luna Max or Terra Task Owner MUST NOT delegate implementation to another
executor for the same scope. It may consult Astra or Sol for difficult
decisions. That consultation is advice: the existing executor applies it and
completes the implementation.

Consult one available, authorized Astra or Sol only when architecture, material
ambiguity, unresolved difficult root cause, repeated failed approaches,
security/data-integrity/concurrency risk, unexpected system-wide consequences,
production-critical decisions, or materially low confidence warrants stronger
reasoning. Do not escalate routine implementation, exploration, or debugging
merely because it is time-consuming.

If Luna Low is genuinely unavailable, a Luna Max or Terra Task Owner performs
the bounded change directly; Astra or Sol routes substantive implementation to
Luna Max by default, or Terra High when speed is explicitly prioritized or Luna
Max is genuinely unavailable.

## Availability and external workers

Native delegation is preferred. When routing requires Luna Low or Luna Max but the
native subagent tool does not expose it, the Task Owner MUST read
[CLI workers](cli-workers.md), verify the exact model in the live
Codex CLI catalog, and use the guarded worktree launcher for repository work.
For Luna Low-only read-only reconnaissance of a non-Git/projectless path, use the
launcher's guarded direct mode; it never creates a worktree and never permits
writes.

The external CLI process is a normal supporting worker: delegation remains one
level deep, recursive agents are disabled, JSONL evidence is captured, and
integration happens only after independent acceptance. Review and correction
use the same worker/worktree when practical except when the cost-efficient
fresh-context rule applies; that rule preserves the existing worktree/state
while replacing repeated conversation history. Absence of the exact slug from
the live catalog is real unavailability.
