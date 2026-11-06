# Traps

Recurring failures, as symptom → cause → rule. A project's own `ERRORS.md` has its full stories.

## Agent environment

- App shows stale data, modules vanish, log looks frozen, a registry value "exists" but never takes effect → an MSIX-packaged agent host such as Claude desktop gives the processes it starts a virtualized AppData and HKCU → see Installed proof in [delivery.md](delivery.md).
- A stale container state deleted real module folders → garbage collection ran on a merged view → skip destructive sweeps when redirection is detected.
- Runner renders no animation → `ClientAreaAnimation` is false there → inject it in tests.
- Keys vanished → generated inside a sandboxed `%LOCALAPPDATA%` → create secrets in the real profile and check with `Test-Path`.
- A file named `nul` appeared → `> nul` in Git Bash → use `/dev/null`.
- Modal mscorlib Assert Failure at startup → exe under a very long path, such as a session scratchpad; WPF hits `PathTooLong` in `ClientConfigPaths` before any app code → build and run tests under a short path such as `D:\<short>`.
- A build script hangs forever → `& $exe | Out-Null` waits on a modal dialog → run diagnostics with `Start-Process -PassThru`, and kill after 30 s.

## Encoding and scripts

- `Ã§`, script parse errors → Windows PowerShell 5.1 reads BOM-less UTF-8 as ANSI → keep scripts ASCII or BOM; edit JSON and text with file tools or `[IO.File]` with explicit UTF-8; use those instead of `Get-Content`, `Set-Content` and `ConvertTo-Json`.
- `%%ERRORLEVEL%%` printed literally, `timeout` skipped → generated batch quoting, no console, GNU `timeout` on PATH → single `%`, full System32 paths, `ping` waits; better, no generated batch.
- Bad MSBuild paths → props paths resolve per project → `$(MSBuildThisFileDirectory)`.
- ISCC parse failure → `\"` in a directive → Inno escapes quotes as `""`.
- Broken logo, remote SQL failure → Base64 sent as text; CRLF → verify the received bytes; `.gitattributes eol=lf` for such files.

## XAML and WPF

- `UnsetValue`, resource not found → see Structure in [design-system.md](design-system.md).
- Crash on `BeginAnimation` → animating a frozen object → replace brushes instead of mutating them; freeze a pen only with an already frozen brush.
- Knob jumps at the end → VSM generated transitions skip Freezable transforms → explicit `VisualTransition` storyboards.
- Window crashes when a switch starts on → an `EventTrigger` in a `ControlTemplate` fires when a constructor sets `IsChecked`, before the template's names exist → start the animation from a small control class after the template applies.
- Blink at reveal, leftover from last open → `From` not applied before `BeginTime`; `HoldEnd` survives → see Motion in [design-system.md](design-system.md).
- Sizes or colors overridden inside templates → app-level implicit `TextBlock` reaches in → keep FontSize out of it; scoped styles.
- Oval badges, lens-shaped bars → oversized `CornerRadius` → half the height.
- Hard-coded `ContentPresenter` alignment ignores the control's setting → template-bind it.
- Getter-only source crash → TwoWay default → `Mode=OneWay`.
- Wheel `Delta` ignored by smooth scrolling → custom scroll controls handle fractional deltas.
- `IsEmpty` stale inside `DeferRefresh`, overlapped empty states → compute state after the refresh.
- `MouseLeave` fires without entry; `KeyValuePair` accessible names; ComboBox box ignoring `DisplayMemberPath` → handle each explicitly.
- WebView2 ignores ScrollViewer clipping → keep the HWND outside the scroller.

## Windows, DPI, monitors

- Teleport to primary → `SystemParameters.WorkArea` → native per-monitor bounds.
- Black strip → `SizeToContent` snap (dotnet/wpf#9816) → force layout; fixed width where possible.
- Frame strip → `WS_THICKFRAME` with `WindowChrome` → `NoResize` plus managed resize.
- Misplaced clicks → hook and `SendInput` in different coordinate spaces → set the thread DPI context.
- Ghost shadow, oversized first frame → hidden `Show()` → see Hidden start in [foundation.md](foundation.md).
- Menu opens at the monitor's corner → `EnsureHandle` with `SizeToContent` keeps a default size until `Show`, so `GetWindowRect` is wrong → measure the content.
- Double click dead, drag overshoots → `DragMove` → manual `CaptureMouse`; test with real clicks.

## Threading and input

Rules live in the Realtime profile of [performance.md](performance.md).

- Mouse dead, keys stuck → slow work on the hook thread.
- Stuck modifiers → press and release straddle a state change.
- Late clicks under load → async waiters on the pool.
- Random disconnects → sequence assigned outside the write gate.
- 4 ms becomes 16 ms → `Sleep` or thread-pool timers.
- Beeps, stalls → lock held across `SendInput`.

## Persistence and startup

Rules live in [foundation.md](foundation.md).

- Default settings, no log at logon → `GetFolderPath` returned `""`.
- Settings reverted → a duplicate instance saved last.
- Silent defaults → truncating write and `catch → defaults`.
- Real settings and tokens changed by tests → `Application` runs `OnStartup` → harness flag, injected stores.
- `--snapshot` overwrote preferences, a smoke test repointed the Run key → diagnostics never persist.
- Silent upgrade re-enabled Run → read the live value in the installer.
- Lost login → OAuth tokens deleted on a rejection, or rotating tokens copied → keep the file and re-read; share it.

## Packaging and update

- Update stuck at 100% or aborted → see Self-update in [foundation.md](foundation.md).
- `clrjit.dll` locked → Restart Manager scope too wide → exact exe filter.
- Stale files after upgrade → `[InstallDelete]`.
- ISPP `ReadFile` unsupported → pass `/DAppVersion=` from the script.
- Missing tray icon → path differs from the installer layout, hidden by a catch → embed runtime assets.
- Exe will not open → copied without its DLL and config.
- WebView2 `BadImageFormat` → no explicit AnyCPU.
- Defender false positive → unsigned exe with hooks in AppData → a visible `Blocked` state; sign when possible.
- CI failure 0xC000000D after passing tests → WinRT teardown → judge by the result line.
- Clean checkout fails → `artifacts/` absent → create it in the script.
- Module install 404 → release pruned before the catalog moved.

## Network and data

- 21 s stall → .NET Framework tries broken IPv6 first → IPv4-first delegate; request timeouts over 25 s.
- Number frozen on an old value → source stopped delivering → stale by age, expired state.
- Invented 100% for an expired window → show `--`.

## Hardware

- Missing reply read as error → the device is off → treat as no reading; hide after 2 misses; show no stale value.
- Unknown command → firmware-update mode → send only the captured safe request.

## Proof gaps

- "Build passed", production stale → verify the deployed artifact.
- Works on net8 tests, fails on net48 → test on the production runtime.
- Docs claim a behaviour the code lost → read the code. Mark unreproduced causes as deduction.
