# UX rules

These rules come from the user's own corrections. They govern behaviour and clarity, while the look stays the product's own. Check a screen against all of them before showing it.

## Clarity and hierarchy

- Buttons look like buttons, and their style follows their role.
- Offer one action per state: Connect or Disconnect, never both. State each fact once.
- Separate sections clearly, by tone and spacing.
- Keep one left edge. An indented checkbox reads as a broken layout.
- Left-align select text. Size buttons to their content, and put related buttons on one line.
- Remove what earns nothing: decorative badges, explanatory text under buttons, dividers inside a block.
- Label an action with its exact effect ("Reset this profile defaults", "Reset all profiles").
- An icon alone needs to be self-explanatory; otherwise add a label.
- Group long lists under a clear label, with the items the user already has above the rest.
- Show the installed version in settings and wherever modules appear.
- Keep value text in proportion to its screen.

## Interaction

- Hover leaves geometry alone, and on an inactive tab it never resembles the active state.
- The active indicator travels to its position.
- Reveal without dwell: a menu that needs a long hover reads as unresponsive. Nothing flickers as a dependent element appears.
- A switch never hitches: defer disk and list work until the animation ends.
- Windows open at their final size.
- Prefer hiding over locking: an option that cannot apply on this machine or in this role disappears.
- New optional behaviour arrives as a switch or checkbox. Diagnostics default off, and appear only while their feature is on.
- List states never overlap: empty, loading, error and offline are mutually exclusive. Give each list the states it can reach.
- Long work shows progress on the thing that started it, such as a ring on the update icon or "Verificando…" on the button.
- Destructive actions confirm with a second click.

## Windows and messages

- Release-notes modal: same window style as the app, title bar "Release notes vX.Y.Z", narrow, automatic height up to 400 px, custom scrollbar beyond that, and only the X closes it.
- Toast: auto-dismiss (3.5-10 s, longer for errors), X in the corner, no check button posing as a close button.
- Update offer: styled window with Yes and No. After updating, the first launch opens the release notes.
- The version label in settings is clickable and opens that version's notes.
- Errors are worded for people. Offer only actions that work on this machine.

## Tray and background presence

- The tray icon stays visible for as long as the app runs, with the window open or the widget hidden.
- A widget appears only while relevant, and the tray remains the way back. Launching the app again also opens settings.
- Left click opens the primary surface: a popup or settings opens on single click, a full app window on double click. Right click opens the menu.
- A hosted module's tray icon has no Exit, because the enable switch in the host owns that. Its double click opens the app's own window, not the host page.

## Widgets

- Size and opacity are adjustable through sliders with stated limits. Position persists and stays clamped inside the monitor frame while dragging.
- Text and icons stay legible at the smallest size. Render at 2x and check.
- A low-level state has a clear visual change. A charging state replaces a meaningless 100% with a bolt or motion.

## Settings baseline

Include those that apply:

- App icon centered at the top, version beneath it (tiny apps)
- Start with Windows (switch)
- Hide to tray on close (switch)
- Update check frequency: Daily, Weekly, Monthly, Never (select)
- Check for updates now
- Language (select), where localized
- Per-module: show icon in the notification area (switch, on by default)

Settings apply immediately.
