# Systematization

Use design-system depth in proportion to evidence and authorized scope:

- **Formal system:** preserve its source of truth and evolve it compatibly.
- **Informal patterns:** consolidate only decisions already proven by use.
- **Greenfield or no patterns:** create the minimum foundation required by the
  current work.

Apply a graduated flow:

1. **Capture:** treat an explicitly approved direction as project evidence and
   preserve its stable visual and interaction choices.
2. **Consolidate:** within the current scope, remove meaningful drift and reuse
   repeated, stable values or patterns.
3. **Systematize:** introduce shared tokens, primitives, and contracts when
   recurrence, multiple relevant surfaces, concrete duplication, or explicit
   project-wide adoption justifies them.
4. **Govern:** add migration guidance, documentation, or ownership only when an
   ongoing shared system genuinely needs it.

Prefer existing tokens. Create a semantic token only for a stable role, and a
component variant only for a real semantic or behavioral difference. Complete
the states relevant to the component, including accessibility and responsive
behavior. Avoid duplicated raw values and over-configurable universal
components whose consumers do not yet exist.

Deep system work is warranted when shared use or drift makes local changes
costlier or less reliable, or when the user explicitly adopts the direction
project-wide or requests a full design system. When that work is inside the
authorized scope, use `$design-system` when available for token architecture,
component specifications, migration, documentation, and validation. If it
would expand the task, report the opportunity instead of silently refactoring
untouched surfaces.

After changing a shared primitive, verify representative consumers and relevant
viewports for visual, behavioral, and accessibility regressions. Approval is
project evidence; it is not authorization to update
`~/.agents/design-taste.md`.
