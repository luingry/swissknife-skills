# Codex CLI workers

Use this fallback only when the routing decision requires Luna Low or Luna Max and the
native subagent tool does not expose that worker. A CLI worker is still a
supporting agent and MUST NOT delegate again.

## Exact routing

- Use Luna Low (`gpt-5.6-luna`, effort `low`) for repository reconnaissance and evidence collection:
  locate definitions and callers, inventory tests or failures, summarize logs,
  and return a concise context package. It is read-only.
- Use Luna Low (`gpt-5.6-luna`, effort `low`) for an already-understood surgical
  repository edit only when all six Mandatory Luna Low surgical criteria pass.
  Use an isolated worktree with `workspace-write`, provide exact targets and
  final state, and run the one named deterministic validation. Do not use this
  route for investigation, architecture, ambiguity, or iterative debugging.
- Use Luna Max (`gpt-5.6-luna`, effort `max`) as the default substantive
  implementation worker when the surgical Luna Low gate does not apply.
  For repository implementation, use an isolated worktree and
  `workspace-write`. Route to Terra High when the user explicitly prioritizes
  the agent's wall-clock delivery time, or when Luna Max is genuinely
  unavailable. Do not infer that priority solely from a product performance or
  runtime-latency task. Honor a supported model or effort explicitly selected
  by the user. Repository Luna defaults to effort `max`; set effort `low`
  explicitly for the surgical Luna Low route.
- Do not use Luna Low surgical execution for investigation, architecture,
  ambiguous requirements, or iterative debugging.

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
   `agents.enabled=false`, the model-appropriate reasoning effort (`low` for
   Luna Low; `max` for Luna Max), and the minimum sandbox
   (`read-only` for Luna Low reconnaissance; `workspace-write` when edits are
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

For bounded Luna Low reconnaissance outside a Git repository (including a
projectless/global configuration directory), use direct mode. It validates the
target path, accepts **only** `gpt-5.6-luna` with effort `low` and `read-only`, creates no
worktree, disables recursive agents, and still records JSONL plus stderr. Do
not use it for surgical edits or any writing task:

```powershell
& scripts/Start-CodexCliWorker.ps1 `
  -DirectPath C:\Users\luing\.codex `
  -Model gpt-5.6-luna `
  -Prompt 'Inventory the configuration files and report only evidence.'
```

For Luna Low surgical repository implementation, use an isolated worktree only
after all six criteria pass, with explicit low effort and write access:

```powershell
& scripts/Start-CodexCliWorker.ps1 `
  -RepositoryPath D:\Dev\project `
  -Model gpt-5.6-luna `
  -Prompt 'Apply the exact bounded change and run the named focused check.' `
  -AccessMode workspace-write `
  -ReasoningEffort low
```

For Luna Max repository implementation, use the isolated-worktree form:

Create a new isolated worker:

```powershell
& scripts/Start-CodexCliWorker.ps1 `
  -RepositoryPath D:\Dev\project `
  -Model gpt-5.6-luna `
  -Prompt 'Implement the assigned substantive change and run the named checks.' `
  -AccessMode workspace-write `
  -ReasoningEffort max
```

Resume a known worker in its preserved worktree:

```powershell
& scripts/Start-CodexCliWorker.ps1 `
  -RepositoryPath D:\Dev\project `
  -WorktreePath C:\temp\codex-worker-existing `
  -Model gpt-5.6-luna `
  -ResumeThreadId '<thread_id>' `
  -Prompt 'Fix the two review findings and rerun the focused check.' `
  -AccessMode workspace-write `
  -ReasoningEffort max
```

The launcher prints a result object containing the CLI, model, worktree, JSONL,
stderr, exit code, whether it created the worktree, and any discovered thread
ID. By default logs live outside the worktree so they do not contaminate its
diff. Preserve those paths until review and integration are complete.

`ReasoningEffort` defaults to `low` in direct Luna Low mode and to `max` for
repository Luna workers. It may be overridden only with an effort listed for
that exact model by the live catalog; a repository `low` value must be explicit
for the surgical route. The launcher
rejects unsupported values before creating or running the worker.
