// Drawing primitives shared by every scene painter in scenes.js: skies, clouds, trees,
// kites, lanterns, fish, gears and the small props the differences hide among. Each helper
// draws one thing at a position and scale in the scene's 600x600 space and holds no state,
// so a scene is the same picture every time it is painted.

/** Fill the whole scene with a vertical gradient of colour stops [[at, colour], ...]. */
export function sky(ctx, stops) {
  const gradient = ctx.createLinearGradient(0, 0, 0, 600);
  for (const [at, colour] of stops) gradient.addColorStop(at, colour);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 600, 600);
}

/** A filled circle. */
export function disc(ctx, x, y, radius, colour) {
  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

/** A soft radial glow (lantern light, lamp light, sun halo). */
export function glow(ctx, x, y, radius, colour) {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, colour);
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
}

/** A rounded rectangle path (not filled): callers set fill/stroke. */
export function roundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

/** A fluffy cloud: a row of overlapping circles on a flat base, `scale` about 60px wide. */
export function cloud(ctx, x, y, scale, colour) {
  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.arc(x, y, 22 * scale, Math.PI * 0.95, Math.PI * 1.95);
  ctx.arc(x + 24 * scale, y - 10 * scale, 28 * scale, Math.PI, Math.PI * 2);
  ctx.arc(x + 52 * scale, y, 20 * scale, Math.PI * 1.05, Math.PI * 2.02);
  ctx.closePath();
  ctx.fill();
  ctx.fillRect(x - 20 * scale, y - 2 * scale, 92 * scale, 8 * scale);
}

/** A simple bird in flight: two arcs meeting at the body. */
export function bird(ctx, x, y, scale, colour) {
  ctx.strokeStyle = colour;
  ctx.lineWidth = 3 * scale;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(x - 9 * scale, y, 9 * scale, Math.PI * 1.15, Math.PI * 1.85);
  ctx.arc(x + 9 * scale, y, 9 * scale, Math.PI * 1.15, Math.PI * 1.85);
  ctx.stroke();
}

/** A four-point sparkle star, for night skies and windows. */
export function sparkle(ctx, x, y, radius, colour) {
  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.moveTo(x, y - radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.quadraticCurveTo(x, y, x, y + radius);
  ctx.quadraticCurveTo(x, y, x - radius, y);
  ctx.quadraticCurveTo(x, y, x, y - radius);
  ctx.fill();
}

/** A round tree: layered leaf circles on a tapered trunk. `apples` dots fruit in the leaves. */
export function tree(ctx, x, y, scale, leaf, trunk, apples) {
  ctx.fillStyle = trunk;
  ctx.beginPath();
  ctx.moveTo(x - 7 * scale, y);
  ctx.lineTo(x - 3 * scale, y - 52 * scale);
  ctx.lineTo(x + 3 * scale, y - 52 * scale);
  ctx.lineTo(x + 7 * scale, y);
  ctx.closePath();
  ctx.fill();
  disc(ctx, x, y - 74 * scale, 40 * scale, leaf);
  disc(ctx, x - 30 * scale, y - 56 * scale, 28 * scale, leaf);
  disc(ctx, x + 30 * scale, y - 56 * scale, 28 * scale, leaf);
  if (apples) {
    const spots = [[-16, -84], [12, -92], [26, -64], [-30, -58], [2, -70]];
    for (const [dx, dy] of spots) disc(ctx, x + dx * scale, y + dy * scale, 5 * scale, '#e2483d');
  }
}

/** A diamond kite with a cross spar and a tail of bows. */
export function kite(ctx, x, y, scale, body, tail) {
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.moveTo(x, y - 34 * scale);
  ctx.lineTo(x + 24 * scale, y);
  ctx.lineTo(x, y + 40 * scale);
  ctx.lineTo(x - 24 * scale, y);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(60,40,20,0.55)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y - 34 * scale);
  ctx.lineTo(x, y + 40 * scale);
  ctx.moveTo(x - 24 * scale, y);
  ctx.lineTo(x + 24 * scale, y);
  ctx.stroke();
  ctx.strokeStyle = tail;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y + 40 * scale);
  ctx.quadraticCurveTo(x + 8 * scale, y + 62 * scale, x - 4 * scale, y + 84 * scale);
  ctx.stroke();
  ctx.fillStyle = tail;
  for (const t of [0.3, 0.55, 0.8]) {
    const bx = x + 4 * scale * Math.sin(t * 5);
    const by = y + 40 * scale + 44 * scale * t;
    ctx.beginPath();
    ctx.moveTo(bx - 6 * scale, by);
    ctx.lineTo(bx + 6 * scale, by);
    ctx.lineTo(bx, by + 7 * scale);
    ctx.closePath();
    ctx.fill();
  }
}

