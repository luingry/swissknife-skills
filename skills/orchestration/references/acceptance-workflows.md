# Acceptance workflows

## General worker acceptance

1. Re-read the original user goal and constraints.
2. Inspect the relevant worker diff, commands, logs, and reported evidence.
3. Run independent checks proportionate to risk: focused tests, typecheck, lint,
   build, runtime flow, browser flow, benchmark, or log inspection.
4. Exercise relevant adjacent behavior and edge cases when practical.
5. Require the worker report to map every acceptance item to passing evidence;
   return concrete defects to the appropriate worker and re-verify the
   correction. Under Codex `cost-efficiency`, follow the fresh-context fixer
   and compact-ledger rules in [cost-efficient owner loop](cost-efficiency.md).
6. The owner independently re-derives acceptance from the original request and
   applicable existing behavior, including negative/complementary assertions
   and the full affected flow when relevant; do not accept a reduced worker
   interpretation.
7. Integrate only accepted work and report evidence boundaries honestly.

## Contract-to-evidence acceptance

Before delegation, apply [shared core](shared-core.md)'s execution contract for
closure, state/complement inference, and owner/worker gap handling. Workers
report newly discovered contract gaps to the owner as specified there; they do
not ask the user directly.

Every new or changed deterministic behavior contract must map to passing
evidence. The worker return maps each acceptance item to evidence, and the owner
re-derives acceptance from the original request and applicable existing behavior.
Prefer automated functional/regression coverage at the lowest meaningful layer
and add a real browser/runtime flow for material UI or integration risk.

Any new or changed UI control or component that affects an action must be tested
through the full affected flow, from reachable preconditions through interaction
to observable outcome. Mount/render, snapshots, typecheck, lint, build, HTTP
success, or isolated handler calls alone are not functional proof; a merely
compiling/rendering component is not proof of the affected behavior. Require
negative/complementary assertions where relevant.

If suitable automation/infrastructure is unavailable or disproportionate, name
the unautomated contract and why, record substitute real-flow evidence, and let
the owner decide the residual risk. Required checks may not be failing at
acceptance; separate unrelated pre-existing failures with evidence. Keep this
proportional: no mandatory E2E or screenshot for every backend/documentation
edit, no exhaustive state matrix, and no automatic user question for ordinary
inferable states. Preserve the existing fast path when these risks do not apply.

## Observable evidence boundaries

Higher reasoning effort does not substitute for absent observable evidence.
Exercise the real boundary that could change the decision before consulting or
accepting when the available evidence does not reach it; a stronger model may
help decide what to test, but cannot turn an unexercised boundary into proof.

For any changed service, worker, agent, daemon, or other resident process,
runtime evidence is valid only after proving that the exercised process loaded
the new version. Acceptable proof includes a restart or reload followed by the
exercise, a PID/start time after the change, a version or hash, a startup log,
or another reliable version marker. A request handled successfully by an old
process is not acceptance evidence for the change.

If a follow-up request introduces a new subsystem or system boundary, reopen
only the delta of the execution contract: preserve criteria already satisfied,
add the new slice, recalculate its risks and validations, and do not retransmit
the old history. Keep the cost, corrections, and evidence for that new slice
separate from the completed work.

After a correction, the Owner reviews the correction delta and repeats the
tests and invariants it can affect. Repeat full validation only when the change
can invalidate other criteria, shared behavior, or a real boundary already
proved. This incremental pass never permits an open material finding to be
ignored, and final acceptance remains the Owner's decision.

## Bug fixes

Establish reproduction/evidence, identify likely root cause, use one available,
authorized Astra or Sol only when reasoning difficulty warrants it, use Luna Low
only for an exact six-criterion surgical edit, implement substantive work with
Luna Max by default, or Terra High when speed is explicitly prioritized or Luna
Max is unavailable, add regression coverage when useful, reproduce the original
scenario, and validate adjacent behavior. Compilation alone does not prove
resolution.

## Performance and stability

Establish a baseline, measure the bottleneck, form a hypothesis, use one
available, authorized Astra or Sol for difficult causal/architectural analysis,
use Luna Low for an exact six-criterion surgical optimization, otherwise use
Luna Max by default for substantive changes, or Terra High when speed is
explicitly prioritized or Luna Max is unavailable,
rerun the same measurement, compare before/after, and reject complexity without
measured benefit.

The fact that the product goal is performance or runtime latency does not itself
mean the user prioritized agent delivery speed; retain Luna Max by default
unless the user explicitly requests a shorter agent/orchestration completion time.

## Browser, runtime, and integration

Assume the worker may be wrong. Execute the real user flow when practical;
inspect observable UI, console, network, runtime, logs, and relevant edge cases.
Avoid destructive production-data actions unless explicitly authorized. HTTP or
compile success is not proof of an authenticated browser, queue, integration,
or end-to-end outcome.
