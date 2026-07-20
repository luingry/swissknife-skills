import React, { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import type { DemoEvent, Vec } from './types';
import { captionHoldSeconds } from './readingTime';

/**
 * Caption box — light surface, soft-dark text, and a vertical accent bar on the left edge.
 *
 * Contrast note: the palette below lands around 11:1 (well past WCAG AA's 4.5:1) while still
 * reading as gentle rather than stark black-on-white. Do not soften it further — video
 * compression eats fine text contrast, so on-screen text needs MORE margin than a web page,
 * not less.
 */
export const CAPTION_THEME = {
  surface: '#FAF9F6',      // warm off-white
  text: '#2E2E38',         // soft dark, not pure black
  accent: '#5B4BE8',       // left bar — swap for the product's brand color
  accentWidth: 7,
  radius: 12,
};

export const Caption: React.FC<{
  events: DemoEvent[];
  /** Live camera state, so a content-space `captionAt` can be projected to screen space. */
  cam: { scale: number; focus: Vec };
  theme?: Partial<typeof CAPTION_THEME>;
  /** Font size in px. Scale by format: 32-38 landscape, 40-46 square, 52-64 portrait. */
  fontSize?: number;
}> = ({ events, cam, theme, fontSize = 34 }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = { ...CAPTION_THEME, ...theme };

  const segments = useMemo(() => {
    const caps = events.filter((e) => e.caption !== undefined);
    return caps.map((e, i) => {
      const start = Math.round(e.at * fps);
      // Auto-expire using the reading-time model. An explicit later caption event (or a
      // `caption: null`) can end it sooner ONLY if that is genuinely later than the floor —
      // otherwise the hold wins, so a caption can never flash by.
      const text = e.caption ?? '';
      const holdS = e.captionHold ?? (text ? captionHoldSeconds(text) : 0);
      const naturalEnd = start + Math.round(holdS * fps);
      const nextStart = i + 1 < caps.length ? Math.round(caps[i + 1].at * fps) : Infinity;
      return {
        start,
        end: Math.min(naturalEnd, nextStart),
        text: e.caption,
        at: e.captionAt as Vec | undefined,
      };
    });
  }, [events, fps]);

  const active = segments.find((s) => frame >= s.start && frame < s.end && s.text);
  if (!active) return null;

  const local = frame - active.start;
  const enter = spring({ frame: local, fps, config: { damping: 22, stiffness: 140, mass: 0.8 } });
  const fadeOut =
    active.end === Infinity
      ? 1
      : interpolate(frame, [active.end - 8, active.end], [1, 0], { extrapolateLeft: 'clamp' });
  const y = interpolate(enter, [0, 1], [18, 0]);

  // Project the content-space anchor through the camera (the caption itself never scales).
  const screenAt: Vec | undefined = active.at
    ? [
        width / 2 + (active.at[0] - cam.focus[0]) * cam.scale,
        height / 2 + (active.at[1] - cam.focus[1]) * cam.scale,
      ]
    : undefined;

  const pos: React.CSSProperties = screenAt
    ? {
        left: screenAt[0],
        top: screenAt[1],
        transform: `translate(-50%, calc(-100% - 16px)) translateY(${y}px)`,
      }
    : { left: '50%', bottom: height * 0.09, transform: `translate(-50%, ${y}px)` };

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          ...pos,
          opacity: Math.min(enter, fadeOut),
          display: 'flex',
          alignItems: 'stretch',
          borderRadius: t.radius,
          overflow: 'hidden',
          background: t.surface,
          boxShadow: '0 14px 44px rgba(0,0,0,0.28), 0 2px 6px rgba(0,0,0,0.16)',
          maxWidth: width * 0.8,
        }}
      >
        {/* Vertical accent bar, flush to the left edge */}
        <div style={{ width: t.accentWidth, flexShrink: 0, background: t.accent }} />
        <div
          style={{
            padding: '15px 26px 15px 22px',
            color: t.text,
            fontSize,
            fontWeight: 600,
            fontFamily: 'Inter, system-ui, sans-serif',
            letterSpacing: -0.2,
            lineHeight: 1.25,
            whiteSpace: 'nowrap',
          }}
        >
          {active.text}
        </div>
      </div>
    </AbsoluteFill>
  );
};
