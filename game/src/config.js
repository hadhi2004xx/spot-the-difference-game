// Twin Tales — layout, palette and the level table. Everything the other modules need to
// agree on lives here: the fixed 1280x800 stage, where the two 600x600 panels sit, the HUD
// bands above and below them, and the colours of the frame that carries every scene.

export const VIEW = { width: 1280, height: 800 };

/** The two picture panels: square 600x600 scenes with a 32px gutter between them. */
export const PANEL = { size: 600, leftX: 24, rightX: 656, y: 124, labelY: 104 };

/** HUD bands: the masthead (0..64), the counter/timer strip (64..124), the controls (724..800). */
export const BAND = { masthead: 64, strip: 124, controlsY: 724 };

export const INK = {
  bg: '#0b0e13',
  frame: '#141a23',
  frameEdge: 'rgba(255,255,255,0.10)',
  paper: '#f5f1e6',
  muted: '#9aa7b8',
  faint: '#5d6a7d',
  accent: '#f5a524',
  accentDeep: '#b45309',
  found: '#34d399',
  danger: '#f4534f',
  chip: '#1c2534',
};

/** Fonts are system stacks only: the game loads no webfont, so it plays fully offline. */
export const FONT = {
  title: '700 30px Georgia, "Times New Roman", serif',
  head: '700 21px Georgia, "Times New Roman", serif',
  body: '600 16px "Segoe UI", system-ui, sans-serif',
  small: '600 13px "Segoe UI", system-ui, sans-serif',
  number: '700 24px "Consolas", "SF Mono", monospace',
  bigNumber: '700 34px "Consolas", "SF Mono", monospace',
};

/**
 * The campaign: four scenes of rising difficulty. `seconds` is the clock the player races;
 * `hints` is how many hint pulses the level allows. Difference counts live in scenes.js and
 * are read from there, so this table never disagrees with the art.
 */
export const LEVELS = [
  { scene: 'meadow', name: 'Kite Meadow', tag: 'Level 1 · Warm-up', seconds: 150, hints: 3 },
  { scene: 'market', name: 'Lantern Market', tag: 'Level 2 · Dusk', seconds: 180, hints: 3 },
  { scene: 'reef', name: 'Coral Reef', tag: 'Level 3 · The Deep', seconds: 210, hints: 2 },
  { scene: 'workshop', name: 'Clockwork Workshop', tag: 'Level 4 · Expert', seconds: 240, hints: 2 },
];

/** Scoring: a find pays FIND_POINTS plus the live streak bonus; a miss costs points and time. */
export const SCORE = {
  find: 100,
  streakStep: 15,
  mistakePoints: 25,
  mistakeSeconds: 3,
  hintCost: 150,
  secondBonus: 2,
};
