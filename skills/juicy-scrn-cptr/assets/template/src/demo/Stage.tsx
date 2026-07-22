import React from 'react';
import { AbsoluteFill, useVideoConfig, useCurrentFrame, interpolate, Easing } from 'remotion';
import { CameraMotionBlur } from '@remotion/motion-blur';
import type { DemoEvent, Vec } from './types';
import { useCursorPosition } from './useCursorPosition';
import { useCamera } from './useCamera';
import { useContactState } from './normalizeEvents';
import { Caption, type CaptionContrast, type CaptionTheme } from './Caption';

/* --------------------------------------------------------------- BlurBackdrop */

/**
 * DEFAULT backdrop: a frame of the capture ITSELF, scaled past the edges and heavily,
 * diffusely blurred, with a light scrim for separation. This ties the backdrop to the
 * product's own palette for free and is the standing default — a solid/gradient/wallpaper
 * backdrop is used only when the user asks for one, and NO backdrop means the capture goes
 * fullscreen, frameless (see DemoStage `backdrop="none"`).
 */
export const BlurBackdrop: React.FC<{
  children: React.ReactNode;
  /** Big and diffuse on purpose; below ~60px the backdrop reads as a broken duplicate. */
  blur?: number;
  /** Over-scale so the blur never samples past the edges into transparency. */
  zoom?: number;
  /** 0-1 dark scrim strength; keeps the framed capture visually separated. */
  dim?: number;
}> = ({ children, blur = 90, zoom = 1.5, dim = 0.14 }) => (
  <AbsoluteFill style={{ overflow: 'hidden' }}>
    <AbsoluteFill
      style={{ transform: `scale(${zoom})`, filter: `blur(${blur}px) saturate(1.12)` }}
    >
      {children}
    </AbsoluteFill>
    <AbsoluteFill style={{ background: `rgba(10,10,12,${dim})` }} />
  </AbsoluteFill>
);

/* ------------------------------------------------------------------ Screen (desktop) */

export const Screen: React.FC<{
  children: React.ReactNode;
  background?: React.ReactNode;
  padding?: number;
  radius?: number;
}> = ({ children, background, padding = 120, radius = 24 }) => (
  <AbsoluteFill>
    <AbsoluteFill>
      {background ?? (
        <AbsoluteFill
          style={{ background: 'linear-gradient(135deg,#1b1030 0%,#0b1030 55%,#04122a 100%)' }}
        />
      )}
    </AbsoluteFill>
    <AbsoluteFill style={{ padding, boxSizing: 'border-box' }}>
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: radius,
          overflow: 'hidden',
          boxShadow: '0 40px 120px rgba(0,0,0,0.55), 0 8px 24px rgba(0,0,0,0.35)',
          background: '#000',
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  </AbsoluteFill>
);

/* ------------------------------------------------------------------- DeviceFrame */

export type DeviceSpec = {
  screen: { width: number; height: number };
  bezel?: number;
  radius?: number;
  screenRadius?: number;
  body?: string;
  notch?: 'none' | 'island' | 'notch';
};

export const PHONE: DeviceSpec = {
  screen: { width: 720, height: 1560 },
  bezel: 16,
  radius: 68,
  screenRadius: 54,
  body: 'linear-gradient(160deg,#3a3a3f,#111114)',
  notch: 'island',
};

