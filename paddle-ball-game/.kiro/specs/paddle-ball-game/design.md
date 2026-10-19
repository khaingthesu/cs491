# Design — Paddle Ball Game

## Overview

A single-page React app. One React component owns the canvas and lifecycle; the
game simulation is a plain-JS module (framework-agnostic, testable) driven by a
`requestAnimationFrame` loop. React handles mount, the HUD/overlays, and input
wiring; the engine handles state and physics.

This separation keeps the physics pure and unit-testable without a DOM.

## Architecture

```
┌─────────────────────────────────────────────────┐
│  App.jsx (React)                                  │
│  ┌──────────────┐   ┌───────────────────────────┐│
│  │ <Game/>      │   │ HUD / overlays (React)    ││
│  │  owns canvas │   │ score, lives, start/pause ││
│  │  + rAF loop  │   │ /gameover screens         ││
│  └──────┬───────┘   └───────────────────────────┘│
│         │ calls each frame                        │
│  ┌──────▼───────────────────────────────────────┐│
│  │ engine/ (plain JS, no React, no DOM)          ││
│  │  game.js   — state machine + update(dt)       ││
│  │  physics.js— collisions, reflection           ││
│  │  entities.js — paddle, ball, brick factories  ││
│  │  config.js — tunable constants                ││
│  └───────────────────────────────────────────────┘│
│  renderer.js — draws engine state onto 2D context │
└─────────────────────────────────────────────────┘
```

## Components and interfaces

### `engine/config.js`
Exports `CONFIG`: field dimensions, paddle size/speed, ball radius/speed, brick
grid (rows, cols, gaps, colors, point values), starting lives.

### `engine/entities.js`
- `createPaddle(config)` → `{ x, y, w, h, speed }`
- `createBall(config)` → `{ x, y, r, vx, vy, launched }`
- `createBricks(config)` → `Brick[]` where `Brick = { x, y, w, h, alive, color, points }`

### `engine/physics.js` (pure)
- `reflectWalls(ball, field)` → mutates/returns ball velocity on wall hits.
- `paddleBounce(ball, paddle)` → boolean; on hit, sets `vy` upward and `vx` from
  impact offset: `vx = (hitPos - 0.5) * 2 * MAX_ANGLE_SPEED`.
- `brickCollision(ball, bricks)` → index of hit brick or `-1`; caller reflects and
  kills the brick. Uses AABB-vs-circle.
- All functions take explicit args and return plain values → unit-testable.

### `engine/game.js`
State machine with `status ∈ {start, playing, paused, won, gameover}`.
- `createGame(config)` → `state`
- `update(state, dt, input)` → advances one step (no-op unless `playing`)
- `launch(state)`, `pause(state)`, `resume(state)`, `restart(state)`
- `loseLife(state)` handles life decrement + reset-or-gameover transition.

Input shape: `{ left: bool, right: bool, pointerX: number|null }`.

### `renderer.js`
`render(ctx, state, config)` — clears, draws bricks, paddle, ball, and HUD text.
No game logic; read-only over state.

### `Game.jsx` (React)
- Creates the game state in a `useRef` (survives re-render).
- Sets up a `requestAnimationFrame` loop in `useEffect`; computes `dt`, calls
  `update` then `render`, mirrors `status/score/lives` into React state for the HUD.
- Binds keyboard, mouse, and touch listeners; cleans them up on unmount.
- Respects `prefers-reduced-motion`.

## Data model

```
GameState {
  status: 'start'|'playing'|'paused'|'won'|'gameover'
  score: number
  lives: number
  paddle: Paddle
  ball: Ball
  bricks: Brick[]
}
```

## Game loop (delta-timed)

```
let last = performance.now()
function frame(now) {
  const dt = Math.min((now - last) / 1000, 1/30)  // clamp to avoid tunneling
  last = now
  update(state, dt, readInput())
  render(ctx, state, CONFIG)
  raf = requestAnimationFrame(frame)
}
```
`dt` is clamped so a backgrounded tab resuming cannot teleport the ball through
bricks (anti-tunneling).

## Collision strategy

- **Walls:** compare ball center ± radius against field bounds; flip `vx`/`vy`.
- **Paddle:** AABB overlap test; on hit, snap ball above paddle and recompute
  velocity angle from horizontal impact offset, preserving speed magnitude.
- **Bricks:** iterate alive bricks, AABB-vs-circle. On the first hit, decide axis
  of reflection by comparing penetration depth on x vs y, flip that component,
  kill the brick, award points, and break (one brick per frame keeps it simple
  and prevents double-reflection jitter).

## Error / edge handling
- Clamp `dt` (tab resume) — prevents tunneling.
- Clamp paddle to field (Req 1.4).
- Normalize ball speed after paddle bounce so magnitude never drifts (Req 2.4).
- Guard against zero bricks at init.

## Testing strategy
- **Unit (Vitest):** `physics.js` reflections and collisions; `game.js`
  transitions (launch, loseLife → reset vs gameover, win on last brick).
- **Manual:** keyboard + mouse play, pause/resume, restart, reduced-motion.

## Technology choices
- **React 18 + Vite** — matches the repo's existing React/Vite tooling; fast HMR.
- **Canvas 2D** — right tool for per-pixel arcade rendering; no game framework
  needed for this scope.
- **Vitest** — Vite-native test runner, zero extra config for the pure modules.
