# Foundation

## Stack

- C#/WPF on `net48`, SDK-style csproj, `Microsoft.NETFramework.ReferenceAssemblies` as a private build dependency. The framework already ships with Windows, so nothing extra stays resident, and a simple app can be a single exe under 200 KB.
- Props: `LangVersion latest`, `TreatWarningsAsErrors`, `Deterministic`, `DebugType embedded`, `SatelliteResourceLanguages en`, explicit `AnyCPU`, `ImplicitUsings` off.
- Zero runtime packages by default. JSON via `DataContractJsonSerializer`, or a small ini. A dependency such as SQLite or WebView2 needs a reason, and stays out of a shared host process.
- Manifest: `asInvoker`, `PerMonitorV2` + `true/PM`, Windows 10 `supportedOS`, and `longPathAware` when handling arbitrary paths.
- P/Invoke only, no native project. Central `Native/NativeMethods.cs`, `MarshalAs(Bool)`, rooted hook delegates, `DestroyIcon` in `finally`, and a fallback catching `DllNotFoundException` and `EntryPointNotFoundException` for newer APIs.
- Net48 lacks `x[1..]`, Channels, `Math.Clamp` and `System.Text.Json`. Build the whole project against net48, with a small `Polyfills.cs` when needed.

## Scaffold

`scripts/new-app.ps1 -Name <App> -OutputDir <folder> [-Publisher <name>] [-RepoUrl <url>]` generates a repo from `assets/scaffold`. It already implements the lifecycle, single instance, styled tray, settings window, atomic settings, special folders, startup registration, snapshot, icon export, tests, installer and CI described here, so read the generated code for the mechanics.

```text
<App>/
  AGENTS.md  README.md  CHANGELOG.md  VERSION  .gitignore  Directory.Build.props
  docs/DESIGN_SYSTEM.md
  src/<App>/
    App.xaml(.cs)   app.manifest
    Core/           pure logic, no WPF, linked into tests
    Native/         P/Invoke
    Shell/          tray, startup registration, updater
    Theme/          Tokens.xaml, Controls.xaml
    Ui/             windows, custom controls, artwork, snapshot
    Device/ Input/  optional, by domain
  tests/<App>.Tests/Program.cs
  scripts/          build.ps1, build-installer.ps1, release-retention.ps1
  installer/<App>.iss
  assets/           generated .ico, .png and installer art
  .github/workflows/ ci.yml, release.yml
```

Add `ERRORS.md` on the first non-trivial fix. Split `Core` into its own project once a second consumer exists. `build-installer.ps1` refuses to ship while `Theme/Tokens.xaml` still holds `PLACEHOLDER` values.

## Defaults

Used when a project's `AGENTS.md` says nothing.

| Topic | Default |
|---|---|
| Version source | `VERSION` file read by props and installer |
| Theme files | `Theme/Tokens.xaml` + `Theme/Controls.xaml` |
| Tray menu | Styled WPF window, never `ContextMenuStrip` |
| Dialogs | Styled; a `MessageBox` only when the theme itself failed to load |
| Theme mode | A product decision; ask when the brief does not say |
| Architecture | Code-behind for one or two screens, hand-rolled MVVM for list-driven shells; never a framework |
| Tests | Console runner on net48, since other runtimes hide net48 gaps |
| Install scope | Per-user unless a firewall rule or Program Files is required |
| Retention | Keep the newest 3 releases, pruned only after consumers moved |
| Language | Code, comments and commits in English; UI in the brief's language, with a second language once public or hosted |
| Crash handling | Global handlers plus a bounded log |
| Close button | A "hide to tray on close" switch; a widget with no window has no such choice |

## Icon on every surface

One vector source produces every icon, so the product looks the same wherever it appears. Each of these is required where the surface exists:

| Surface | How |
|---|---|
| Exe, taskbar, title bar, Alt+Tab | `ApplicationIcon` in the csproj; `.ico` with PNG frames 16, 24, 32, 48, 64, 128 and 256 |
| Tray | Runtime HICON ([design-system.md](design-system.md)) |
| Setup exe | `SetupIconFile` |
| Installed apps list | `UninstallDisplayIcon={app}\<exe>` |
| Start Menu, desktop | `[Icons]` pointing at the exe |
| Installer wizard | `WizardStyle=modern`; when any wizard page shows, also `WizardImageFile` and `WizardSmallImageFile` as 24-bit BMPs at 1x and 2x |
| Module store | Its icon field, typically a 256 px PNG |
| README | PNG at 128-256 px |

An app that draws its own icon has none for its first build, so `build.ps1` builds, runs `--export-icon` and rebuilds. `verify-installed.ps1` checks the exe, uninstall, shortcut and setup icons.

