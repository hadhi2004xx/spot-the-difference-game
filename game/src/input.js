// Pointer and keyboard input. The canvas is a fixed 1280x800 stage scaled by CSS, so every
// pointer event is mapped back into stage coordinates here; the rest of the game never sees
// a device pixel. Keyboard play: H hint, L loupe, P pause, R restart, M mute, Esc to title.

import { PANEL, VIEW } from './config.js';

/** Map a pointer event to stage coordinates. */
export function stagePoint(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * VIEW.width,
    y: ((event.clientY - rect.top) / rect.height) * VIEW.height,
  };
}

/**
 * Which panel a stage point falls in, and where inside the 600x600 scene:
 * { side: 'left'|'right', x, y } or null when the point is outside both panels.
 */
export function panelPoint(point) {
  if (point.y < PANEL.y || point.y > PANEL.y + PANEL.size) return null;
  if (point.x >= PANEL.leftX && point.x <= PANEL.leftX + PANEL.size) {
    return { side: 'left', x: point.x - PANEL.leftX, y: point.y - PANEL.y };
  }
  if (point.x >= PANEL.rightX && point.x <= PANEL.rightX + PANEL.size) {
    return { side: 'right', x: point.x - PANEL.rightX, y: point.y - PANEL.y };
  }
  return null;
}

/**
 * Wire the canvas and window to the game's handlers:
 * onTap(point, panel) for clicks, onMove(point, panel) for the loupe, onKey(action) for keys.
 */
export function attachInput(canvas, handlers) {
  canvas.addEventListener('pointerdown', (event) => {
    const point = stagePoint(canvas, event);
    handlers.onTap(point, panelPoint(point));
  });
  canvas.addEventListener('pointermove', (event) => {
    const point = stagePoint(canvas, event);
    handlers.onMove(point, panelPoint(point));
  });
  canvas.addEventListener('pointerleave', () => handlers.onMove(null, null));
  window.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    const actions = { h: 'hint', l: 'loupe', p: 'pause', r: 'restart', m: 'mute', escape: 'title', enter: 'confirm', ' ': 'confirm' };
    if (actions[key]) {
      event.preventDefault();
      handlers.onKey(actions[key]);
    }
  });
}
