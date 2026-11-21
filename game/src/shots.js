// The staged frames behind ?shot=<name>, used to take the entry's screenshots: each one
// sets up a real game state (a level mid-hunt, a cleared campaign) and freezes it, so the
// picture is the game's own render of a moment that real play reaches. Deterministic: the
// same name always stages the same frame. shots.json at the repo root lists the set.

/**
 * Stage the named shot on `state`. `startLevel` is main.js's level starter; after staging,
 * main.js freezes the clock so the frame holds still for the camera.
 */
export function stageShot(name, state, startLevel) {
  if (name === 'cover') {
    // The cover: the Lantern Market mid-hunt — three differences found and ringed, four
    // still hiding, the counter and a half-drained clock saying the hunt is on.
    startLevel(1);
    const level = state.level;
    for (const id of ['lantern-colour', 'awning-colour', 'fruit-count']) level.found.add(id);
    level.streak = 3;
    level.bestStreak = 3;
    level.score = 345;
    state.totalScore = 985;
    level.timeLeft = 104;
    return;
  }
  if (name === 'play') {
    // The Coral Reef, two finds in, with a hint ring pulsing around the turtle.
    startLevel(2);
    const level = state.level;
    for (const id of ['fish-colour', 'coral-colour']) level.found.add(id);
    level.streak = 2;
    level.bestStreak = 2;
    level.hintsLeft = 1;
    level.hintsUsed = 1;
    level.score = 65;
    state.totalScore = 1885;
    level.timeLeft = 137;
    const now = performance.now();
    level.hint = { x: 452, y: 372, at: now, until: now + 600000 };
    return;
  }
  if (name === 'victory') {
    // The campaign-complete card, with a believable spread of stars and scores.
    startLevel(3);
    state.results = [
      { stars: 3, score: 640 },
      { stars: 2, score: 1180 },
      { stars: 2, score: 1490 },
      { stars: 3, score: 1830 },
    ];
    state.totalScore = 5140;
    state.screen = 'campaignComplete';
    return;
  }
  // 'title' and anything else: the title screen as it boots.
  state.screen = 'title';
}
