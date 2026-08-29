# swissknife-skills

[![skills.sh](https://skills.sh/b/luingry/swissknife-skills)](https://skills.sh/luingry/swissknife-skills)

A small, MIT-licensed collection of reusable [Agent Skills](https://agentskills.io/specification)
for practical product work. `skills/` is the single canonical source; host-specific
plugin manifests are thin packaging/install adapters and contain no copied skill content.

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
| [`design-intelligence`](skills/design-intelligence) | Gives significant UI/UX work deliberate, product-specific direction and visual verification. | Needs file access; its taste memory is optional. |
| [`orchestration`](skills/orchestration) | Routes engineering work and owns acceptance. | Conditional runtime: selects one Codex, Claude Code, or Cursor adapter; Codex tiers and CLI remain Codex-only. |
| [`delivery-verification`](skills/delivery-verification) | Decides whether completed work is acceptable when material uncertainty remains. | The most portable skill; it still needs host-available evidence/tools. |
| [`juicy-scrn-cptr`](skills/juicy-scrn-cptr) | Produces polished product demos and device-framed screenshots with Remotion. | Needs Node.js, npm, Remotion, Playwright and Chromium; some modes need `adb` or `simctl`. |

The machine-readable catalog is [skills/catalog.json](skills/catalog.json). The core trio is
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

Clone the repository, then copy the skills you want. These examples copy all four skills. To
install only the core trio, omit `juicy-scrn-cptr` deliberately.

### Codex

Codex discovers user skills in `~/.agents/skills`.

```powershell
New-Item -ItemType Directory -Force ~/.agents/skills | Out-Null
foreach ($skill in 'design-intelligence', 'orchestration', 'delivery-verification', 'juicy-scrn-cptr') {
  Copy-Item -Recurse -Force ".\skills\$skill" ~/.agents/skills/
}
if (-not (Test-Path ~/.agents/design-taste.md)) {
  Copy-Item .\design-taste.md ~/.agents/design-taste.md
}
```

```sh
mkdir -p ~/.agents/skills
for skill in design-intelligence orchestration delivery-verification juicy-scrn-cptr; do
  cp -R "./skills/$skill" ~/.agents/skills/
done
[ -e ~/.agents/design-taste.md ] || cp ./design-taste.md ~/.agents/design-taste.md
```

### Claude Code

Claude Code discovers user skills in `~/.claude/skills`.

```powershell
New-Item -ItemType Directory -Force ~/.claude/skills | Out-Null
foreach ($skill in 'design-intelligence', 'orchestration', 'delivery-verification', 'juicy-scrn-cptr') {
  Copy-Item -Recurse -Force ".\skills\$skill" ~/.claude/skills/
}
```

```sh
mkdir -p ~/.claude/skills
for skill in design-intelligence orchestration delivery-verification juicy-scrn-cptr; do
  cp -R "./skills/$skill" ~/.claude/skills/
done
```

`design-intelligence` can use `~/.agents/design-taste.md` when it is available;
it is optional. To reuse this repository's starter taste memory without overwriting
an existing one:

```powershell
New-Item -ItemType Directory -Force ~/.agents | Out-Null
if (-not (Test-Path ~/.agents/design-taste.md)) {
  Copy-Item .\design-taste.md ~/.agents/design-taste.md
}
```

### Cursor

Cursor supports Agent Skills through `~/.agents/skills`; use the Codex copy commands above for
a user-wide install. For a repository-local installation, copy selected folders into
`.cursor/skills/`:

```powershell
New-Item -ItemType Directory -Force .cursor/skills | Out-Null
foreach ($skill in 'design-intelligence', 'orchestration', 'delivery-verification', 'juicy-scrn-cptr') {
  Copy-Item -Recurse -Force ".\skills\$skill" .cursor/skills/
}
```

```sh
mkdir -p .cursor/skills
for skill in design-intelligence orchestration delivery-verification juicy-scrn-cptr; do
  cp -R "./skills/$skill" .cursor/skills/
done
```

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
