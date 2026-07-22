# luingry-swissknife-skills

Agent Skills for [Claude Code](https://claude.com/claude-code) — a growing toolbox of
production-grade capabilities, each one packaged so an agent can pick it up and execute
without improvising.

## Skills

| Skill | What it does |
|---|---|
| [`juicy-scrn-cptr`](skills/juicy-scrn-cptr) | Produces polished, Screen Studio-style product demo videos and device-framed screenshots programmatically with Remotion — real browser interaction driven by Playwright, animated cursor/touch, auto-zoom that follows the action, blurred-self backdrops, typewriter caption boxes, element-level UI choreography, subtle film grain, transitions, and a director-grade script. Desktop and mobile, landscape through portrait. |

### `juicy-scrn-cptr`

Builds product demo videos (and framed still screenshots) as **code**, so they re-render when
the product changes instead of being re-edited by hand. Formerly `screen-demo-video`.

- **Real interaction, not faked.** A Playwright script drives an actual browser and records it:
  clicking an input really focuses it, typing really appears character by character, scrolling
  carries the site's real momentum and scroll-triggered animations. The overlay cursor is driven
  by the emitted capture timeline, so it lands exactly where the real pointer went.
- **Cinematography.** Camera auto-zooms toward the action and holds still while results land;
  the pointer moves in human arcs with a dwell before clicking; motion blur on fast moves.
- **Three production types.** *Walkthrough* (teach how it works), *pitch* (alternating
  statement card → demo proving it), and *UI story* (reconstructed UI whose elements perform
  the story themselves — staggered reveals, in-UI typing, highlight rings, scroll
  continuity — no cursor).
- **The premium finish.** Backdrop is the capture itself, heavily blurred; caption boxes are
  squared and shadowed and type themselves in (no caret) with light/dark themes; subtle
  animated film grain over the whole frame; everything follows the subject project's palette.
- **Transitions.** `softCut` (default), `containerZoom`, `circleReveal`, `slidePush`, plus
  in-canvas scroll continuity for UI stories.
- **Component replication.** Extracts a real component from a live page into independently
  animatable parts — every text run, icon and row measured separately — so a component can be
  presented in isolation with staggered reveals, part-level morphs and ripples, instead of a
  flat screenshot sliding in.
- **Grid discipline.** Placement, framing and camera focus snap to a 12×8 grid; alignment is
  what separates a designed piece from a set of improvised frames.
- **Desktop and mobile.** Arrow cursor in a browser frame, or a touch blob with real gestures
  inside a phone bezel; landscape, square, and portrait cuts from one story.
- **Ships a validated template** — copy `assets/template/`, `npm install`, and the engine is
  ready; typecheck, render, capture and verify scripts are all proven working.

## Repository layout

```
skills/
  <skill-name>/
    SKILL.md          # entry point: frontmatter (name, description) + the skill itself
    references/       # deep-dive docs the skill loads on demand
    assets/           # runnable code, templates, scripts the agent copies rather than retypes
```

`SKILL.md` is the only required file. Keep it short enough to stay in context and push detail
into `references/`, which the agent reads only when the task calls for it. Anything the agent
would otherwise transcribe belongs in `assets/` — copying a file is faster, cheaper in tokens,
and cannot introduce transcription bugs.

## Installing

Symlink or copy a skill into your Claude Code skills directory:

```bash
# Windows (directory junction, no admin needed)
mklink /J "%USERPROFILE%\.claude\skills\juicy-scrn-cptr" "D:\Dev\luingry-swissknife-skills\skills\juicy-scrn-cptr"

# macOS / Linux
ln -s "$PWD/skills/juicy-scrn-cptr" ~/.claude/skills/juicy-scrn-cptr
```

Skills in `~/.claude/skills/` are available globally; a `.claude/skills/` directory inside a
project scopes them to that project.

## Conventions

- **`SKILL.md` frontmatter** carries `name` (kebab-case, matching the directory) and a
  `description` rich in trigger phrases — that description is what the agent matches against to
  decide the skill is relevant, so it earns its length.
- **Reference files are linked from a table** in `SKILL.md` stating *when* to read each one,
  not merely what it contains.
- **Assets are validated before they ship.** A template that does not typecheck or run costs
  more than no template at all.
- **Findings from real runs get folded back in.** When something is verified — an API that does
  not exist, a flag that behaves differently than documented — record it in the skill so the
  next run does not rediscover it.

## Maintaining this README

**This file must be updated whenever a skill is added, removed, or substantially changed** —
both the table and, for additions, a short section describing the skill.

## License

MIT — see [LICENSE](LICENSE).
