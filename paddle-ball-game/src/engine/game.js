// Game state machine. Owns the simulation; pure-ish (mutates the state object
// it is given, returns nothing surprising). No DOM, no React, no rendering.

import { createPaddle, createBall, createBricks } from './entities.js'
import {
  reflectWalls,
  paddleBounce,
  brickCollision,
  ballIsLost,
  normalizeSpeed,
} from './physics.js'

// status: 'start' | 'playing' | 'paused' | 'won' | 'gameover'
export function createGame(config) {
  const paddle = createPaddle(config)
  return {
    config,
    status: 'start',
    score: 0,
    lives: config.lives,
    paddle,
    ball: createBall(config, paddle),
    bricks: createBricks(config),
  }
}

// Reset ball + paddle to their starting rest position (after a lost life or restart).
function resetBallAndPaddle(state) {
  state.paddle = createPaddle(state.config)
  state.ball = createBall(state.config, state.paddle)
}

// Launch the ball from rest: fixed upward speed, slight random horizontal angle.
export function launch(state) {
  if (state.status === 'start') state.status = 'playing'
  if (state.status !== 'playing') return
  if (state.ball.launched) return
  const dir = Math.random() < 0.5 ? -1 : 1
  state.ball.vx = dir * state.config.ball.maxAngleSpeed * 0.35
  state.ball.vy = -state.config.ball.speed
  normalizeSpeed(state.ball, state.config.ball.speed)
  state.ball.launched = true
}

export function pause(state) {
  if (state.status === 'playing') state.status = 'paused'
}

export function resume(state) {
  if (state.status === 'paused') state.status = 'playing'
}

export function togglePause(state) {
  if (state.status === 'playing') state.status = 'paused'
  else if (state.status === 'paused') state.status = 'playing'
}

export function restart(state) {
  state.status = 'start'
  state.score = 0
  state.lives = state.config.lives
  state.bricks = createBricks(state.config)
  resetBallAndPaddle(state)
}

// Handle losing the ball: decrement a life, then reset or end (Req 4.2–4.4).
export function loseLife(state) {
  state.lives -= 1
  if (state.lives <= 0) {
    state.lives = 0
    state.status = 'gameover'
    return
  }
  resetBallAndPaddle(state)
  state.status = 'playing'
}

// Advance the simulation by dt seconds. No-op unless playing.
// input = { left, right, pointerX|null }
export function update(state, dt, input) {
  if (state.status !== 'playing') return
  const { config, paddle, ball, bricks } = state

  // --- Paddle movement ---
  if (input.pointerX != null) {
    paddle.x = input.pointerX - paddle.w / 2
  } else {
    if (input.left) paddle.x -= paddle.speed * dt
    if (input.right) paddle.x += paddle.speed * dt
  }
  // Clamp paddle to the field (Req 1.4).
  paddle.x = Math.max(0, Math.min(config.field.width - paddle.w, paddle.x))

  // Ball rides the paddle until launched.
  if (!ball.launched) {
    ball.x = paddle.x + paddle.w / 2
    ball.y = paddle.y - ball.r - 1
    return
  }

  // --- Integrate ball ---
  ball.x += ball.vx * dt
  ball.y += ball.vy * dt

  // --- Collisions ---
  reflectWalls(ball, config.field)
  paddleBounce(ball, paddle, config)

  const hitIndex = brickCollision(ball, bricks)
  if (hitIndex !== -1) {
    const brick = bricks[hitIndex]
    brick.alive = false
    state.score += brick.points
    normalizeSpeed(ball, config.ball.speed)
    if (bricks.every((b) => !b.alive)) {
      state.status = 'won'
      return
    }
  }

  // --- Lost ball ---
  if (ballIsLost(ball, config.field)) {
    loseLife(state)
  }
}
