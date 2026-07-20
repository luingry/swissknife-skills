# Roteiro & Pacing — writing the script before the code

The script is the deliverable that decides whether the video is good. Footage quality and
spring configs are recoverable; a bad story is not. **Write and get this approved before
scaffolding anything.**

## 1. The three-act shape

Every product demo, regardless of length, is:

| Act | Share of runtime | Job |
|---|---|---|
| **Hook** | first 10–15% | Show the *outcome* or the *pain*, immediately. No logo-first intros. |
| **Beats** | 70–80% | 3–5 features, one per beat, in the order a real user would hit them |
| **Close** | last 10–15% | Land on the finished state + a single CTA or product name |

**The first 2 seconds decide everything.** On a landing page the video is muted and autoplays;
on social it competes with a thumb. Open on motion that shows the product *working*, not on a
title card. If you must brand, brand at the **end**.

## 2. Beat structure (the unit of the film)

Every beat is the same seven-part shape. This is what makes the video feel consistent and
professional rather than improvised:

```
1. REST      pointer idle, camera at 1.0×             0.2–0.4s
2. TRAVEL    pointer moves toward the target          0.4–0.7s
3. PUNCH     camera zooms to the target (overlaps 2)  0.5–0.8s
4. ACT       click / tap / swipe                      0.1–0.5s
5. RESULT    the UI responds — untouched, no motion   0.4–0.8s
6. LABEL     caption appears, ~250ms after RESULT     stays per reading formula
7. RELEASE   camera pulls back out                    0.6–0.9s
```

Total per beat: **2.5–4.5s**. Overlap steps 2/3 (camera follows the pointer, doesn't wait for
it) and steps 6/7 (caption can still be up while the camera releases) — strict sequencing is
what makes demos feel slow.

**Never** collapse step 5. The single most common failure is cutting away before the viewer
sees what the action *did*.

## 3. Ordering the beats

Order by the **user's real journey**, not by your feature list or architecture:

1. **Entry** — the first thing a new user does (connect, sign in, create).
2. **Core value** — the one thing the product exists to do. This gets the **longest** beat and
   the deepest zoom.
3. **Differentiator** — the thing competitors don't have.
4. **Depth (optional)** — a power feature, kept short, signaling there's more.

If you can only keep three beats, keep 1, 2, 3. Cut *depth* first — a shorter video that lands
beats always outperforms a complete one that rushes.

## 4. Runtime targets

| Context | Runtime | Beats |
|---|---|---|
| Landing-page hero loop (muted, autoplay) | 8–15s | 2–3 |
| Social post (Reels/Shorts/X) | 15–30s | 3–4 |
| Feature announcement | 30–60s | 4–6 |
| Full walkthrough / docs | 60–120s | 6–10, chaptered |

Mobile/portrait cuts run **shorter** than their desktop equivalents — roughly 70% of the beats
for the same story. Small screen, less patience, less room.

## 5. Reading time (the caption formula)

Computed automatically by `captionHoldSeconds()` — you do not set caption durations by hand:

```
hold_seconds = max(3.0, 0.4 + chars / 12 + 0.3)
                     ^     ^          ^
                     |     |          +-- exit buffer: don't yank it mid-word
                     |     +------------- 12 characters/second (conservative)
                     +------------------- acquire: notice it + saccade to it
```

**Why characters, not words:** characters-per-second is the subtitle industry's standard
because it survives language changes — Portuguese and German words are far longer than English
ones, so a word-count model silently under-serves them.

**Why 12 cps:** Netflix permits 17 cps for adults and 13 for children. We sit below both on
purpose, because a demo caption competes with the UI it is describing. Split attention costs
time that pure silent-reading research (~238 wpm, Brysbaert 2019) never measures — the reader
is also watching a cursor move and a screen change.

**Why a 3-second floor:** below ~3s a caption reads as a flash regardless of how short it is;
the eye must leave the UI, acquire the box, read, and return. Short captions are therefore
floored, not sped up.

Worked examples:

| Caption | Chars | Computed | Actual hold |
|---|---|---|---|
| "Espelhe a tela em 1 toque" | 25 | 2.78s | **3.0s** (floor) |
| "Conecte pela rede local, sem cabo" | 33 | 3.45s | **3.45s** |
| "Controle qualquer dispositivo remotamente" | 41 | 4.12s | **4.12s** |

Two planning consequences:

