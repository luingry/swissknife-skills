# Codex CLI workers

Use this fallback only when the routing decision requires Luna or Spark and the
native subagent tool does not expose that worker. A CLI worker is still a
supporting agent and MUST NOT delegate again.

## Exact routing

- Use `gpt-5.6-luna` for repository reconnaissance and evidence collection:
  locate definitions and callers, inventory tests or failures, summarize logs,
  and return a concise context package. Prefer `read-only`. Permit
  `workspace-write` only exceptionally for a deterministic, tightly bounded,
  mechanical transformation with automatic verification.
- Use `gpt-5.3-codex-spark` only for surgical execution when all six Mandatory
  Spark gate criteria in `SKILL.md` pass. Give exact targets, final state, and
  the single focused deterministic validation.
- Do not use Luna as a fallback for Terra or Spark. Do not use Spark for
  investigation, architecture, ambiguous requirements, or iterative debugging.

## Discover the real CLI and live models

On Windows, prefer this installed binary:

```powershell
$cli = 'C:\Users\luing\.codex\plugins\.plugin-appserver\codex.exe'
& $cli debug models
```

Use an explicit `-CliPath` when the install differs. Only after the preferred
path is absent may the launcher resolve `codex.exe`/`codex` from `PATH`.
WindowsApps aliases are last-resort candidates because they may fail with
`Access denied` in hosted terminals.

Always inspect the live `debug models` JSON before launch and require the exact
slug. A model mentioned in documentation or policy but absent from this catalog
is unavailable in the current CLI/account environment.

## Isolated execution workflow

1. For repository work, choose a dedicated worktree path and a base revision. The launcher defaults
   to `HEAD` and creates a detached worktree. A manually created worktree based
   on `HEAD` does **not** contain uncommitted or untracked changes from the main
   checkout; commit/stash/materialize required context deliberately.
2. Launch in the default lean mode: `codex exec --ignore-user-config`, explicit
   `agents.enabled=false`, reasoning effort `low`, the minimum sandbox
   (`read-only` for Luna reconnaissance; `workspace-write` only when edits are
   authorized), and `--ask-for-approval never`. Ignoring user config preserves
   CLI authentication and repository `AGENTS.md` instructions while avoiding
   unrelated user skills/plugins/config context. Use `-IncludeUserConfig` only
   when the assignment genuinely depends on user-level configuration.
   The launcher captures stdout as JSONL and stderr separately without merging
   them.
3. Parse JSONL events for `thread.started`, retain its `thread_id`, inspect
   messages, commands, file changes, failures, final output, and token usage.
4. Continue a correction cycle either with `codex exec --json resume
   <thread_id> <feedback>` in the same worktree or with a fresh CLI execution in
   that same worktree. Return specific review feedback to the same worker until
   acceptable.
5. Independently inspect the diff and rerun proportionate acceptance checks.
   Never accept the worker's `done` claim as validation.
6. Integrate only the accepted diff or commit into the main checkout. The
   launcher never integrates, removes the worktree, or deletes logs.

A worktree prevents two workers from physically overwriting the same checkout.
It does not prevent logical merge conflicts when their accepted diffs touch the
same lines or assumptions. Assign non-overlapping scopes and review integration.

## Launcher

For bounded Luna reconnaissance outside a Git repository (including a
projectless/global configuration directory), use direct mode. It validates the
target path, accepts **only** `gpt-5.6-luna` with `read-only`, creates no
worktree, disables recursive agents, and still records JSONL plus stderr. Do
not use it for Spark or any writing task:

```powershell
& scripts/Start-CodexCliWorker.ps1 `
  -DirectPath C:\Users\luing\.codex `
  -Model gpt-5.6-luna `
  -Prompt 'Inventory the configuration files and report only evidence.'
```

For repository work, use the existing isolated-worktree form:

Create a new isolated worker:

```powershell
& scripts/Start-CodexCliWorker.ps1 `
  -RepositoryPath D:\Dev\project `
  -Model gpt-5.3-codex-spark `
  -Prompt 'Apply the exact bounded change and run the named check.' `
  -AccessMode workspace-write `
  -ReasoningEffort low
```

Resume a known worker in its preserved worktree:

```powershell
& scripts/Start-CodexCliWorker.ps1 `
  -RepositoryPath D:\Dev\project `
  -WorktreePath C:\temp\codex-worker-existing `
  -Model gpt-5.3-codex-spark `
  -ResumeThreadId '<thread_id>' `
  -Prompt 'Fix the two review findings and rerun the focused check.' `
  -AccessMode workspace-write
```

The launcher prints a result object containing the CLI, model, worktree, JSONL,
stderr, exit code, whether it created the worktree, and any discovered thread
ID. By default logs live outside the worktree so they do not contaminate its
diff. Preserve those paths until review and integration are complete.

`ReasoningEffort` defaults to `low` for both models and may be overridden only
with an effort listed for that exact model by the live catalog. The launcher
rejects unsupported values before creating or running the worker.
