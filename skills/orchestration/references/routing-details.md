# Routing details

## Decision heuristic

- Difficult part is deciding what to do: one available, authorized Astra or Sol.
- Difficult part is implementing, testing, or debugging: Luna Max by default;
  Terra High when the user explicitly prioritizes delivery speed.
- Difficult part is finding, reading, collecting, or enumerating: Luna Low.
- Solution is already exact and all Mandatory Luna Low surgical criteria pass:
  Luna Low at effort `low` in authorized repository/workspace write mode with
  exclusive scope and serialized writes.

Luna Low reconnaissance and surgical implementation, Luna Max implementation,
and Terra High are distinct routes. Luna Low is the first implementation
decision for exact six-criterion surgical edits and remains read-only for
reconnaissance. Luna Max is the substantive implementation default; Terra High
is the explicit speed-oriented alternative and the fallback when Luna Max is
genuinely unavailable.

An explicit priority of speed or shortest delivery time means lower wall-clock
latency for the agent/orchestration work to complete. Do not infer that priority
solely because the requested product work is a performance, runtime-latency, or
throughput optimization: such work still uses Luna Max by default unless the
user also asks for faster agent delivery.

## Luna Low reconnaissance

Luna Low reconnaissance is bounded read-only repository evidence collection
performed by a single Luna Low worker. For broad evidence needs, apply narrow,
sequential follow-ups with that same worker. Do not distribute reconnaissance
across more than one Luna Low worker.

A Luna Low reconnaissance worker remains bounded and read-only: it locates, reads, collects, and
returns evidence. It does not implement, choose architecture or engineering,
substantively test or debug, or replace Astra, Sol, Luna Max, or Terra. This
read-only mode must not be confused with the separately gated surgical Luna Low
route. Do not send duplicated prompts or use voting/consensus. The Owner
resolves conflicts against raw evidence and may send a focused follow-up for
any gap.

## Luna Low surgical implementation

When all six Mandatory Luna Low surgical criteria pass, Luna Low (`gpt-5.6-luna`,
effort `low`) is the mandatory executor for the exact, already-understood edit,
including when the Task Owner is Astra, Sol, Luna Max, or Terra. The native route
uses an authorized write-enabled repository/workspace, an exclusive scope, and
serialized writes. Use an isolated worktree when the native host provides it or
when concurrent work requires isolation; a shared native checkout is valid when
its writes remain serialized. Never use DirectPath for this route. The CLI
fallback remains stricter: its surgical Luna Low worker must use an isolated
worktree, as defined in [CLI workers](cli-workers.md). If Luna Low is
unavailable, an Astra/Sol owner routes to Luna Max by default or Terra High when
agent delivery speed was explicitly prioritized, while an existing Luna Max/Terra
owner performs the bounded change directly.

## Luna Max implementation

When the surgical Luna Low criteria do not all pass, use Luna Max
(`gpt-5.6-luna`, effort `max`) as the default executor for substantive
implementation: features, multi-file changes, tests, debugging, refactoring,
and iterative code/test/fix work. It may work in an isolated write-enabled
workspace. Luna Max does not replace Astra or Sol for architecture, difficult
causal decisions, critical review, or final acceptance. Repository Luna uses
effort `max` by default; effort `low` is reserved for the explicit surgical
route.

Route to Terra High (`gpt-5.6-terra`, effort `high`) instead when the user
explicitly prioritizes speed or the shortest delivery time. Terra High is also
the fallback if Luna Max is genuinely unavailable. A user-selected supported
model or effort overrides these defaults.

## Handoff contract

Provide only the necessary context:

- Goal: observable outcome.
- Scope: subsystem and files when known.
- Context: facts needed to execute.
- Constraints: behavior and data to preserve.
- Acceptance: definition of done.
- Validation: exact checks and evidence expected.

The worker returns:

- Completed: change or finding.
- Files: relevant modified files.
- Evidence: path:line references or command outcomes.
- Validation: commands and outcomes.
- Concerns/scope gaps: unresolved issues only.

## Shallow topology

Allowed arrows describe a handoff or consultation that returns to the same
Task Owner; they do not authorize a worker to create another worker.

Allowed examples:

- Astra/Sol owner -> Luna Max implementation -> Astra/Sol acceptance.
- Astra/Sol owner -> Terra High implementation when speed is explicitly prioritized -> Astra/Sol acceptance.
- Astra/Sol owner -> Luna Low reconnaissance -> Astra/Sol continues.
- Astra/Sol/Luna Max/Terra owner -> Luna Low surgical edit -> owner acceptance.
- Terra or Luna Max owner -> Astra or Sol consultation -> same owner implements and
  accepts.

Forbidden nested-worker creation examples:

- Astra/Sol owner -> Luna Max or Terra worker -> that worker creates Luna.
- Luna Max or Terra owner -> Astra/Sol worker -> that worker creates another executor.
- Luna Max or Terra owner -> Luna Low worker -> that worker creates another
  executor.
- Any worker creating another worker.
- Luna Max owner creating another Luna Max implementation worker.
- Terra owner creating another Terra implementation worker.

## Parallelism

Use one implementation worker by default. Add a second worker only for a genuinely
independent, non-overlapping scope that materially reduces elapsed time. Useful
combinations include one Luna Low worker collecting bounded evidence while Luna
Max or Terra performs independent implementation. A surgical Luna Low worker is
the sole implementation worker for its exact scope. Avoid duplicate solutions,
overlapping writes, speculative swarms, and unnecessary context transfer.

Avoid distributing reconnaissance across more than one Luna Low worker; if evidence breadth
increases, keep the same Luna Low worker and run narrower sequential passes.

## Escalation package

When Luna Max or Terra consults Astra or Sol, include goal, relevant evidence, attempts,
exact decision needed, known options, and the executor's recommendation. Select
one available, authorized model; it returns advice, and the existing executor
retains ownership and performs the implementation.

## Completion and optional closing capabilities

Finish after proportionate self-verification demonstrates the requested
behavior, relevant checks pass, no unexplained behavior change remains, and no
material risk is unresolved. Do not add a confidence pass by default.

When a concrete material uncertainty remains after cheap verification, the
Owner may use the available `delivery-verification` capability. Provide the
original goal, changed delta or artifacts, validation evidence, the risk signal,
and prior findings/fixes when re-verifying. It is an evidence-based
acceptability check, not a generic audit or mandatory review; it does not edit,
delegate, or reinvoke orchestration.

When an explicitly authorized terminal action remains after implementation, the
Owner may use the available `delivery-closer` capability. Provide the terminal
outcome, authority from the full user request and Owner handoff, current state,
valid existing evidence, and changes that must be preserved. When the host
offers a suitable temporary specialist, dispatch it in fresh context. Otherwise
the Owner performs the same closing protocol sequentially. The specialist is
not persistent and does not delegate. It closes only that action; it does not
correct code, reinvoke orchestration, or automatically invoke verification. If a
capability is absent, the Owner performs the same proportional contract without
skipping it. The verifier and closer have distinct triggers, may be selected
separately, and neither is required for the fast path or depends on the other.

## Anti-patterns

- Astra or Sol performing prolonged mechanical implementation.
- Luna Max or Terra escalating routine execution.
- Luna Low making engineering decisions or replacing Luna Max/Terra.
- Using multiple workers of the same specialist tier for one scope.
- Luna Low investigating, architecting, or replacing Luna Max/Terra for complex
  work.
- Recursive delegation.
- Accepting worker claims without observable evidence.
- Skipping eligible Luna Low surgical delegation because delegation has overhead.
