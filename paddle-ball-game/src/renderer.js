// Read-only renderer: draws engine state onto a 2D canvas context.
// No game logic lives here.

export function render(ctx, state, config) {
  const { field } = config
  const { paddle, ball, bricks } = state

  // Background.
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, field.width, field.height)

  // Bricks.
  for (const b of bricks) {
    if (!b.alive) continue
    ctx.fillStyle = b.color
    ctx.fillRect(b.x, b.y, b.w, b.h)
    // subtle top highlight
    ctx.fillStyle = 'rgba(255,255,255,0.18)'
    ctx.fillRect(b.x, b.y, b.w, 3)
  }

  // Paddle.
  ctx.fillStyle = '#e2e8f0'
  roundRect(ctx, paddle.x, paddle.y, paddle.w, paddle.h, 6)
  ctx.fill()

  // Ball.
  ctx.beginPath()
  ctx.fillStyle = '#fbbf24'
  ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2)
  ctx.fill()

  // HUD: score (left) and lives (right).
  ctx.fillStyle = '#e2e8f0'
  ctx.font = '600 20px system-ui, sans-serif'
  ctx.textBaseline = 'top'
  ctx.textAlign = 'left'
  ctx.fillText(`Score ${state.score}`, 16, 14)

  ctx.textAlign = 'right'
  ctx.fillText('♥'.repeat(state.lives) || '—', field.width - 16, 14)
}

function roundRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + w, y, x + w, y + h, radius)
  ctx.arcTo(x + w, y + h, x, y + h, radius)
  ctx.arcTo(x, y + h, x, y, radius)
  ctx.arcTo(x, y, x + w, y, radius)
  ctx.closePath()
}
