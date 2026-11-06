# Modular apps

For a host that installs modules, or an app becoming one. The repo's own module docs are the contract for project shape, manifest and SDK interfaces, so read them first. This file adds which shape to pick and what conversions taught.

## Pick the shape

Choose by stall risk and dependencies.

| Shape | Use when |
|---|---|
| Hosted process | Hooks or latency-critical paths, heavy dependencies (SQLite, WebView2), or an established app whose behaviour must not change |
| In-process | Designed as a module, cheap, event-driven |
| Native page with a hidden backend | An existing non-.NET service, in a kill-on-close job |

A hook stalled by a shared UI thread harms the whole app, which is why converted input tools stay in their own process.

## Hosted process

- The module is a thin supervisor that starts a renamed copy of the same exe, such as `<App>.Hosted.exe`, so standalone tooling cannot kill it, with `--hosted --parent <pid> --data <dir>` (and `--show` to surface its window).
- Hosted mode removes tray, updates and Run from the app; the host owns them. It keeps the standalone mutex and exits with a named AlreadyRunning code. The child exits with its parent.
- The app keeps its own UI. The module page uses host styles only and is small: state plus an "Abrir <App>" button, with no duplicate of the app's options.
- The standalone build keeps working, with its installer and data folder untouched. Data copies once into the module's data directory, except rotating tokens, which stay shared.
- Limit restarts to 3 crashes per minute, then show a Failed state with the reason. Name exit codes for each state, and detect an antivirus block by file fingerprint.

## In-process

- Initialization is cheap and never blocks. Disposal leaves nothing running: timers, threads, windows, static handlers, child processes. An update disposes the instance in the same process and loads the new one side by side.
- Pages and the settings tab use host styles only. A floating layer may add product tokens on top of host tokens.
- Catch your own background exceptions, and leave process exit to the host.

## Conventions the user set

- A module's settings sit in a tab beside its description, in its details popup, and expose "Show icon in the notification area", on by default.
- The module's own icon appears in the store.
- Tray: left click opens the module page, double click opens the app's own window, right click opens the menu with no Exit.
- Installing an update does not restart the host. Loading assemblies from memory gives this; loading from file requires a restart, so use it only when something needs `Assembly.Location` or native side-by-side DLLs.
- Each module shows its version and its update button; an available update is green.

## Host rules

- The SDK is a public contract: additive within a major version, with an explicit contract version for breaks, and a minimum host version on modules that need newer interfaces.
- Modules reference the SDK compile-only (`Private=false`). Packages exclude the SDK, `.pdb` and `.xml`, and keep the manifest at the zip root, written without a BOM.
- Packages are hash-verified, extracted to staging with a zip-slip check, then swapped in.
- Give the host an environment variable for an isolated data root, so agent-driven runs leave the real install alone.
- Skip destructive sweeps when redirection is detected, and reinstall any installed module whose files are missing.

## Release and test

- Bump the version on main, add the catalog's release notes to the manifest in the same change, and keep the manifest version equal to the product version where the project ties them. CI publishes the package.
- The first catalog entry is manual; later versions sync on their own. A scheduled sync can lag and can usually be dispatched. Prune an old release only after the catalog names the new one, or installs get a 404.
- Test locally through the host's local feed and an isolated data root.
- To let the user test with the installed host, swap the module with their go-ahead, then restore through a normal catalog update.
