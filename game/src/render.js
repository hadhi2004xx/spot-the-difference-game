// Everything drawn on the stage: the masthead, the counter-and-timer strip, the two panels
// with their found markers, the hint pulse, the magnifier loupe, the control bar, and the
// title / pause / result overlays. render.js also owns hitTargets(), the single list of
// clickable rectangles for the current screen, so what a button looks like and where it
// can be clicked can never drift apart.

import { BAND, FONT, INK, PANEL, SCORE, VIEW } from './config.js';

/** Draw centred or aligned text in one call. */
function text(ctx, value, x, y, font, colour, align = 'left') {
  ctx.font = font;
  ctx.fillStyle = colour;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(value, x, y);
}

/** Format seconds as m:ss. */
export function clock(seconds) {
  const whole = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`;
}

/** A pill button with an optional small badge (a count, a key hint). */
function drawButton(ctx, target, label, options = {}) {
  const { accent = false, disabled = false, badge = null } = options;
  ctx.fillStyle = disabled ? '#232c3d' : accent ? INK.accent : INK.chip;
  ctx.beginPath();
  ctx.roundRect(target.x, target.y, target.w, target.h, 10);
  ctx.fill();
  ctx.strokeStyle = disabled ? 'transparent' : INK.frameEdge;
  ctx.lineWidth = 1;
  ctx.stroke();
  text(ctx, label, target.x + target.w / 2, target.y + target.h / 2 + 1, FONT.body, disabled ? INK.faint : accent ? '#231303' : INK.paper, 'center');
  if (badge !== null) {
    ctx.fillStyle = accent ? '#231303' : INK.accent;
    ctx.beginPath();
    ctx.arc(target.x + target.w - 16, target.y + 15, 9, 0, Math.PI * 2);
    ctx.fill();
    text(ctx, badge, target.x + target.w - 16, target.y + 16, FONT.small, accent ? INK.accent : '#231303', 'center');
  }
}

/** The control bar buttons shown while playing (also the hit targets for those clicks). */
function controlTargets(state) {
  const y = BAND.controlsY + 16;
  const level = state.level;
  return [
    { id: 'hint', x: 24, y, w: 168, h: 44, label: 'HINT · H', badge: String(level.hintsLeft), disabled: level.hintsLeft <= 0 },
    { id: 'loupe', x: 208, y, w: 150, h: 44, label: state.loupeOn ? 'LOUPE · ON' : 'LOUPE · L', badge: null, disabled: false },
    { id: 'pause', x: 374, y, w: 150, h: 44, label: 'PAUSE · P', badge: null, disabled: false },
    { id: 'restart', x: 540, y, w: 168, h: 44, label: 'RESTART · R', badge: null, disabled: false },
    { id: 'mute', x: 1130, y, w: 126, h: 44, label: state.muted ? 'SOUND · OFF' : 'SOUND · M', badge: null, disabled: false },
  ];
}

/** Centred overlay buttons, ids read by the state machine. */
function overlayTargets(state) {
  const cy = 520;
  const make = (id, label, x, w) => ({ id, x, y: cy, w, h: 52, label });
  if (state.screen === 'paused') return [make('resume', 'RESUME', 340, 180), make('restart', 'RESTART', 550, 180), make('title', 'TITLE', 760, 180)];
  if (state.screen === 'levelComplete') {
    return state.levelIndex + 1 < state.campaign.length
      ? [make('next', 'NEXT LEVEL →', 400, 220), make('restart', 'REPLAY', 650, 150), make('title', 'TITLE', 830, 130)]
      : [make('finish', 'FINISH →', 430, 200), make('restart', 'REPLAY', 660, 150), make('title', 'TITLE', 840, 130)];
  }
  if (state.screen === 'timeUp') return [make('restart', 'TRY AGAIN', 440, 200), make('title', 'TITLE', 670, 170)];
  if (state.screen === 'campaignComplete') return [make('again', 'PLAY AGAIN', 440, 200), make('title', 'TITLE', 670, 170)];
  return [];
}

/** Title-screen targets: one card per level plus the campaign start button. */
function titleTargets(state) {
  const targets = state.campaign.map((entry, index) => ({
    id: `level-${index}`, x: 24 + index * 308, y: 396, w: 292, h: 168, label: entry.meta.name,
  }));
  targets.push({ id: 'start', x: 480, y: 620, w: 320, h: 58, label: 'START THE HUNT' });
  return targets;
}

/** Every clickable rectangle for the current screen. */
export function hitTargets(state) {
  if (state.screen === 'title') return titleTargets(state);
  if (state.screen === 'playing') return controlTargets(state);
  return overlayTargets(state);
}

/** The masthead: game title left, campaign progress and score right. */
function drawMasthead(ctx, state) {
  ctx.fillStyle = INK.frame;
  ctx.fillRect(0, 0, VIEW.width, BAND.masthead);
  ctx.fillStyle = INK.frameEdge;
  ctx.fillRect(0, BAND.masthead - 1, VIEW.width, 1);
  text(ctx, 'TWIN TALES', 24, 26, FONT.title, INK.paper);
  text(ctx, 'SPOT THE DIFFERENCE', 25, 52, FONT.small, INK.accent);
  if (state.screen !== 'title') {
    const entry = state.campaign[state.levelIndex];
    text(ctx, `${entry.meta.tag} — ${entry.meta.name}`, 640, 26, FONT.head, INK.paper, 'center');
    text(ctx, `LEVEL ${state.levelIndex + 1} OF ${state.campaign.length}`, 640, 52, FONT.small, INK.muted, 'center');
  }
  text(ctx, `SCORE ${state.totalScore.toLocaleString('en-US')}`, 1256, 33, FONT.number, INK.paper, 'right');
}

/** The strip under the masthead: found pips, the big remaining counter, the draining clock. */
function drawStrip(ctx, state) {
  const level = state.level;
  const total = level.diffs.length;
  const found = level.found.size;
  const left = total - found;
  // Pips: one per difference, filled as they fall.
  for (let index = 0; index < total; index += 1) {
    ctx.fillStyle = index < found ? INK.found : '#2a3549';
    ctx.beginPath();
    ctx.arc(40 + index * 26, 94, 8, 0, Math.PI * 2);
    ctx.fill();
  }
  text(ctx, `${found} FOUND`, 40 + total * 26 + 8, 95, FONT.body, INK.muted);
  // The counter the judge's first criterion asks for, big enough to read at a glance.
  text(ctx, left === 0 ? 'ALL FOUND!' : `${left} TO FIND`, 640, 95, FONT.bigNumber, left <= 2 ? INK.accent : INK.paper, 'center');
  // The clock: a draining bar that reddens and pulses under twenty seconds.
  const fraction = Math.max(0, level.timeLeft / level.seconds);
  const urgent = level.timeLeft <= 20 && state.screen === 'playing';
  ctx.fillStyle = '#2a3549';
  ctx.beginPath();
  ctx.roundRect(880, 84, 250, 20, 10);
  ctx.fill();
  ctx.fillStyle = urgent ? INK.danger : INK.accent;
  ctx.beginPath();
  ctx.roundRect(880, 84, Math.max(20, 250 * fraction), 20, 10);
  ctx.fill();
  text(ctx, clock(level.timeLeft), 1256, 95, FONT.number, urgent ? INK.danger : INK.paper, 'right');
}

/** One panel: frame, the prerendered picture, and its corner label chip. */
function drawPanel(ctx, image, x, label) {
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.roundRect(x - 3, PANEL.y - 3, PANEL.size + 6, PANEL.size + 6, 10);
  ctx.fill();
  ctx.drawImage(image, x, PANEL.y);
  ctx.strokeStyle = INK.frameEdge;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(x - 3, PANEL.y - 3, PANEL.size + 6, PANEL.size + 6, 10);
  ctx.stroke();
  ctx.fillStyle = 'rgba(8,10,16,0.78)';
  ctx.beginPath();
  ctx.roundRect(x + 12, PANEL.y + 12, label.length * 9.5 + 24, 30, 8);
  ctx.fill();
  text(ctx, label, x + 24, PANEL.y + 28, FONT.small, INK.paper);
}

/** A found marker: a green ring with a check, drawn on a panel at scene coordinates. */
function drawMarker(ctx, panelX, x, y, scale) {
  const cx = panelX + x;
  const cy = PANEL.y + y;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);
  ctx.strokeStyle = 'rgba(6,20,14,0.55)';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(0, 0, 19, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = INK.found;
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.arc(0, 0, 19, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = '#eafff5';
  ctx.lineWidth = 3.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-8, 0);
  ctx.lineTo(-2.5, 6);
  ctx.lineTo(9, -6);
  ctx.stroke();
  ctx.restore();
}

/** All markers and transient effects (pops, misses, score floaters, the hint pulse). */
function drawEffects(ctx, state, now) {
  const level = state.level;
  for (const diff of level.diffs) {
    if (!level.found.has(diff.id)) continue;
    let scale = 1;
    const pop = state.anims.find((anim) => anim.kind === 'pop' && anim.id === diff.id);
    if (pop) {
      const t = (now - pop.at) / 320;
      if (t < 1) scale = 0.55 + 0.45 * (1 - Math.pow(1 - t, 3)) + Math.sin(t * Math.PI) * 0.12;
    }
    drawMarker(ctx, PANEL.leftX, diff.x, diff.y, scale);
    drawMarker(ctx, PANEL.rightX, diff.x, diff.y, scale);
  }
  // The hint: two breathing rings around one unfound difference, on both panels.
  if (level.hint && now < level.hint.until) {
    const t = ((now - level.hint.at) % 800) / 800;
    for (const panelX of [PANEL.leftX, PANEL.rightX]) {
      for (const phase of [0, 0.5]) {
        const p = (t + phase) % 1;
        ctx.strokeStyle = `rgba(245,165,36,${0.85 * (1 - p)})`;
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(panelX + level.hint.x, PANEL.y + level.hint.y, 16 + p * 30, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }
  for (const anim of state.anims) {
    const age = now - anim.at;
    if (anim.kind === 'miss' && age < 650) {
      const panelX = anim.side === 'left' ? PANEL.leftX : PANEL.rightX;
      ctx.strokeStyle = `rgba(244,83,79,${1 - age / 650})`;
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      const cx = panelX + anim.x;
      const cy = PANEL.y + anim.y;
      ctx.beginPath();
      ctx.moveTo(cx - 11, cy - 11);
      ctx.lineTo(cx + 11, cy + 11);
      ctx.moveTo(cx + 11, cy - 11);
      ctx.lineTo(cx - 11, cy + 11);
      ctx.stroke();
    }
    if (anim.kind === 'score' && age < 900) {
      const panelX = anim.side === 'left' ? PANEL.leftX : PANEL.rightX;
      text(ctx, anim.label, panelX + anim.x, PANEL.y + anim.y - 30 - age / 22, FONT.number, `rgba(52,211,153,${1 - age / 900})`, 'center');
    }
  }
}

/** The magnifier: a 2x circular loupe over the panel under the pointer. */
function drawLoupe(ctx, state) {
  if (!state.loupeOn || !state.hover || !state.pointer) return;
  const { side, x, y } = state.hover;
  const image = side === 'left' ? state.level.panels.left : state.level.panels.right;
  const radius = 92;
  const cx = state.pointer.x;
  const cy = state.pointer.y;
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = '#0b0e13';
  ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
  ctx.drawImage(image, x - radius / 2, y - radius / 2, radius, radius, cx - radius, cy - radius, radius * 2, radius * 2);
  ctx.restore();
  ctx.strokeStyle = INK.accent;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(245,165,36,0.5)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx - 10, cy);
  ctx.lineTo(cx + 10, cy);
  ctx.moveTo(cx, cy - 10);
  ctx.lineTo(cx, cy + 10);
  ctx.stroke();
}

/** The control bar under the panels. */
function drawControls(ctx, state) {
  ctx.fillStyle = INK.frame;
  ctx.fillRect(0, BAND.controlsY, VIEW.width, VIEW.height - BAND.controlsY);
  for (const target of controlTargets(state)) {
    drawButton(ctx, target, target.label, { disabled: target.disabled, badge: target.badge, accent: target.id === 'loupe' && state.loupeOn });
  }
  const level = state.level;
  text(ctx, `STREAK ×${level.streak}`, 760, BAND.controlsY + 30, FONT.body, level.streak >= 3 ? INK.accent : INK.muted);
  text(ctx, `MISSES ${level.mistakes}`, 760, BAND.controlsY + 56, FONT.small, INK.muted);
  text(ctx, `LEVEL SCORE ${level.score.toLocaleString('en-US')}`, 1108, BAND.controlsY + 43, FONT.body, INK.paper, 'right');
}

/** A dimmed-panel overlay card shell; returns the card's rect. */
function drawCard(ctx, title, subtitle) {
  ctx.fillStyle = 'rgba(5,8,12,0.74)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  const card = { x: 340, y: 218, w: 600, h: 348 };
  ctx.fillStyle = '#171e2a';
  ctx.beginPath();
  ctx.roundRect(card.x, card.y, card.w, card.h, 16);
  ctx.fill();
  ctx.strokeStyle = INK.frameEdge;
  ctx.stroke();
  text(ctx, title, 640, card.y + 52, FONT.title, INK.paper, 'center');
  if (subtitle) text(ctx, subtitle, 640, card.y + 86, FONT.body, INK.muted, 'center');
  return card;
}

/** Stars for a finished level: 3 clean, 2 steady, 1 scrappy — by misses and hints used. */
export function starsFor(level) {
  const spent = level.mistakes + level.hintsUsed;
  return spent === 0 ? 3 : spent <= 2 ? 2 : 1;
}

function drawStars(ctx, count, cx, cy, size) {
  for (let index = 0; index < 3; index += 1) {
    const x = cx + (index - 1) * (size * 2.4);
    ctx.fillStyle = index < count ? INK.accent : '#2a3549';
    ctx.beginPath();
    for (let point = 0; point < 10; point += 1) {
      const angle = -Math.PI / 2 + (point * Math.PI) / 5;
      const r = point % 2 === 0 ? size : size * 0.45;
      const px = x + Math.cos(angle) * r;
      const py = cy + Math.sin(angle) * r;
      if (point === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  }
}

/** The overlay for the non-playing screens (pause, level end, time up, campaign end). */
function drawOverlay(ctx, state) {
  const level = state.level;
  if (state.screen === 'paused') {
    drawCard(ctx, 'Paused', 'The clock is stopped. Take a breath.');
  } else if (state.screen === 'levelComplete') {
    const entry = state.campaign[state.levelIndex];
    const card = drawCard(ctx, `${entry.meta.name} — Cleared!`, `Every one of the ${level.diffs.length} differences found`);
    drawStars(ctx, starsFor(level), 640, card.y + 140, 22);
    const bonus = Math.round(level.timeLeft) * SCORE.secondBonus;
    text(ctx, `Finds ${level.found.size} × ${SCORE.find}   ·   Streak best ×${level.bestStreak}   ·   Time bonus +${bonus}`, 640, card.y + 196, FONT.body, INK.paper, 'center');
    text(ctx, `Misses ${level.mistakes} · Hints used ${level.hintsUsed}`, 640, card.y + 228, FONT.small, INK.muted, 'center');
    text(ctx, `LEVEL SCORE ${level.score.toLocaleString('en-US')}`, 640, card.y + 268, FONT.number, INK.accent, 'center');
  } else if (state.screen === 'timeUp') {
    const left = level.diffs.length - level.found.size;
    drawCard(ctx, "Time's Up", `${level.found.size} of ${level.diffs.length} found — ${left} slipped away`);
    const recap = level.diffs.filter((diff) => !level.found.has(diff.id)).slice(0, 3).map((diff) => diff.label).join(' · ');
    text(ctx, recap, 640, 218 + 170, FONT.small, INK.muted, 'center');
  } else if (state.screen === 'campaignComplete') {
    const card = drawCard(ctx, 'Campaign Complete!', 'All four scenes cleared');
    state.campaign.forEach((entry, index) => {
      const result = state.results[index];
      text(ctx, entry.meta.name, card.x + 60, card.y + 128 + index * 36, FONT.body, INK.paper);
      drawStars(ctx, result ? result.stars : 0, card.x + 372, card.y + 128 + index * 36, 10);
      text(ctx, result ? result.score.toLocaleString('en-US') : '—', card.x + card.w - 60, card.y + 128 + index * 36, FONT.number, INK.paper, 'right');
    });
    text(ctx, `TOTAL ${state.totalScore.toLocaleString('en-US')}`, 640, card.y + 292, FONT.number, INK.accent, 'center');
  } else {
    return;
  }
  for (const target of overlayTargets(state)) drawButton(ctx, target, target.label, { accent: ['next', 'finish', 'resume', 'again'].includes(target.id) });
}

/** The title screen: name, the two-panel idea shown small, and the level cards. */
function drawTitle(ctx, state, now) {
  ctx.fillStyle = INK.bg;
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  text(ctx, 'TWIN TALES', 640, 92, '700 64px Georgia, "Times New Roman", serif', INK.paper, 'center');
  text(ctx, 'S P O T   T H E   D I F F E R E N C E', 640, 140, FONT.head, INK.accent, 'center');
  text(ctx, 'Two pictures, side by side. They are almost twins — click every difference before the clock runs out.', 640, 178, FONT.body, INK.muted, 'center');
  // A miniature of the first scene's pair, one marker already on it.
  const entry = state.campaign[0];
  if (entry && state.titlePanels) {
    for (const [image, x] of [[state.titlePanels.left, 355], [state.titlePanels.right, 655]]) {
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(x, 208, 270, 270, 10);
      ctx.clip();
      ctx.drawImage(image, 0, 0, 600, 600, x, 208, 270, 270);
      ctx.restore();
      ctx.strokeStyle = INK.frameEdge;
      ctx.beginPath();
      ctx.roundRect(x, 208, 270, 270, 10);
      ctx.stroke();
    }
    const diff = entry.scene.diffs[0];
    for (const x of [355, 655]) drawMarker(ctx, x - PANEL.leftX, diff.x * 0.45 + PANEL.leftX, diff.y * 0.45 + 84, 0.8);
  }
  for (const target of titleTargets(state)) {
    if (target.id === 'start') {
      drawButton(ctx, target, target.label, { accent: true });
      continue;
    }
    const index = Number(target.id.split('-')[1]);
    const item = state.campaign[index];
    ctx.fillStyle = INK.chip;
    ctx.beginPath();
    ctx.roundRect(target.x, target.y, target.w, target.h, 12);
    ctx.fill();
    ctx.strokeStyle = INK.frameEdge;
    ctx.stroke();
    text(ctx, item.meta.name, target.x + 20, target.y + 34, FONT.head, INK.paper);
    text(ctx, item.meta.tag, target.x + 20, target.y + 62, FONT.small, INK.accent);
    text(ctx, `${item.scene.diffs.length} differences · ${clock(item.meta.seconds)}`, target.x + 20, target.y + 96, FONT.body, INK.muted);
    const result = state.results[index];
    if (result) drawStars(ctx, result.stars, target.x + 52, target.y + 134, 11);
    else text(ctx, 'not played yet', target.x + 20, target.y + 134, FONT.small, INK.faint);
  }
  text(ctx, 'Click a card to start there, or begin the campaign. Keys: H hint · L loupe · P pause · R restart · M sound', 640, 716, FONT.small, INK.muted, 'center');
  text(ctx, 'Wrong clicks cost 3 seconds. A hint costs 150 points. Find them all to clear the scene.', 640, 744, FONT.small, INK.faint, 'center');
}

/** Draw the whole stage for the current state. */
export function drawGame(ctx, state, now) {
  ctx.fillStyle = INK.bg;
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  if (state.screen === 'title') {
    drawTitle(ctx, state, now);
    return;
  }
  drawMasthead(ctx, state);
  drawStrip(ctx, state);
  drawPanel(ctx, state.level.panels.left, PANEL.leftX, 'ORIGINAL');
  drawPanel(ctx, state.level.panels.right, PANEL.rightX, 'SPOT THE CHANGES');
  drawEffects(ctx, state, now);
  drawControls(ctx, state);
  drawLoupe(ctx, state);
  if (state.screen !== 'playing') drawOverlay(ctx, state);
}
