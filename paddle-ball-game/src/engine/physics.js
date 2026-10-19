// Pure physics helpers. Each takes explicit arguments and mutates/returns
// plain objects — no DOM, no globals — so they are directly unit-testable.

// Normalize a velocity vector to a target speed magnitude.
// Keeps ball speed constant across all deflections (Req 2.4).
export function normalizeSpeed(ball, speed) {
  const mag = Math.hypot(ball.vx, ball.vy) || 1
  ball.vx = (ball.vx / mag) * speed
  ball.vy = (ball.vy / mag) * speed
  return ball
}

// Reflect the ball off the left/right/top walls (Req 2.1).
// Returns true if any wall was hit. Does NOT handle the bottom (that's a life loss).
export function reflectWalls(ball, field) {
  let hit = false
  if (ball.x - ball.r <= 0) {
    ball.x = ball.r
    ball.vx = Math.abs(ball.vx)
    hit = true
  } else if (ball.x + ball.r >= field.width) {
    ball.x = field.width - ball.r
    ball.vx = -Math.abs(ball.vx)
    hit = true
  }
  if (ball.y - ball.r <= 0) {
    ball.y = ball.r
    ball.vy = Math.abs(ball.vy)
    hit = true
  }
  return hit
}

// True when the ball has fallen past the bottom of the field (Req 4.2).
export function ballIsLost(ball, field) {
  return ball.y - ball.r > field.height
}

// AABB overlap test between a circle (ball) and a rectangle (paddle/brick).
export function circleRectOverlap(ball, rect) {
  const nearestX = Math.max(rect.x, Math.min(ball.x, rect.x + rect.w))
  const nearestY = Math.max(rect.y, Math.min(ball.y, rect.y + rect.h))
  const dx = ball.x - nearestX
  const dy = ball.y - nearestY
  return dx * dx + dy * dy <= ball.r * ball.r
}

// Bounce the ball off the paddle (Req 2.2). On hit, the ball always goes
// upward, and its horizontal velocity depends on where it struck:
//   hit at left edge  -> steep left
//   hit at center     -> straight up
//   hit at right edge -> steep right
// Returns true if a bounce occurred.
export function paddleBounce(ball, paddle, config) {
  // Only bounce when moving downward and overlapping.
  if (ball.vy <= 0) return false
  if (!circleRectOverlap(ball, paddle)) return false

  const hitPos = (ball.x - paddle.x) / paddle.w // 0..1 across the paddle
  const clamped = Math.max(0, Math.min(1, hitPos))
  const offset = clamped - 0.5 // -0.5..0.5

  ball.vx = offset * 2 * config.ball.maxAngleSpeed
  ball.vy = -Math.abs(ball.vy)
  // Lift the ball above the paddle so it can't re-trigger next frame.
  ball.y = paddle.y - ball.r - 0.5
  normalizeSpeed(ball, config.ball.speed)
  return true
}

// Find the first alive brick the ball overlaps, reflect the ball off it, and
// return the brick's index (or -1). Caller is responsible for killing the brick
// and awarding points (Req 2.3). Reflection axis is chosen by the shallower
// penetration, which approximates hitting a side vs the top/bottom.
export function brickCollision(ball, bricks) {
  for (let i = 0; i < bricks.length; i++) {
    const b = bricks[i]
    if (!b.alive) continue
    if (!circleRectOverlap(ball, b)) continue

    // Decide reflection axis by comparing how centered the ball is on each axis.
    const ballCenterX = ball.x
    const ballCenterY = ball.y
    const brickCenterX = b.x + b.w / 2
    const brickCenterY = b.y + b.h / 2

    const overlapX = b.w / 2 + ball.r - Math.abs(ballCenterX - brickCenterX)
    const overlapY = b.h / 2 + ball.r - Math.abs(ballCenterY - brickCenterY)

    if (overlapX < overlapY) {
      ball.vx = ballCenterX < brickCenterX ? -Math.abs(ball.vx) : Math.abs(ball.vx)
    } else {
      ball.vy = ballCenterY < brickCenterY ? -Math.abs(ball.vy) : Math.abs(ball.vy)
    }
    return i
  }
  return -1
}