export const DeviceFrame: React.FC<{ device?: DeviceSpec; children: React.ReactNode }> = ({
  device = PHONE,
  children,
}) => {
  const { screen, bezel = 16, radius = 68, screenRadius = 54, body, notch = 'island' } = device;
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div
        style={{
          width: screen.width + bezel * 2,
          height: screen.height + bezel * 2,
          borderRadius: radius,
          padding: bezel,
          boxSizing: 'border-box',
          background: body,
          boxShadow:
            '0 60px 140px rgba(0,0,0,0.6), 0 10px 30px rgba(0,0,0,0.45), inset 0 0 0 1.5px rgba(255,255,255,0.10)',
          position: 'relative',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: screenRadius,
            overflow: 'hidden',
            background: '#000',
            position: 'relative',
          }}
        >
          {children}
          {notch !== 'none' && (
            <div
              style={{
                position: 'absolute',
                top: notch === 'island' ? 14 : 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: notch === 'island' ? 108 : 168,
                height: notch === 'island' ? 32 : 26,
                borderRadius: notch === 'island' ? 999 : '0 0 18px 18px',
                background: '#000',
              }}
            />
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------------ Camera */

export const Camera: React.FC<{ scale: number; focus: Vec; children: React.ReactNode }> = ({
  scale,
  focus,
  children,
}) => {
  const { width, height } = useVideoConfig();
  const tx = width / 2 - focus[0] * scale;
  const ty = height / 2 - focus[1] * scale;
  return (
    <AbsoluteFill
      style={{ transformOrigin: '0 0', transform: `translate(${tx}px, ${ty}px) scale(${scale})` }}
    >
      {children}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------- Pointers */

const Pointer: React.FC<{ scale?: number }> = ({ scale = 1 }) => (
  // Modern, minimalist arrow: slim geometry, rounded joins, a hairline outline and a soft
  // drop shadow so it reads as floating just above the UI. The hotspot (the tip) sits at the
  // SVG origin, so the pointer coordinate still maps exactly to the tip.
  <svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    style={{ transform: `scale(${scale})`, transformOrigin: '0 0', overflow: 'visible' }}
  >
    <path
      d="M1.6 1.6 L1.6 17.2 L6.1 13.1 L9.0 19.5 L11.5 18.4 L8.7 12.1 L14.5 12.1 Z"
      fill="#fff"
      stroke="rgba(12,12,18,0.30)"
      strokeWidth={1}
      strokeLinejoin="round"
      strokeLinecap="round"
      style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.45))' }}
    />
  </svg>
);

export const Cursor: React.FC<{ x: number; y: number; pressScale?: number }> = ({
  x, y, pressScale = 1,
}) => (
  <AbsoluteFill style={{ pointerEvents: 'none' }}>
    <div style={{ position: 'absolute', left: 0, top: 0, transform: `translate(${x}px, ${y}px)`, willChange: 'transform' }}>
      <Pointer scale={pressScale} />
    </div>
  </AbsoluteFill>
);

export const TouchPointer: React.FC<{ x: number; y: number; down: boolean; size?: number }> = ({
  x, y, down, size = 64,
}) => {
  const s = down ? 0.82 : 1;
  const opacity = down ? 0.55 : 0.32;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          left: x,
          top: y,
          width: size,
          height: size,
          marginLeft: -size / 2,
          marginTop: -size / 2,
          borderRadius: '50%',
          background: `radial-gradient(circle at 40% 35%, rgba(255,255,255,${opacity + 0.2}), rgba(255,255,255,${opacity}) 60%, rgba(255,255,255,0) 72%)`,
          border: '1.5px solid rgba(255,255,255,0.55)',
          transform: `scale(${s})`,
          willChange: 'transform',
        }}
      />
    </AbsoluteFill>
  );
};

/* --------------------------------------------------------------------- Ripple */

