# Shared orchestration core

This reference applies after selecting a host adapter. It is portable guidance,
not a promise that every host exposes the same tools.

## Authority and ownership

The Task Owner/owner retains the user's goal and authorization boundary. It may
perform safe in-scope reads, edits, tests, and correction loops autonomously,
but asks before destructive effects, production-data risk, missing access,
material ambiguity, consequential scope expansion, or an external decision not
already authorized. A worker never broadens authority.

Use semantic roles rather than vendor model names:

- `researcher`: bounded, preferably read-only evidence collection.
- `implementer`: an authorized, focused change and its required validation.
- `reviewer`: independent, preferably read-only examination of the change and
  evidence.
- `owner`: plans, integrates, reviews the diff/evidence, and accepts.

Use one implementer by default. Do not create persistent agents automatically.

## Delegation and parallelism

Give every worker a goal, authorized scope/files, necessary context, constraints,
observable acceptance criteria, expected validation, and return format. Workers
must return only: completed work/finding; files; validation commands and
outcomes; evidence; and genuine concerns or scope gaps.

Parallelize only independent, non-overlapping work that materially reduces time.
Research, review, and tests are normally safer parallel candidates than writing.
Before concurrent writers start, confirm host-provided isolated worktrees/copies
or assign mutually exclusive files and state assumptions. Otherwise serialize.
Keep topology shallow: the owner delegates and integrates; workers return
out-of-scope needs to the owner. A host that permits nested agents does not make
them necessary for this skill.

## Handoff, review, and completion

Every handoff records: goal; covered scope; files changed or inspected;
validations and outcomes; whether isolation was used; unresolved risks; and the
next owner decision. Host-specific thread IDs, JSONL paths, or cloud links are
optional evidence, never the portable contract.

The owner inspects the relevant diff and worker evidence, then independently
runs proportionate acceptance checks. A worker saying `done`, a green hook, or
a background completion is not acceptance. Return a concrete defect to the
appropriate worker and re-verify its correction; broaden review only when new
evidence expands risk.

Preserve behavior unless the task requires a change. Treat existing tests as
contracts, do not weaken them merely to pass, and finish when requested behavior
is demonstrated, relevant checks pass, no unexplained behavior change remains,
and no material risk is unresolved. Do not start another confidence pass without
a concrete risk signal.

## Visual work and specialized verification

For a new screen/page, significant component/layout, dashboard, redesign,
meaningful UI/UX improvement, or screenshot/reference-driven work, use the
available `design-intelligence` capability. Handoff the user goal,
preserve/replace decision, design direction, must-preserve details, references,
viewports, and visual acceptance.

For material residual uncertainty after cheap verification, the owner may use
the available `delivery-verification` capability. It is an evidence-based
acceptance check, not a required generic audit and does not replace the selected
host adapter. Separately, for an authorized terminal delivery action still
pending after implementation, the owner may use the available `delivery-closer`
capability. It does not replace acceptance and is independent of delivery
verification. The owner may select both only when their distinct triggers each
exist; neither calls the other automatically.

When delivery closure applies, its skill is available, and the host offers a
suitable temporary specialist, the owner dispatches that specialist in fresh
context with the requested outcome, full-request authority, handoff, current
state, valid evidence, preserved boundaries, and return contract. It is not a
persistent agent and must not delegate. If the specialist or capability is
unavailable, the owner performs the same closing protocol sequentially.
