import { describe, it, expect } from 'vitest'
import {
  normalizeSpeed,
  reflectWalls,
  ballIsLost,
  circleRectOverlap,
  paddleBounce,
  brickCollision,
} from './physics.js'
import { CONFIG } from './config.js'

const field = CONFIG.field

describe('normalizeSpeed', () => {
  it('scales velocity to the target magnitude', () => {
    const ball = { vx: 3, vy: 4 } // magnitude 5
    normalizeSpeed(ball, 10)
    expect(Math.hypot(ball.vx, ball.vy)).toBeCloseTo(10, 5)
  })
  it('preserves direction', () => {
    const ball = { vx: 3, vy: 4 }
    normalizeSpeed(ball, 10)
    expect(ball.vx / ball.vy).toBeCloseTo(3 / 4, 5)
  })
})

describe('reflectWalls (Req 2.1)', () => {
  it('reflects off the left wall', () => {
    const ball = { x: -1, y: 100, r: 8, vx: -5, vy: 2 }
    expect(reflectWalls(ball, field)).toBe(true)
    expect(ball.vx).toBeGreaterThan(0)
  })
  it('reflects off the right wall', () => {
    const ball = { x: field.width + 1, y: 100, r: 8, vx: 5, vy: 2 }
    expect(reflectWalls(ball, field)).toBe(true)
    expect(ball.vx).toBeLessThan(0)
  })
  it('reflects off the top wall', () => {
    const ball = { x: 100, y: -1, r: 8, vx: 2, vy: -5 }
    expect(reflectWalls(ball, field)).toBe(true)
    expect(ball.vy).toBeGreaterThan(0)
  })
  it('does not reflect in open space', () => {
    const ball = { x: 400, y: 300, r: 8, vx: 5, vy: 5 }
    expect(reflectWalls(ball, field)).toBe(false)
  })
})

describe('ballIsLost (Req 4.2)', () => {
  it('true when below the field', () => {
    expect(ballIsLost({ x: 10, y: field.height + 20, r: 8 }, field)).toBe(true)
  })
  it('false when inside the field', () => {
    expect(ballIsLost({ x: 10, y: field.height - 20, r: 8 }, field)).toBe(false)
  })
})

describe('circleRectOverlap', () => {
  const rect = { x: 100, y: 100, w: 50, h: 20 }
  it('detects overlap', () => {
    expect(circleRectOverlap({ x: 110, y: 110, r: 8 }, rect)).toBe(true)
  })
  it('rejects a clear miss', () => {
    expect(circleRectOverlap({ x: 300, y: 300, r: 8 }, rect)).toBe(false)
  })
})

describe('paddleBounce (Req 2.2, 2.4)', () => {
  const paddle = { x: 345, y: 560, w: 110, h: 16 }

  it('bounces the ball upward on a center hit', () => {
    const ball = { x: 400, y: 560, r: 8, vx: 0, vy: 100 }
    const bounced = paddleBounce(ball, paddle, CONFIG)
    expect(bounced).toBe(true)
    expect(ball.vy).toBeLessThan(0)
  })

  it('angles left when struck on the left side', () => {
    const ball = { x: 355, y: 560, r: 8, vx: 0, vy: 100 }
    paddleBounce(ball, paddle, CONFIG)
    expect(ball.vx).toBeLessThan(0)
  })

  it('angles right when struck on the right side', () => {
    const ball = { x: 445, y: 560, r: 8, vx: 0, vy: 100 }
    paddleBounce(ball, paddle, CONFIG)
    expect(ball.vx).toBeGreaterThan(0)
  })

  it('keeps speed constant after bounce', () => {
    const ball = { x: 360, y: 560, r: 8, vx: 0, vy: 100 }
    paddleBounce(ball, paddle, CONFIG)
    expect(Math.hypot(ball.vx, ball.vy)).toBeCloseTo(CONFIG.ball.speed, 3)
  })

  it('does not bounce when the ball moves upward', () => {
    const ball = { x: 400, y: 560, r: 8, vx: 0, vy: -100 }
    expect(paddleBounce(ball, paddle, CONFIG)).toBe(false)
  })
})

describe('brickCollision (Req 2.3)', () => {
  it('returns the index of a hit brick and reflects', () => {
    const bricks = [
      { x: 0, y: 0, w: 40, h: 20, alive: true },
      { x: 100, y: 100, w: 40, h: 20, alive: true },
    ]
    const ball = { x: 120, y: 90, r: 8, vx: 0, vy: -50 }
    const idx = brickCollision(ball, bricks)
    expect(idx).toBe(1)
    expect(ball.vy).toBeGreaterThan(0) // reflected downward
  })

  it('ignores dead bricks', () => {
    const bricks = [{ x: 100, y: 100, w: 40, h: 20, alive: false }]
    const ball = { x: 120, y: 110, r: 8, vx: 0, vy: 50 }
    expect(brickCollision(ball, bricks)).toBe(-1)
  })

  it('returns -1 on a clear miss', () => {
    const bricks = [{ x: 100, y: 100, w: 40, h: 20, alive: true }]
    const ball = { x: 500, y: 500, r: 8, vx: 0, vy: 50 }
    expect(brickCollision(ball, bricks)).toBe(-1)
  })
})
