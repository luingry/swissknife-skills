# swissknife-skills

[![skills.sh](https://skills.sh/b/luingry/swissknife-skills)](https://skills.sh/luingry/swissknife-skills)

A small, MIT-licensed collection of reusable [Agent Skills](https://agentskills.io/specification)
for product design, engineering orchestration, delivery verification, and polished product
demos. `skills/` is the single canonical source; host-specific plugin manifests are thin
packaging/install adapters and contain no copied skill content.

## Scope and compatibility

This repository documents installation for **Codex**, **Claude Code**, and **Cursor**
only. A host may support the same `SKILL.md` format without discovering or executing
every workflow identically. `orchestration` has a portable entrypoint and conditional
Codex, Claude Code, and Cursor adapters; it degrades to a sequential owner
workflow when a required host capability is unavailable. Cloning this repository
alone does not cause a host to load a plugin manifest; install standalone skills
at a documented skill path or use that host's plugin import/install/development
flow. See the evidence, capability matrix, and limitations in
[docs/compatibility.md](docs/compatibility.md).

## Catalog

| Skill | Purpose | Runtime note |
| --- | --- | --- |
| [`design-intelligence`](skills/design-intelligence) | Guides significant UI/UX work with product-specific direction and practical visual verification. | Needs file access; its taste memory is optional. |
| [`orchestration`](skills/orchestration) | Routes repository work through the active host while the Task Owner integrates evidence and accepts the result. | Selects one Codex, Claude Code, or Cursor adapter; Codex tiers and CLI remain Codex-only. |
| [`delivery-verification`](skills/delivery-verification) | Returns an evidence-based PASS/FAIL when material uncertainty remains after implementation. | Most portable; needs host-available evidence/tools and never edits artifacts. |
| [`juicy-scrn-cptr`](skills/juicy-scrn-cptr) | Builds Screen Studio-style desktop/mobile demos and framed screenshots from real captures or declarative timelines using React and Remotion. | Needs Node.js, npm, and Remotion; capture modes may need Playwright, Chromium, `adb`, or `simctl`. |

The machine-readable catalog is [skills/catalog.json](skills/catalog.json). The recommended default set is
`design-intelligence`, `orchestration`, and `delivery-verification`; `juicy-scrn-cptr` is an
explicit opt-in because it carries a local media toolchain.

## Structure

```text
skills/                       canonical skill source
  <skill>/SKILL.md            standard Agent Skills entrypoint
  <skill>/agents/openai.yaml  optional Codex UI metadata
  <skill>/references/         conditional guidance
  <skill>/assets/             reusable output assets/templates
docs/                         compatibility, authoring, and validation guidance
scripts/validate-repository.mjs
tests/                        offline structural checks
plugin.json                   open Agent Plugin manifest
.codex-plugin/                optional Codex packaging/install adapter
.claude-plugin/               optional Claude Code packaging/install adapter
```

## Install

### Quick install

Install this repository through skills.sh:

```sh
npx skills add luingry/swissknife-skills
```

### Manual installation

Clone the repository and copy the skills you want. The documented PowerShell and Unix commands
for Codex, Claude Code, and Cursor, including the optional `design-taste.md` starter memory,
are in [docs/installation.md](docs/installation.md). To install only the recommended default
set, omit `juicy-scrn-cptr` deliberately.

Read [docs/compatibility.md](docs/compatibility.md) before relying on a skill's runtime behavior
outside Codex.

## Development

Use Node.js LTS. All repository checks are offline after dependencies are installed:

```sh
npm ci
npm run validate
npm test
```

Authoring and test policy live in [docs/authoring.md](docs/authoring.md) and
[docs/testing.md](docs/testing.md). `ERRORS.md` is the maintained incident log for non-trivial
repository maintenance issues, not end-user installation guidance.

## Contributing and security

Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a change. Report security issues through
[SECURITY.md](SECURITY.md). Release notes begin in [CHANGELOG.md](CHANGELOG.md).

## License

[MIT](LICENSE).
