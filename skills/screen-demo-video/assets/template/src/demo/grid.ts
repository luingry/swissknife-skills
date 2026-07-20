import { useVideoConfig } from 'remotion';
import type { Vec } from './types';

/**
 * The composition grid.
 *
 * Every dynamic element position, every camera focus point, and every framing decision snaps
 * to this grid. Not decoration — it is what makes a sequence of shots feel like one designed
 * piece instead of a series of separately-improvised frames. The eye reads alignment and
 * symmetry as intent, and intent reads as professionalism; arbitrary coordinates read as
 * sloppiness even when the viewer cannot say why.
 *
 * 12 columns because it divides cleanly by 2, 3, 4 and 6 — halves, thirds and quarters all
 * land on real column lines. 8 rows for the same reason vertically.
 */
export const GRID = {
  cols: 12,
  rows: 8,
  /** Outer margin as a fraction of the smaller canvas dimension. */
  margin: 0.055,
} as const;

export type GridHelpers = {
  /** X of a column line, 0..cols. */
  x: (col: number) => number;
  /** Y of a row line, 0..rows. */
  y: (row: number) => number;
  /** Center point of a cell block: (col,row) with span. */
  cell: (col: number, row: number, colSpan?: number, rowSpan?: number) => Vec;
  /** Rect [x, y, w, h] of a cell block. */
  rect: (col: number, row: number, colSpan?: number, rowSpan?: number) => [number, number, number, number];
  /** Snap an arbitrary point to the nearest grid intersection. */
  snap: (p: Vec) => Vec;
  /** Snap only if within `tolerance` px — keeps genuinely off-grid targets honest. */
  snapNear: (p: Vec, tolerance?: number) => Vec;
  colWidth: number;
  rowHeight: number;
  bounds: { left: number; top: number; right: number; bottom: number };
};

export function useGrid(): GridHelpers {
  const { width, height } = useVideoConfig();
  return makeGrid(width, height);
}

export function makeGrid(width: number, height: number): GridHelpers {
  const m = Math.round(Math.min(width, height) * GRID.margin);
  const left = m;
  const top = m;
  const right = width - m;
  const bottom = height - m;
  const colWidth = (right - left) / GRID.cols;
  const rowHeight = (bottom - top) / GRID.rows;

  const x = (col: number) => left + colWidth * col;
  const y = (row: number) => top + rowHeight * row;

  const rect = (
    col: number,
    row: number,
    colSpan = 1,
    rowSpan = 1,
  ): [number, number, number, number] => [x(col), y(row), colWidth * colSpan, rowHeight * rowSpan];

  const cell = (col: number, row: number, colSpan = 1, rowSpan = 1): Vec => {
    const [rx, ry, rw, rh] = rect(col, row, colSpan, rowSpan);
    return [rx + rw / 2, ry + rh / 2];
  };

  const snap = (p: Vec): Vec => [
    x(Math.round((p[0] - left) / colWidth)),
    y(Math.round((p[1] - top) / rowHeight)),
  ];

  const snapNear = (p: Vec, tolerance = 24): Vec => {
    const s = snap(p);
    return Math.hypot(s[0] - p[0], s[1] - p[1]) <= tolerance ? s : p;
  };

  return { x, y, cell, rect, snap, snapNear, colWidth, rowHeight, bounds: { left, top, right, bottom } };
}

/**
 * Stagger timing on a rhythm rather than ad-hoc delays. Index-based, capped so a long list
 * never drags past the point where the reveal stops reading as one gesture.
 */
export function staggerDelay(index: number, perItemS = 0.045, maxTotalS = 0.36): number {
  return Math.min(index * perItemS, maxTotalS);
}
