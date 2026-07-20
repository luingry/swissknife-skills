import type { DemoEvent, Vec } from './types';

/** Shape emitted by scripts/capture.mjs. */
export type CaptureTimeline = {
  name: string;
  url: string;
  viewport: { width: number; height: number };
  recordSize: { width: number; height: number };
  durationSeconds: number;
  events: Array<{
    t: number;
    kind: 'move' | 'click' | 'typeStart' | 'typeEnd' | 'press' | 'scrollStart' | 'scrollEnd' | 'waitFor' | 'marker';
    x?: number;
    y?: number;
    text?: string;
    key?: string;
    label?: string;
    selector?: string;
    deltaY?: number;
  }>;
};

export type MapOptions = {
  /** Where the recording sits on the canvas, in composition px. */
  inset: Vec;
  /** Displayed size of the recording on the canvas, in composition px. */
  displaySize: Vec;
  /** Auto-punch the camera on each click. Off by default: zoom is a directorial choice. */
  autoZoom?: { scale: number; leadS?: number; releaseAfterS?: number };
};

/**
 * Converts a real-capture timeline into DemoEvents.
 *
 * This is the high-fidelity path: coordinates come from where the pointer REALLY went and
 * clicks from where it REALLY clicked, so the overlay lands exactly on the interaction that
 * the footage shows. No coordinate guessing, no drift between overlay and reality.
 *
 * Captured coordinates are in VIEWPORT space; the canvas shows the recording inset and
 * possibly scaled, so map through both.
 */
export function timelineToEvents(timeline: CaptureTimeline, opts: MapOptions): DemoEvent[] {
  const { viewport } = timeline;
  const [ix, iy] = opts.inset;
  const [dw, dh] = opts.displaySize;

  const toCanvas = (x: number, y: number): Vec => [
    ix + (x / viewport.width) * dw,
    iy + (y / viewport.height) * dh,
  ];

  const out: DemoEvent[] = [];

  for (const e of timeline.events) {
    switch (e.kind) {
      case 'move':
      case 'scrollStart':
        if (e.x != null && e.y != null) out.push({ at: e.t, cursor: toCanvas(e.x, e.y) });
        break;

      case 'click': {
        if (e.x == null || e.y == null) break;
        const p = toCanvas(e.x, e.y);
        out.push({ at: e.t, cursor: p });
        out.push({ at: e.t, click: p });
        if (opts.autoZoom) {
          const lead = opts.autoZoom.leadS ?? 0.3;
          out.push({ at: Math.max(0, e.t - lead), zoom: { scale: opts.autoZoom.scale, to: p } });
          if (opts.autoZoom.releaseAfterS != null) {
            out.push({ at: e.t + opts.autoZoom.releaseAfterS, zoom: { scale: 1 } });
          }
        }
        break;
      }

      // typeStart/typeEnd/press/scrollEnd/waitFor carry no pointer change; they are useful as
      // caption anchors and beat boundaries when authoring, so they are intentionally dropped
      // here rather than invented into motion.
      default:
        break;
    }
  }

  return out.sort((a, b) => a.at - b.at);
}

/** Beat boundaries you marked with `{ type: 'marker' }` during capture. */
export function markersOf(timeline: CaptureTimeline): Array<{ at: number; label?: string }> {
  return timeline.events.filter((e) => e.kind === 'marker').map((e) => ({ at: e.t, label: e.label }));
}
