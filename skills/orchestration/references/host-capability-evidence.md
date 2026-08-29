# Host capabilities for operational orchestration

**Scope.** This evidence supports the `orchestration` skill's Codex, Claude
Code, and Cursor adapters. It does not claim that the three hosts expose the
same APIs, model catalog, or operational behavior. All sources were accessed on
**2026-08-28**. The review covers discovery, delegation, review, and engineering
execution only.

**Method.** A **documented fact** comes from vendor documentation or
vendor-maintained code. A **qualitative report** is a vendor-hosted issue/forum
item and is never treated as a guarantee. A **design inference** is a repository
recommendation derived from documented facts. No benchmark or cross-model
performance inference was used.

## Executive summary

All three hosts support `SKILL.md` skills, specialized agents, and some form of
parallel work. A cross-host skill can therefore direct an `owner` to decompose
work, isolate concurrent writes, request validation evidence, and consolidate
results. [1][2][3]

The portable contract must not, however, make Codex's Sol/Terra/Luna/Spark
taxonomy, `spawn_agent`/`wait_agent`, session JSONL, or PowerShell launcher a
universal requirement. Those are Codex-adapter details. Claude Code exposes
Markdown/frontmatter subagents, Claude model selection, background mode, and
`isolation: worktree`; Cursor exposes subagents, Cloud Agents, worktrees, and
its own hooks. [4][5][6][7]

The safe compatibility design is capability-based degradation: when a host does
not expose subagents, worktrees, a requested model, hooks, or needed permissions,
the owner completes the same accountable workflow sequentially and reports the
limitation. This is a design inference from the documented variation in host
configuration, model availability, permissions, and policy. [4][5][8]

## Documented capability matrix

| Capability | Codex | Claude Code | Cursor | Adapter consequence |
| --- | --- | --- | --- | --- |
| Skill discovery | Uses `SKILL.md` with `name` and `description`, explicit or implicit invocation, and scans repository `.agents/skills` paths. [1] | Follows Agent Skills and supports `/name` or relevance-based invocation; skills can live in `.claude/skills/<name>/SKILL.md`. [2][9] | Discovers skills automatically, supports `/` invocation, and can keep a skill as a Custom Mode. [3] | Keep standard frontmatter and a concise, discriminating description. |
| Specialized agents | Documented subagent workflows and native collaboration are available subject to host configuration. [10][11] | Markdown/frontmatter agents can set tools, permissions, memory, skills, model, effort, background, isolation, and nested delegation up to three layers below the main conversation. [4] | Subagents have separate context and may be customized for editor, CLI, or cloud use. [5] | Use semantic roles and return contracts; do not assume another host's API or agent-file format. |
| Parallelism | Official guidance recommends parallel exploration, tests, triage, and summarization, with caution for concurrent writes. [11] | Supports foreground/background subagents and parallel research patterns. [4] | Documents simultaneous subagents. [5] | Parallelize only independent scopes; concurrent writing needs isolation or exclusive files. |
| Model and effort | Children may inherit, use `config.toml` defaults, or receive explicit Codex configuration. [11] | Frontmatter accepts `model` and `effort`; availability depends on installation/account. [4] | Plan, Max Mode, or administrator policy can restrict or replace configuration. [5] | Express intent such as focused review; never map vendor model names or promise quality/cost equivalence. |
| Isolation | The subagent documentation does not define a per-child worktree parameter; children inherit sandbox policy. [11] | `isolation: worktree` runs a child in a temporary Git worktree. [4] | Supports isolated copies/branches and task worktrees. [5][6] | The core requires verification of isolation; each adapter selects its own mechanism. |
| Background and handoff | The UI can expose background subagents; Codex Cloud supports background and parallel tasks. [11][12] | `background: true` can make a subagent a background task. [4] | Background subagents are resumable; `/in-cloud` uses a VM and branch. [5] | Handoff is a structured summary, not a host-specific ID, log path, or UI object. |
| Hooks and governance | Lifecycle hooks can be enabled through `hooks.json` or inline configuration. [10] | Subagent lifecycle hooks exist; agent-based hooks are experimental and command hooks are recommended for production. [4][13] | Hooks use JSON over stdio and may observe, block, or modify agent/subagent flow. [7] | Hooks are optional guardrails, never proof of acceptance. |
| Agent Teams | N/A to this adapter contract. | Teams are experimental and disabled by default. When enabled, a subagent named by Claude launches as a teammate even without a team request; teammate completion is an idle notification rather than returned output. [15] | N/A to this adapter contract. | With the Teams flag enabled and no explicit team authorization, the Claude adapter must remain owner-sequential and must not call Agent/subagents. |

