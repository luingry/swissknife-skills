# Routing details

## Decision heuristic

- Difficult part is deciding what to do: one available, authorized Astra or Sol.
- Difficult part is implementing, testing, or debugging: Terra.
- Difficult part is finding, reading, collecting, or enumerating: Luna.
- Solution is already exact and all Mandatory Spark criteria pass: Spark.

Luna and Spark are orthogonal optimizations. Luna reduces expensive context
work; Spark reduces latency for known edits.

## Luna reconnaissance

Luna reconnaissance is bounded read-only repository evidence collection performed
by a single Luna. For broad evidence needs, apply narrow, sequential follow-ups
with that same Luna. Do not distribute reconnaissance across more than one Luna.

A Luna remains bounded and read-only: it locates, reads, collects, and
returns evidence. It does not implement, choose architecture or engineering,
substantively test or debug, or replace Astra, Sol, Terra, or Spark. Do not send
duplicated prompts or use voting/consensus. The Owner resolves conflicts against
raw evidence and may send a focused follow-up for any gap.

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

- Astra/Sol owner -> Terra implementation -> Astra/Sol acceptance.
- Astra/Sol owner -> Luna reconnaissance -> Astra/Sol continues.
- Astra/Sol/Terra owner -> Spark surgical edit -> owner acceptance.
- Terra owner -> Astra or Sol consultation -> same Terra owner implements and
  accepts.

Forbidden nested-worker creation examples:

- Astra/Sol owner -> Terra worker -> Terra worker creates Luna.
- Terra owner -> Astra/Sol worker -> that worker creates another Terra.
- Terra owner -> Luna worker -> Luna worker creates Spark.
- Any worker creating another worker.
- Terra Medium owner creating a Terra Medium implementation worker.

## Parallelism

Use one implementation worker by default. Add a second worker only for a genuinely
independent, non-overlapping scope that materially reduces elapsed time. Useful
combinations include one Luna collecting bounded evidence while Terra performs
independent implementation, or Spark handling a separate known edit while another
specialist performs longer work. Avoid duplicate solutions, overlapping writes,
speculative swarms, and unnecessary context transfer.

Avoid distributing reconnaissance across more than one Luna; if evidence breadth
increases, keep the same Luna and run narrower sequential passes.

## Escalation package

When Terra consults Astra or Sol, include goal, relevant evidence, attempts,
exact decision needed, known options, and Terra's recommendation. Select one
available, authorized model; it returns advice, and Terra retains ownership and
performs the implementation.

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
- Terra escalating routine execution.
- Luna making engineering decisions or replacing Terra/Spark.
- Using multiple workers of the same specialist tier for one scope.
- Spark investigating, architecting, or replacing Terra for complex work.
- Recursive delegation.
- Accepting worker claims without observable evidence.
- Skipping eligible Spark because delegation has overhead.
