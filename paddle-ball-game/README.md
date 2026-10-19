# 🏓 Paddle Ball

A browser-based **Breakout-style paddle-ball game**, built the **spec-driven** way
(the same workflow as Kiro's sample apps): requirements → design → tasks, then
implementation that traces back to each requirement.

Built with **React 18 + Vite + HTML5 Canvas**. The physics engine is pure,
framework-free JavaScript, so it is unit-tested without a browser.

---

## Gameplay

Move the paddle, launch the ball, and clear every brick without dropping it.
You get **3 lives**. Top rows of bricks are worth more points.

| Action | Keys |
| --- | --- |
| Move paddle | `←` / `→`, or `A` / `D`, or **mouse / touch** |
| Launch ball | `Space` or **click** |
| Pause / resume | `P` or `Esc` |
| Restart | button on the Game Over / Win screen |

---

## Spec-driven development

This project is driven by three spec documents in
[`.kiro/specs/paddle-ball-game/`](.kiro/specs/paddle-ball-game/):

1. **[`requirements.md`](.kiro/specs/paddle-ball-game/requirements.md)** — user
   stories and acceptance criteria in **EARS** format
   (`WHEN <trigger> THE SYSTEM SHALL <response>`).
2. **[`design.md`](.kiro/specs/paddle-ball-game/design.md)** — architecture,
   module interfaces, the game loop, collision strategy, and testing approach.
3. **[`tasks.md`](.kiro/specs/paddle-ball-game/tasks.md)** — the implementation
   plan as a checklist, each task citing the requirement(s) it fulfills.

The flow: write the requirements, agree on the design, break it into tasks, then
implement task by task. Every code module maps back to a requirement, and the
tests assert the acceptance criteria directly (see the `Req X.Y` references in
the test files).

---

## Getting started

Requires **Node.js 20+**.

```bash
npm install      # install dependencies
npm run dev      # start the dev server (http://localhost:5173)
```

Then open the printed URL and click **Launch Ball**.

### Other commands

```bash
npm run build    # production build into dist/
npm run preview  # serve the production build locally
npm run test     # run the unit tests once (Vitest)
npm run test:watch
```

---

## Project structure

```
paddle-ball-game/
├─ .kiro/
│  └─ specs/paddle-ball-game/
│     ├─ requirements.md      # EARS acceptance criteria
│     ├─ design.md            # architecture + interfaces
│     └─ tasks.md             # implementation checklist
├─ index.html
├─ package.json
├─ vite.config.js
└─ src/
   ├─ main.jsx                # React entry
   ├─ App.jsx                 # app shell
   ├─ Game.jsx                # canvas + rAF loop + input + overlays (React)
   ├─ renderer.js             # draws engine state onto the 2D context
   ├─ index.css
   └─ engine/                 # pure, framework-free game logic
      ├─ config.js            # tunable constants
      ├─ entities.js          # paddle / ball / brick factories
      ├─ physics.js           # collisions + reflection (pure)
      ├─ game.js              # state machine + update(dt)
      ├─ physics.test.js      # unit tests
      └─ game.test.js         # unit tests
```

### Why engine code is separate from React

`src/engine/` has no imports of React or the DOM. React (`Game.jsx`) only owns
the canvas element, the animation-frame loop, input listeners, and the
overlays. This keeps the simulation:

- **testable** — physics and state transitions run under Vitest in plain Node;
- **portable** — the same engine could drive a different renderer;
- **predictable** — the game loop is delta-timed and frame-rate independent, with
  `dt` clamped so a backgrounded tab can't tunnel the ball through bricks.

---

## How it maps to the requirements

| Requirement | Where it lives |
| --- | --- |
| R1 Paddle control | `Game.jsx` (input), `game.js` `update()` (clamp) |
| R2 Ball physics | `physics.js` (`reflectWalls`, `paddleBounce`, `brickCollision`, `normalizeSpeed`) |
| R3 Bricks & scoring | `entities.js` `createBricks`, `game.js` scoring + win check |
| R4 Lives & game over | `game.js` `loseLife`, `ballIsLost` |
| R5 State & controls | `game.js` state machine, `Game.jsx` overlays |
| R6 Rendering | `renderer.js`, `Game.jsx` rAF loop, reduced-motion CSS |

---

## Tuning the game

All the knobs live in [`src/engine/config.js`](src/engine/config.js): field size,
paddle speed, ball speed, brick grid (rows, columns, colors, point values), and
starting lives. Change a value, save, and the dev server hot-reloads.

---

## License

MIT — do whatever you like.
