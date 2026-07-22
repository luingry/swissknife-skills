import { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import type { DemoEvent, Vec } from './types';

type Key = { frame: number; scale: number; focus: Vec };

export const ZOOM_IN_S = 0.7;  // punch-in transition length
export const ZOOM_OUT_S = 0.9; // release is slower / calmer

/** Keep the framed screen filling the canvas — never let background bleed in at high zoom. */
export function clampFocus(focus: Vec, scale: number, width: number, height: number): Vec {
  if (scale <= 1) return [width / 2, height / 2];
  const halfW = width / (2 * scale);
  const halfH = height / (2 * scale);
  return [
    Math.min(Math.max(focus[0], halfW), width - halfW),
    Math.min(Math.max(focus[1], halfH), height - halfH),
  ];
}

/**
 * Camera state. Same trigger semantics and the same fixed-duration-then-HOLD rule as the
 * pointer: stretching the spring over the gap to the next keyframe is what turns a punch-in
 * plus a release 3s later into one continuous 3s drift, leaving the camera still moving
 * during the click and breaking the beat.
 */
export function useCamera(events: DemoEvent[]): { scale: number; focus: Vec } {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const keys = useMemo<Key[]>(() => {
    const out: Key[] = [];
    let scale = 1;
    let focus: Vec = [width / 2, height / 2];
    for (const e of events) {
      if (!e.zoom) continue;
      if (e.zoom.scale != null) scale = e.zoom.scale;
      if (e.zoom.to) focus = e.zoom.to;
      out.push({
        frame: Math.round(e.at * fps),
        scale,
        focus: clampFocus(focus, scale, width, height),
      });
    }
    if (out.length === 0 || out[0].frame > 0) {
      out.unshift({ frame: 0, scale: 1, focus: [width / 2, height / 2] });
    }
    return out;
  }, [events, fps, width, height]);

  if (frame <= keys[0].frame) return { scale: keys[0].scale, focus: keys[0].focus };

  let idx = 0;
  for (let k = 0; k < keys.length; k++) if (frame >= keys[k].frame) idx = k;

  const target = keys[idx];
  const from = idx > 0 ? keys[idx - 1] : target;
  if (target.scale === from.scale && target.focus === from.focus) {
    return { scale: target.scale, focus: target.focus };
  }

  const zoomingIn = target.scale >= from.scale;
  const config = zoomingIn
    ? { damping: 30, stiffness: 90, mass: 1 }
    : { damping: 40, stiffness: 70, mass: 1 };

  const gapToNext = idx + 1 < keys.length ? keys[idx + 1].frame - target.frame : Infinity;
  const durFrames = Math.max(
    1,
    Math.min(Math.round((zoomingIn ? ZOOM_IN_S : ZOOM_OUT_S) * fps), gapToNext),
  );

  const local = frame - target.frame;
  const t = spring({ frame: local, fps, durationInFrames: durFrames, config });
  return {
    scale: interpolate(t, [0, 1], [from.scale, target.scale]),
    focus: [
      interpolate(t, [0, 1], [from.focus[0], target.focus[0]]),
      interpolate(t, [0, 1], [from.focus[1], target.focus[1]]),
    ],
  };
}
