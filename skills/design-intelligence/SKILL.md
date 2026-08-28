---
name: design-intelligence
description: "Design high-quality product UI/UX for new or redesigned web, mobile, and desktop screens, landing pages, dashboards, significant components/layouts, and screenshot/reference work; not for exact trivial visual tweaks or pure backend work."
---

# Design Intelligence

Use this skill for visually significant product work. It complements specialized
design skills without invoking or requiring them.

## Decide the mode

Separate product refinement from greenfield or redesign work. For refinement,
preserve the established product identity and improve the specific task. For
greenfield or redesign, establish an intentional direction before building.

Before significant UI implementation, understand the user, task, and context;
form a short product-specific direction and deliberate visual thesis internally.
Record it only when useful for a handoff or coordination. Libraries provide
primitives, not identity. Keep UX, accessibility, states, responsiveness,
performance, and maintenance as constraints.

Use anti-convergence as a justification test, not a blacklist or default style:
could this still belong to this product without its branding or copy? Prefer
grouping with space, typography, and alignment when boundaries are not
semantic.

## Adapt effort to value and uncertainty

Apply these internal tiers without requiring a user-facing process:

- **Tier 0:** low-impact work; make the smallest coherent change and check it.
- **Tier 1:** form a short direction and self-review the result.
- **Tier 2:** use optional references, capture desktop and mobile when cheap,
  then make one evidence-based correction.
- **Tier 3:** only for high-value or uncertain work; use a concept or
  independent evaluator, then make at most two corrections.

For significant visual changes, render or capture the app whenever it can be
run and observed practically. Do not conclude from JSX or CSS alone when a
render is viable. If it is not viable, state the evidence boundary. A critic or
evaluator decides acceptability; PASS with no changes is valid and it must not
invent defects.

Prioritize user and project references. Use the web only when its value is
high, keep sources few, and extract principles rather than copying. Image
generation is optional only for open greenfield or flagship work with high
expected value.

## Maintain systems proportionately

Before adding a visual primitive, inspect the project's existing tokens,
components, and patterns. Reuse, compose, or extend them when their semantics
align. Avoid arbitrary repeated values, duplicate variants, and speculative
universal abstractions. When changing a shared primitive, cover the relevant
states, accessibility, and responsive behavior, then inspect representative
consumers and viewports.

Explicit user approval of a visual direction triggers a lightweight
systematization check. Treat the approval as project evidence and a candidate
baseline: preserve the direction in subsequent in-scope work and consolidate
proven patterns within the current authorization. Approval alone does not
authorize an unrelated project-wide refactor, a global taste-memory update, or
a deep system derived from one experimental composition. Deepen the system only
when recurrence across relevant surfaces or consumers, concrete drift or
duplication, explicit project-wide adoption, or a full design-system request
justifies it.

## Handoffs and persistence

For visual work assigned to another worker, provide: user/job,
preserve-versus-replace decision, direction/thesis, must-preserve details,
references, and target viewports/acceptance. Keep the handoff compact.

For significant visual work, read the global taste memory at
`~/.agents/design-taste.md` when available. It is subordinate to
the current briefing and project. Treat universal, global, and project context
separately. Do not create `DESIGN.md` automatically: reuse it if present, and
create or update it only when the task requests persistent identity/design
system work or multi-surface coordination. Update taste memory only after an
explicit request to remember or forget; consolidate and deduplicate durable
preferences, keeping project-specific context separate.

Stop when the agreed task is coherent, constraints are met, and the selected
tier's evidence supports acceptance; do not continue polishing without a
concrete reason.

## Read on demand

- Read [direction and craft](references/direction-and-craft.md) when choosing
  a visual direction or making a meaningful component/layout decision.
- Read [references and concepts](references/references-and-concepts.md) for
  external references, concepts, or optional image generation.
- Read [visual verification](references/visual-verification.md) when rendering,
  capturing, or evaluating significant visual changes.
- Read [systematization](references/systematization.md) after approval when
  reuse or system depth is plausible, and whenever creating or maintaining a
  design system.
- Read [taste memory](references/taste-memory.md) for durable preference and
  project-identity handling.
