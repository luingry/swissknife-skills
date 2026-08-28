# luingry-swissknife-skills

A small collection of reusable Agent Skills for practical product work. Each
skill keeps its entrypoint concise and puts conditional detail in references.

## Skills

| Skill | Purpose |
|---|---|
| [`design-intelligence`](skills/design-intelligence) | Gives significant UI/UX work a deliberate product-specific direction, adaptive visual verification, and durable taste-memory boundaries. |
| [`orchestration`](skills/orchestration) | Routes engineering work across available agent tiers, with acceptance ownership and compact visual handoffs. |
| [`delivery-verification`](skills/delivery-verification) | Decides whether completed work is acceptable when material uncertainty remains. |
| [`juicy-scrn-cptr`](skills/juicy-scrn-cptr) | Produces polished product demo videos and device-framed screenshots with Remotion and real browser interaction. |

## Layout

```text
skills/
  <skill-name>/
    SKILL.md
    agents/              # optional UI metadata
    references/          # optional on-demand guidance
    scripts/             # optional deterministic helpers
    assets/              # optional output assets/templates
```

`SKILL.md` is the entrypoint. Supporting references are read only when their
specific guidance is useful.

`orchestration` references `design-intelligence` and `delivery-verification`;
install that trio together.

## Install for Codex

Copy or link the desired skill directory into `~/.agents/skills/`:

```powershell
Copy-Item -Recurse .\skills\design-intelligence ~/.agents/skills/design-intelligence
```

These directories follow the Agent Skills convention and are compatible with
agents that support `SKILL.md`-based discovery.

## License

MIT — see [LICENSE](LICENSE).
