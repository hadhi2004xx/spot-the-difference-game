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

/* ------------------------------------------------------------------ Lantern Market */

function paintMarket(ctx, applied) {
  sky(ctx, [[0, '#232048'], [0.42, '#4a3566'], [0.58, '#a85a6e'], [0.68, '#e88b5a'], [0.76, '#3a2b47'], [1, '#241f33']]);
  // Stars, identical in both panels, plus one extra sparkle when changed.
  ctx.fillStyle = 'rgba(255,244,200,0.85)';
  for (const [x, y] of scatter('market-stars', 42, 10, 590, 8, 205)) ctx.fillRect(x, y, 2.4, 2.4);
  sparkle(ctx, 210, 52, 7, 'rgba(255,244,200,0.9)');
  sparkle(ctx, 560, 130, 6, 'rgba(255,244,200,0.8)');
  if (has(applied, 'star-extra')) sparkle(ctx, 472, 64, 11, '#fff3b0');
  // Difference: the crescent moon opens the other way in the changed panel.
  crescent(ctx, 92, 84, 27, '#f7e8b0', '#2e2857', has(applied, 'moon-flip') ? -1 : 1);

  // Rooftop silhouettes against the dusk.
  ctx.fillStyle = '#1d1830';
  ctx.beginPath();
  ctx.moveTo(0, 600);
  ctx.lineTo(0, 330);
  ctx.lineTo(70, 330); ctx.lineTo(105, 296); ctx.lineTo(140, 330);
  ctx.lineTo(238, 330); ctx.lineTo(272, 302); ctx.lineTo(306, 330);
  ctx.lineTo(420, 330); ctx.lineTo(452, 298); ctx.lineTo(484, 330);
  ctx.lineTo(600, 330); ctx.lineTo(600, 600);
  ctx.closePath();
  ctx.fill();
  ctx.fillRect(168, 306, 14, 26);
  ctx.fillRect(500, 308, 14, 24);
  // Difference: the cat on the middle roof is gone in the changed panel.
  if (!has(applied, 'cat-missing')) {
    ctx.fillStyle = '#100c1c';
    ctx.beginPath();
    ctx.ellipse(330, 288, 17, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    disc(ctx, 314, 280, 7.5, '#100c1c');
    ctx.strokeStyle = '#100c1c';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(346, 286);
    ctx.quadraticCurveTo(358, 272, 352, 260);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(309, 274); ctx.lineTo(306, 266); ctx.lineTo(314, 270);
    ctx.moveTo(319, 274); ctx.lineTo(320, 265); ctx.lineTo(325, 271);
    ctx.stroke();
  }

  // Strings of small bulbs sagging over the lane.
  for (const [y0, y1] of [[150, 118], [214, 186]]) {
    ctx.strokeStyle = 'rgba(16,12,28,0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-6, y0);
    ctx.quadraticCurveTo(300, y0 + 52, 606, y1);
    ctx.stroke();
    const colours = ['#ffd94d', '#e86a9a', '#7ed0c5', '#f5a524'];
    for (let index = 0; index < 12; index += 1) {
      const t = (index + 0.5) / 12;
      const x = (1 - t) * (1 - t) * -6 + 2 * (1 - t) * t * 300 + t * t * 606;
      const y = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * (y0 + 52) + t * t * y1;
      glow(ctx, x, y + 7, 13, 'rgba(255,190,80,0.30)');
      disc(ctx, x, y + 7, 4, colours[index % colours.length]);
    }
  }

  // The lantern row: five paper lanterns on one wire.
  ctx.strokeStyle = 'rgba(16,12,28,0.85)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(0, 96);
  ctx.lineTo(600, 96);
  ctx.stroke();
  const lanternColours = ['#e2483d', '#f5a524', '#e86a9a', '#f5a524', '#3fa7a0'];
  // Difference: the fourth lantern is violet in the changed panel, amber in the original.
  if (has(applied, 'lantern-colour')) lanternColours[3] = '#8a6fd6';
  [90, 195, 300, 405, 510].forEach((x, index) => lantern(ctx, x, 96, 36, 48, lanternColours[index], true));

  // Three market stalls with striped awnings and laden counters.
  const stalls = [
    { x: 20, awning: ['#d84a3d', '#f7ead9'] },
    { x: 215, awning: has(applied, 'awning-colour') ? ['#7a4a9e', '#f7ead9'] : ['#2e8f86', '#f7ead9'] },
    { x: 410, awning: ['#f5a524', '#f7ead9'] },
  ];
  for (const stall of stalls) {
    ctx.fillStyle = '#171226';
    ctx.fillRect(stall.x + 6, 428, 8, 128);
    ctx.fillRect(stall.x + 156, 428, 8, 128);
    ctx.beginPath();
    ctx.moveTo(stall.x - 6, 430);
    ctx.lineTo(stall.x + 85, 378);
    ctx.lineTo(stall.x + 176, 430);
    ctx.closePath();
    ctx.fillStyle = stall.awning[0];
    ctx.fill();
    ctx.save();
    ctx.clip();
    ctx.fillStyle = stall.awning[1];
    for (let stripe = 0; stripe < 5; stripe += 1) ctx.fillRect(stall.x + 12 + stripe * 36, 378, 17, 54);
    ctx.restore();
    ctx.fillStyle = '#4a3421';
    ctx.fillRect(stall.x, 470, 170, 16);
    ctx.fillStyle = '#38271a';
    ctx.fillRect(stall.x, 486, 170, 70);
  }
  // Stall one: a pile of oranges — Difference: two are missing in the changed panel.
  const oranges = [[70, 458], [96, 458], [122, 458], [83, 440], [109, 440], [96, 424]];
  const shownOranges = has(applied, 'fruit-count') ? oranges.slice(0, 4) : oranges;
  for (const [x, y] of shownOranges) {
    disc(ctx, x, y, 12, '#f08a1d');
    disc(ctx, x - 3, y - 4, 3.4, '#ffb35c');
  }
  // Stall two: jars of preserves. Stall three: bread loaves.
  for (const x of [258, 292, 326]) {
    ctx.fillStyle = '#c8d64f';
    roundedRect(ctx, x, 436, 24, 32, 5);
    ctx.fill();
    ctx.fillStyle = '#8a5a2b';
    ctx.fillRect(x + 3, 430, 18, 8);
  }
  for (const [x, y] of [[452, 456], [486, 456], [520, 456], [469, 438], [503, 438]]) {
    ctx.fillStyle = '#d9a45c';
    ctx.beginPath();
    ctx.ellipse(x, y, 15, 9, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // Difference: the pink banner on the third stall is taken down in the changed panel.
  if (!has(applied, 'banner-missing')) {
    ctx.fillStyle = '#e86a9a';
    ctx.fillRect(520, 436, 27, 66);
    ctx.fillStyle = '#f7ead9';
    disc(ctx, 533, 458, 6, '#f7ead9');
    disc(ctx, 533, 482, 6, '#f7ead9');
  }
  // The lane floor.
  ctx.fillStyle = '#241f33';
  ctx.fillRect(0, 556, 600, 44);
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 2;
  for (const [x, y] of scatter('market-cobbles', 16, 10, 590, 566, 594)) {
    ctx.beginPath();
    ctx.arc(x, y, 13, Math.PI, Math.PI * 2);
    ctx.stroke();
  }
}

/* ------------------------------------------------------------------ Coral Reef */

/** A sea turtle with an optionally spotted shell. */
function turtle(ctx, x, y, scale, spotted) {
  ctx.fillStyle = '#4e7d4a';
  ctx.beginPath();
  ctx.ellipse(x - 44 * scale, y + 12 * scale, 15 * scale, 7 * scale, 0.6, 0, Math.PI * 2);
  ctx.ellipse(x + 40 * scale, y + 16 * scale, 15 * scale, 7 * scale, -0.5, 0, Math.PI * 2);
  ctx.ellipse(x + 30 * scale, y - 20 * scale, 13 * scale, 6 * scale, 0.7, 0, Math.PI * 2);
  ctx.fill();
  disc(ctx, x + 56 * scale, y - 6 * scale, 11 * scale, '#5da653');
  ctx.fillStyle = '#5da653';
  ctx.beginPath();
  ctx.ellipse(x, y, 46 * scale, 32 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#79b264';
  ctx.beginPath();
  ctx.ellipse(x, y - 3 * scale, 36 * scale, 24 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
  if (spotted) {
    ctx.fillStyle = '#4e7d4a';
    for (const [dx, dy, r] of [[-16, -8, 7], [8, -14, 6], [18, 4, 7], [-6, 8, 6], [-24, 6, 5]]) {
      disc(ctx, x + dx * scale, y + dy * scale, r * scale, '#4e7d4a');
    }
  }
}

/** A seahorse in profile: a chain of shrinking circles along an S-curve. */
function seahorse(ctx, x, y, scale, colour) {
  ctx.fillStyle = colour;
  const spine = [[0, -34, 9], [7, -22, 10], [10, -8, 11], [6, 6, 11], [-2, 18, 10], [-10, 28, 8], [-14, 38, 6]];
  for (const [dx, dy, r] of spine) disc(ctx, x + dx * scale, y + dy * scale, r * scale, colour);
  ctx.beginPath();
  ctx.moveTo(x - 2 * scale, y - 40 * scale);
  ctx.lineTo(x - 16 * scale, y - 30 * scale);
  ctx.lineTo(x - 2 * scale, y - 26 * scale);
  ctx.closePath();
  ctx.fill();
  disc(ctx, x + 3 * scale, y - 33 * scale, 2.4 * scale, '#10303e');
  ctx.strokeStyle = colour;
  ctx.lineWidth = 4 * scale;
  ctx.beginPath();
  ctx.moveTo(x - 12 * scale, y + 40 * scale);
  ctx.quadraticCurveTo(x - 24 * scale, y + 48 * scale, x - 12 * scale, y + 54 * scale);
  ctx.stroke();
}

/** A crab with one claw sized by `bigClaw`. */
function crab(ctx, x, y, scale, bigClaw) {
  ctx.fillStyle = '#d84a3d';
  ctx.beginPath();
  ctx.ellipse(x, y, 26 * scale, 16 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
  disc(ctx, x - 10 * scale, y - 14 * scale, 3.4 * scale, '#7a1f16');
  disc(ctx, x + 10 * scale, y - 14 * scale, 3.4 * scale, '#7a1f16');
  ctx.strokeStyle = '#d84a3d';
  ctx.lineWidth = 4 * scale;
  for (const side of [-1, 1]) {
    for (let leg = 0; leg < 3; leg += 1) {
      ctx.beginPath();
      ctx.moveTo(x + side * 20 * scale, y + 4 * scale + leg * 3);
      ctx.lineTo(x + side * (34 + leg * 4) * scale, y + (14 + leg * 5) * scale);
      ctx.stroke();
    }
  }
  const clawR = (bigClaw ? 13 : 7) * scale;
  disc(ctx, x - 34 * scale, y - 12 * scale, clawR, '#d84a3d');
  disc(ctx, x + 34 * scale, y - 12 * scale, 8 * scale, '#d84a3d');
}

function paintReef(ctx, applied) {
  sky(ctx, [[0, '#0d4a6e'], [0.5, '#093a5c'], [1, '#062a44']]);
  // Shafts of surface light.
  ctx.fillStyle = 'rgba(190,230,255,0.07)';
  for (const [x0, x1] of [[70, 150], [240, 330], [420, 480]]) {
    ctx.beginPath();
    ctx.moveTo(x0, 0);
    ctx.lineTo(x1, 0);
    ctx.lineTo(x1 + 60, 505);
    ctx.lineTo(x0 + 30, 505);
    ctx.closePath();
    ctx.fill();
  }
  // The sandy floor and its speckles.
  ctx.fillStyle = '#7d6c46';
  ctx.beginPath();
  ctx.moveTo(0, 520);
  ctx.quadraticCurveTo(200, 496, 400, 514);
  ctx.quadraticCurveTo(510, 524, 600, 510);
  ctx.lineTo(600, 600);
  ctx.lineTo(0, 600);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(40,32,16,0.35)';
  for (const [x, y] of scatter('reef-sand', 30, 8, 592, 522, 592)) ctx.fillRect(x, y, 3.4, 2.4);

  // Difference: the branching coral is pink in the original, orange in the changed panel.
  const coralColour = has(applied, 'coral-colour') ? '#f08a3c' : '#e86a9a';
  ctx.strokeStyle = coralColour;
  ctx.lineCap = 'round';
  for (const [width, path] of [[11, [[88, 512], [84, 470], [70, 446]]], [9, [[88, 512], [96, 462], [112, 436]]], [8, [[88, 512], [88, 452], [88, 424]]], [6, [[80, 478], [58, 462], [48, 442]]], [6, [[94, 470], [116, 452], [128, 430]]]]) {
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(path[0][0], path[0][1]);
    ctx.quadraticCurveTo(path[1][0], path[1][1], path[2][0], path[2][1]);
    ctx.stroke();
  }
  // An anemone with waving tentacles.
  ctx.fillStyle = '#6a4a9e';
  ctx.beginPath();
  ctx.ellipse(300, 528, 34, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#a884e0';
  ctx.lineWidth = 4;
  for (let index = 0; index < 9; index += 1) {
    const x = 274 + index * 6.5;
    ctx.beginPath();
    ctx.moveTo(x, 522);
    ctx.quadraticCurveTo(x + (index % 2 === 0 ? -5 : 5), 502, x + (index % 2 === 0 ? -8 : 8), 492);
    ctx.stroke();
  }
  // A sea fan at the back right.
  ctx.fillStyle = 'rgba(168,132,224,0.35)';
  ctx.beginPath();
  ctx.moveTo(528, 500);
  ctx.quadraticCurveTo(492, 420, 516, 356);
  ctx.quadraticCurveTo(566, 340, 584, 396);
  ctx.quadraticCurveTo(578, 456, 552, 500);
  ctx.closePath();
  ctx.fill();

  // The big fish — Difference: orange in the original, blue in the changed panel.
  fish(ctx, 330, 238, 1.5, has(applied, 'fish-colour') ? '#3f8fe2' : '#f08a3c', 1);
  // A small school — Difference: one fish of the five is gone in the changed panel.
  const school = [[150, 150, '#7ed0c5'], [196, 126, '#ffd94d'], [118, 198, '#e86a9a'], [522, 148, '#7ed0c5'], [472, 108, '#ffd94d']];
  school.forEach(([x, y, colour], index) => {
    if (index === 1 && has(applied, 'fish-missing')) return;
    fish(ctx, x, y, 0.55, colour, 1);
  });
  // Difference: the turtle's shell spots are scrubbed off in the changed panel.
  turtle(ctx, 452, 372, 1.05, !has(applied, 'turtle-spots'));
  // Difference: the seahorse is yellow in the original, pink in the changed panel.
  seahorse(ctx, 140, 300, 0.9, has(applied, 'seahorse-colour') ? '#e86a9a' : '#ffd94d');
  // Difference: the clam is closed in the original, open with a pearl in the changed panel.
  if (has(applied, 'shell-open')) {
    ctx.fillStyle = '#cbb7d9';
    ctx.beginPath();
    ctx.ellipse(250, 548, 26, 15, -0.5, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(250, 560, 26, 13, 0, 0, Math.PI);
    ctx.fill();
    disc(ctx, 250, 552, 6.5, '#fdf6ec');
  } else {
    ctx.fillStyle = '#cbb7d9';
    ctx.beginPath();
    ctx.ellipse(250, 552, 26, 17, 0, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#9a84b8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(226, 552);
    ctx.lineTo(274, 552);
    ctx.stroke();
  }
  // Difference: the crab's left claw is big in the original, small in the changed panel.
  crab(ctx, 516, 540, 0.95, !has(applied, 'crab-claw'));
  // A bubble column from a rock vent, plus — Difference — an extra cluster when changed.
  for (const [x, y, r] of [[206, 430, 6], [214, 396, 8], [204, 358, 5], [216, 318, 7], [208, 276, 5]]) bubble(ctx, x, y, r);
  if (has(applied, 'bubbles-extra')) for (const [x, y, r] of [[428, 176, 7], [442, 152, 5], [420, 138, 4]]) bubble(ctx, x, y, r);
  // Difference: the tall seaweed at the right edge is cut short in the changed panel.
  const bladeTop = has(applied, 'seaweed-short') ? 472 : 384;
  ctx.strokeStyle = '#3f9b5f';
  ctx.lineCap = 'round';
  for (const [x, sway] of [[552, -12], [568, 8], [584, -6]]) {
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(x, 560);
    ctx.quadraticCurveTo(x + sway, (560 + bladeTop) / 2, x + sway * 1.6, bladeTop);
    ctx.stroke();
  }
  for (const [x, y] of scatter('reef-pebbles', 8, 20, 580, 540, 585)) {
    ctx.fillStyle = '#5d5138';
    ctx.beginPath();
    ctx.ellipse(x, y, 10, 6, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

/* ------------------------------------------------------------------ Clockwork Workshop */

/** A wall clock with hands set by `minutes` past ten, and its pendulum. */
function clockFace(ctx, x, y, radius, minutes) {
  ctx.strokeStyle = '#8a6a2f';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(x, y + radius);
  ctx.lineTo(x, y + radius + 62);
  ctx.stroke();
  disc(ctx, x, y + radius + 74, 13, '#c99635');
  ctx.fillStyle = '#c99635';
  ctx.beginPath();
  ctx.arc(x, y, radius + 7, 0, Math.PI * 2);
  ctx.fill();
  disc(ctx, x, y, radius, '#f3e9d2');
  ctx.strokeStyle = '#5d4a22';
  ctx.lineWidth = 2;
  for (let tick = 0; tick < 12; tick += 1) {
    const angle = (tick / 12) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(angle) * (radius - 12), y + Math.sin(angle) * (radius - 12));
    ctx.lineTo(x + Math.cos(angle) * (radius - 4), y + Math.sin(angle) * (radius - 4));
    ctx.stroke();
  }
  const hourAngle = ((10 + minutes / 60) / 12) * Math.PI * 2 - Math.PI / 2;
  const minuteAngle = (minutes / 60) * Math.PI * 2 - Math.PI / 2;
  ctx.strokeStyle = '#2b2118';
  ctx.lineCap = 'round';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + Math.cos(hourAngle) * radius * 0.52, y + Math.sin(hourAngle) * radius * 0.52);
  ctx.stroke();
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + Math.cos(minuteAngle) * radius * 0.8, y + Math.sin(minuteAngle) * radius * 0.8);
  ctx.stroke();
  disc(ctx, x, y, 5, '#2b2118');
}

function paintWorkshop(ctx, applied) {
  sky(ctx, [[0, '#3b332c'], [0.78, '#33291f'], [1, '#241c14']]);
  // The window: night outside, a moon, and stars — one of which can vanish.
  ctx.fillStyle = '#191f38';
  ctx.fillRect(56, 60, 148, 196);
  disc(ctx, 96, 100, 16, '#f7e8b0');
  disc(ctx, 104, 94, 14, '#191f38');
  ctx.fillStyle = 'rgba(255,244,200,0.9)';
  for (const [x, y] of scatter('workshop-stars', 12, 66, 194, 70, 240)) ctx.fillRect(x, y, 2.2, 2.2);
  if (!has(applied, 'window-star')) sparkle(ctx, 152, 122, 9, '#fff3b0');
  ctx.strokeStyle = '#191410';
  ctx.lineWidth = 10;
  ctx.strokeRect(52, 56, 156, 204);
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(130, 56);
  ctx.lineTo(130, 260);
  ctx.moveTo(52, 158);
  ctx.lineTo(208, 158);
  ctx.stroke();
  // The shelf under the window and its jars — Difference: the middle jar is gone.
  ctx.fillStyle = '#191410';
  ctx.fillRect(44, 268, 172, 9);
  const jarColours = ['#7ed0c5', '#e86a9a', '#ffd94d'];
  [76, 122, 168].forEach((x, index) => {
    if (index === 1 && has(applied, 'jar-missing')) return;
    ctx.fillStyle = jarColours[index];
    roundedRect(ctx, x - 15, 228, 30, 40, 6);
    ctx.fill();
    ctx.fillStyle = '#191410';
    ctx.fillRect(x - 10, 222, 20, 8);
  });

  // Difference: the clock's minute hand moves from ten past to twenty-five past.
  clockFace(ctx, 300, 128, 64, has(applied, 'clock-hands') ? 25 : 10);
  // Gears on the right wall — Difference: the big gear is brass, then copper.
  gear(ctx, 452, 108, 38, 9, has(applied, 'gear-colour') ? '#b5542f' : '#c99635', 0.3);
  gear(ctx, 526, 178, 26, 8, '#8a8f98', 0.8);
  gear(ctx, 456, 194, 20, 8, '#c99635', 0.1);

  // A bookshelf — Difference: the fourth spine changes from red to green.
  ctx.fillStyle = '#191410';
  ctx.fillRect(392, 292, 176, 9);
  const spines = ['#3f6fb5', '#c99635', '#7a4a9e', '#c23b2e', '#3f7d4e', '#8a5a2b'];
  if (has(applied, 'book-colour')) spines[3] = '#3f7d4e';
  spines.forEach((colour, index) => {
    ctx.fillStyle = colour;
    ctx.fillRect(400 + index * 27, 230, 22, 62);
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.fillRect(400 + index * 27, 240, 22, 4);
  });

  // The workbench and its clutter.
  ctx.fillStyle = '#6b4a2c';
  ctx.fillRect(56, 392, 488, 16);
  ctx.fillStyle = '#54381f';
  ctx.fillRect(72, 408, 14, 62);
  ctx.fillRect(514, 408, 14, 62);
  ctx.fillStyle = '#38271a';
  ctx.fillRect(56, 470, 488, 10);
  // The bench lamp — Difference: lit in the original, dark in the changed panel.
  const lampLit = !has(applied, 'lamp-off');
  ctx.strokeStyle = '#22252c';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(96, 392);
  ctx.lineTo(112, 348);
  ctx.lineTo(134, 344);
  ctx.stroke();
  if (lampLit) glow(ctx, 140, 356, 52, 'rgba(255,196,80,0.45)');
  ctx.fillStyle = '#2e6e5e';
  ctx.beginPath();
  ctx.moveTo(118, 330);
  ctx.lineTo(152, 336);
  ctx.lineTo(144, 358);
  ctx.lineTo(124, 354);
  ctx.closePath();
  ctx.fill();
  disc(ctx, 138, 352, 5, lampLit ? '#ffd94d' : '#5d6a7d');
  // A teapot — Difference: its steam is gone in the changed panel.
  ctx.fillStyle = '#8a8f98';
  ctx.beginPath();
  ctx.ellipse(252, 380, 26, 15, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(226, 376);
  ctx.lineTo(210, 366);
  ctx.lineTo(228, 368);
  ctx.closePath();
  ctx.fill();
  ctx.fillRect(246, 360, 12, 7);
  if (!has(applied, 'steam-missing')) {
    ctx.strokeStyle = 'rgba(230,236,244,0.65)';
    ctx.lineWidth = 3;
    for (const dx of [-8, 6]) {
      ctx.beginPath();
      ctx.moveTo(252 + dx, 352);
      ctx.quadraticCurveTo(252 + dx - 6, 338, 252 + dx + 2, 326);
      ctx.stroke();
    }
  }
  // Tools: a hammer, and a wrench that can go missing.
  ctx.fillStyle = '#8a5a2b';
  ctx.save();
  ctx.translate(352, 388);
  ctx.rotate(-0.35);
  ctx.fillRect(-4, -26, 8, 30);
  ctx.fillStyle = '#5d6068';
  ctx.fillRect(-13, -36, 26, 13);
  ctx.restore();
  if (!has(applied, 'tool-missing')) {
    ctx.strokeStyle = '#5d6068';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(404, 396);
    ctx.lineTo(434, 372);
    ctx.stroke();
    disc(ctx, 438, 369, 8, '#5d6068');
    disc(ctx, 438, 369, 4.5, '#38271a');
  }
  // Scattered screws on the bench, identical in both panels.
  ctx.fillStyle = '#a8adb5';
  for (const [x, y] of scatter('workshop-screws', 7, 180, 500, 398, 404)) ctx.fillRect(x, y, 4, 2.4);

  // The floor and its rug — Difference: the rug is red, then blue.
  ctx.fillStyle = '#4a3826';
  ctx.fillRect(0, 480, 600, 120);
  ctx.strokeStyle = 'rgba(0,0,0,0.25)';
  ctx.lineWidth = 2;
  for (let x = 40; x < 600; x += 74) {
    ctx.beginPath();
    ctx.moveTo(x, 480);
    ctx.lineTo(x - 16, 600);
    ctx.stroke();
  }
  ctx.fillStyle = has(applied, 'rug-colour') ? '#3b5a7a' : '#7a3b3b';
  ctx.beginPath();
  ctx.ellipse(300, 546, 152, 30, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,235,200,0.35)';
  ctx.beginPath();
  ctx.moveTo(300, 528);
  ctx.lineTo(322, 546);
  ctx.lineTo(300, 564);
  ctx.lineTo(278, 546);
  ctx.closePath();
  ctx.fill();
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
  market: {
    paint: paintMarket,
    diffs: [
      { id: 'moon-flip', x: 92, y: 84, r: 28, label: 'The crescent moon flipped over' },
      { id: 'star-extra', x: 472, y: 64, r: 22, label: 'A new star lit up' },
      { id: 'lantern-colour', x: 405, y: 122, r: 27, label: 'A lantern changed colour' },
      { id: 'cat-missing', x: 330, y: 282, r: 27, label: 'The rooftop cat slipped away' },
      { id: 'awning-colour', x: 300, y: 404, r: 40, label: 'An awning changed colour' },
      { id: 'fruit-count', x: 104, y: 452, r: 32, label: 'Two oranges went missing' },
      { id: 'banner-missing', x: 533, y: 469, r: 28, label: 'A banner was taken down' },
    ],
  },
  reef: {
    paint: paintReef,
    diffs: [
      { id: 'fish-missing', x: 196, y: 126, r: 24, label: 'One fish left the school' },
      { id: 'bubbles-extra', x: 430, y: 156, r: 27, label: 'A new bubble cluster rose' },
      { id: 'fish-colour', x: 330, y: 238, r: 40, label: 'The big fish changed colour' },
      { id: 'seahorse-colour', x: 140, y: 300, r: 27, label: 'The seahorse changed colour' },
      { id: 'turtle-spots', x: 452, y: 372, r: 40, label: "The turtle's shell spots vanished" },
      { id: 'coral-colour', x: 88, y: 452, r: 37, label: 'The coral changed colour' },
      { id: 'seaweed-short', x: 568, y: 436, r: 34, label: 'The tall seaweed was trimmed' },
      { id: 'crab-claw', x: 492, y: 524, r: 28, label: "The crab's big claw shrank" },
      { id: 'shell-open', x: 250, y: 552, r: 27, label: 'The clam opened on a pearl' },
    ],
  },
  workshop: {
    paint: paintWorkshop,
    diffs: [
      { id: 'window-star', x: 152, y: 122, r: 24, label: 'A bright star winked out' },
      { id: 'clock-hands', x: 300, y: 128, r: 44, label: 'The clock jumped fifteen minutes' },
      { id: 'gear-colour', x: 452, y: 108, r: 37, label: 'The big gear turned copper' },
      { id: 'jar-missing', x: 122, y: 248, r: 25, label: 'A jar left the shelf' },
      { id: 'book-colour', x: 484, y: 261, r: 23, label: 'A book spine changed colour' },
      { id: 'lamp-off', x: 132, y: 348, r: 31, label: 'The bench lamp went dark' },
      { id: 'steam-missing', x: 252, y: 340, r: 25, label: "The teapot's steam stopped" },
      { id: 'tool-missing', x: 420, y: 384, r: 27, label: 'The wrench went missing' },
      { id: 'rug-colour', x: 300, y: 546, r: 40, label: 'The rug changed colour' },
    ],
  },
};
