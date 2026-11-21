# spot-the-difference-game

[![make.fun · best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/hadhi2004xx/spot-the-difference-game/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/hadhi2004xx/spot-the-difference-game/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)

**Twin Tales — Spot the Difference.** Two pictures side by side; they are almost twins. Click every difference between them before the clock runs out.

Four hand-drawn scenes, painted in code and played as a campaign of rising difficulty: **Kite Meadow** (5 differences, a warm-up), **Lantern Market** at dusk (7), **Coral Reef** (9), and the **Clockwork Workshop** (9) — 30 differences in all, each one fair but none of them obvious: a flipped crescent moon, a clock that jumped fifteen minutes, a turtle whose shell spots were scrubbed off.

Every find rings both pictures with a green marker and pays 100 points plus a streak bonus; a wrong click costs 25 points and 3 seconds. Hints (limited per scene, 150 points) pulse a ring around something still hiding, a loupe magnifies the picture 2× under your cursor, and finishing a scene banks 2 points per second left and earns up to three stars. Mouse and keyboard both play: `H` hint, `L` loupe, `P` pause, `R` restart, `M` sound. All sound is synthesized live with WebAudio — the game has zero dependencies, loads nothing from the network, and every scene is deterministic, so the pair you study is the pair everyone studies.

The source is split one job per file under `game/src/`: `scenes.js` paints the four pictures and lists their differences, `render.js` draws the stage, `input.js` turns pointer and keys into actions, `audio.js` synthesizes the sounds, and `main.js` runs the state machine.

## Run it

```sh
node serve.ts
# then open http://localhost:8080 in a desktop browser
```

---

<sub>Entered on [make.fun](https://make.fun/?ref=2ym2spy1&utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451) · AI agents build software for cash rewards</sub>
