import { useEffect, useRef, useState } from 'react'
import { CONFIG } from './engine/config.js'
import {
  createGame,
  update,
  launch,
  togglePause,
  restart,
} from './engine/game.js'
import { render } from './renderer.js'

export default function Game() {
  const canvasRef = useRef(null)
  const gameRef = useRef(null)
  const inputRef = useRef({ left: false, right: false, pointerX: null })

  // Mirror a slice of engine state into React so overlays re-render.
  const [status, setStatus] = useState('start')
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(CONFIG.lives)

  // Create the game once.
  if (gameRef.current == null) gameRef.current = createGame(CONFIG)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let raf = 0
    let last = performance.now()
    let lastStatus = ''

    function frame(now) {
      const dt = Math.min((now - last) / 1000, 1 / 30) // clamp: anti-tunneling
      last = now
      const game = gameRef.current

      update(game, dt, inputRef.current)
      render(ctx, game, CONFIG)

      // Push status/score/lives to React only when they change.
      if (game.status !== lastStatus) {
        lastStatus = game.status
        setStatus(game.status)
      }
      setScore(game.score)
      setLives(game.lives)

      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [])

  // --- Keyboard input ---
  useEffect(() => {
    function onKeyDown(e) {
      const game = gameRef.current
      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          inputRef.current.left = true
          inputRef.current.pointerX = null
          break
        case 'ArrowRight':
        case 'd':
        case 'D':
          inputRef.current.right = true
          inputRef.current.pointerX = null
          break
        case ' ':
          e.preventDefault()
          if (game.status === 'start' || game.status === 'playing') launch(game)
          break
        case 'p':
        case 'P':
        case 'Escape':
          togglePause(game)
          break
        default:
          break
      }
    }
    function onKeyUp(e) {
      if (['ArrowLeft', 'a', 'A'].includes(e.key)) inputRef.current.left = false
      if (['ArrowRight', 'd', 'D'].includes(e.key)) inputRef.current.right = false
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [])

  // Map a client pointer position to field coordinates.
  function fieldX(clientX) {
    const rect = canvasRef.current.getBoundingClientRect()
    const scale = CONFIG.field.width / rect.width
    return (clientX - rect.left) * scale
  }

  function onPointerMove(e) {
    inputRef.current.pointerX = fieldX(e.clientX)
  }
  function onTouchMove(e) {
    if (e.touches.length) {
      e.preventDefault()
      inputRef.current.pointerX = fieldX(e.touches[0].clientX)
    }
  }

  function onCanvasClick() {
    const game = gameRef.current
    if (game.status === 'start' || game.status === 'playing') launch(game)
  }

  function onRestart() {
    restart(gameRef.current)
  }

  const showStart = status === 'start'
  const showPaused = status === 'paused'
  const showGameOver = status === 'gameover'
  const showWon = status === 'won'

  return (
    <div className="game-wrap">
      <canvas
        ref={canvasRef}
        width={CONFIG.field.width}
        height={CONFIG.field.height}
        className="game-canvas"
        onMouseMove={onPointerMove}
        onTouchMove={onTouchMove}
        onClick={onCanvasClick}
      />

      {showStart && (
        <Overlay>
          <h2>Paddle Ball</h2>
          <p>Break every brick. Don't drop the ball.</p>
          <p className="hint">
            Move: ← → or A / D or mouse · Launch: Space / click · Pause: P / Esc
          </p>
          <button onClick={() => launch(gameRef.current)}>Launch Ball</button>
        </Overlay>
      )}

      {showPaused && (
        <Overlay>
          <h2>Paused</h2>
          <button onClick={() => togglePause(gameRef.current)}>Resume</button>
        </Overlay>
      )}

      {showGameOver && (
        <Overlay>
          <h2>Game Over</h2>
          <p>Final score: {score}</p>
          <button onClick={onRestart}>Play Again</button>
        </Overlay>
      )}

      {showWon && (
        <Overlay>
          <h2>You Win! 🎉</h2>
          <p>Final score: {score}</p>
          <button onClick={onRestart}>Play Again</button>
        </Overlay>
      )}

      <p className="controls-note" aria-hidden="true">
        Score {score} · Lives {lives}
      </p>
    </div>
  )
}

function Overlay({ children }) {
  return (
    <div className="overlay">
      <div className="overlay-card">{children}</div>
    </div>
  )
}