- **Captions set your runtime floor.** Four captions cost ≥12s of screen time on the floor
  alone. Run `captionBudgetSeconds([...])` against your target runtime *before* building the
  timeline — if it doesn't fit, cut captions, not reading time.
- Never let a caption appear while the camera is still moving; the eye cannot read and track at
  once. Let the camera settle, then label.

## 6. Caption copy rules

- **Verb-first, present tense, second person implied.** "Espelhe a tela em 1 toque" — not
  "O usuário pode espelhar a tela".
- **Name the benefit, not the mechanism.** "Sem cabo, sem nuvem" beats "Conexão via WebSocket
  na porta 9240".
- **One claim per caption.** No commas joining two ideas.
- **Never narrate what's visibly happening.** If the click is on screen, don't write "clique
  aqui" — write what it *achieves*.
- **Match the product's language.** Write captions in the language of the audience; keep
  product/UI terms exactly as they appear on screen so the words match the pixels.
- **No exclamation marks.** They read as an ad; the motion already carries the energy.

## 7. The storyboard table (the artifact to get approved)

Produce this before coding. It's short enough to review and complete enough to build from:

| # | Beat | Action shown | Camera | Caption | Dur |
|---|---|---|---|---|---|
| 0 | Hook | App already mirroring, screen live | 1.0× wide | — | 1.5s |
| 1 | Connect | Tap "Conectar" on the LAN list | 1.8× on the button | Conecte pela rede local | 3.2s |
| 2 | Mirror | Screen appears in the viewer | 1.0× → 1.3× on viewer | Espelhe em 1 toque | 3.8s |
| 3 | Control | Drag/tap remotely, device responds | 1.6× on the cursor | Controle de qualquer lugar | 3.5s |
| 4 | Close | Pull out to full frame + wordmark | 1.0× | xSharect | 2.0s |
|   |  |  |  | **Total** | **14.0s** |

Then translate each row into a run of `DemoEvent`s — the table's Camera column becomes `zoom`,
Action becomes `cursor`/`click`/`swipe`, Caption becomes `caption`.

## 8. Pacing rhythm — avoiding the metronome

Identical beat lengths are the clearest tell of a generated video. Deliberately vary:

- **Beat length:** alternate long/short (3.8s, 2.6s, 3.4s, 2.2s) rather than 3.0s × 4.
- **Zoom depth:** don't punch to the same scale every time; vary 1.5×/2.1×/1.7×.
- **Not every beat needs a zoom.** One beat held wide at 1.0× is a rest that makes the next
  punch-in land harder.
- **Not every beat needs a caption.** A purely visual beat gives the eye a break and speeds the
  film up.
- **Dwell longer on the hard part.** A human operator hesitates before the non-obvious click;
  that half-second of hesitation is the single most humanizing detail available.

## 9. Trimming — what to cut

Cut ruthlessly, but only from the gaps:

- **Cut:** idle pointer wandering, loading spinners, typing character-by-character (jump to the
  filled field or speed-ramp it), repeated similar interactions, anything the viewer already
  understands.
- **Keep:** the moment a result appears, every frame of a caption's reading time, the small
  pause *before* a decisive click, transitions/animations the product itself plays (those are
  free polish — don't cut through the product's own motion).

## 10. Audio (optional but high-leverage)

- **Music bed:** soft, no vocals, no drop. Duck it if there's narration. Loops fine for hero
  videos. Must be licensed for commercial use — never lift a track.
- **SFX:** a soft click on taps and a light whoosh on camera moves add remarkable perceived
  quality. Keep them **quiet** (−18 to −24 dB relative to the bed).
- **Silence is fine.** Landing-page loops autoplay muted; if that's the only target, skip audio
  entirely and spend the effort on motion.
- Implement with Remotion's `<Audio src={staticFile('bed.mp3')} volume={0.25} />` inside the
  composition; use `<Sequence>` to place one-shot SFX at click frames.

## 11. Pre-build checklist

Before writing a single component, confirm:

- [ ] Target format and device decided (see [devices-and-formats.md](devices-and-formats.md))
- [ ] Runtime target chosen; beat count fits it
- [ ] Storyboard table written, with durations summing to the target
- [ ] Every beat names exactly one idea
- [ ] Every caption ≤7 words (desktop) / ≤5 (mobile), verb-first, benefit-led
- [ ] Beat lengths and zoom depths deliberately varied
- [ ] The hook shows the product working within 2 seconds
- [ ] The story survives with **no audio and no captions** (muted autoplay test)
- [ ] User has approved the table
