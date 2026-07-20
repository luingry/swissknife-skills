/**
 * Caption hold duration — how long on-screen text must stay readable.
 *
 * Grounded in subtitle practice rather than raw reading speed, because a demo caption
 * competes for attention with the UI it is describing (split attention costs time that
 * pure-reading figures like Brysbaert's ~238 wpm silent-reading average do not capture).
 *
 * Model, in characters-per-second (CPS) — the professional standard, and more robust
 * across languages than words-per-minute, since word length varies a lot
 * (Portuguese/German words run far longer than English ones):
 *
 *   hold = ACQUIRE + chars / CPS + EXIT      (floored at MIN_HOLD)
 *
 *   ACQUIRE  0.4s  notice the caption appeared + saccade to it
 *   CPS      12    conservative. Netflix allows 17 cps for adults and 13 for children;
 *                  12 leaves headroom for split attention and for text degraded by
 *                  video compression
 *   EXIT     0.3s  don't yank the box as the eye finishes the last word
 *   MIN_HOLD 3.0s  floor: below this a caption reads as a flash regardless of length
 *
 * Sanity check: "Espelhe a tela em 1 toque" (24 chars) -> 2.7s -> floored to 3.0s.
 * A 7-word / ~48-char caption -> ~4.7s. Both comfortable at a glance.
 */
export const CAPTION_ACQUIRE_S = 0.4;
export const CAPTION_CPS = 12;
export const CAPTION_EXIT_S = 0.3;
export const CAPTION_MIN_HOLD_S = 3.0;

export function captionHoldSeconds(text: string): number {
  const chars = text.trim().length;
  const computed = CAPTION_ACQUIRE_S + chars / CAPTION_CPS + CAPTION_EXIT_S;
  return Math.max(CAPTION_MIN_HOLD_S, computed);
}

/**
 * Budget helper: total seconds a list of captions needs. Use while writing the roteiro to
 * check the caption load actually fits the target runtime BEFORE building the timeline.
 */
export function captionBudgetSeconds(texts: string[]): number {
  return texts.reduce((sum, t) => sum + captionHoldSeconds(t), 0);
}
