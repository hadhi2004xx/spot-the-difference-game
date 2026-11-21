// The four scenes and their differences. Each scene paints the same 600x600 picture twice:
// with an empty `applied` set for the original panel, and with every difference id applied
// for the changed panel. A difference is one deliberate change — a colour swapped, a thing
// removed, a thing added, a thing moved — declared in the scene's `diffs` list with the
// point a player clicks (x, y) and the reach of the click (r). Painters read `applied` only
// through the `has` helper, so the two panels can never drift apart by accident.

import { between, makeRandom } from './random.js';
import {
  bird, bubble, cloud, crescent, disc, fish, flower, gear, glow, kite, lantern,
  roundedRect, sky, sparkle, tree,
} from './artwork.js';

/** True when difference `id` is applied in the panel being painted. */
function has(applied, id) {
  return applied.has(id);
}

/** Scatter `count` points from a seeded source so both panels scatter identically. */
function scatter(seed, count, x0, x1, y0, y1) {
  const next = makeRandom(seed);
  const points = [];
  for (let index = 0; index < count; index += 1) points.push([between(next, x0, x1), between(next, y0, y1)]);
  return points;
}

/* ------------------------------------------------------------------ Kite Meadow */

function paintMeadow(ctx, applied) {
  sky(ctx, [[0, '#a8dcf2'], [0.55, '#d8f2fc'], [0.62, '#eaf7e9'], [1, '#eaf7e9']]);
  glow(ctx, 508, 78, 90, 'rgba(255,214,80,0.5)');
  disc(ctx, 508, 78, 36, '#ffd94d');
  disc(ctx, 508, 78, 44, 'rgba(255,217,77,0.25)');
  cloud(ctx, 96, 74, 1.0, '#ffffff');
  cloud(ctx, 282, 126, 0.72, '#ffffff');
  // Difference: the low cloud drifts sideways in the changed panel.
  const cloudX = has(applied, 'cloud-moved') ? 500 : 448;
  cloud(ctx, cloudX, 172, 0.6, '#fdfdfd');
  bird(ctx, 150, 106, 1.0, '#3a5a74');
  bird(ctx, 198, 80, 0.8, '#3a5a74');
  // Difference: one bird of the three is gone in the changed panel.
  if (!has(applied, 'bird-missing')) bird(ctx, 336, 100, 0.9, '#3a5a74');

  // Rolling hills and the meadow floor.
  ctx.fillStyle = '#a5d68c';
  ctx.beginPath();
  ctx.moveTo(0, 348);
  ctx.quadraticCurveTo(180, 300, 360, 336);
  ctx.quadraticCurveTo(500, 362, 600, 340);
  ctx.lineTo(600, 600);
  ctx.lineTo(0, 600);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#79c25f';
  ctx.beginPath();
  ctx.moveTo(0, 420);
  ctx.quadraticCurveTo(220, 384, 430, 412);
  ctx.quadraticCurveTo(530, 426, 600, 408);
  ctx.lineTo(600, 600);
  ctx.lineTo(0, 600);
  ctx.closePath();
  ctx.fill();
  // A pale winding path to the picnic spot.
  ctx.fillStyle = '#e8ddae';
  ctx.beginPath();
  ctx.moveTo(268, 600);
  ctx.quadraticCurveTo(286, 520, 236, 486);
  ctx.quadraticCurveTo(214, 470, 238, 462);
  ctx.quadraticCurveTo(292, 478, 306, 528);
  ctx.quadraticCurveTo(314, 560, 330, 600);
  ctx.closePath();
  ctx.fill();

  // Difference: the big kite changes colour (scarlet in the original, teal when changed).
  kite(ctx, 252, 148, 1.1, has(applied, 'kite-colour') ? '#1fa8a0' : '#e2483d', '#f5a524');
  kite(ctx, 398, 218, 0.68, '#ffd94d', '#3a5a74');
  ctx.strokeStyle = 'rgba(70,60,40,0.5)';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(252, 190);
  ctx.quadraticCurveTo(238, 320, 218, 458);
  ctx.moveTo(398, 248);
  ctx.quadraticCurveTo(392, 340, 356, 452);
  ctx.stroke();

  // Difference: the apples in the big tree are picked in the changed panel.
  tree(ctx, 96, 404, 1.25, '#4e9b47', '#7a5230', !has(applied, 'apples-missing'));
  tree(ctx, 520, 420, 0.9, '#5da653', '#7a5230', false);

  // The picnic blanket, chequered, with a basket.
  ctx.save();
  ctx.translate(150, 492);
  ctx.transform(1, 0, -0.18, 0.62, 0, 0);
  for (let row = 0; row < 4; row += 1) {
    for (let col = 0; col < 6; col += 1) {
      ctx.fillStyle = (row + col) % 2 === 0 ? '#d84a3d' : '#f7ead9';
      ctx.fillRect(col * 17, row * 17, 17, 17);
    }
  }
  ctx.restore();
  ctx.fillStyle = '#b07a3f';
  roundedRect(ctx, 268, 470, 40, 28, 5);
  ctx.fill();
  ctx.fillStyle = '#8a5a2b';
  ctx.fillRect(268, 480, 40, 5);

  // Difference: a patch of flowers is mown away in the changed panel.
  const flowers = [[64, 548, '#e86a9a'], [92, 562, '#ffd94d'], [118, 544, '#e86a9a'], [140, 564, '#ffffff'], [82, 528, '#ffffff'], [128, 528, '#ffd94d']];
  const shown = has(applied, 'flowers-missing') ? flowers.slice(0, 2) : flowers;
  for (const [x, y, colour] of shown) flower(ctx, x, y, 1.0, colour, '#f5a524');
  for (const [x, y, colour] of [[452, 540, '#ffffff'], [486, 556, '#e86a9a'], [420, 560, '#ffd94d']]) flower(ctx, x, y, 0.9, colour, '#f5a524');

  // Grass tufts, identical in both panels.
  ctx.strokeStyle = '#5da653';
  ctx.lineWidth = 2;
  for (const [x, y] of scatter('meadow-grass', 26, 16, 584, 452, 584)) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - 3, y - 9);
    ctx.moveTo(x + 4, y);
    ctx.lineTo(x + 6, y - 10);
    ctx.stroke();
  }
  // Two butterflies.
  for (const [x, y] of [[446, 306], [176, 262]]) {
    ctx.fillStyle = '#8a6fd6';
    ctx.beginPath();
    ctx.ellipse(x - 5, y, 6, 4, -0.5, 0, Math.PI * 2);
    ctx.ellipse(x + 5, y, 6, 4, 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

/* ------------------------------------------------------------------ the registry */

/**
 * Every scene: a painter and its difference list. `label` names the change for the
 * level-clear recap; `r` is generous enough for a fair click and tight enough that
 * neighbouring differences never overlap.
 */
export const SCENES = {
  meadow: {
    paint: paintMeadow,
    diffs: [
      { id: 'kite-colour', x: 252, y: 148, r: 38, label: 'The big kite changed colour' },
      { id: 'bird-missing', x: 336, y: 100, r: 27, label: 'A bird flew away' },
      { id: 'cloud-moved', x: 474, y: 172, r: 34, label: 'A cloud drifted sideways' },
      { id: 'apples-missing', x: 96, y: 308, r: 38, label: 'The apples were picked' },
      { id: 'flowers-missing', x: 106, y: 544, r: 36, label: 'A patch of flowers was mown' },
    ],
  },
};
