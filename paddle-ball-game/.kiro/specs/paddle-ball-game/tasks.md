# Implementation Plan — Paddle Ball Game

Tasks are ordered so each builds on the last. Check a box when done. Each task
cites the requirement(s) it satisfies.

- [x] 1. Scaffold the Vite + React project
  - `package.json`, `vite.config.js`, `index.html`, entry `src/main.jsx`
  - _Requirements: 6.1, 6.2_

- [x] 2. Define tunable config
  - `src/engine/config.js` with field, paddle, ball, brick grid, lives
  - _Requirements: 3.1, 4.1_

- [x] 3. Build entity factories
  - `src/engine/entities.js`: `createPaddle`, `createBall`, `createBricks`
  - _Requirements: 1.*, 2.*, 3.1_

- [x] 4. Implement pure physics
  - `src/engine/physics.js`: wall reflect, paddle bounce (angle from offset),
    brick AABB-vs-circle, speed normalization
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 5. Implement the game state machine
  - `src/engine/game.js`: `createGame`, `update`, `launch`, `pause`, `resume`,
    `restart`, `loseLife`
  - _Requirements: 4.2, 4.3, 4.4, 5.1, 5.2, 5.3, 5.4_

- [x] 6. Implement the renderer
  - `src/renderer.js`: draw bricks, paddle, ball; HUD score + lives
  - _Requirements: 3.4, 4.5, 6.1_

- [x] 7. Wire the React component + input + loop
  - `src/Game.jsx`: rAF loop, delta time, keyboard/mouse/touch, overlays,
    reduced-motion
  - _Requirements: 1.1–1.4, 5.1–5.4, 6.1, 6.3_

- [x] 8. App shell and styles
  - `src/App.jsx`, `src/index.css`
  - _Requirements: 6.2_

- [x] 9. Unit tests for physics and state transitions
  - `src/engine/physics.test.js`, `src/engine/game.test.js` (Vitest)
  - _Requirements: 2.*, 4.2–4.4, 3.3_

- [ ] 10. Install, build, and smoke-test (deferred until host memory frees)
  - `npm install`, `npm run build`, `npm run test`, manual play at `npm run dev`
  - _Requirements: NFR-1, NFR-4_
