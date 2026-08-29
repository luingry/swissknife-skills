---
name: orchestration
description: "MANDATORY before every engineering or repository task: route work through the available Codex, Claude Code, or Cursor capabilities while the Task Owner integrates and accepts the result."
---

# Orchestration

Use this skill before engineering or repository work, including reconnaissance,
review, testing, and implementation. The agent receiving the request is the
**Task Owner** (also called `owner`): it retains the original goal, authority
checks, integration, evidence review, and final acceptance.

## Select exactly one host adapter

Identify the active host from its actual surface and tools, not from a requested
model name or a folder that happens to exist. Select exactly one adapter and do
not combine its APIs, model names, configuration, logs, or worktree semantics
with another host.

1. **Codex:** the current client is Codex CLI, desktop, or IDE, or identifies
   itself as Codex. Read [Codex adapter](references/codex.md) before routing;
   absent native collaboration tools use that adapter's guarded CLI fallback,
   not the Unknown route.
2. **Claude Code:** the current client is Claude Code, with its commands/tools
   or `.claude` runtime. Read [Claude Code adapter](references/claude-code.md).
3. **Cursor:** the current client is Cursor Agent, with its Task/subagent
   facilities or Cursor runtime. Read [Cursor adapter](references/cursor.md).
4. **Unknown or constrained host:** do not claim host-specific orchestration.
   Read [shared core](references/shared-core.md) and execute sequentially with
   the Task Owner.

If more than one integration is installed, the current conversation surface and
its callable tools decide. Never create persistent agents, change host settings,
or enable experimental/team/cloud features merely because this skill is active.

## Shared non-negotiables

Read [shared core](references/shared-core.md) before delegating, changing files,
or accepting a result. It defines literal authorization, portable roles,
handoffs, parallelism, review, visual routing, and stop conditions. The shared
core applies to every host, but the selected adapter governs any host-specific
routing, model, isolation, background, and fallback detail.

For bug, performance, runtime, browser, integration, or worker acceptance work,
also read [acceptance workflows](references/acceptance-workflows.md). When a
significant UI surface is in scope, apply
[$design-intelligence](../design-intelligence/SKILL.md) alongside the selected
adapter; do not add a second orchestration pipeline.

## Capability fallback

Use a capability only after confirming it is available and authorized in the
active host. If subagents, a suitable model, background execution, isolation,
hooks, permissions, or required tools are unavailable, keep the same ownership
and acceptance contract but execute the work sequentially. State the unavailable
capability in the final report when it materially changed the route.

The evidence basis and unvalidated boundaries are documented in
[host capability evidence](references/host-capability-evidence.md).
