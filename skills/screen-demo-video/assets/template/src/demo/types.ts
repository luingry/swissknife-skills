export type Vec = [number, number]; // [x, y] in composition pixels (content space)

/**
 * `at` is a TRIGGER, not a keyframe: `{ at: 1.5, zoom: {scale: 1.9} }` means
 * "START the punch at 1.5s", not "be at 1.9x by 1.5s". Each transition runs for its own
 * fixed length and then HOLDS until the next trigger, so holds and dwells are automatic.
 */
export type DemoEvent = {
  /** Seconds from the start of the composition. */
  at: number;

  /** Move the pointer toward this point. Desktop = arrow cursor; mobile = touch blob. */
  cursor?: Vec;

  /** Register a tap/click here -> ripple + frame press. */
  click?: Vec;

  /** Mobile gestures. */
  swipe?: { to: Vec; holdMs?: number };
  scroll?: { to: Vec };
  longPress?: { at: Vec; holdMs: number };
  pinch?: { at: Vec; from: number; to: number };

  /** Camera. `scale` 1 = rest; `to` = focus point kept centered. */
  zoom?: { scale?: number; to?: Vec };

  /** Show/replace the caption. `null` clears it. Duration is computed from the text
   *  (see readingTime.ts) unless `captionHold` overrides it. */
  caption?: string | null;

  /** Override the auto-computed caption hold, in seconds. Use sparingly. */
  captionHold?: number;

  /** Anchor the caption near a content-space point instead of the default lower-third. */
  captionAt?: Vec;
};
