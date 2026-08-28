# Contributing

Thanks for improving the collection. Keep `skills/` as the only canonical source
and preserve existing skill behavior unless a proposed change explicitly intends
to change it.

## Before opening a pull request

1. Read [docs/authoring.md](docs/authoring.md) and [docs/testing.md](docs/testing.md).
2. Keep host-specific metadata outside `SKILL.md` frontmatter.
3. Update the README, [skills/catalog.json](skills/catalog.json), and compatibility
   documentation when a public skill contract changes.
4. Run `npm ci`, `npm run validate`, `npm test`, and `git diff --check`.
5. For template changes, run the template typecheck too.

Please make changes narrowly, explain runtime requirements, and do not claim
cross-host behavior without dated reproducible evidence.
