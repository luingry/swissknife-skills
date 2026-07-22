import React from 'react';
import { Composition, Img, staticFile } from 'remotion';
import { DemoStage, SourceSwap } from './demo/Stage';
import { captionBudgetSeconds } from './demo/readingTime';
import type { DemoEvent } from './demo/types';

/* ============================================================================
 * EDIT BELOW. Everything above `demo/` is the engine; this file is the film.
 * ==========================================================================*/

/** 60fps is the fluidity floor for final renders — 30 is only for fast drafts. */
const FPS = 60;
const WIDTH = 1920;
const HEIGHT = 1080;

/** Screenshots fill the frame. `objectPosition: 'top'` keeps page headers from being
 *  cropped away by `cover` — see setup-and-render.md §3 before changing this. */
const shotStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  objectPosition: 'top',
};

const events: DemoEvent[] = [
  { at: 0.0, cursor: [960, 700] },

  // Beat 1 — pointer leads, camera follows ~0.3s behind, dwell, then click.
  { at: 1.0, cursor: [1180, 300] },
  { at: 1.3, zoom: { scale: 1.8, to: [1180, 300] } },
  { at: 2.2, click: [1180, 300] },
  { at: 2.5, caption: 'Busque qualquer artigo', captionAt: [1180, 300] },

  // Beat 2 — the RESULT. Camera holds motionless while the screen swaps, then releases.
  { at: 6.0, zoom: { scale: 1.0, to: [960, 540] } },
  { at: 6.3, caption: 'Resultado em um clique' },
  { at: 6.5, cursor: [960, 700] },
];

/** Swap times are authored against the click that causes them. */
const shots = [
  { at: 0, node: <Img src={staticFile('shot-1.png')} style={shotStyle} /> },
  { at: 2.2, node: <Img src={staticFile('shot-2.png')} style={shotStyle} /> },
];

// Runtime must cover the last caption's computed hold; see readingTime.ts.
const DURATION_S = 10.5;

const Demo: React.FC = () => (
  <DemoStage
    events={events}
    captionFontSize={34}
    // Step 0b answers (ask the user BEFORE production): font + contrast.
    contrast="light"
    fontFamily="Inter, system-ui, sans-serif"
    // Default backdrop: the capture itself, heavily blurred ('blur'). Pass 'none' only when
    // the user opted out of a backdrop → fullscreen, frameless capture.
    backdrop="blur"
    source={<SourceSwap shots={shots} />}
  />
);

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="Demo"
      component={Demo}
      durationInFrames={Math.round(DURATION_S * FPS)}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
  </>
);

// Sanity aid while authoring: does the caption load even fit the runtime?
if (captionBudgetSeconds(['Busque qualquer artigo', 'Resultado em um clique']) > DURATION_S) {
  console.warn('[demo] Caption reading time exceeds composition duration — lengthen it.');
}
