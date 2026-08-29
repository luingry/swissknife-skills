# Changelog

All notable changes to this repository are documented here.

## Unreleased

### Changed

- `orchestration` now discovers `design-intelligence`, `delivery-verification`,
  and `delivery-closer` as independent optional companion capabilities at their
  distinct decision points. Missing capabilities preserve the proportional Task
  Owner contract and fast path.

- `orchestration` now has a progressive host-neutral entrypoint with conditional
  Codex, Claude Code, and Cursor adapters, structured handoffs, and sequential
  fallback. The Codex Luna/Spark/Sol/Terra, CLI catalog, guarded Codex CLI
  worktree launcher, and JSONL workflow remain intact and Codex-only.

- README now documents Codex, Claude Code, and Cursor install routes and runtime limits.
- The Remotion template now exposes a TypeScript typecheck command and lockfile.

### Added

- `delivery-closer`, a focused terminal-delivery skill that completes and proves
  only explicitly authorized actions without editing implementation artifacts.

- Agent Plugins 1.0, Codex, and Claude Code packaging manifests.
- Machine-readable skill catalog, offline structural validator, unit tests, and CI.
- Compatibility, authoring, testing, contribution, and security documentation.

### Fixed

- `juicy-scrn-cptr` frontmatter description now meets the Agent Skills 1024-character limit.
- Remotion template Playwright dependency now meets the minimum version that fixes GHSA-7mvr-c777-76hp.
