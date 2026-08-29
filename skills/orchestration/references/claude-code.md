# Claude Code adapter

Use only when Claude Code is the active orchestration surface. This adapter
uses documented Claude Code capabilities; it does not call Codex tools, model
tiers, CLI workers, JSONL contracts, or Cursor commands.

Read [shared core](shared-core.md) first.

## Route

The main Claude Code session is the owner. For bounded reconnaissance, use the
built-in Explore agent or a focused read-only custom subagent when the Agent tool
and an already-defined/available custom agent are present. This skill does not
create persistent agent files. Use a focused `implementer` for an authorized
change and a read-only `reviewer` for independent verification when the task
benefits from separation. Claude Code supports nested subagents up to three
layers below the main conversation (configurable), but this skill deliberately
keeps a shallow topology: a worker does not delegate and returns any further
need to the owner.

Set `model` and `effort` only when those values are actually available; otherwise
inherit the session configuration. They express routing intent, not a guarantee
of quality, cost, or model equivalence.

## Concurrency and isolation

Run background or parallel subagents only for independent work. For concurrent
writes, use `isolation: worktree` only when Git and that capability are available;
otherwise use one implementer sequentially. The owner reviews and integrates
the resulting diff. Do not infer isolation from a prompt alone.

`background: true` is optional and must not be used merely to make a task appear
asynchronous. A normal foreground result is sufficient when the owner needs it
to continue.

## Teams, hooks, and fallback

Agent Teams are experimental. Do not enable, configure, or modify their
settings/environment. Before **any** Agent/subagent call, inspect the effective
`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` state through configuration or environment
the host exposes. If the state cannot be confirmed disabled, remain
owner-sequential; do not call Agent/subagents unless Teams are confirmed enabled
and the task explicitly authorizes team coordination. When Teams are confirmed
enabled and authorized, use teammate semantics only within that authority:
Claude may name an ordinary subagent automatically, and a named subagent becomes
a teammate. Treat teammate idle notification as status, not a returned result;
collect the teammate's explicit message or shared task evidence, then perform
owner review and acceptance. Hooks are optional enforcement/observation, not
proof that the owner accepted work.

If Agent, the selected model/effort, background mode, worktree isolation, or
permissions are unavailable, the owner conducts the equivalent work sequentially
and reports the material limitation. Keep the same structured handoff and
acceptance requirements.
