import { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import type { DemoEvent, Vec } from './types';

/**
 * Pointer position with human motion: distance-derived travel time, spring easing with a
 * hair of settle, and a subtle perpendicular arc.
 *
 * CRITICAL: the move takes a FIXED (distance-derived) duration and then HOLDS until the next
 * trigger. Never pass "the gap to the next event" as durationInFrames — Remotion stretches
 * the spring across whatever duration it is given, which turns a long gap into one slow
 * continuous drift instead of "move, arrive, wait". Holding after arrival is also what
 * produces the dwell before a click, for free.
 */
export function useCursorPosition(events: DemoEvent[]): { x: number; y: number } {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  const points = useMemo(
    () =>
      events
        .filter((e) => e.cursor)
        .map((e) => ({ frame: Math.round(e.at * fps), pos: e.cursor as Vec })),
    [events, fps],
  );

  if (points.length === 0) return { x: 0, y: 0 };
  if (frame <= points[0].frame) return { x: points[0].pos[0], y: points[0].pos[1] };

  let idx = 0;
  for (let k = 0; k < points.length; k++) if (frame >= points[k].frame) idx = k;

  const target = points[idx];
  const from = idx > 0 ? points[idx - 1].pos : target.pos;

  const dx = target.pos[0] - from[0];
  const dy = target.pos[1] - from[1];
  const dist = Math.hypot(dx, dy);
  if (dist === 0) return { x: target.pos[0], y: target.pos[1] };

  const frac = dist / width;
  const travelS = frac < 0.15 ? 0.3 : frac < 0.4 ? 0.5 : 0.7;
  const gapToNext = idx + 1 < points.length ? points[idx + 1].frame - target.frame : Infinity;
  const durFrames = Math.max(1, Math.min(Math.round(travelS * fps), gapToNext));

  const local = frame - target.frame;
  const t = spring({
    frame: local,
    fps,
    durationInFrames: durFrames,
    config: { damping: 26, stiffness: 120, mass: 1 },
  });

  const x = interpolate(t, [0, 1], [from[0], target.pos[0]]);
  const y = interpolate(t, [0, 1], [from[1], target.pos[1]]);

  const arc = Math.sin(Math.min(Math.max(t, 0), 1) * Math.PI) * Math.min(dist * 0.06, 40);
  const nx = -dy / dist;
  const ny = dx / dist;

  return { x: x + nx * arc, y: y + ny * arc };
}