export const ClickRipple: React.FC<{ events: DemoEvent[] }> = ({ events }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const clicks = events
    .filter((e) => e.click)
    .map((e) => ({ frame: Math.round(e.at * fps), pos: e.click as Vec }));
  const dur = Math.round(fps * 0.5);

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {clicks.map((c, i) => {
        const local = frame - c.frame;
        if (local < 0 || local > dur) return null;
        const p = local / dur;
        const size = interpolate(p, [0, 1], [12, 92], { easing: Easing.out(Easing.ease) });
        const opacity = interpolate(p, [0, 1], [0.55, 0], { easing: Easing.out(Easing.ease) });
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: c.pos[0],
              top: c.pos[1],
              width: size,
              height: size,
              marginLeft: -size / 2,
              marginTop: -size / 2,
              borderRadius: '50%',
              opacity,
              // Concentric light+dark ring so it stays visible on ANY backdrop.
              boxShadow:
                'inset 0 0 0 1.5px rgba(255,255,255,0.95), inset 0 0 0 3.5px rgba(0,0,0,0.45)',
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/**
 * Cursor press on click. Returns a scale that dips the POINTER briefly on each click and
 * settles back. Only the cursor reacts to a click — the framed screen is deliberately never
 * scaled, because a whole-frame dip reads as the whole page bouncing rather than as a tap.
 * See cursor-and-clicks.md §3.
 */
export function useCursorPress(events: DemoEvent[]): number {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const clicks = events.filter((e) => e.click).map((e) => Math.round(e.at * fps));
  const dur = Math.round(fps * 0.16);
  let s = 1;
  for (const cf of clicks) {
    const local = frame - cf;
    if (local >= 0 && local <= dur) s = Math.min(s, 1 - Math.sin((local / dur) * Math.PI) * 0.16);
  }
  return s;
}

/* ------------------------------------------------------------------ SourceSwap */

export type Shot = { at: number; node: React.ReactNode };

export const SourceSwap: React.FC<{ shots: Shot[]; crossfadeFrames?: number }> = ({
  shots,
  crossfadeFrames = 3,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cuts = shots.map((s) => ({ ...s, frame: Math.round(s.at * fps) }));
  let idx = 0;
  for (let k = 0; k < cuts.length; k++) if (frame >= cuts[k].frame) idx = k;

  const cur = cuts[idx];
  const prev = idx > 0 ? cuts[idx - 1] : null;
  const local = frame - cur.frame;
  const t =
    crossfadeFrames > 0
      ? interpolate(local, [0, crossfadeFrames], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })
      : 1;

  return (
    <AbsoluteFill>
      {prev && t < 1 && <AbsoluteFill>{prev.node}</AbsoluteFill>}
      <AbsoluteFill style={{ opacity: t, filter: t < 1 ? `blur(${(1 - t) * 2}px)` : undefined }}>
        {cur.node}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------- FilmGrain */

/**
 * Subtle animated film grain over the WHOLE frame — the top layer, above captions, which is
 * what makes it read as film rather than as a dirty screenshot. Natural and restrained:
 * noticeable on flat areas at 100% zoom, never gritty. The turbulence seed advances with the
 * frame so the grain crawls like real film; a static seed reads as a dirty lens.
 *
 * Deliberately NO mix-blend-mode: verified (2026-07) that `overlay`/blend modes on this
 * layer are silently dropped by the still/render compositor when siblings include
 * CameraMotionBlur's blended layers — the grain painted nothing. Plain source-over gray
 * noise at low opacity renders reliably and looks equivalent at these strengths.
 */
export const FilmGrain: React.FC<{ opacity?: number; baseFrequency?: number }> = ({
  opacity = 0.05,
  baseFrequency = 0.75,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  // useId emits colons, which break url(#...) references — strip to a safe id.
  const id = `grain-${React.useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', opacity }}>
      <svg width={width} height={height}>
        <filter id={id} x="0" y="0" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency={baseFrequency}
            numOctaves={2}
            seed={frame % 1000}
            stitchTiles="stitch"
          />
          {/* Luminance-only noise — chroma noise reads as compression artifacts. */}
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#${id})`} />
      </svg>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------- DemoStage */

export const DemoStage: React.FC<{
  events: DemoEvent[];
  source: React.ReactNode;
  /**
   * 'blur' (DEFAULT): backdrop is the capture itself, heavily blurred (BlurBackdrop).
   * 'none': the user opted out of a backdrop → the capture renders FULLSCREEN, frameless
   *         (no padding, no radius, no bezel, no shadow).
   * A ReactNode: custom backdrop (solid/gradient/wallpaper) when the user asked for one.
   */
  backdrop?: 'blur' | 'none' | React.ReactNode;
  /** @deprecated Legacy alias for a custom backdrop node — prefer `backdrop`. */
  background?: React.ReactNode;
  mode?: 'desktop' | 'mobile';
  device?: DeviceSpec;
  /** Contrast the user chose in Step 0b — themes the caption box. */
  contrast?: CaptionContrast;
  /** Font the user chose in Step 0b (family string, loaded before render). */
  fontFamily?: string;
  captionFontSize?: number;
  captionTheme?: Partial<CaptionTheme>;
  /** Film grain over the whole frame. On by default; `false` only if the user opts out. */
  grain?: boolean;
  grainOpacity?: number;
  /** Debug overlay: coordinate grid for authoring. Never leave on for a final render. */
  grid?: boolean;
}> = ({
  events,
  source,
  backdrop = 'blur',
  background,
  mode = 'desktop',
  device,
  contrast,
  fontFamily,
  captionFontSize,
  captionTheme,
  grain = true,
  grainOpacity,
  grid,
}) => {
  const cursor = useCursorPosition(events);
  const cam = useCamera(events);
  const cursorPress = useCursorPress(events);
  const contact = useContactState(events);

  const fullscreen = backdrop === 'none';
  const backdropNode: React.ReactNode = fullscreen
    ? null
    : backdrop === 'blur'
      ? (background ?? <BlurBackdrop>{source}</BlurBackdrop>)
      : (backdrop ?? background);

  const framed = fullscreen ? (
    <AbsoluteFill>{source}</AbsoluteFill>
  ) : mode === 'mobile' ? (
    <DeviceFrame device={device}>{source}</DeviceFrame>
  ) : (
    <Screen background={backdropNode}>{source}</Screen>
  );

  return (
    <AbsoluteFill>
      {mode === 'mobile' && !fullscreen && <AbsoluteFill>{backdropNode}</AbsoluteFill>}

      <CameraMotionBlur shutterAngle={180} samples={8}>
        {/* The camera is NEVER scaled by the click press — only the pointer dips (below). */}
        <Camera scale={cam.scale} focus={cam.focus}>
          {framed}
          {mode === 'mobile' ? (
            <TouchPointer x={cursor.x} y={cursor.y} down={contact.down} />
          ) : (
            <Cursor x={cursor.x} y={cursor.y} pressScale={cursorPress} />
          )}
          {/* Ripples use CONTENT coordinates, so they must live inside <Camera>. */}
          <ClickRipple events={events} />
          {grid && <CoordinateGrid />}
        </Camera>
      </CameraMotionBlur>

      {/* Screen-space: captions must not scale, so they project through the camera. */}
      <Caption
        events={events}
        cam={cam}
        contrast={contrast}
        theme={captionTheme}
        fontSize={captionFontSize}
        fontFamily={fontFamily}
      />

      {/* Top layer, above everything including captions — that is what reads as film. */}
      {grain && <FilmGrain opacity={grainOpacity} />}
    </AbsoluteFill>
  );
};

/* --------------------------------------------------------------- CoordinateGrid */

/**
 * Authoring aid: overlays a labelled 100px grid in CONTENT space. Render one still with
 * `grid` on, read the coordinates of every target off the image at once, then author the
 * whole timeline in a single pass instead of guess-render-adjust looping.
 */
export const CoordinateGrid: React.FC<{ step?: number }> = ({ step = 100 }) => {
  const { width, height } = useVideoConfig();
  const xs = Array.from({ length: Math.floor(width / step) + 1 }, (_, i) => i * step);
  const ys = Array.from({ length: Math.floor(height / step) + 1 }, (_, i) => i * step);
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {xs.map((x) => (
        <div key={`x${x}`} style={{ position: 'absolute', left: x, top: 0, width: 1, height, background: 'rgba(255,0,80,0.35)' }} />
      ))}
      {ys.map((y) => (
        <div key={`y${y}`} style={{ position: 'absolute', top: y, left: 0, height: 1, width, background: 'rgba(255,0,80,0.35)' }} />
      ))}
      {xs.filter((_, i) => i % 2 === 0).map((x) =>
        ys.filter((_, i) => i % 2 === 0).map((y) => (
          <div key={`l${x}-${y}`} style={{ position: 'absolute', left: x + 3, top: y + 2, color: '#ff0050', fontSize: 15, fontFamily: 'monospace', fontWeight: 700, textShadow: '0 0 4px #fff, 0 0 4px #fff' }}>
            {x},{y}
          </div>
        )),
      )}
    </AbsoluteFill>
  );
};
