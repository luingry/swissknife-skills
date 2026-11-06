---
name: lightweight-windows-app
description: "Build, change, fix or release lightweight Windows desktop apps: tray utilities, floating widgets, input tools, and modular hosts or plugins in C#/WPF on .NET Framework 4.8. Use for any new Windows app or widget request and for work in any existing WPF desktop repo, including UI polish, viability questions, converting an app into a module, and delivery requests such as \"instale na minha máquina\", \"pode lançar\" or \"consolida\". Not for WinUI 3 projects or web apps."
compatibility: "Requires Windows 10 or 11, the .NET SDK, Windows PowerShell 5.1, and Inno Setup 6 for installers. Targets .NET Framework 4.8. Uses the GitHub CLI for releases when available."
---

# Lightweight Windows App

The product bar: light at idle, an entirely custom UI with an identity of its own, reliable in real use, and delivered installed so the user can test it.

## Orient

Read the project's `AGENTS.md` and `ERRORS.md` first. Project rules win over this skill on language, version source, release flow and retention. Where a project is silent, use the defaults in [foundation.md](references/foundation.md).

Existing code is evidence, not automatically the standard: a project may still carry native menus, `MessageBox`es or inline colors that these rules supersede.

Before touching XAML, scripts, installers or threads, skim the matching section of [traps.md](references/traps.md).

Then follow the branch that fits. One request can take several.

### Viability: "é viável?", "é possível?", "tem alguma abordagem...?"

The user usually decides from this answer, so answering is the whole job. Investigate with real evidence (the device, the API, a throwaway probe outside the repo) and report: feasible or not, what was verified versus assumed, resource cost, side effects and a recommendation. Implementation waits for a go-ahead such as "manda bala" or "pode criar". "Consegue <verb>" naming a concrete change belongs to Change or Bug.

Done when all five items are stated and no repo file changed.

### New app

1. Prove the core data source or OS capability with a throwaway probe. If it needs a driver, elevation or a package, stop and report before scaffolding.
2. Fix the thesis in a few lines: the one job, what happens at idle and the surfaces needed (widget, tray menu, settings, shell).
3. Generate the repo with this skill's `scripts/new-app.ps1 -Name <App> -OutputDir <folder>`, on a short path next to the user's other projects. It builds a working tray app with placeholder design tokens.
4. Find the product's own idea, then replace every placeholder and build its design system before any new screen, following [design-system.md](references/design-system.md). The look is decided here, and no other app's look is the starting point.
5. Draw the real icon as vector source, generate the rasters and apply it on every surface ([foundation.md](references/foundation.md)).
6. Implement against [ux-rules.md](references/ux-rules.md) and [performance.md](references/performance.md).
7. Extend `--snapshot <dir>` so every state renders off-screen, look at the images and run the authenticity test.
8. Complete the README template to the standard in [foundation.md](references/foundation.md).
9. Deliver per [delivery.md](references/delivery.md).

Done when `scripts/build.ps1` passes, snapshots cover every state and pass the authenticity test, idle behaviour matches the thesis, the icon is on every surface, the README meets the standard and the installed exe is proven.

### Change

1. Reuse existing components and tokens, and keep the app's identity unless the user asks for a redesign. If a value is missing, add the token first ([design-system.md](references/design-system.md), [ux-rules.md](references/ux-rules.md)).
2. Walk every entry path to the behaviour: hotkey and pointer, standalone and hosted, each role of a multi-machine feature, tray and window. Most regressions came from fixing one path.
3. Put optional or surprising behaviour behind a switch, with the default the user stated, hidden where it does not apply.
4. Check the idle cost of anything that runs in the background ([performance.md](references/performance.md)).
5. Deliver for testing, per the words the user used.

Done when each entry path from step 2 is listed with its check, and the new path has a test or snapshot.

### Polish: visual or UX feedback

The user's visual feedback is precise. Apply it literally, then fix the same flaw in sibling elements of that screen, using [ux-rules.md](references/ux-rules.md). Render the changed states and inspect them. When the user asks for a preview before consolidating, send an image rendered from the real code, never a mockup or an old screenshot.

Done when an image of every changed state has been inspected.

### Bug

"Ainda não funcionou" is the user's most repeated complaint: fixes took several rounds because a plausible cause shipped as a fix.

1. Search the project's `ERRORS.md` and [traps.md](references/traps.md).
2. Get evidence from the failing scenario: the real log (see virtualization in [delivery.md](references/delivery.md)), a reproduction, or a capture coordinated with the user. A short coordinated logger session has solved what many tuning rounds could not.
3. State the root cause and its evidence. Label a deduction as a deduction.
4. Fix the class of failure and harden it: log the failure path, and cover the sibling scenarios the user mentioned.
5. Add a regression test where the logic can be isolated.
6. Install and prove it, then tell the user exactly what to try.
7. If the user reports it persists, drop the theory and return to step 2.
8. Record the entry in `ERRORS.md`.

Done when the scenario passes on the installed exe or the user-only steps are listed, and the `ERRORS.md` entry cites the evidence.

### Modular host or module work

Read [modular-apps.md](references/modular-apps.md) and the repo's own module docs.

### Delivery: "instale", "pode commitar", "lança", "consolida"

Read [delivery.md](references/delivery.md). Each of these words has a precise, different meaning.

## Standing rules

- **Idle silence.** With nothing to do, the app does nothing: no polling, ticking or watching. It wakes on an event, and polls only while a target exists. A job that must stay periodic polls at the slowest useful interval, and its measured cost is reported. "Leve" is the user's first adjective for these apps.
- **No new baggage.** A new package, service or resident runtime needs the user's approval. Net48 is already on every target machine, which is why the apps stay small.
- **Own identity.** The look comes from the product's own idea, and the design does useful work: it carries information or removes a step. Only the limits in [design-system.md](references/design-system.md) are fixed.
- **Everything custom.** Every window, dialog, tray menu, tooltip and scrollbar comes from the app's theme, and every value from a token. A native-looking control is a bug.
- **Tonal surfaces.** Tone separates surfaces, so solid borders have no job to do.
- **Motion without displacement.** Every state change animates opacity or a transform with a token duration. Hover leaves elements in place, indicators travel instead of teleporting, and windows open at their final size.
- **Immediate response.** Input gets a visible response at once. Remove dwell delays and first-use hitches, and defer side effects past the animation.
- **Show only what applies.** Hide what does not apply to this state or machine rather than disabling it, keep one place for each fact, and remove what nobody needs.
- **Honest data.** Every failure path logs its reason, and stale or expired data shows as stale. A guessed value is a bug.
- **Protected user state.** Tests, diagnostics and harnesses leave real settings, the Run key, tokens and captured data untouched; back up before touching user data. Test harnesses that drive global hooks, `SendInput` or the cursor need explicit authorization, because one took the mouse and forced a reboot. An install request does authorize launching the product itself.
- **Installed proof.** A passing build proves the build. Done means the installed exe, launched outside the agent's virtualization, at the expected version, in the scenario that matters.
- **Known-safe hardware.** Send a device only messages already known to be safe. One probe put a dongle into firmware-update mode.

## Closing report

For New app, Change, Bug and Delivery, write it in the user's language and include:

- what changed
- `Versão esperada: X.Y.Z`
- what was proven on the installed exe
- what only the user can test (real device, second PC), with exact steps
- what is committed, pushed and released, and what is not

When available, `dotnet-pinvoke` helps with P/Invoke declarations, `analyzing-dotnet-performance` or `dotnet-trace-collect` with a measured hot path, and `design-intelligence` with a greenfield visual direction.
