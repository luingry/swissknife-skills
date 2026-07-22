import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from 'remotion';
import type { Vec } from './types';

/**
 * Composition-to-composition transitions.
 *
 * A hard cut between two compositions is never acceptable in this skill's output — it reads as
 * an edit mistake, not a choice. `softCut` is applied by DEFAULT whenever two compositions meet;
 * pass an explicit kind to override.
 *
 * The four kinds below are the ones with real synergy for screen demos, drawn from what the
 * big platforms actually ship:
 *
 *  softCut       DEFAULT. Short crossfade + a 1.02x scale drift + a touch of blur at the
 *                midpoint. The Apple-keynote / Screen Studio idiom: the cut hides inside
 *                movement, so the viewer registers continuity rather than a transition. It is
 *                the default precisely because it never competes with the content, and it works
 *                between ANY two shots with no shared element required.
 *
 *  containerZoom Material Design's "container transform": the element you clicked expands to
 *                become the next screen. The highest-craft option and the most spatially honest
 *                — use it whenever composition B is literally the result of clicking something
 *                in A. Requires the source rect.
 *
 *  circleReveal  Material's circular reveal: a clip-path circle grows from the click point,
 *                uncovering the next composition. Excellent for tap -> new screen, especially
 *                mobile, where the touch point is the natural origin.
 *
 *  slidePush     iOS/Material navigation push: B slides in from the direction that matches the
 *                spatial model (forward = right to left). For wizards, steps and paged flows.
 */
export type TransitionKind = 'softCut' | 'containerZoom' | 'circleReveal' | 'slidePush';

export const DEFAULT_TRANSITION: TransitionKind = 'softCut';

export type TransitionSpec = {
  kind?: TransitionKind;
  /** Seconds. Defaults are tuned per kind; override only with reason. */
  durationS?: number;
  /** circleReveal / containerZoom: content-space origin (usually the click point). */
  origin?: Vec;
  /** containerZoom: the source element rect in content space [x, y, w, h]. */
  fromRect?: [number, number, number, number];
  /** slidePush: 'forward' (right-to-left) or 'back'. */
  direction?: 'forward' | 'back';
};

const DEFAULT_DURATION_S: Record<TransitionKind, number> = {
  softCut: 0.28,
  containerZoom: 0.55,
  circleReveal: 0.5,
  slidePush: 0.42,
};

/**
 * Renders `from` transitioning into `to`. `startS` is when the transition begins.
 * Before it, only `from` shows; after, only `to`.
 */
export const Transition: React.FC<{
  from: React.ReactNode;
  to: React.ReactNode;
  startS: number;
  spec?: TransitionSpec;
}> = ({ from, to, startS, spec }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const kind = spec?.kind ?? DEFAULT_TRANSITION;
  const durS = spec?.durationS ?? DEFAULT_DURATION_S[kind];
  const start = Math.round(startS * fps);
  const dur = Math.max(1, Math.round(durS * fps));
  const local = frame - start;

  if (local <= 0) return <AbsoluteFill>{from}</AbsoluteFill>;
  if (local >= dur) return <AbsoluteFill>{to}</AbsoluteFill>;

  const p = local / dur;

  switch (kind) {
    case 'softCut': {
      // Crossfade with a slight push, so the cut is buried in motion rather than announced.
      const o = interpolate(p, [0, 1], [0, 1], { easing: Easing.inOut(Easing.ease) });
      const blur = Math.sin(p * Math.PI) * 2.2;
      return (
        <AbsoluteFill>
          <AbsoluteFill style={{ transform: `scale(${interpolate(p, [0, 1], [1, 1.02])})`, filter: `blur(${blur}px)` }}>
            {from}
          </AbsoluteFill>
          <AbsoluteFill style={{ opacity: o, transform: `scale(${interpolate(p, [0, 1], [1.02, 1])})`, filter: `blur(${blur}px)` }}>
            {to}
          </AbsoluteFill>
        </AbsoluteFill>
      );
    }

    case 'circleReveal': {
      const origin: Vec = spec?.origin ?? [width / 2, height / 2];
      // Radius must reach the farthest corner, or the reveal stops short.
      const maxR = Math.max(
        Math.hypot(origin[0], origin[1]),
        Math.hypot(width - origin[0], origin[1]),
        Math.hypot(origin[0], height - origin[1]),
        Math.hypot(width - origin[0], height - origin[1]),
      );
      const t = spring({ frame: local, fps, durationInFrames: dur, config: { damping: 34, stiffness: 95, mass: 1 } });
      const r = interpolate(t, [0, 1], [0, maxR]);
      return (
        <AbsoluteFill>
          <AbsoluteFill>{from}</AbsoluteFill>
          <AbsoluteFill style={{ clipPath: `circle(${r}px at ${origin[0]}px ${origin[1]}px)` }}>
            {to}
          </AbsoluteFill>
        </AbsoluteFill>
      );
    }

    case 'containerZoom': {
      // The clicked rect grows to fill the frame; `to` fades up inside it.
      const [rx, ry, rw, rh] = spec?.fromRect ?? [width * 0.4, height * 0.4, width * 0.2, height * 0.2];
      const t = spring({ frame: local, fps, durationInFrames: dur, config: { damping: 32, stiffness: 90, mass: 1 } });
      const scale = interpolate(t, [0, 1], [rw / width, 1]);
      const cx = rx + rw / 2;
      const cy = ry + rh / 2;
      const tx = interpolate(t, [0, 1], [cx - (width * scale) / 2, 0]);
      const ty = interpolate(t, [0, 1], [cy - (height * scale) / 2, 0]);
      const radius = interpolate(t, [0, 1], [16, 0]);
      return (
        <AbsoluteFill>
          <AbsoluteFill style={{ opacity: interpolate(t, [0, 0.6], [1, 0], { extrapolateRight: 'clamp' }) }}>
            {from}
          </AbsoluteFill>
          <AbsoluteFill
            style={{
              transformOrigin: '0 0',
              transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
              borderRadius: radius,
              overflow: 'hidden',
              opacity: interpolate(t, [0, 0.25], [0, 1], { extrapolateRight: 'clamp' }),
            }}
          >
            {to}
          </AbsoluteFill>
        </AbsoluteFill>
      );
    }

    case 'slidePush': {
      const dir = spec?.direction === 'back' ? -1 : 1;
      const t = spring({ frame: local, fps, durationInFrames: dur, config: { damping: 34, stiffness: 110, mass: 1 } });
      // The outgoing screen trails slightly rather than moving 1:1 — depth, as iOS does it.
      const fromX = interpolate(t, [0, 1], [0, -0.25 * width * dir]);
      const toX = interpolate(t, [0, 1], [width * dir, 0]);
      return (
        <AbsoluteFill>
          <AbsoluteFill style={{ transform: `translateX(${fromX}px)`, filter: `brightness(${interpolate(t, [0, 1], [1, 0.82])})` }}>
            {from}
          </AbsoluteFill>
          <AbsoluteFill style={{ transform: `translateX(${toX}px)`, boxShadow: '-24px 0 60px rgba(0,0,0,0.45)' }}>
            {to}
          </AbsoluteFill>
        </AbsoluteFill>
      );
    }
  }
};
