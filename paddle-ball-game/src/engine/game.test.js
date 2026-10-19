import { describe, it, expect } from 'vitest'
import {
  createGame,
  update,
  launch,
  pause,
  resume,
  togglePause,
  restart,
  loseLife,
} from './game.js'
import { CONFIG } from './config.js'

describe('createGame', () => {
  it('starts on the start screen with full lives and a brick grid', () => {
    const g = createGame(CONFIG)
    expect(g.status).toBe('start')
    expect(g.lives).toBe(CONFIG.lives)
    expect(g.score).toBe(0)
    expect(g.bricks.length).toBe(CONFIG.bricks.rows * CONFIG.bricks.cols)
    expect(g.bricks.every((b) => b.alive)).toBe(true)
    expect(g.ball.launched).toBe(false)
  })
})

describe('launch (Req 5.2)', () => {
  it('moves from start to playing and sends the ball upward', () => {
    const g = createGame(CONFIG)
    launch(g)
    expect(g.status).toBe('playing')
    expect(g.ball.launched).toBe(true)
    expect(g.ball.vy).toBeLessThan(0)
    expect(Math.hypot(g.ball.vx, g.ball.vy)).toBeCloseTo(CONFIG.ball.speed, 3)
  })
})

describe('pause / resume (Req 5.3)', () => {
  it('pauses and resumes', () => {
    const g = createGame(CONFIG)
    launch(g)
    pause(g)
    expect(g.status).toBe('paused')
    resume(g)
    expect(g.status).toBe('playing')
  })
  it('togglePause flips between playing and paused', () => {
    const g = createGame(CONFIG)
    launch(g)
    togglePause(g)
    expect(g.status).toBe('paused')
    togglePause(g)
    expect(g.status).toBe('playing')
  })
})

describe('update', () => {
  it('is a no-op unless playing', () => {
    const g = createGame(CONFIG)
    const before = { ...g.ball }
    update(g, 0.016, { left: false, right: false, pointerX: null })
    expect(g.ball.x).toBe(before.x)
    expect(g.ball.y).toBe(before.y)
  })

  it('moves the paddle right on input and clamps to the field (Req 1.2, 1.4)', () => {
    const g = createGame(CONFIG)
    launch(g)
    for (let i = 0; i < 200; i++) {
      update(g, 0.016, { left: false, right: true, pointerX: null })
    }
    expect(g.paddle.x + g.paddle.w).toBeLessThanOrEqual(CONFIG.field.width)
    expect(g.paddle.x).toBe(CONFIG.field.width - g.paddle.w)
  })

  it('awards points and removes a brick on contact (Req 3.2)', () => {
    const g = createGame(CONFIG)
    launch(g)
    // Put the ball right on top of the first brick, moving up into it.
    const brick = g.bricks[0]
    g.ball.x = brick.x + brick.w / 2
    g.ball.y = brick.y + brick.h + g.ball.r - 1
    g.ball.vx = 0
    g.ball.vy = -CONFIG.ball.speed
    update(g, 0.016, { left: false, right: false, pointerX: null })
    expect(g.bricks[0].alive).toBe(false)
    expect(g.score).toBe(brick.points)
  })

  it('declares won when the last brick is destroyed (Req 3.3)', () => {
    const g = createGame(CONFIG)
    launch(g)
    // Kill all but one brick.
    for (let i = 1; i < g.bricks.length; i++) g.bricks[i].alive = false
    const brick = g.bricks[0]
    g.ball.x = brick.x + brick.w / 2
    g.ball.y = brick.y + brick.h + g.ball.r - 1
    g.ball.vx = 0
    g.ball.vy = -CONFIG.ball.speed
    update(g, 0.016, { left: false, right: false, pointerX: null })
    expect(g.status).toBe('won')
  })
})

describe('loseLife (Req 4.2–4.4)', () => {
  it('decrements a life and resets the ball while lives remain', () => {
    const g = createGame(CONFIG)
    launch(g)
    loseLife(g)
    expect(g.lives).toBe(CONFIG.lives - 1)
    expect(g.status).toBe('playing')
    expect(g.ball.launched).toBe(false)
  })

  it('ends the game when lives reach 0', () => {
    const g = createGame(CONFIG)
    g.lives = 1
    launch(g)
    loseLife(g)
    expect(g.lives).toBe(0)
    expect(g.status).toBe('gameover')
  })

  it('triggers on a ball that falls below the field during update', () => {
    const g = createGame(CONFIG)
    launch(g)
    g.ball.y = CONFIG.field.height + 50
    g.ball.vy = CONFIG.ball.speed
    update(g, 0.016, { left: false, right: false, pointerX: null })
    expect(g.lives).toBe(CONFIG.lives - 1)
  })
})

describe('restart (Req 5.4)', () => {
  it('resets everything to initial state', () => {
    const g = createGame(CONFIG)
    launch(g)
    g.score = 500
    g.lives = 1
    g.bricks.forEach((b) => (b.alive = false))
    restart(g)
    expect(g.status).toBe('start')
    expect(g.score).toBe(0)
    expect(g.lives).toBe(CONFIG.lives)
    expect(g.bricks.every((b) => b.alive)).toBe(true)
    expect(g.ball.launched).toBe(false)
  })
})
