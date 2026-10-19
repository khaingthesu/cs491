// Tunable constants for the paddle-ball game.
// All positions/sizes are in play-field units (the canvas is scaled to fit).

export const CONFIG = {
  field: {
    width: 800,
    height: 600,
  },
  paddle: {
    width: 110,
    height: 16,
    speed: 520, // units per second (keyboard)
    bottomMargin: 28, // distance of paddle top from field bottom
  },
  ball: {
    radius: 8,
    speed: 380, // constant magnitude per level (units/sec)
    maxAngleSpeed: 320, // horizontal speed contribution at paddle edge
  },
  bricks: {
    rows: 5,
    cols: 9,
    topOffset: 60,
    sideMargin: 30,
    gap: 6,
    height: 24,
    // Per-row colors and points (top rows worth more).
    rows_meta: [
      { color: '#ef4444', points: 50 },
      { color: '#f97316', points: 40 },
      { color: '#eab308', points: 30 },
      { color: '#22c55e', points: 20 },
      { color: '#3b82f6', points: 10 },
    ],
  },
  lives: 3,
}
