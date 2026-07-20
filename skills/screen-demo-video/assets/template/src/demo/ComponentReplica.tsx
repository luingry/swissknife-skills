import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Easing } from 'remotion';
import { staggerDelay } from './grid';
import type { Vec } from './types';

/** Shape emitted by scripts/replicate.mjs. */
export type ComponentPart = {
  id: string;
  parent: string | null;
  depth: number;
  tag: string;
  role?: string;
  text?: string;
  img?: string;
  isLeaf: boolean;
  rect: [number, number, number, number]; // x, y, w, h relative to component root
  style: Record<string, string | number | undefined>;
};

export type ComponentSpec = {
  name: string;
  size: [number, number];
  parts: ComponentPart[];
};

/* ------------------------------------------------------------------ animation */

export type PartFrom = { x?: number; y?: number; scale?: number; opacity?: number; blur?: number };

export type Reveal = {
  /** Which parts animate. Default: leaves only — animating containers AND their children
   *  double-transforms and looks mushy. */
  select?: (p: ComponentPart) => boolean;
  order?: 'top-down' | 'bottom-up' | 'left-right' | 'center-out' | 'dom';
  perItemS?: number;
  maxTotalS?: number;
  from?: PartFrom;
  /** Seconds into the composition when the reveal begins. */
  atS?: number;
};

export type Ripple = { partId: string; atS: number; color?: string; durationS?: number };

/** Move one part from its captured rect to another — part-level morph. */
export type Morph = { partId: string; atS: number; to: [number, number, number, number]; durationS?: number };

const DEFAULT_FROM: PartFrom = { y: 16, opacity: 0, scale: 0.985 };

function orderIndex(parts: ComponentPart[], order: Reveal['order'], size: Vec): number[] {
  const idx = parts.map((_, i) => i);
  const key = (p: ComponentPart) => {
    const [x, y, w, h] = p.rect;
    switch (order) {
      case 'bottom-up': return -(y + h / 2);
      case 'left-right': return x + w / 2;
      case 'center-out':
        return Math.hypot(x + w / 2 - size[0] / 2, y + h / 2 - size[1] / 2);
      case 'dom': return 0;
      case 'top-down':
      default: return y + h / 2;
    }
  };
  if (order === 'dom') return idx;
  return idx.sort((a, b) => key(parts[a]) - key(parts[b]));
}

/* ------------------------------------------------------------------ rendering */

const PartBox: React.FC<{
  part: ComponentPart;
  transform: { x: number; y: number; scale: number; opacity: number; blur: number };
  rectOverride?: [number, number, number, number];
  ripple?: { progress: number; color: string };
}> = ({ part, transform, rectOverride, ripple }) => {
  const [x, y, w, h] = rectOverride ?? part.rect;
  const s = part.style;

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        height: h,
        boxSizing: 'border-box',
        background: (s.backgroundImage as string) ?? (s.background as string),
        color: s.color as string,
        fontFamily: s.fontFamily as string,
        fontSize: s.fontSize as number,
        fontWeight: s.fontWeight as string,
        lineHeight: s.lineHeight ? `${s.lineHeight}px` : undefined,
        letterSpacing: s.letterSpacing ? `${s.letterSpacing}px` : undefined,
        textAlign: s.textAlign as React.CSSProperties['textAlign'],
        borderRadius: s.borderRadius as string,
        border: s.border as string,
        boxShadow: s.boxShadow as string,
        overflow: ripple ? 'hidden' : (s.overflow as string),
        display: 'flex',
        alignItems: 'center',
        opacity: transform.opacity * ((s.opacity as number) ?? 1),
        transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
        transformOrigin: 'center',
        filter: transform.blur > 0.05 ? `blur(${transform.blur}px)` : undefined,
        willChange: 'transform, opacity',
      }}
    >
      {part.img && (
        <img
          src={part.img}
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: s.borderRadius as string }}
        />
      )}
      {part.text}
      {ripple && (
        <span
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: ripple.progress * Math.hypot(w, h) * 2.2,
            height: ripple.progress * Math.hypot(w, h) * 2.2,
            transform: 'translate(-50%, -50%)',
            borderRadius: '50%',
            background: ripple.color,
            opacity: (1 - ripple.progress) * 0.35,
            pointerEvents: 'none',
          }}
        />
      )}
    </div>
  );
};

