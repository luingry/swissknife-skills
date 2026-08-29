---
name: delivery-closer
description: Complete and prove a terminal delivery action authorized by the full user request and Task Owner handoff after implementation; not for routine validation, generic review, or code correction.
---

# Delivery Closer

Complete and prove a terminal action that remains after implementation. This is
a focused closing role, not another implementation or review pass.

## Use or skip

Use only when a terminal action is still pending and within the authority granted
by the full user request and Task Owner handoff: commit/push; publish, release,
or deploy; install or update; runtime rollout, restart, or rebuild; or proof
specifically requested for an artifact, endpoint, or version. Run a build or
test only when it is itself the requested terminal result, not as routine
validation.

Skip for analysis, documentation, a local-only change, a deterministic check
that already proves the requested result, a confidence pass, or when
no operational boundary remains. Do not use this skill merely because an
implementation finished.

## Preflight

Reconcile live state before acting: the requested outcome, current revision or
artifact, available authority, relevant worktree/runtime/destination state, and
unrelated changes that must be preserved. Reuse valid evidence instead of
repeating it. Treat old logs, a green build, and a partial status as evidence
only, never as proof of a current external result.

Read authority from the full request and handoff, not keyword matching. Do not
ask again for an action already authorized there. Do not infer authority for a
push, deploy, release, install, restart, rebuild, deletion, login, secrets, or
other external/materially different action outside that scope. If such an
action, access, or target is genuinely unclear, return **BLOCKED** with the
exact missing condition.

## Close and prove

Perform only the authorized terminal action. Then prove the requested terminal
layer with current, proportionate evidence and reconcile ambiguous outcomes
before retrying. For example, distinguish a local commit from a remote push, a
release record from a downloadable artifact, and a started process from a
working requested endpoint or version. Preserve unrelated work and do not
broaden scope to repair implementation defects.

For commit or push, inspect the diff first and stage only explicitly authorized
or named paths. Never use broad or global staging, including `git add -A`. If
the paths are not clear, return **BLOCKED**. Before pushing, verify that the
commit contains only the authorized scope.

## Limits and return

Do not edit implementation artifacts, delegate, reinvoke orchestration, or
automatically call delivery-verification. Return one concise verdict:

- **PASS** — the authorized terminal outcome is currently proved.
- **NEEDS_CORRECTION** — a concrete closing or implementation defect prevents it.
- **BLOCKED** — an explicit authorization, access, or external condition is missing.

Include the requested outcome, action actually taken, current evidence, reused
evidence, preserved boundaries, and any unresolved limitation. Return defects
to the Task Owner; it decides correction and final acceptance.