/** A five-petal flower on a short stem. */
export function flower(ctx, x, y, scale, petal, centre) {
  ctx.strokeStyle = '#3f7d33';
  ctx.lineWidth = 2.5 * scale;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y - 12 * scale);
  ctx.stroke();
  ctx.fillStyle = petal;
  for (let index = 0; index < 5; index += 1) {
    const angle = (index / 5) * Math.PI * 2 - Math.PI / 2;
    disc(ctx, x + Math.cos(angle) * 6 * scale, y - 12 * scale + Math.sin(angle) * 6 * scale, 4.6 * scale, petal);
  }
  disc(ctx, x, y - 12 * scale, 3.6 * scale, centre);
}

/** A paper lantern: a ribbed rounded body with caps, hanging from `topY` by a cord. */
export function lantern(ctx, x, topY, width, height, colour, lit) {
  ctx.strokeStyle = 'rgba(20,16,30,0.7)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, topY);
  ctx.lineTo(x, topY + 14);
  ctx.stroke();
  const y = topY + 14;
  if (lit) glow(ctx, x, y + height / 2, width * 1.15, 'rgba(255,176,66,0.35)');
  ctx.fillStyle = colour;
  roundedRect(ctx, x - width / 2, y, width, height, width / 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.25)';
  ctx.lineWidth = 1.5;
  for (const t of [0.3, 0.5, 0.7]) {
    ctx.beginPath();
    ctx.moveTo(x - width / 2 + 3, y + height * t);
    ctx.lineTo(x + width / 2 - 3, y + height * t);
    ctx.stroke();
  }
  ctx.fillStyle = '#2b2135';
  ctx.fillRect(x - width * 0.28, y - 5, width * 0.56, 6);
  ctx.fillRect(x - width * 0.28, y + height - 1, width * 0.56, 6);
}

/** A fish pointing `dir` (1 right, -1 left): ellipse body, triangle tail, one eye. */
export function fish(ctx, x, y, scale, colour, dir) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(dir * scale, scale);
  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.ellipse(0, 0, 26, 13, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-22, 0);
  ctx.lineTo(-38, -11);
  ctx.lineTo(-38, 11);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-2, -11);
  ctx.quadraticCurveTo(6, -20, 14, -10);
  ctx.closePath();
  ctx.fill();
  disc(ctx, 14, -3, 3, '#10222e');
  ctx.restore();
}

/** A bubble: a pale ring with a highlight. */
export function bubble(ctx, x, y, radius) {
  ctx.strokeStyle = 'rgba(190,230,255,0.75)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.beginPath();
  ctx.arc(x - radius * 0.35, y - radius * 0.35, radius * 0.22, 0, Math.PI * 2);
  ctx.fill();
}

/** A gear: a toothed wheel with a hub hole, rotated by `turn` radians. */
export function gear(ctx, x, y, radius, teeth, colour, turn) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(turn);
  ctx.fillStyle = colour;
  const toothDepth = radius * 0.22;
  ctx.beginPath();
  for (let index = 0; index < teeth; index += 1) {
    const a0 = (index / teeth) * Math.PI * 2;
    const a1 = ((index + 0.38) / teeth) * Math.PI * 2;
    const a2 = ((index + 0.5) / teeth) * Math.PI * 2;
    const a3 = ((index + 0.88) / teeth) * Math.PI * 2;
    ctx.lineTo(Math.cos(a0) * (radius + toothDepth), Math.sin(a0) * (radius + toothDepth));
    ctx.lineTo(Math.cos(a1) * (radius + toothDepth), Math.sin(a1) * (radius + toothDepth));
    ctx.lineTo(Math.cos(a2) * radius, Math.sin(a2) * radius);
    ctx.lineTo(Math.cos(a3) * radius, Math.sin(a3) * radius);
  }
  ctx.closePath();
  ctx.fill();
  disc(ctx, 0, 0, radius * 0.34, '#241f1d');
  disc(ctx, 0, 0, radius * 0.16, colour);
  ctx.restore();
}

/** A crescent moon: a disc with the sky's shadow disc offset over it. */
export function crescent(ctx, x, y, radius, colour, shadowColour, flip) {
  disc(ctx, x, y, radius, colour);
  disc(ctx, x + flip * radius * 0.45, y - radius * 0.18, radius * 0.86, shadowColour);
}
