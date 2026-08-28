# Testing policy

## Offline repository checks

`npm run validate` checks the collection structure without network access:

- skill discovery, YAML frontmatter, standard limits, names, and duplicate names;
- local Markdown links, JSON manifests, catalog synchronization, and optional
  `agents/openai.yaml` essentials;
- thin plugin adapters pointing at `./skills/` and the root Agent Plugin manifest.

`npm test` runs unit tests for the validator with temporary fixtures. The CI
workflow runs both on Ubuntu and Windows. The Remotion template has a separate
dependency install and TypeScript typecheck.

These are structural and infrastructure checks. They are **not** a behavioral
benchmark of any model, do not prove skill activation, and do not claim runtime
equivalence across Codex, Claude Code, or Cursor.

## Future host/model evaluations

When access is available, add reproducible fixtures per host/model and record
the host version, model, OS, install route, exact prompt, selected skill,
available tools, observable outcome, and failure mode. Keep results dated and
separate from the baseline validation suite; do not generalize one model or
anecdotal report to every host.
