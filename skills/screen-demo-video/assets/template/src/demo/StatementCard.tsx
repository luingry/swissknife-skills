import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';

/**
 * StatementCard — the text composition of a "pitch" production.
 *
 * In a pitch, each benefit is stated on its own card, then the NEXT composition shows that
 * benefit actually happening. The card must therefore be quiet: it sets up the payoff, it is
 * not the payoff. Minimal box, generous space, one short line, a single accent element on the
 * left in the project's color.
 *
 * FONTS — four vetted choices, all open-licensed (SIL OFL) so they are safe to ship:
 *
 *   sans (DEFAULT: 'inter')
 *     inter    Inter — the reference UI typeface. Unmatched legibility at any size, neutral
 *              and quietly elegant, huge weight range, variable. It is the default because it
 *              never fights the product on screen and survives video compression best.
 *     geist    Geist (Vercel) — more character than Inter, tighter and more geometric.
 *              Reach for it when the brand wants a modern developer-tool feel.
 *
 *   serif
 *     instrument  Instrument Serif — high-contrast display serif. Editorial and premium; use
 *                 large and sparingly, ideal for a single-line statement.
 *     source      Source Serif 4 — a workhorse text serif. Professional and highly readable,
 *                 better than Instrument when the line runs longer.
 *
 * Load the chosen family via @remotion/google-fonts (or a local file) before rendering, or the
 * renderer silently falls back to a system font and the card loses its identity.
 */
export type StatementFont = 'inter' | 'geist' | 'instrument' | 'source';

export const FONT_STACK: Record<StatementFont, string> = {
  inter: "'Inter', system-ui, sans-serif",
  geist: "'Geist', 'Inter', system-ui, sans-serif",
  instrument: "'Instrument Serif', Georgia, serif",
  source: "'Source Serif 4', Georgia, serif",
};

export const DEFAULT_STATEMENT_FONT: StatementFont = 'inter';

export type StatementTheme = {
  background: string;
  surface: string;
  text: string;
  accent: string;
  accentWidth: number;
  radius: number;
};

export const STATEMENT_THEME: StatementTheme = {
  background: '#0C0C11',
  surface: '#FAF9F6',
  text: '#23232B',
  accent: '#5B4BE8',
  accentWidth: 8,
  radius: 14,
};

export const StatementCard: React.FC<{
  text: string;
  font?: StatementFont;
  theme?: Partial<StatementTheme>;
  /** Fraction of canvas height. Keep it large — this composition has one job. */
  fontScale?: number;
}> = ({ text, font = DEFAULT_STATEMENT_FONT, theme, fontScale = 0.075 }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = { ...STATEMENT_THEME, ...theme };

  const enter = spring({ frame, fps, config: { damping: 24, stiffness: 120, mass: 0.9 } });
  const y = interpolate(enter, [0, 1], [22, 0]);
  const barGrow = spring({ frame: frame - 3, fps, config: { damping: 26, stiffness: 140, mass: 0.7 } });

  return (
    <AbsoluteFill
      style={{
        background: t.background,
        alignItems: 'center',
        justifyContent: 'center',
        padding: width * 0.1,
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'stretch',
          background: t.surface,
          borderRadius: t.radius,
          overflow: 'hidden',
          opacity: enter,
          transform: `translateY(${y}px)`,
          boxShadow: '0 30px 90px rgba(0,0,0,0.45)',
          maxWidth: width * 0.78,
        }}
      >
        <div
          style={{
            width: t.accentWidth,
            flexShrink: 0,
            background: t.accent,
            transform: `scaleY(${Math.min(barGrow, 1)})`,
            transformOrigin: 'top',
          }}
        />
        <div
          style={{
            padding: `${height * 0.055}px ${width * 0.045}px`,
            color: t.text,
            fontFamily: FONT_STACK[font],
            fontSize: height * fontScale,
            fontWeight: font === 'instrument' || font === 'source' ? 400 : 600,
            lineHeight: 1.22,
            letterSpacing: font === 'instrument' ? 0 : -0.5,
          }}
        >
          {text}
        </div>
      </div>
    </AbsoluteFill>
  );
};