## README

Written first for someone who wants to use the app, in the project's language. In this order:

1. Centered icon (about 128 px), centered name, and one plain sentence stating the benefit.
2. A prominent download link to the latest release. Badges for version, Windows and languages are optional.
3. A screenshot or GIF of the real app with alt text, from `--snapshot`, refreshed when the UI changes.
4. What it does: short bullets, each a bold benefit plus one sentence, free of jargon.
5. How to install: numbered steps, with requirements in plain terms.
6. How to use, for anything not obvious.
7. Privacy, when the app touches input, network or personal data.
8. For developers: stack, build, tests and links to `docs/`, always last.
9. License.

Done when a non-developer learns what the app does and how to get it from the top of the page, and every image resolves on GitHub.

## Process lifecycle

Order in `OnStartup`:

1. Exception handlers: `DispatcherUnhandledException` plus a final catch on every dedicated thread.
2. Diagnostic flags (`--snapshot`, `--export-icon`). They run before the mutex and never persist anything.
3. Single-instance mutex, before settings load. A stale instance saving last reverts settings and doubles hooks. Name it `Local\<App>...`, per user. A second launch signals the first and exits. Release it only after the final save.
4. `ProfileOptimization` multicore JIT, started only by the surviving instance, with one profile file per mode.
5. Settings, then the first window or the hidden host.
6. Tray at `ApplicationIdle`, or at once when the tray is the only surface.
7. Everything else off the UI thread.

A tray app uses `ShutdownMode=OnExplicitShutdown`, with a 0×0 `HwndSource` named `<App>.Host` for tray, device and close messages, which also lets the installer close the app with `WM_CLOSE`.

**Hidden start:** create only the HWND with `new WindowInteropHelper(w).EnsureHandle()`. A layered `Show()` at opacity 0 leaves a ghost shadow on the desktop, and a minimized `Show()` leaves a stale size. A flag in the Run value, such as `--startup`, selects this path.

**Run at startup:** the registry is the source of truth. Touch only the app's own value under HKCU `Run`, and read the live value during silent upgrades so the installer preserves the user's choice.

**Special folders:** call `Environment.GetFolderPath` with `SpecialFolderOption.DoNotVerify` and an environment-variable fallback. Without them it can return `""` at logon, sending every path nowhere with no log.

**Child processes:** put them in a Job Object (`SetInformationJobObject` with `JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE`, 0x2000). Spawning `taskkill` during session end raises a 0xc0000142 popup.

## Persistence

- Write to a temp file, flush (`WriteThrough`), then `File.Replace` keeping `.bak`. Do it off the UI thread, except a tiny file saved only at exit. Debounce slider-driven saves (400 ms works) so the newest snapshot wins.
- Treat invalid structured files as corruption: quarantine to `.corrupt-<timestamp>`, fall back to `.bak`, log it. Silent reset to defaults is what costs users their settings. An empty or unreadable key=value file also falls back to `.bak`.
- Stay tolerant across versions: record defaults, `Normalize` or clamp on load, ignore unknown keys, add fields append-only. An unread `schema` number is decoration.
- Data with an expiry gets an explicit expired state in the presentation.
- Outputs for the user's own files go to a temp name, then rename. Never overwrite a source.

## Logging

Bounded queue (4096), rotation at 512 KB to 1 MB, writer on a `BelowNormal` thread, `%USERPROFILE%` masked, exception type names rather than tokens. Log every failed path with its reason. Total absence of log lines is itself a diagnostic: it means a wrong path, not a stall.

## Self-update

Add it once a release channel exists. The sequence that survived the most failures:

1. Check on a schedule (Daily, Weekly, Monthly, Never). Persist the attempt before the network call. Query live, since a cached answer once offered an already deleted version. A manual check always bypasses the schedule.
2. Offer in a styled window with release notes. Tiny widgets use a non-activating corner toast.
3. Download to `.partial` with 3 attempts, verify SHA-256, and confirm an exact asset name and a pinned URL prefix. An RSA-signed manifest is stronger for tools with elevated reach.
4. Launch the installer with `/VERYSILENT /SUPPRESSMSGBOXES /update=1`, then exit with a watchdog. A signal file tells the app the installer started.
5. The installer closes the app (`WM_CLOSE` to the host, then wait for the mutex), waits until the exe is writable, and relaunches even on failure. Fixed sleeps cause most stuck updates.
6. On first run after an update, show the release notes and report the outcome.

Test it end to end on an isolated install, driving two test installers with UI Automation. To see the flow on the real machine, install a build with the previous number first.
