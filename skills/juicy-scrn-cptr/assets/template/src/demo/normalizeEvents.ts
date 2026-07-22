import { useCurrentFrame, useVideoConfig } from 'remotion';
import type { DemoEvent, Vec } from './types';

export type Contact = { start: number; end: number }; // seconds

/**
 * Mobile gestures are sugar: they expand into ordinary cursor waypoints plus a contact
 * interval (finger down -> up), so every other hook works unchanged.
 */
export function normalizeEvents(
  events: DemoEvent[],
  opts?: { swipeDurationS?: number },
): { events: DemoEvent[]; contacts: Contact[] } {
  const swipeDur = opts?.swipeDurationS ?? 0.45;
  const out: DemoEvent[] = [];
  const contacts: Contact[] = [];
  let last: Vec | null = null;

  for (const e of events) {
    if (e.cursor) last = e.cursor;

    const drag = e.swipe ?? e.scroll;
    if (drag) {
      const from = last ?? drag.to;
      const hold = (e.swipe?.holdMs ?? 0) / 1000;
      out.push({ at: e.at, cursor: from });
      out.push({ at: e.at + swipeDur, cursor: drag.to });
      contacts.push({ start: e.at, end: e.at + swipeDur + hold });
      last = drag.to;
      const { swipe, scroll, cursor, ...rest } = e;
      if (rest.zoom || rest.caption !== undefined) out.push({ ...rest });
      continue;
    }

    if (e.longPress) {
      out.push({ at: e.at, cursor: e.longPress.at });
      contacts.push({ start: e.at, end: e.at + e.longPress.holdMs / 1000 });
      last = e.longPress.at;
      continue;
    }

    if (e.click) contacts.push({ start: e.at, end: e.at + 0.12 });
    out.push(e);
  }

  return { events: out.sort((a, b) => a.at - b.at), contacts };
}

/** Is the finger currently touching the glass? Drives TouchPointer's pressed look. */
export function useContactState(events: DemoEvent[]): { down: boolean } {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { contacts } = normalizeEvents(events);
  const t = frame / fps;
  return { down: contacts.some((c) => t >= c.start && t <= c.end) };
}
