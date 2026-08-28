# Authoring skills

Use `skills/` as the only canonical source. Do not create copied `SKILL.md`
files for host directories or plugin adapters.

## Core contract

- Start every skill with standard Agent Skills YAML frontmatter containing a
  lowercase hyphenated `name` and a concise `description`.
- Keep the entrypoint focused. Put conditional procedures and large examples in
  linked `references/`; keep assets and templates in `assets/`.
- Use relative links and paths that remain valid when a skill directory is copied.
- State real tool, runtime, host, and operating-system dependencies. Do not
  silently assume a vendor's agent, filesystem, command, browser, or device tool.
- Keep vendor UI metadata under `agents/` and host plugin metadata in the
  respective root adapter; do not place vendor metadata in core frontmatter.

## Updating the collection

1. Add or modify the canonical skill under `skills/<name>/`.
2. Update [skills/catalog.json](../skills/catalog.json) with factual portability
   and requirements information.
3. Update the README catalog and compatibility matrix if the public contract changes.
4. Review scripts and templates for declared dependencies, reproducible install
   behavior, and safe paths before publishing.
5. Run the checks in [testing.md](testing.md). A passing structural check is not
   proof of model behavior.

Prefer progressive disclosure over exhaustive entrypoints. Preserve a skill's
existing workflow unless a requested behavior change is explicit and validated.
