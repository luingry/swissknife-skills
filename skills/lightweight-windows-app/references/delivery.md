# Delivery

## What the user's words mean

| Words | Do | Stop before |
|---|---|---|
| "instale na minha máquina", "instala pra eu testar", "testar antes" | Build the installer from the current tree, install, launch, prove | Publishing; commit unless a standing permission applies |
| "deu bom", "funcionou", "show" | Accept that result | Anything more, unless the same message asks |
| "pode commitar" | Commit on the current branch | Push |
| "comita mas não suba", "tem mais coisas em andamento" | Local commit, and remember that release is on hold | Push until told |
| "pode mergear" | Merge the PR, update local main | Release, see below |
| "pode lançar", "lança a versão" | Bump if pending, notes, commit, merge to main, push, watch the workflow, verify the release | Nothing |
| "consolida", "consolida e lança", "pode consolidar tudo" | All finished work in every repo touched: commit, merge open branches and PRs, update local copies, delete merged branches. Release too when the words say so | Unfinished work |

**A version bump reaching main is often a release.** Read the triggers in `.github/workflows/` first. Where it is, and without release words, keep the bump out of the merge or ask.

**Finished** means the user accepted it, or it builds, tests pass and nothing marks it as work in progress. Leave anything else on its branch and name it in the closing report.

Commit when asked, or when the user has given a standing permission for that repo, in chat or in its `AGENTS.md`. Merged branches get deleted.

The usual cycle: request → install → user tests → "deu bom" → "pode lançar".

## Version

- SemVer without `v`, one source per project. MAJOR for breaks, MINOR for compatible features, PATCH for fixes.
- Where the project requires it, every delivered change bumps the version and writes `CHANGELOG.md` (Keep a Changelog) in the same change. The installer and props read the number; nothing duplicates it.
- A published version is immutable. A fix ships as a new version.
- Notes are brief and user-facing, in the project's language.

## Build gate

Run the project's build command before any handoff (`scripts/build.ps1` by default). Visual changes also run `--snapshot`, and you look at the images.

## Installed proof

When the agent runs inside an MSIX-packaged host such as Claude desktop, every process started from its shell sees a private view:

- `%APPDATA%` and `%LOCALAPPDATA%` writes land in `%LOCALAPPDATA%\Packages\<package>\LocalCache` (`Claude_*` for Claude desktop).
- **HKCU is virtualized too**, including `Run` and `Uninstall`. The shell has shown a different installed version from the real hive, and a `Run` value the real hive did not have.
- `Start-Process` and `explorer.exe <exe>` inherit the package. WMI does not.

An app installed or launched that way reads stale state, and its start-with-Windows choice may never reach the real logon.

Use the bundled script, which installs, launches and reads through WMI:

```bash
powershell -NoProfile -ExecutionPolicy Bypass -File "<skill-dir>/scripts/verify-installed.ps1" -App MyApp -Version 1.2.3 -Installer artifacts/MyApp-Setup-1.2.3.exe -Launch -LaunchArgs --startup
```

`-App` is the exe name without extension. Pass `-DisplayName` when the installed name differs (read `AppName` in the `.iss`). The startup flag is in the project's startup registration code.

It fails unless the installer log reports success, the real `DisplayVersion`, real file version and running process path all agree, and the icons are in place: embedded in the exe, on the uninstall entry, on a Start Menu shortcut, and on the setup exe matching the app's. It warns about other copies running, values visible only in the package view, and stray virtual-store folders. Omit `-Installer` and `-Launch` to check what is already running. Admin installers raise UAC, so tell the user first. If the user has the app open with state to lose, say so before closing it.

Then exercise the changed scenario. Read logs and data through `\\localhost\C$\Users\<user>\AppData\...`, because the normal path shows the virtual copy. Read real registry values with `Invoke-CimMethod StdRegProv`.

**The app runs inside a host.** When `<App>.Hosted.exe` is running, a standalone launch signals the hosted copy and exits, and the hosted window may hide standalone settings. Ask whether to disable the module or swap in the new build. A module without an installer is proven through an isolated host install or a swap; see [modular-apps.md](modular-apps.md).

Agents cannot prove everything. A real device, a second PC or a physical gesture belongs to the user: list exact steps, and report it as untested until they confirm.

To test an update prompt on the real machine, install a build with the previous number, then publish the new one.

## Release

Follow the project's flow. Then verify, since a push is not a release:

1. The workflow finished green.
2. The tag and every expected asset exist on GitHub, with notes matching the changelog section.
3. For a module, the host's catalog names the new version. Dispatch its sync if one exists, since a schedule can lag.
4. Retention may run hours later, once consumers moved, so report it as pending when it has not. Never re-create old releases.
5. No merged branch remains; local and remote main match.
6. If the UI changed, the README screenshot is current.

Report what you confirmed. A deleted or newer release that a client cannot see usually means a stale catalog or cached check, so test the client too.

## New repo

`scripts/new-app.ps1` creates everything but the first commit. Run `git init`, and create the GitHub repo only when the user asks; until then, ship the settings without the update section. Repos serving modules must be public so installs can download packages.
