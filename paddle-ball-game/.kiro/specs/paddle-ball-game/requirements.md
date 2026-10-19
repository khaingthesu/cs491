# Requirements — Paddle Ball Game

## Introduction

A browser-based paddle-ball (Breakout-style) arcade game. The player controls a
horizontal paddle at the bottom of the screen, bounces a ball upward to break a
wall of bricks, and tries to clear all bricks without letting the ball fall past
the paddle. The game is built with React + Vite and rendered on an HTML5 canvas.

This document is written in EARS format (Easy Approach to Requirements Syntax):
each acceptance criterion reads `WHEN <trigger> THE SYSTEM SHALL <response>`.

## Glossary

- **Paddle** — the player-controlled bar at the bottom of the play field.
- **Ball** — the moving circle that bounces off surfaces.
- **Brick** — a destructible block; destroyed on ball contact, awards points.
- **Life** — one attempt; losing the ball costs a life.
- **Play field** — the bounded rectangular area the ball moves within.

---

## Requirement 1 — Paddle control

**User story:** As a player, I want to move the paddle left and right, so that I
can position it under the ball.

### Acceptance criteria
1. WHEN the player presses the Left Arrow (or `A`) key THE SYSTEM SHALL move the
   paddle left at a constant speed until the key is released or the paddle
   reaches the left wall.
2. WHEN the player presses the Right Arrow (or `D`) key THE SYSTEM SHALL move the
   paddle right until the key is released or the paddle reaches the right wall.
3. WHEN the player moves the mouse (or drags on touch) over the canvas THE SYSTEM
   SHALL center the paddle horizontally on the pointer, clamped to the walls.
4. WHILE the paddle is at a wall THE SYSTEM SHALL NOT allow it to move past the
   play-field boundary.

## Requirement 2 — Ball physics

**User story:** As a player, I want the ball to bounce realistically, so that the
game feels fair and predictable.

### Acceptance criteria
1. WHEN the ball hits the left, right, or top wall THE SYSTEM SHALL reflect its
   velocity on the corresponding axis.
2. WHEN the ball hits the paddle THE SYSTEM SHALL reflect it upward and adjust the
   horizontal velocity based on where on the paddle it struck (edge = sharper
   angle, center = steeper).
3. WHEN the ball hits a brick THE SYSTEM SHALL reflect the ball and destroy that
   brick.
4. THE SYSTEM SHALL maintain a constant ball speed per level (direction changes,
   magnitude does not drift).

## Requirement 3 — Bricks and scoring

**User story:** As a player, I want to earn points for breaking bricks, so that I
can measure progress.

### Acceptance criteria
1. WHEN the game starts THE SYSTEM SHALL render a grid of bricks across the top of
   the play field.
2. WHEN a brick is destroyed THE SYSTEM SHALL increase the score by the brick's
   point value and remove it from the field.
3. WHEN all bricks are destroyed THE SYSTEM SHALL declare the level won.
4. THE SYSTEM SHALL display the current score at all times during play.

## Requirement 4 — Lives and game over

**User story:** As a player, I want a limited number of lives, so that there are
stakes.

### Acceptance criteria
1. WHEN the game starts THE SYSTEM SHALL grant the player 3 lives.
2. WHEN the ball falls below the paddle THE SYSTEM SHALL decrement lives by 1.
3. IF lives remain after losing the ball THE SYSTEM SHALL reset the ball on the
   paddle and wait for the player to launch it.
4. WHEN lives reach 0 THE SYSTEM SHALL end the game and display a Game Over screen
   with the final score.
5. THE SYSTEM SHALL display the remaining lives at all times during play.

## Requirement 5 — Game state and controls

**User story:** As a player, I want to start, pause, and restart the game, so that
I stay in control of the session.

### Acceptance criteria
1. WHEN the page loads THE SYSTEM SHALL show a Start screen and SHALL NOT move the
   ball until the player launches.
2. WHEN the player presses Space (or clicks) on the Start screen THE SYSTEM SHALL
   launch the ball and begin play.
3. WHEN the player presses `P` (or Escape) during play THE SYSTEM SHALL pause the
   game and show a Paused overlay; pressing it again SHALL resume.
4. WHEN the game is over or won THE SYSTEM SHALL offer a Restart that resets score,
   lives, bricks, and ball to their initial state.

## Requirement 6 — Rendering and responsiveness

**User story:** As a player, I want smooth, readable visuals, so that the game is
pleasant to play.

### Acceptance criteria
1. THE SYSTEM SHALL render the game loop using `requestAnimationFrame` and SHALL
   be frame-rate independent (movement scaled by delta time).
2. THE SYSTEM SHALL render on a canvas sized to fit the viewport while preserving
   aspect ratio.
3. WHEN the browser reduced-motion preference is set THE SYSTEM SHALL disable
   non-essential visual effects.

## Non-functional requirements
- **NFR-1 (Performance):** sustain 60 FPS on a mid-range laptop at the default
  field size.
- **NFR-2 (No backend):** the game runs entirely client-side; no network calls.
- **NFR-3 (Accessibility):** keyboard-only play is fully supported; controls are
  documented on screen.
- **NFR-4 (Browser support):** latest Chrome, Firefox, Safari, Edge.
