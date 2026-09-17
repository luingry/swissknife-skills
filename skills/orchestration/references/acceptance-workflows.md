# Acceptance workflows

## General worker acceptance

1. Re-read the original user goal and constraints.
2. Inspect the relevant worker diff, commands, logs, and reported evidence.
3. Run independent checks proportionate to risk: focused tests, typecheck, lint,
   build, runtime flow, browser flow, benchmark, or log inspection.
4. Exercise relevant adjacent behavior and edge cases when practical.
5. Return concrete defects to the same worker; repeat until acceptable.
6. Integrate only accepted work and report evidence boundaries honestly.

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
