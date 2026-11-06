# Performance

Pick the profile first. A utility is judged by what it costs while idle. An input tool is judged by latency under load. One app can contain both.

## Idle-silent profile

- With nothing to do, nothing runs. A keyboard hook thread sleeps in `GetMessage`, and timers exist only while a gesture or card is active.
- Wake on OS events. For devices, use `RegisterDeviceNotification` and `WM_DEVICECHANGE` (`DBT_DEVICEARRIVAL`, 0x8000), a 400 ms settle and up to 4 retries at 1 s, and poll only while the device exists.
- Pause view work while hidden. Refresh diagnostic lists only while expanded.
- A tiny layered widget gains little from a GPU device: `RenderOptions.ProcessRenderMode = RenderMode.SoftwareOnly`. Keep hardware rendering where a window animates heavily.
- For an always-on widget, after transient screens close, trim once at `ApplicationIdle` with `GC.Collect` and `SetProcessWorkingSetSize(-1,-1)`.
- Heavy work runs off the UI thread at below-normal priority with bounded concurrency: at most 2 jobs, child processes at `BelowNormal`, a persistent cache for repeated parsing.

## Polling done right

When a remote source forces polling, adapt it. One proven client: 20 s base, +20 s per 429 up to 2 min, -20 s per 3 successes, 60 s when idle, backoff on every non-2xx, `Retry-After` honoured with a cap, a total deadline per refresh, and `HttpClient` recreated after 2 network failures. Age marks data stale. A fixed fast poll just earns more 429s.

## Startup

Lifecycle order lives in [foundation.md](foundation.md). Beyond it:

- NGen at install for cold start, and multicore JIT.
- Warm non-critical windows at `ApplicationIdle`. Run capability probes after 2 s at `BelowNormal`.
- Create heavy dependencies on first use: a browser control only in the window that needs it, hooks only when a session connects.
- A small synchronous settings load before first paint is the accepted exception to "no disk before paint".

## UI thread

- No disk or network on it. Coalesce progress with an `Interlocked` flag at `Render` priority.
- Defer side effects past the animation (about 260 ms after a switch).
- Gate list refreshes on a signature and rebuild only on membership change. Throttle per-event UI, since per-event updates in an unvirtualized grid freeze the app.
- Debounce search at 140 ms. Decode icons off-thread at their display size and freeze them.

## Rendering

- Freeze brushes, pens, geometries and easings. Freezing a Pen also freezes its brush, so freeze it only when that brush is not animated.
- Invalidate a custom-drawn control only during its visible motion.
- Prefer a radial gradient to blur on layered windows. `DropShadowEffect` uses `RenderingBias=Performance`, on floating layers only.
- `Timeline.DesiredFrameRate` matched to the display, clamped 60-240 Hz, keeps fast monitors smooth. Low-rate ambient motion can run at 12 fps.

## Realtime input profile

- Hook on a dedicated thread with a message loop: `SetWindowsHookEx` with `WH_KEYBOARD_LL` (13) or `WH_MOUSE_LL` (14), priority `AboveNormal` or `Highest`, delegate rooted in a field and prepared with `RuntimeHelpers.PrepareDelegate`. The callback stays trivial, because Windows drops or skips a slow hook.
- Run a watchdog, since a hook can silently die (every 250 ms via a thread timer works).
- Release any lock shared with the hook before calling `SendInput`.
- Use bounded queues (capacity 256 works). Merge motion, but never reorder clicks or keys.
- Pace with a high-resolution waitable timer: `CreateWaitableTimerExW` with flag `CREATE_WAITABLE_TIMER_HIGH_RESOLUTION` (0x2) and access 0x1F0003. `Sleep` follows the 15.6 ms tick, a thread-pool timer measured 17 ms for a 4 ms target, and Windows 11 ignores `timeBeginPeriod` for hidden windows. The waitable timer measured p50 4.08 ms, max 4.72 ms.
- Use dedicated threads with a final catch in the input path. Async waits on the .NET Framework pool delay clicks under load.
- Set `SetThreadDpiAwarenessContext((IntPtr)(-4))` where hook and `SendInput` coordinates meet.
- Seed already-held keys when a session starts. A press the remote never saw releases locally, which prevents stuck modifiers.
- Assign sequence numbers under the same lock as the write.

## Measure

Report before and after, measured on net48, because other runtimes mislead.

| Question | Tool |
|---|---|
| Idle cost | `Get-Process` CPU over a minute, working set, handles, threads |
| Stutter | Frame-gap logging behind an env var, reporting gaps over 25 ms |
| Timer accuracy, latency | A probe logging p50, p95 and max |
| Parse or scan time | A hidden benchmark flag |
| Size | Exe and installer bytes |

State the numbers and let the comparison decide.
