# Agent guide

## Product

PLACEHOLDER: the thesis in a few lines. The one job, what happens at idle, and the surfaces it needs.

__APP__ is C#/WPF on .NET Framework 4.8, with nothing beyond what Windows already ships.

## Rules

- **Lightness.** With nothing to do, the app does nothing: no polling, no timers at idle, no watchers. It wakes on an event. A new package, service or resident runtime needs the owner's approval.
- **Language.** Code, comments and commit messages in English. UI text in Brazilian Portuguese unless the brief names another language, stored as UTF-8; the README and CHANGELOG follow it. Every `.ps1` and the `.iss` stay pure ASCII, because Windows PowerShell 5.1 and Inno Setup read BOM-less UTF-8 as ANSI.
- **Tokens only.** Every color, size, radius and duration comes from `src/__APP__/Theme/Tokens.xaml`, and every style from `Theme/Controls.xaml`. No native-looking controls and no solid borders. Every animation honors `SystemParameters.ClientAreaAnimation`. `docs/DESIGN_SYSTEM.md` records the reasoning. The installer refuses to build while `Tokens.xaml` still has its placeholder tags.
- **Diagnostics.** `--snapshot` and `--export-icon` run before the mutex and never persist anything. Only the app's own value in the `Run` key may change, and the registry is the truth for it.

## Versions

- `VERSION` is the single source, SemVer without `v`. Props and installer read it, so never duplicate it.
- Every delivered change bumps it: `MAJOR` for a break, `MINOR` for a compatible feature, `PATCH` for a fix.
- The same change adds a `## [X.Y.Z]` section to `CHANGELOG.md` (Keep a Changelog), with short user-facing notes.
- A push to `main` that changes `VERSION` or `CHANGELOG.md` publishes `vX.Y.Z`, and fails without a matching section. A published version is immutable: fixes ship as a new version. The workflow keeps the newest 3.

## Validation

```powershell
powershell -ExecutionPolicy Bypass -File scripts/build.ps1
src/__APP__/bin/Release/net48/__APP__.exe --snapshot snapshots
```

Open the snapshot images for any visual change. Record non-trivial fixes in `ERRORS.md`.
