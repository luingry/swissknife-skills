# Compatibility

Last reviewed: **2026-08-28**.

## What this matrix means

Compatibility has three independent layers:

1. **Format**: the host can parse a standard `SKILL.md` with YAML frontmatter.
2. **Discovery**: the host can find a skill from an installed directory or plugin.
3. **Runtime**: the host exposes the files, commands, tools, and agent capabilities the skill asks for.

The first two layers do not prove the third. This repository has not benchmarked
models or run behavioral evaluations on Codex, Claude Code, or Cursor. No
comparable, reproducible public statistic for adoption, activation, or task
success across these hosts was found; forum reports are anecdotal and are not
used as a quality proxy.

## Evidence and scope

The shared baseline is the [Agent Skills specification](https://agentskills.io/specification)
and its [authoring best practices](https://agentskills.io/skill-creation/best-practices).
Installation and plugin guidance comes from the official documentation for
[Codex](https://developers.openai.com/codex/skills),
[Claude Code skills](https://code.claude.com/docs/en/skills),
[Claude Code plugins](https://code.claude.com/docs/en/plugins-reference),
[Cursor skills](https://cursor.com/docs/skills),
[Cursor plugins](https://cursor.com/docs/reference/plugins), and the
[Agent Plugins 1.0 schema](https://agent-plugins.org/schemas/1.0.0/plugin.schema.json).
The Codex URL currently redirects from OpenAI's developer documentation.

The compatibility claims below are documentation-derived, not a promise of
identical activation, model behavior, or tool availability.

## Host matrix

| Host | Standard format | Documented discovery route used here | Runtime confidence |
| --- | --- | --- | --- |
| Codex | Yes | Standalone: `~/.agents/skills`. Package: `.codex-plugin/plugin.json` after the Codex plugin install/import/development flow. | Highest: the collection was authored for this environment, but individual tools still need to exist. |
| Claude Code | Yes | Standalone: `~/.claude/skills`. Package: `.claude-plugin/plugin.json` after the Claude plugin install/import/development flow. | Conditional: host-specific Codex concepts do not transfer. |
| Cursor | Yes | Standalone: `~/.agents/skills` or `.cursor/skills`. Package: root `plugin.json` after the Cursor Agent Plugin install/import/development flow. | Conditional: only standard-format and host-available runtime requirements are assumed. |

## Skill matrix

| Skill | Format | Discovery | Runtime |
| --- | --- | --- | --- |
| `delivery-verification` | Standard Agent Skills frontmatter and relative resources. | Expected where the host recognizes the documented skill path. | Most portable: it needs task evidence and whatever inspection tools the host provides. |
| `design-intelligence` | Standard format. | Expected through the documented paths. | Conditional on filesystem access. Its `design-taste.md` location is Codex-oriented; absence must be handled as missing optional taste memory. |
| `orchestration` | Standard format. | Expected through the documented paths. | **Codex-specific execution**. It depends on Sol/Terra/Luna/Spark, native subagents, and Codex CLI/worktree workflows. Other hosts may parse it but must not be represented as executing its routing contract. |
| `juicy-scrn-cptr` | Standard format. | Expected through the documented paths. | Conditional on Node.js, npm, Remotion, Playwright, and Chromium. Android/iOS capture modes additionally require `adb` or `simctl`. |

## Plugin adapters

The root `plugin.json` follows Agent Plugins 1.0 and relies on its fixed
`skills/` discovery convention. `.codex-plugin/` and `.claude-plugin/` are
thin, optional host adapters pointing to `./skills/`. Cursor uses the root
Agent Plugin manifest, so this repository intentionally has no redundant
`.cursor-plugin/` manifest. These manifests are packaging/install adapters,
not auto-discovery routes: they take effect only after the corresponding host
install, import, or development-flag flow. Cloning the repository does not by
itself activate a plugin. None of these files duplicate skill content or add
vendor-specific fields to `SKILL.md` frontmatter.

Hosts can evolve plugin schema or installation behavior independently; follow
the linked host documentation when packaging or publishing a release.

## Future evidence plan

When test access is available, record host version, model, operating system,
installation path, invoked skill, prompt fixture, observed activation, available
tools, outcome, and failure mode. Keep those evaluations separate from the
offline structural checks; they are not currently present and should not be
inferred from this matrix.

## Statistics and user reports

There is no public, comparable, reproducible dataset for skill adoption,
activation, or task success across these three hosts. GitHub stars and install
counts do not measure quality. Cursor exposes a leaderboard, but not a public
dataset that supports reproducing cross-host skill-quality conclusions. User
reports can illustrate operational variation only: for example, this
[Cursor community thread](https://forum.cursor.com/t/how-to-use-agent-skills-in-cursor-ide/149860)
is anecdotal evidence that manual and automatic handling can vary, not evidence
of compatibility or quality. Official host documentation remains the primary basis here.