## Codex

**Documented fact.** Codex uses progressive disclosure: the initial skill list
contains name/description, then loads the full `SKILL.md` when selected. It
documents repository discovery through `.agents/skills` and recommends concise,
front-loaded descriptions. [1]

**Documented fact.** `features.multi_agent` enables collaboration tools. The
documentation recommends specialized parallel agents for independent,
read-heavy work and warns that concurrent writing raises conflict and
coordination risk. Children inherit the parent sandbox policy. [10][11]

**Design inference.** Keep the established Luna reconnaissance, Spark gate,
Sol/Terra routing, guarded CLI worktree launcher, live model catalog, JSONL
evidence, and shallow topology inside the Codex adapter. They remain conditional
on available Codex tools/configuration and must not be interpreted by other
hosts.

## Claude Code

**Documented fact.** Claude Code states that its skills follow Agent Skills and
adds invocation control, subagent execution, and dynamic context injection. It
distinguishes reusable skill instructions from isolated subagent work. [2][9]

**Documented fact.** Custom subagents can reside in `.claude/agents/` or
`~/.claude/agents/` and support fields such as `model`, `effort`, `background`,
`skills`, and `isolation: worktree`. Claude Code documents nested delegation up
to three layers below the main conversation, with a configurable depth limit.
[4]

**Design inference.** The Claude adapter keeps the main session as owner and
uses only built-in or already-defined available subagents. It never creates
persistent agent files. Agent Teams are experimental and must never be enabled
automatically. Before any Agent/subagent call, the adapter verifies the effective
Teams flag from exposed host configuration/environment. If it cannot confirm the
flag disabled, it remains sequential unless Teams are confirmed enabled and
explicitly authorized; a named ordinary subagent can become a teammate, so an
authorized team route collects explicit team evidence and accepts the result.
[15] Although the host supports nesting, the adapter deliberately keeps a
shallow owner-to-worker topology as a design inference.

## Cursor

**Documented fact.** Cursor presents Agent Skills as an open standard,
automatically discovers skills, and allows explicit invocation or Custom Mode.
[3]

**Documented fact.** Cursor subagents have separate context and may run in
parallel. They may be configured in `.cursor/agents/`; Cursor also recognizes
compatible Claude/Codex agent locations with Cursor precedence. Cursor permits
limited child launches, subject to Task access and policy/hook constraints. [5]

**Documented fact.** Cursor provides worktrees for isolated tasks and Cloud
Agents in VM/branch environments. Its documented model selection can be changed
or blocked by plan and administrator policy. [5][6]

**Design inference.** The Cursor parent remains owner and uses only built-in or
already-defined available custom agents. The adapter intentionally keeps a
shallow topology despite Cursor's limited nested-launch capability. Cloud,
`/in-cloud`, and worktree conveniences are used only when available and within
the user's authority.

## Portable contract

The following is a **design inference**, not a shared API claim:

1. The owner reads repository instructions, checks state, divides work,
   integrates results, and performs final acceptance.
2. Each delegation includes objective, authorized area, write authority,
   validation, return format, and definition of done.
3. Research, inventory, review, and tests may run in parallel when independent.
   Shared files/state require serial work or host-provided isolation.