/**
 * Renders a replicated component with every part independently animatable.
 *
 * Parts are absolutely positioned from their captured rects, which is what makes rich
 * choreography possible: a row can slide while a badge scales while a button ripples, all on
 * the same component, none of it faked.
 */
export const ComponentReplica: React.FC<{
  spec: ComponentSpec;
  /** Where the component sits on the canvas — snap this to the grid (see grid.ts). */
  at: Vec;
  /** Uniform scale applied to the whole replica. */
  scale?: number;
  reveal?: Reveal;
  ripples?: Ripple[];
  morphs?: Morph[];
}> = ({ spec, at, scale = 1, reveal, ripples = [], morphs = [] }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const select = reveal?.select ?? ((p: ComponentPart) => p.isLeaf);
  const animated = spec.parts.filter(select);
  const order = orderIndex(animated, reveal?.order ?? 'top-down', spec.size);
  const rankOf = new Map<string, number>();
  order.forEach((partIdx, rank) => rankOf.set(animated[partIdx].id, rank));

  const from = { ...DEFAULT_FROM, ...(reveal?.from ?? {}) };
  const revealAt = reveal?.atS ?? 0;

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          left: at[0],
          top: at[1],
          width: spec.size[0],
          height: spec.size[1],
          transform: `translate(-50%, -50%) scale(${scale})`,
          transformOrigin: 'center',
        }}
      >
        {spec.parts.map((part) => {
          const isAnimated = rankOf.has(part.id);
          let tr = { x: 0, y: 0, scale: 1, opacity: 1, blur: 0 };

          if (isAnimated && reveal) {
            const delayS = staggerDelay(rankOf.get(part.id)!, reveal.perItemS, reveal.maxTotalS);
            const local = Math.round((t - revealAt - delayS) * fps);
            const p = spring({
              frame: local,
              fps,
              durationInFrames: Math.round(0.55 * fps),
              config: { damping: 26, stiffness: 130, mass: 0.9 },
            });
            tr = {
              x: interpolate(p, [0, 1], [from.x ?? 0, 0]),
              y: interpolate(p, [0, 1], [from.y ?? 0, 0]),
              scale: interpolate(p, [0, 1], [from.scale ?? 1, 1]),
              opacity: interpolate(p, [0, 1], [from.opacity ?? 1, 1], { extrapolateRight: 'clamp' }),
              blur: interpolate(p, [0, 1], [from.blur ?? 0, 0], { extrapolateRight: 'clamp' }),
            };
          }

          // Part-level morph: animate the captured rect toward a new one.
          let rectOverride: [number, number, number, number] | undefined;
          const morph = morphs.find((m) => m.partId === part.id);
          if (morph) {
            const dur = Math.round((morph.durationS ?? 0.6) * fps);
            const p = spring({
              frame: Math.round((t - morph.atS) * fps),
              fps,
              durationInFrames: dur,
              config: { damping: 30, stiffness: 100, mass: 1 },
            });
            rectOverride = part.rect.map((v, i) => interpolate(p, [0, 1], [v, morph.to[i]])) as [
              number, number, number, number,
            ];
          }

          const rip = ripples.find((r) => r.partId === part.id);
          let rippleState: { progress: number; color: string } | undefined;
          if (rip) {
            const dur = rip.durationS ?? 0.6;
            const p = (t - rip.atS) / dur;
            if (p >= 0 && p <= 1) {
              rippleState = {
                progress: interpolate(p, [0, 1], [0, 1], { easing: Easing.out(Easing.ease) }),
                color: rip.color ?? 'rgba(91,75,232,0.9)',
              };
            }
          }

          return (
            <PartBox
              key={part.id}
              part={part}
              transform={tr}
              rectOverride={rectOverride}
              ripple={rippleState}
            />
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
