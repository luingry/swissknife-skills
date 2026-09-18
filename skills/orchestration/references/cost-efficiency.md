# Cost-efficient owner loop (Codex)

Apply this profile only when the effective Codex priority is `cost-efficiency`
after the current request has taken precedence over the stored project
preference. An explicit current-request `speed` priority therefore disables
this profile even when the project stores `cost-efficiency`. The profile
reduces repeated Task Owner context while preserving the Owner's authority,
independent acceptance, and evidence standard. It is a loop policy, not a new
model tier or a relaxation of the existing routing contract.

## Non-negotiable ownership

The Task Owner continues to understand the request, close the contract, make
material decisions, inspect the candidate diff and evidence, perform
proportionate independent acceptance, and issue the final acceptance. The Owner
does not perform extensive investigation, substantive implementation, prolonged
fixes, or repetitive exploration when a bounded executor can do that more
economically. Delegation saves context; it never delegates acceptance.

There is no round limit that permits accepting incomplete work. Continue the
loop until the contract is evidenced and all material findings are resolved, or
record a genuine external/user blocker with the missing evidence. A worker's
`done` message, a green hook, or an elapsed-round budget is never acceptance.

## Compact contract before implementation

Before an executor starts, the Owner sends a compact, verifiable contract. Use
the shared-core contract fields and label each criterion as explicit requested
behavior, logically/product-derived behavior, or preserved behavior. When
applicable, include only the relevant slice of:

- functional outcome and happy path;
- authority, ownership of consumed resources, and compatibility with affected
  downstream contracts and consumers;
- isolation of tools, plugins, MCP servers, network access, and external
  effects;
- concurrency, cancellation, retries, timeouts, and failure handling;
- exact tests and expected results, repository docs/instructions to preserve,
  and runtime proof at the real boundary (including version/reload evidence for
  resident processes).

Record material assumptions, ambiguities, and the observable proof required.
Do not transmit an unbounded transcript in place of this contract.

## Compact handoff

Prefer a handoff of at most approximately 1,200 tokens. The worker return
contains only the following, with references replacing dumps:

1. commit, fixed point, or diff ID;
2. material files (and relevant hunks);
3. material decisions;
4. exact tests and results;
5. real validations and boundary evidence;
6. risks or requirements not proven;
7. open findings;
8. next action for the Owner.

The handoff is not a diary, full history, repeated prompt, or imported raw
tool/log output. Cite paths, line numbers, commit IDs, and log locations; do
not copy the complete conversation or command output. The Owner keeps the
original contract separately from this result so the next phase receives only
what it needs.

## Fresh-context phase transitions

After a candidate exists, prefer a new, bounded agent for each substantive
later phase rather than replaying the Owner's history. A reviewer receives the
contract, fixed point, candidate/diff ID, and minimum references needed to
check the affected invariants. A fixer receives only the open findings, files
and hunks, affected criteria, and required checks. Use `fork_turns: "none"` by
default or the smallest sufficient bounded context; never use `fork_turns:
"all"` merely for convenience.

Substantive correction returns to fresh-context Luna Max (`gpt-5.6-luna`,
effort `max`) under the normal cost-efficient route. The Owner may correct
directly only when the change is surgical, already understood, reversible, and
demonstrably cheaper than a fresh executor (for example, one known hunk and
one focused deterministic check). Re-review the correction's delta and every
affected invariant. Run full validation again only when the correction could
invalidate unrelated criteria or shared behavior.

If an executor makes no observable progress or is stuck, wait for an
appropriate bounded event-oriented window, then interrupt and redispatch a fresh
context with the preserved worktree/state and a compact finding-only brief.
Do not discard partial work. A timeout with no state change creates no new
finding, polling loop, or narrative recap; continue only when an event or
concrete evidence requires action.

## Progress-aware Codex wait loop

The shared-core progress-aware waiting rules are authoritative. In Codex,
prefer the host's event-oriented wait primitive (such as `wait_threads`) for a
long wait, typically covering 5-10 minutes where the host permits it, rather
than repeated snapshot reads. Use an initial lease of ~10 minutes for
common work and ~20 minutes for debugging, builds, or runtime work. While
checkpoints, tool activity, diffs or file changes, or an active test/build/
runtime process are observable, renew the wait. Do not send commentary or an
owner snapshot when the state is unchanged.

When a lease expires without a completion result, use `send_message_to_thread`
(or the host equivalent) to request a concrete checkpoint and grant about
5 minutes. Count the checkpoint window as the first no-progress window only if
it remains without real control/evidence; after a second consecutive
no-progress window, confirm that no relevant process is active before
interrupting. Preserve the workspace and partial diff, then create a truly new
agent with a minimal finding-only brief. Never use `followup_task` on the
interrupted agent and relabel it as fresh context.

## Ledger and acceptance

When subagents or history controls are unavailable, execute sequentially from
the same compact ledger. Work only on open findings and affected criteria; do
not restate settled analysis or evidence.

Keep one compact ledger with three linked parts: criteria (`pending`, `proven`,
or `open`), findings (owner, severity, file/hunk, status), and evidence
(command/result, real boundary, and Owner verdict). Transfer only open findings
and the evidence needed to verify them; do not repeat settled history. The
Owner independently consolidates the ledger, re-derives acceptance from the
request, and accepts only after the affected flow and negative/complementary
states are proven.

Event-oriented waiting, bounded fresh contexts, and the ledger are context
controls, not proof of model routing, token savings, runtime behavior, or
successful skill activation. Static repository tests can verify the written
invariants and absence of retired routes, but cannot prove those runtime
effects; the Owner must report that boundary honestly.

## Routing boundaries

Cost-efficiency keeps Luna Max as the default substantive executor. Luna Low
remains for short reconnaissance/evidence work and exact six-criterion
surgical edits; Terra High remains available for explicit delivery-speed work,
as the established implementation fallback, and for review where substantial
security, authentication, concurrency, or resident-process risk warrants it.
Astra and Sol remain Owner/consultation tiers under the conditional same-model
policy in [codex.md](codex.md).

This profile does not add a route, alter the six-criterion gate, or move
planning/acceptance away from the Owner.
