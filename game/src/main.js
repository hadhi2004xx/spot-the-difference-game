// Twin Tales — the game itself: the state machine and the loop. Owns the campaign (the
// levels whose scenes exist), the live level (found set, clock, streak, score), the pointer
// and the animation clock, and turns taps and keys into finds, misses, hints and screen
// changes. Drawing is render.js; sound is audio.js; the scenes are scenes.js.

import { LEVELS, SCORE } from './config.js';
import { SCENES } from './scenes.js';
import { attachInput } from './input.js';
import { drawGame, hitTargets, starsFor } from './render.js';
import {
  isMuted, playClick, playFind, playHint, playLose, playMiss, playTick, playWin, toggleMuted,
} from './audio.js';
import { stageShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const statusLine = document.getElementById('status');

/** The campaign: the level table joined to the scenes that exist, in order. */
const campaign = LEVELS
  .filter((meta) => SCENES[meta.scene])
  .map((meta) => ({ meta, scene: SCENES[meta.scene] }));

const state = {
  screen: 'title',
  campaign,
  levelIndex: 0,
  totalScore: 0,
  results: campaign.map(() => null),
  level: null,
  anims: [],
  pointer: null,
  hover: null,
  loupeOn: false,
  muted: false,
  frozen: false,
  titlePanels: null,
};

/** Paint one panel of a scene into an offscreen canvas (panels never change mid-level). */
export function paintPanel(scene, applied) {
  const panel = document.createElement('canvas');
  panel.width = 600;
  panel.height = 600;
  scene.paint(panel.getContext('2d'), applied);
  return panel;
}

/** Start (or restart) a campaign level with a fresh clock, streak and pair of panels. */
export function startLevel(index) {
  const entry = campaign[index];
  state.levelIndex = index;
  const applied = new Set(entry.scene.diffs.map((diff) => diff.id));
  state.level = {
    scene: entry.scene,
    diffs: entry.scene.diffs,
    found: new Set(),
    mistakes: 0,
    hintsLeft: entry.meta.hints,
    hintsUsed: 0,
    timeLeft: entry.meta.seconds,
    seconds: entry.meta.seconds,
    streak: 0,
    bestStreak: 0,
    score: 0,
    hint: null,
    panels: { left: paintPanel(entry.scene, new Set()), right: paintPanel(entry.scene, applied) },
    lastTickSecond: Math.ceil(entry.meta.seconds),
  };
  state.anims = [];
  state.screen = 'playing';
  announce(`${entry.meta.name}: find ${entry.scene.diffs.length} differences in ${entry.meta.seconds} seconds.`);
}

/** Say what just happened, for screen readers. */
function announce(message) {
  statusLine.textContent = message;
}

/** A click inside a panel: a find, a re-click on a found marker (ignored), or a miss. */
function tapPanel(panel, now) {
  const level = state.level;
  for (const diff of level.diffs) {
    const distance = Math.hypot(panel.x - diff.x, panel.y - diff.y);
    if (distance > diff.r) continue;
    if (level.found.has(diff.id)) return;
    level.found.add(diff.id);
    level.streak += 1;
    level.bestStreak = Math.max(level.bestStreak, level.streak);
    const points = SCORE.find + (level.streak - 1) * SCORE.streakStep;
    level.score += points;
    state.anims.push({ kind: 'pop', id: diff.id, at: now });
    state.anims.push({ kind: 'score', side: panel.side, x: diff.x, y: diff.y, at: now, label: `+${points}` });
    playFind();
    const left = level.diffs.length - level.found.size;
    announce(left === 0 ? `Found it: ${diff.label}. That was the last one!` : `Found it: ${diff.label}. ${left} to go.`);
    if (left === 0) completeLevel();
    return;
  }
  level.mistakes += 1;
  level.streak = 0;
  level.score = Math.max(0, level.score - SCORE.mistakePoints);
  level.timeLeft = Math.max(0, level.timeLeft - SCORE.mistakeSeconds);
  state.anims.push({ kind: 'miss', side: panel.side, x: panel.x, y: panel.y, at: now });
  playMiss();
  announce(`Not a difference. ${SCORE.mistakeSeconds} seconds lost.`);
}

/** All differences found: bank the time bonus, record the result, show the clear card. */
function completeLevel() {
  const level = state.level;
  level.score += Math.round(level.timeLeft) * SCORE.secondBonus;
  state.totalScore += level.score;
  state.results[state.levelIndex] = { stars: starsFor(level), score: level.score };
  state.screen = 'levelComplete';
  playWin();
}

/** Spend a hint: a pulsing ring around one unfound difference, for points. */
function useHint(now) {
  const level = state.level;
  if (level.hintsLeft <= 0) return;
  const unfound = level.diffs.filter((diff) => !level.found.has(diff.id));
  if (unfound.length === 0) return;
  const diff = unfound[Math.floor(Math.random() * unfound.length)];
  level.hintsLeft -= 1;
  level.hintsUsed += 1;
  level.score = Math.max(0, level.score - SCORE.hintCost);
  level.hint = { x: diff.x, y: diff.y, at: now, until: now + 2400 };
  playHint();
  announce('A hint glimmers somewhere on the pictures.');
}

/** Run a named action (a button id or a key action) against the current screen. */
function runAction(id, now) {
  if (id === 'mute') {
    state.muted = toggleMuted();
    return;
  }
  if (state.screen === 'title') {
    if (id === 'start' || id === 'confirm') {
      const firstOpen = state.results.findIndex((result) => result === null);
      startLevel(firstOpen === -1 ? 0 : firstOpen);
    } else if (id.startsWith('level-')) {
      startLevel(Number(id.split('-')[1]));
    }
    return;
  }
  if (state.screen === 'playing') {
    if (id === 'hint') useHint(now);
    else if (id === 'loupe') { state.loupeOn = !state.loupeOn; playClick(); }
    else if (id === 'pause') state.screen = 'paused';
    else if (id === 'restart') startLevel(state.levelIndex);
    else if (id === 'title') state.screen = 'title';
    return;
  }
  if (state.screen === 'paused') {
    if (id === 'resume' || id === 'pause' || id === 'confirm') state.screen = 'playing';
    else if (id === 'restart') startLevel(state.levelIndex);
    else if (id === 'title') state.screen = 'title';
    return;
  }
  if (state.screen === 'levelComplete') {
    if (id === 'next') startLevel(state.levelIndex + 1);
    else if (id === 'finish') state.screen = 'campaignComplete';
    else if (id === 'restart') { state.totalScore -= state.level.score; state.results[state.levelIndex] = null; startLevel(state.levelIndex); }
    else if (id === 'title') state.screen = 'title';
    return;
  }
  if (state.screen === 'timeUp') {
    if (id === 'restart' || id === 'confirm') startLevel(state.levelIndex);
    else if (id === 'title') state.screen = 'title';
    return;
  }
  if (state.screen === 'campaignComplete') {
    if (id === 'again' || id === 'confirm') {
      state.totalScore = 0;
      state.results = campaign.map(() => null);
      startLevel(0);
    } else if (id === 'title') state.screen = 'title';
  }
}

attachInput(canvas, {
  onTap(point, panel) {
    const now = performance.now();
    for (const target of hitTargets(state)) {
      if (point.x >= target.x && point.x <= target.x + target.w && point.y >= target.y && point.y <= target.y + target.h) {
        if (!target.disabled) runAction(target.id, now);
        return;
      }
    }
    if (state.screen === 'playing' && panel) tapPanel(panel, now);
  },
  onMove(point, panel) {
    state.pointer = point;
    state.hover = panel;
  },
  onKey(action) {
    runAction(action, performance.now());
  },
});

// The title screen shows the first scene's real pair as its miniature.
if (campaign.length > 0) {
  const scene = campaign[0].scene;
  state.titlePanels = {
    left: paintPanel(scene, new Set()),
    right: paintPanel(scene, new Set(scene.diffs.map((diff) => diff.id))),
  };
}

// A ?shot= page is a staged, frozen frame for the maker's screenshots.
const shot = new URLSearchParams(window.location.search).get('shot');
if (shot) {
  stageShot(shot, state, startLevel);
  state.frozen = true;
}

let previous = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - previous) / 1000);
  previous = now;
  if (state.screen === 'playing' && !state.frozen && state.level) {
    const level = state.level;
    level.timeLeft = Math.max(0, level.timeLeft - dt);
    const second = Math.ceil(level.timeLeft);
    if (second !== level.lastTickSecond) {
      level.lastTickSecond = second;
      if (second <= 10 && second > 0) playTick();
    }
    if (level.timeLeft <= 0) {
      state.screen = 'timeUp';
      playLose();
      announce("Time's up.");
    }
  }
  state.anims = state.anims.filter((anim) => now - anim.at < 1000);
  drawGame(ctx, state, now);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
