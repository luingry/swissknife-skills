# Cursor adapter

Use only when Cursor Agent is the active orchestration surface. This adapter
uses documented Cursor capabilities; it does not call Codex APIs/CLI or Claude
Code configuration.

Read [shared core](shared-core.md) first.

## Route

The parent Cursor Agent is the owner. Use Explore, a focused custom subagent
that is already defined/available, or the Task capability for bounded
reconnaissance when available. This skill does not create persistent agent
files. Assign focused `implementer` and `reviewer` responsibilities only when
they materially improve the task. Keep topology shallow even though Cursor can
allow limited child-agent launches: workers return to the parent instead of
delegating again.

Use `inherit` or an available model configuration. Do not promise a model pin:
Cursor documents that plan, Max Mode, or administrator policy can substitute or
restrict a subagent model.

## Parallel, isolation, and cloud

Run background or parallel workers only for independent scopes. Before concurrent
writers, use a confirmed Cursor worktree/copy/isolated branch, or serialize the
writes. `/worktree`, `/best-of-n`, and Agent Window worktrees are Cursor
surface-specific conveniences, not a portable prerequisite.

Cloud agents, `/in-cloud`, and cloud handoff are optional. Use them only when
they are already available in the active Cursor surface and their remote access,
cost, repository, and authorization boundaries are within the user request.
They do not authorize a push, PR, secret exposure, or changed network policy.

## Hooks and fallback

Cursor hooks may observe or gate agent/subagent activity when configured, but
they are optional and do not replace owner review. If Task/subagents, isolation,
background mode, a chosen model, cloud access, or permissions are unavailable or
blocked by policy, work sequentially under the shared core and report the
material limitation.
