---
name: delivery-verification
description: Determine whether implemented work is acceptable when material uncertainty remains; not for routine completion or generic review.
---

# Delivery Verification

Determine whether the implementation is acceptable from evidence, rather than
trying to find problems. Use this only after implementation when material
uncertainty remains, or when the user explicitly requests it. Do not use it for
routine completion, a generic audit/review/debugging pass, or repeated
confidence passes.

## Evidence and decision

Reuse the original goal or specification, changed delta/artifacts, validation
results, material risk signal, and prior findings/fixes when re-verifying. Do
not require a formal matrix or manifest. An unchanged artifact evaluated with
the same criteria and evidence should normally receive the same verdict.

Return a concise verdict: **PASS** or **FAIL**, blocking findings with stable
IDs and concrete evidence, separately listed nonblocking observations, and the
evidence boundary or limitations. PASS with no relevant problem is a successful
verdict; no prose report is required beyond what supports the decision.

Only BLOCKER or MAJOR findings prevent acceptance. A blocking finding must name
the affected and expected behavior, demonstrate a real reachable problem with
concrete or verifiable evidence/reasoning, and be relevant to the contract,
regression, or reliability. Classify everything else clearly as MINOR,
IMPROVEMENT, SPECULATION, or OUT OF SCOPE. Optional improvements, speculation,
and out-of-scope observations are not blockers.

## Re-verification and boundaries

For a re-verification, check the named findings are fixed, regress behavior
relevant to those fixes, and confirm previously satisfied criteria were not
obviously invalidated; then stop. Broaden the review only if the fix materially
expands the risk surface or new concrete evidence justifies it.

Do not edit artifacts. Return the evidence and acceptability decision to the
Task Owner or implementer, who applies any fix. Do not delegate, recursively
invoke orchestration, or create a verification cycle. This skill may be run by
the current agent or an independent specialist selected by orchestration.
