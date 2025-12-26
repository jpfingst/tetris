import React, { useRef, useEffect, useState, useCallback } from 'react'

const COLS = 10
const ROWS = 20
const BLOCK = 20

const SHAPES = [
  [[1,1,1,1]],
  [[1,1],[1,1]],
  [[0,1,0],[1,1,1]],
  [[1,0],[1,0],[1,1]],
  [[0,1],[0,1],[1,1]],
  [[0,1,1],[1,1,0]],
  [[1,1,0],[0,1,1]]
]

function randShape() {
  return SHAPES[Math.floor(Math.random() * SHAPES.length)]
}

function rotate(m) {
  const h = m.length
  const w = m[0].length
  const r = Array.from({length: w}, () => Array(h).fill(0))
  for(let y = 0; y < h; y++) {
    for(let x = 0; x < w; x++) {
      r[x][h - 1 - y] = m[y][x]
    }
  }
  return r
}

function emptyGrid() {
  return Array.from({length: ROWS}, () => Array(COLS).fill(0))
}

export default function Tetris({token}) {
  const cvs = useRef()
  const [grid, setGrid] = useState(emptyGrid())
  const [piece, setPiece] = useState(null)
  const [pos, setPos] = useState({x: 3, y: 0})
  const [running, setRunning] = useState(true)
  const [score, setScore] = useState(0)
  
  // Refs to track current state in the tick loop without recreating it
  const gridRef = useRef(grid)
  const pieceRef = useRef(piece)
  const posRef = useRef(pos)
  const runningRef = useRef(running)
  
  useEffect(() => { gridRef.current = grid }, [grid])
  useEffect(() => { pieceRef.current = piece }, [piece])
  useEffect(() => { posRef.current = pos }, [pos])
  useEffect(() => { runningRef.current = running }, [running])

  const spawn = useCallback(() => {
    setPiece(randShape())
    setPos({x: 3, y: 0})
  }, [])

  const collide = useCallback((s, x, y) => {
    for(let py = 0; py < s.length; py++) {
      for(let px = 0; px < s[py].length; px++) {
        if(!s[py][px]) continue
        const gx = x + px
        const gy = y + py
        if(gx < 0 || gx >= COLS || gy >= ROWS) return true
        if(gy >= 0 && gridRef.current[gy][gx]) return true
      }
    }
    return false
  }, [])

  const lock = useCallback(() => {
    const g = gridRef.current.map(r => r.slice())
    const p = pieceRef.current
    const {x, y} = posRef.current
    for(let py = 0; py < p.length; py++) {
      for(let px = 0; px < p[py].length; px++) {
        if(p[py][px]) {
          const gx = x + px
          const gy = y + py
          if(gy >= 0) g[gy][gx] = 1
        }
      }
    }
    setGrid(g)
    spawn()
  }, [spawn])

  // Single stable interval that runs the game tick
  useEffect(() => {
    const iv = setInterval(() => {
      if(!runningRef.current || !pieceRef.current) return
      const ny = posRef.current.y + 1
      if(!collide(pieceRef.current, posRef.current.x, ny)) {
        setPos(p => ({x: p.x, y: p.y + 1}))
      } else {
        if(posRef.current.y <= 0) {
          setRunning(false)
          return
        }
        lock()
      }
    }, 600)
    return () => clearInterval(iv)
  }, [collide, lock])

  const onKey = useCallback((e) => {
    if(!pieceRef.current) return
    const {x, y} = posRef.current
    if(e.key === 'ArrowLeft' && !collide(pieceRef.current, x - 1, y)) {
      setPos(p => ({x: p.x - 1, y: p.y}))
    }
    if(e.key === 'ArrowRight' && !collide(pieceRef.current, x + 1, y)) {
      setPos(p => ({x: p.x + 1, y: p.y}))
    }
    if(e.key === 'ArrowDown' && !collide(pieceRef.current, x, y + 1)) {
      setPos(p => ({x: p.x, y: p.y + 1}))
    }
    if(e.key === ' ' || e.key === 'ArrowUp') {
      const r = rotate(pieceRef.current)
      if(!collide(r, x, y)) setPiece(r)
    }
  }, [collide])

  // Initialize game and keyboard listener
  useEffect(() => {
    spawn()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onKey, spawn])

  useEffect(() => {
    const c = cvs.current
    if(!c) return
    const ctx = c.getContext('2d')
    c.width = COLS * BLOCK
    c.height = ROWS * BLOCK
    ctx.fillStyle = '#111'
    ctx.fillRect(0, 0, c.width, c.height)
    
    for(let y = 0; y < ROWS; y++) {
      for(let x = 0; x < COLS; x++) {
        if(grid[y][x]) {
          ctx.fillStyle = '#66ccff'
          ctx.fillRect(x * BLOCK, y * BLOCK, BLOCK - 1, BLOCK - 1)
        }
      }
    }
    
    if(piece) {
      ctx.fillStyle = '#ffcc66'
      for(let y = 0; y < piece.length; y++) {
        for(let x = 0; x < piece[y].length; x++) {
          if(piece[y][x]) {
            const gx = pos.x + x
            const gy = pos.y + y
            if(gy >= 0) ctx.fillRect(gx * BLOCK, gy * BLOCK, BLOCK - 1, BLOCK - 1)
          }
        }
      }
    }
  }, [grid, piece, pos])

  return (
    <div className="tetris">
      <div className="board">
        <canvas ref={cvs} />
      </div>
      <div className="info">
        <div>Score: {score}</div>
        <div className="controls">
          <button onClick={() => setRunning(r => !r)}>
            {running ? 'Pause' : 'Start'}
          </button>
        </div>
      </div>
    </div>
  )
}