4. Roles describe behavior, not models: `researcher` gathers evidence,
   `implementer` changes a focused scope, `reviewer` independently checks it,
   and `owner` integrates/accepts.
5. Model/effort configuration is adapter preference subject to host catalog,
   plan, and policy. Missing requested configuration must not block safe work on
   the host default.
6. Every handoff states covered scope, changed files, validations/outcomes,
   risks/limits, and whether isolation was used. No host is asked to fabricate
   logs or metrics it does not expose.
7. Missing capability degrades to owner-led sequential execution; it does not
   imply background work, isolation, parallelism, or a benchmark.

## Evidence limits

- No benchmark was run across models, platforms, or subagent modes. This
  evidence cannot establish relative quality, cost, reliability, or speed.
- No practical execution was run in Claude Code or Cursor. Future evaluation
  should record host/version, model, operating system, installation path, skill
  invocation, available tools, outcome, and failure mode.
- Cursor documents model override/restriction by plan and administration. [5]
- Claude Code supports configurable nesting, but this skill deliberately keeps
  a shallow topology for predictable ownership and handoff. This is a design
  inference, not a host limitation. [4]
- When Claude Agent Teams are enabled, a named subagent can become a teammate
  even without a team request; the adapter therefore cannot use normal Agent
  calls without explicit team authorization. [15]
- Codex multi-agent availability can be disabled by managed configuration even
  though it is stable and enabled by default. [10]
- **Qualitative report, not a guarantee:** an OpenAI Codex GitHub issue requests
  explicit worktree-directory selection for spawned subagents. It reinforces the
  design inference that isolation must be verified before concurrent writes, not
  assumed from natural-language instructions. [14]

## Sources

[1] OpenAI. “Build skills.” ChatGPT Learn. https://developers.openai.com/codex/skills (accessed 2026-08-28).

[2] Anthropic. “Extend Claude with skills.” Claude Code Docs. https://code.claude.com/docs/en/slash-commands (accessed 2026-08-28).

[3] Cursor. “Agent Skills.” Cursor Docs. https://cursor.com/docs/skills (accessed 2026-08-28).

[4] Anthropic. “Create custom subagents.” Claude Code Docs. https://code.claude.com/docs/en/sub-agents (accessed 2026-08-28).

[5] Cursor. “Subagents.” Cursor Docs. https://cursor.com/docs/subagents (accessed 2026-08-28).

[6] Cursor. “Worktrees.” Cursor Docs. https://cursor.com/docs/configuration/worktrees (accessed 2026-08-28).

[7] Cursor. “Hooks.” Cursor Docs. https://cursor.com/docs/hooks (accessed 2026-08-28).

[8] Cursor. “Run Modes.” Cursor Docs. https://cursor.com/docs/agent/security/run-modes (accessed 2026-08-28).

[9] Anthropic. “Explore the .claude directory.” Claude Code Docs. https://code.claude.com/docs/en/claude-directory (accessed 2026-08-28).

[10] OpenAI. “Configuration Reference.” ChatGPT Learn. https://developers.openai.com/codex/config-reference (accessed 2026-08-28).

[11] OpenAI. “Subagents.” ChatGPT Learn. https://developers.openai.com/codex/subagents (accessed 2026-08-28).

[12] OpenAI. “Codex cloud.” ChatGPT Learn. https://developers.openai.com/codex/cloud (accessed 2026-08-28).

[13] Anthropic. “Hooks reference.” Claude Code Docs. https://code.claude.com/docs/en/hooks (accessed 2026-08-28).

[14] OpenAI Codex repository. “Allow spawn_agent to start subagents in a specified workspace/worktree directory,” issue #23095. https://github.com/openai/codex/issues/23095 (accessed 2026-08-28). **Qualitative improvement request; not product documentation.**

[15] Anthropic. “Orchestrate teams of Claude Code sessions.” Claude Code Docs. https://code.claude.com/docs/en/agent-teams (accessed 2026-08-28).
