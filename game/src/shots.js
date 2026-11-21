// The staged frames behind ?shot=<name>, used to take the entry's screenshots: each one
// sets up a real game state (a level mid-hunt, a cleared campaign) and freezes it, so the
// picture is the game's own render of a moment that real play reaches. Deterministic: the
// same name always stages the same frame.

/**
 * Stage the named shot on `state`. `startLevel` is main.js's level starter; after staging,
 * main.js freezes the clock so the frame holds still for the camera.
 */
export function stageShot(name, state, startLevel) {
  if (name === 'cover') {
    // The cover: the first scene mid-hunt — two differences found and ringed, three still
    // hiding, the counter and a half-drained clock saying the hunt is on.
    startLevel(0);
    const level = state.level;
    level.found.add('kite-colour');
    level.found.add('cloud-moved');
    level.streak = 2;
    level.bestStreak = 2;
    level.score = 215;
    state.totalScore = 215;
    level.timeLeft = 88;
    state.anims.push({ kind: 'pop', id: 'cloud-moved', at: performance.now() - 4000 });
    return;
  }
  if (name === 'victory') {
    // The campaign-complete card, with a believable spread of stars and scores.
    startLevel(0);
    state.results = state.campaign.map((entry, index) => (index === 0 ? { stars: 3, score: state.level.score } : null));
    state.screen = 'campaignComplete';
    return;
  }
  // 'title' and anything else: the title screen as it boots.
  state.screen = 'title';
}
