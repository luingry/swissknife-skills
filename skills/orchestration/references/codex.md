# Codex adapter: preserved operational contract

Use only when Codex is the active orchestration surface. This reference preserves
the complete pre-portability routing contract. Do not reinterpret Sol, Terra,
Luna, Spark, the CLI catalog, worktrees, or JSONL for Claude Code or Cursor.

Optimize quality, throughput, reliability, model cost, and elapsed time. The
model receiving the user request is the **Task Owner** and remains responsible
for the original goal, integration, independent validation, and final report.

## Mandatory routing assessment

Before exploration, repository/engineering tool calls, edits, or delegation,
the Task Owner MUST classify the task under this skill. Read-only work is
included.

For bounded read-only repository reconnaissance or evidence collection, when
Luna is available, the Task Owner MUST delegate to Luna before doing that work
and MUST NOT perform it itself. If native Luna is unavailable, use the guarded
CLI fallback. Only concrete unavailability permits direct owner work and the
final report MUST state it. This restriction covers the task's reconnaissance
or evidence collection, not the Owner's required direct inspection of worker
diff/evidence or independent acceptance checks.

Read the applicable first-level reference before delegating:

- [Routing details](routing-details.md): roles, handoffs, escalation,
  parallelism, and workflow selection.
- [CLI workers](cli-workers.md): required whenever Luna or Spark is not exposed
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
- Give every worker goal, scope, necessary context, constraints, observable
  acceptance criteria, and expected validation.
- A worker returns completed work, files, validation evidence, and genuine
  concerns—not a diary.
- The Task Owner MUST inspect the relevant diff/evidence and independently run
  proportionate acceptance checks. A worker saying `done` is not evidence.
- When review finds a defect, return specific feedback to the same worker and
  repeat worker -> review -> correction while it remains the appropriate tier;
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

### Sol

Use Sol when the difficult part is deciding what to do: architecture, ambiguity,
difficult causal analysis, consequential tradeoffs, security, data integrity,
concurrency/distributed behavior, high-risk production changes, critical
review, or materially low confidence. Default Sol effort: medium; use high only
when deeper reasoning materially changes the outcome.

### Terra

Use Terra Medium for normal software-engineering execution: features,
multi-file or multi-subsystem changes, substantive bugs, refactoring, new tests,
API/database/application logic, performance implementation, routine debugging,
and iterative code/test/fix work. Terra is the default implementation tier.

### Luna

Use Luna Low for bounded repository reconnaissance and evidence collection:
locating files, definitions, callers, routes, configs, tests, patterns, logs,
failures, and concise context packages. Prefer read-only. Allow writing only for
an exceptional deterministic, tightly bounded, mechanical, low-risk
transformation with automatic verification. Luna is not a fallback for Terra or
Spark and MUST NOT make engineering or architectural decisions. For broad
reconnaissance, use sequential narrow follow-ups with the same Luna.

### Spark

Use Spark Low only to execute an already-understood surgical change when all six
Mandatory Spark criteria below pass. Spark is latency-specialized, not a cheap
reasoning or investigation tier. Give exact targets, final state, constraints,
and the single focused validation. If judgment or investigation becomes
necessary, Spark stops and returns findings.

## Mandatory Spark gate

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
   existing validation that Spark is expected to run.
6. No new/regression test, broad build/runtime/browser/benchmark/integration
   validation, or iterative debug/fix loop is required.

If all six pass and Spark is available, delegation to Spark is mandatory for
both Sol and Terra Task Owners. Overhead or convenience is not unavailability.
If Spark is absent from both native delegation and the live CLI catalog, or has
a real outage/rate/capacity failure, apply the owner-specific fallback below.
When apparently eligible work does not use Spark, the final report MUST identify
the failed numbered criterion or concrete unavailability.

## Sol Task Owner

Apply the Spark gate before editing application code. If it does not require
Spark, delegate implementation to Terra Medium when any substantial indicator
holds:

- more than one application file or subsystem;
- frontend and backend work;
- new/regression tests or iterative code/test/fix;
- feature, performance, refactoring, or non-trivial bug work;
- build, runtime, browser, benchmark, or integration validation beyond one
  focused check;
- uncertainty that every direct-implementation condition below passes.

The applicability of this skill or an `AGENTS.md` delegation rule is explicit
authorization to route the worker. Sol may implement directly only when the
Spark gate does not require delegation, the exact tiny modification and location
are known, no meaningful exploration is needed, and no substantial validation
or debugging is expected. Otherwise route to Terra. Record the direct exception
and failed Spark criterion in the final report.

Sol owns strategy, difficult judgment, critical review, and acceptance. It
should not become the default implementation worker.

## Terra Medium Task Owner

Apply the Spark gate first. Terra Medium MUST NOT delegate implementation to
another Terra Medium. If the gate requires available Spark, delegate to Spark;
otherwise Terra implements substantive work itself. Terra may use Luna only for
genuinely bounded reconnaissance and may consult Sol for difficult decisions.
Sol consultation is advice: Terra applies it and completes the implementation.

Consult Sol only when architecture, material ambiguity, unresolved difficult
root cause, repeated failed approaches, security/data-integrity/concurrency
risk, unexpected system-wide consequences, production-critical decisions, or
materially low confidence warrants stronger reasoning. Do not escalate routine
implementation, exploration, or debugging merely because it is time-consuming.

If Spark is genuinely unavailable, Terra performs the bounded change directly;
other Task Owner tiers fall back from Spark to Terra.

## Availability and external workers

Native delegation is preferred. When routing requires Luna or Spark but the
native subagent tool does not expose it, the Task Owner MUST read
[CLI workers](cli-workers.md), verify the exact model in the live
Codex CLI catalog, and use the guarded worktree launcher for repository work.
For Luna-only read-only reconnaissance of a non-Git/projectless path, use the
launcher's guarded direct mode; it never creates a worktree and never permits
writes.

The external CLI process is a normal supporting worker: delegation remains one
level deep, recursive agents are disabled, JSONL evidence is captured, review
and correction use the same worker/worktree when practical, and integration
happens only after independent acceptance. Absence of the exact slug from the
live catalog is real unavailability.
