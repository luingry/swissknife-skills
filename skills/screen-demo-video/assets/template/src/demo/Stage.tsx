import React from 'react';
import { AbsoluteFill, useVideoConfig, useCurrentFrame, interpolate, Easing } from 'remotion';
import { CameraMotionBlur } from '@remotion/motion-blur';
import type { DemoEvent, Vec } from './types';
import { useCursorPosition } from './useCursorPosition';
import { useCamera } from './useCamera';
import { useContactState } from './normalizeEvents';
import { Caption } from './Caption';

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
  <svg width={28} height={28} viewBox="0 0 28 28" style={{ transform: `scale(${scale})`, transformOrigin: '0 0' }}>
    <path
      d="M2 2 L2 22 L7.5 16.5 L11 24 L14.5 22.5 L11 15 L18 15 Z"
      fill="#fff"
      stroke="rgba(0,0,0,0.5)"
      strokeWidth={1.2}
      strokeLinejoin="round"
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

export function usePressScale(events: DemoEvent[]): number {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const clicks = events.filter((e) => e.click).map((e) => Math.round(e.at * fps));
  const dur = Math.round(fps * 0.16);
  let s = 1;
  for (const cf of clicks) {
    const local = frame - cf;
    if (local >= 0 && local <= dur) s = Math.min(s, 1 - Math.sin((local / dur) * Math.PI) * 0.02);
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

/* ------------------------------------------------------------------- DemoStage */

export const DemoStage: React.FC<{
  events: DemoEvent[];
  source: React.ReactNode;
  background?: React.ReactNode;
  mode?: 'desktop' | 'mobile';
  device?: DeviceSpec;
  captionFontSize?: number;
  /** Debug overlay: coordinate grid for authoring. Never leave on for a final render. */
  grid?: boolean;
}> = ({ events, source, background, mode = 'desktop', device, captionFontSize, grid }) => {
  const cursor = useCursorPosition(events);
  const cam = useCamera(events);
  const press = usePressScale(events);
  const contact = useContactState(events);

  const framed =
    mode === 'mobile' ? (
      <DeviceFrame device={device}>{source}</DeviceFrame>
    ) : (
      <Screen background={background}>{source}</Screen>
    );

  return (
    <AbsoluteFill>
      {mode === 'mobile' && <AbsoluteFill>{background}</AbsoluteFill>}

      <CameraMotionBlur shutterAngle={180} samples={8}>
        <Camera scale={cam.scale * press} focus={cam.focus}>
          {framed}
          {mode === 'mobile' ? (
            <TouchPointer x={cursor.x} y={cursor.y} down={contact.down} />
          ) : (
            <Cursor x={cursor.x} y={cursor.y} pressScale={press < 1 ? 0.9 : 1} />
          )}
          {/* Ripples use CONTENT coordinates, so they must live inside <Camera>. */}
          <ClickRipple events={events} />
          {grid && <CoordinateGrid />}
        </Camera>
      </CameraMotionBlur>

      {/* Screen-space: captions must not scale, so they project through the camera. */}
      <Caption events={events} cam={cam} fontSize={captionFontSize} />
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
