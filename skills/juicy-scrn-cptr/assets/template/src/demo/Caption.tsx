import React, { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import type { DemoEvent, Vec } from './types';
import { captionHoldSeconds, CAPTION_REVEAL_CPS } from './readingTime';

/**
 * Caption box — SQUARED corners (no radius), a soft shadow, and a vertical accent bar on
 * the left edge. It enters by EXPANDING ITS WIDTH left-to-right while the text is revealed
 * character by character, as if being typed — with no caret.
 *
 * The theme is chosen by the CONTRAST the user picked in Step 0b (SKILL.md):
 *   light → light-beige surface with a soft dark pastel orange-brown text (Claude-like
 *           palette, deliberately gentle)
 *   dark  → dark warm surface with warm off-white text
 * `accent` must be swapped for the SUBJECT PROJECT's brand color in both themes.
 *
 * The light theme's text contrast is intentionally low-key; because video compression
 * erodes fine text, always confirm legibility on a rendered frame at delivery bitrate.
 */
export type CaptionContrast = 'light' | 'dark';

export type CaptionTheme = {
  surface: string;
  text: string;
  accent: string;
  accentWidth: number;
  shadow: string;
};

export const CAPTION_THEMES: Record<CaptionContrast, CaptionTheme> = {
  light: {
    surface: '#F0EEE6', // light beige
    text: '#8F5B3C', // soft dark pastel orange-brown
    accent: '#C96442', // swap for the subject project's brand color
    accentWidth: 7,
    shadow: '0 18px 50px rgba(41,37,30,0.30), 0 3px 10px rgba(41,37,30,0.16)',
  },
  dark: {
    surface: '#262624', // dark warm surface
    text: '#F0EEE6', // warm off-white
    accent: '#C96442', // swap for the subject project's brand color
    accentWidth: 7,
    shadow: '0 18px 50px rgba(0,0,0,0.45), 0 3px 10px rgba(0,0,0,0.30)',
  },
};

export const Caption: React.FC<{
  events: DemoEvent[];
  /** Live camera state, so a content-space `captionAt` can be projected to screen space. */
  cam: { scale: number; focus: Vec };
  /** Chosen in Step 0b. Decides surface/text colors. */
  contrast?: CaptionContrast;
  theme?: Partial<CaptionTheme>;
  /** Font size in px. Scale by format: 32-38 landscape, 40-46 square, 52-64 portrait. */
  fontSize?: number;
  /** The family the user chose in Step 0b. Load it before rendering. */
  fontFamily?: string;
}> = ({ events, cam, contrast = 'light', theme, fontSize = 34, fontFamily }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = { ...CAPTION_THEMES[contrast], ...theme };
  const family = fontFamily ?? 'Inter, system-ui, sans-serif';

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

  // Hooks can't be conditional, so the measurer state lives above the early return.
  const text = active?.text ?? '';
  const chars = useMemo(() => Array.from(text), [text]);

  // Measure the full text width so the box width can animate smoothly in px. Layout effects
  // run before the frame is screenshotted, so even the first frame measures in time.
  const measureRef = React.useRef<HTMLSpanElement>(null);
  const [textW, setTextW] = React.useState(0);
  React.useLayoutEffect(() => {
    const w = measureRef.current?.getBoundingClientRect().width ?? 0;
    if (Math.abs(w - textW) > 0.5) setTextW(w);
  });

  const measurer = (
    <span
      ref={measureRef}
      style={{
        position: 'fixed',
        left: -99999,
        top: 0,
        visibility: 'hidden',
        whiteSpace: 'pre',
        fontSize,
        fontWeight: 600,
        fontFamily: family,
        letterSpacing: -0.2,
        lineHeight: 1.25,
      }}
    >
      {text}
    </span>
  );

  if (!active) return <AbsoluteFill style={{ pointerEvents: 'none' }}>{measurer}</AbsoluteFill>;

  const local = frame - active.start;

  // Typewriter reveal: width expansion and character visibility share ONE linear progress,
  // so the box edge and the last visible letter arrive together. No caret is drawn.
  const revealFrames = Math.max(1, Math.round((chars.length / CAPTION_REVEAL_CPS) * fps));
  const p = interpolate(local, [0, revealFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const visibleChars = Math.floor(p * chars.length);

  const fadeIn = interpolate(local, [0, 4], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut =
    active.end === Infinity
      ? 1
      : interpolate(frame, [active.end - 8, active.end], [1, 0], { extrapolateLeft: 'clamp' });

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
        transform: 'translate(-50%, calc(-100% - 16px))',
      }
    : { left: '50%', bottom: height * 0.09, transform: 'translate(-50%, 0)' };

  const padV = 15;
  const padL = 22;
  const padR = 26;

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {measurer}
      <div
        style={{
          position: 'absolute',
          ...pos,
          opacity: Math.min(fadeIn, fadeOut) * (textW > 0 ? 1 : 0),
          display: 'flex',
          alignItems: 'stretch',
          // Squared corners by design — no borderRadius, no border; the shadow does the lifting.
          background: t.surface,
          boxShadow: t.shadow,
          overflow: 'hidden',
          maxWidth: width * 0.8,
        }}
      >
        {/* Vertical accent bar, flush to the left edge — the project's brand color */}
        <div style={{ width: t.accentWidth, flexShrink: 0, background: t.accent }} />
        <div
          style={{
            width: padL + textW * p + padR,
            overflow: 'hidden',
            boxSizing: 'border-box',
            padding: `${padV}px ${padR}px ${padV}px ${padL}px`,
            color: t.text,
            fontSize,
            fontWeight: 600,
            fontFamily: family,
            letterSpacing: -0.2,
            lineHeight: 1.25,
            whiteSpace: 'pre',
          }}
        >
          {chars.map((c, i) => (
            <span key={i} style={{ opacity: i < visibleChars ? 1 : 0 }}>
              {c}
            </span>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
