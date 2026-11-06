# Design system

Every product gets its own design. This file sets the limits every design respects, the structure every design system has, and the method for reaching an authentic result. It sets no look.

An existing app keeps its identity unless the user asks for a redesign. An in-process module's pages use the host's design system; its floating surfaces may have their own.

## Limits

| Not used | Use instead |
|---|---|
| Native-looking controls, `MessageBox`, `ContextMenuStrip`, default tooltips and scrollbars | Styled versions from the app's theme |
| Solid borders as separators | Tone and spacing |
| Hex, sizes or durations in views and code | Tokens; add one if missing |
| More than two font families, or serif faces | Up to two sans-serif families, each with a clear job |
| Hover displacement, teleporting indicators, windows that resize after opening | Opacity and transform animation, indicators that travel, final size on open |
| A `CornerRadius` above half the element's height, such as 999 | Half the height, since WPF scales larger radii into ovals |
| A look borrowed from another of the user's apps, a UI kit or a default template | The product's own idea, below |

## Authentic design

Do this before choosing a color.

1. **Read the context.** Who looks at it, for how long, at what size, at which moment, and what must be understood at a glance.
2. **Find the product's idea.** One concept from its own domain that shapes palette, form, type and motion. Write it in a sentence.
3. **Make the design do work.** This is what the user means by intelligent: the visuals carry information or remove a step, so less needs explaining. Choose at least one element that does this.
4. **Decide the language.** Palette (light, dark or both; ask when the brief does not say), type, shape, density, motion character and icon style, each traceable to the idea.
5. **Record it** in `docs/DESIGN_SYSTEM.md`, so it can be followed and maintained.

Examples of the method. They illustrate the thinking, and the results belong to those products.

| Product | Idea | Design doing work |
|---|---|---|
| Battery widget | Tide water and a charging LED | The panel fills to the battery level; the water moves while charging |
| Module host | A cross of modular tiles: one tool, many modules | The tile returns in every module icon, and the accent marks only the main action and the selection |
| File-action wheel | A wheel at the pointer | It offers only what works for every dragged item on this PC |
| Multi-PC input | Physical keys and connected screens | The edge layout shows the real monitors, with the active edge highlighted |

### Authenticity test

Run it on rendered snapshots, before showing the first screen:

- With logo and text hidden, could this be another app, including another of the user's apps with its colors swapped?
- Can each color, font and shape be justified by the idea?
- Is something here that only this product would have?
- Does the most important information read first, at real size?

Rework until the first answer is no and the others are yes.

## Structure

`Theme/Tokens.xaml` holds every value, `Theme/Controls.xaml` every style, and `docs/DESIGN_SYSTEM.md` the idea, principles, tokens, components and usage rules.

Every design system defines these groups. The values are the product's decision, and a tiny app keeps each group short.

| Group | Defines |
|---|---|
| Surfaces | Background levels and how elevation reads |
| Text | Primary, secondary, tertiary, disabled |
| Accent | The accent, its interaction variants, text on it |
| Meaning | Which hue means what, including status |
| Interaction | Hover, pressed, focus |
| Type | Families, and sizes and weights named by role |
| Space | One scale |
| Radius | One scale, with pill at half the height |
| Size | Control heights and fixed chrome dimensions |
| Motion | Named durations with their uses, and easings |
| Elevation | Floating layers only |

Mechanics:

- Every theme file merges Tokens itself, because a `StaticResource` in a trigger or storyboard cannot see a sibling merged dictionary.
- Use `StaticResource` for a fixed theme, and `po:Freeze="True"` on brushes and easings.
- Use `Color.*` inside storyboards and `Brush.*` everywhere else.
- C# reads tokens through one helper, so hex literals never reach code.

## Component hierarchy

Layout varies by product. The chain of responsibility stays:

```text
Process (App.xaml.cs, composition root)
├─ Host HWND or hidden main window
├─ Tray icon → styled menu
└─ Surfaces the product needs: widget, shell window, modal, toast
    └─ Page, one primary title and purpose
        └─ Section, a labelled group
            └─ Row, one setting or item
                └─ Control, implicit or named style, tokens only
Core (no WPF)   state and policies, unit-tested; the UI applies a pure model
```

- Create heavy pages lazily and keep them alive.
- Promote a row to a template or control once a second screen needs it.
- A tiny app can skip levels.

## Controls

- Each control in use has styled normal, hover, pressed, focus and disabled states, plus checked where it applies. Keyboard focus is visible.
- Button roles look different from each other: primary (the single main action of a surface), secondary, low emphasis, destructive and icon only (with a ToolTip).
- A switch serves settings that apply immediately. Exclusive views use one indicator that travels. Long background work shows progress on the icon or button that started it.

## Windows and chrome

- Shell windows: `WindowChrome`, `DwmSetWindowAttribute` for dark mode (attribute 20) and rounded corners (33, value 2) to match the theme, Snap Layouts by answering `WM_NCHITTEST` with `HTMAXBUTTON` over the maximize button, padding restored when maximized. Persist placement on real exit, and restore it only with a minimum size and an intersection with the virtual desktop.
- Small tools: `WindowStyle=None`, transparent background, outer margin reserved for the shadow, no `ResizeMode` frame. `WS_THICKFRAME` with `WindowChrome` causes a frame strip.
- Floating layers: `ShowActivated=false` plus `WS_EX_TOOLWINDOW | WS_EX_NOACTIVATE` set in `OnSourceInitialized`. Lay out across monitors in physical pixels, using `MonitorFromPoint` and `GetMonitorInfo`. `SetWindowPos` may need two passes across a DPI change.
- Widget drag: manual `CaptureMouse`, because `DragMove` swallows the double click.

## Motion

The character comes from the product. As a speed guide, interaction responses of 120-200 ms and entrances under 300 ms have felt right; the user reads noticeable delay as unresponsive.

Honor `SystemParameters.ClientAreaAnimation` by zeroing durations. Set start values before any `BeginTime`, clear animations on reset, and guard `Completed` with a generation counter so a stale callback cannot overwrite a newer state.

## Icons and logo

- Interface icons: one consistent set that fits the language, as vector paths or a system icon font with a fallback. Space path numbers, since the parser misreads `7.54.54`. Freeze geometries.
- Logo: the user asks for one that is beautiful, authentic, intelligent and understandable, so anchor it in the product's idea, and make it read at tray size.
- Source: vector (XAML or drawing code), with a script generating every raster. Edit the source only. [foundation.md](foundation.md) lists every surface that must carry the icon.
- Tray icons render at runtime to HICON at the DPI-correct size (`GetSystemMetricsForDpi`), and re-register on `TaskbarCreated`.
