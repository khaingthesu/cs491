// Entity factories. Pure functions that produce plain-object game entities
// from the CONFIG. No DOM, no React.

export function createPaddle(config) {
  const { field, paddle } = config
  return {
    w: paddle.width,
    h: paddle.height,
    speed: paddle.speed,
    x: field.width / 2 - paddle.width / 2,
    y: field.height - paddle.bottomMargin - paddle.height,
  }
}

// Ball starts resting on the paddle (not launched).
export function createBall(config, paddle) {
  const { ball } = config
  return {
    r: ball.radius,
    x: paddle.x + paddle.w / 2,
    y: paddle.y - ball.radius - 1,
    vx: 0,
    vy: 0,
    launched: false,
  }
}

export function createBricks(config) {
  const { field, bricks } = config
  const usableWidth = field.width - bricks.sideMargin * 2
  const brickWidth = (usableWidth - bricks.gap * (bricks.cols - 1)) / bricks.cols
  const out = []
  for (let row = 0; row < bricks.rows; row++) {
    const meta = bricks.rows_meta[row % bricks.rows_meta.length]
    for (let col = 0; col < bricks.cols; col++) {
      out.push({
        x: bricks.sideMargin + col * (brickWidth + bricks.gap),
        y: bricks.topOffset + row * (bricks.height + bricks.gap),
        w: brickWidth,
        h: bricks.height,
        alive: true,
        color: meta.color,
        points: meta.points,
      })
    }
  }
  return out
}
