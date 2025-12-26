import React, { useRef, useEffect, useState, useCallback } from 'react'

const COLS = 10
const ROWS = 20
const BLOCK = 20

const SHAPES = {
  I: [[1,1,1,1]],
  O: [[1,1],[1,1]],
  T: [[0,1,0],[1,1,1]],
  L: [[1,0],[1,0],[1,1]],
  J: [[0,1],[0,1],[1,1]],
  S: [[0,1,1],[1,1,0]],
  Z: [[1,1,0],[0,1,1]]
}

function randShape(){
  const keys = Object.keys(SHAPES)
  const k = keys[Math.floor(Math.random()*keys.length)]
  return {shape: SHAPES[k], type: k}
}

function rotate(m){
  const h = m.length, w = m[0].length
  const r = Array.from({length:w}, ()=>Array(h).fill(0))
  for(let y=0;y<h;y++) for(let x=0;x<w;x++) r[x][h-1-y]=m[y][x]
  return r
}

function emptyGrid(){
  return Array.from({length:ROWS}, ()=>Array(COLS).fill(0))
}

export default function Tetris({token}){
  const canvasRef = useRef()
  const [grid,setGrid] = useState(emptyGrid())
  const [piece,setPiece] = useState(null)
  const [pos,setPos] = useState({x:3,y:0})
  const [score,setScore] = useState(0)
  const [running,setRunning] = useState(true)

  function spawn(){
    const p = randShape()
    setPiece(p.shape)
    setPos({x:3,y:0})
  }

  function collide(s, x, y){
    for(let py=0; py<s.length; py++){
      for(let px=0; px<s[py].length; px++){
        if(!s[py][px]) continue
        const gx = x+px, gy = y+py
        if(gx<0 || gx>=COLS || gy>=ROWS) return true
        if(gy>=0 && grid[gy][gx]) return true
      }
    }
    return false
  }

  function lock(){
    const g = grid.map(r=>r.slice())
    for(let y=0;y<piece.length;y++) for(let x=0;x<piece[y].length;x++){
      if(piece[y][x]){
        const gx = pos.x + x, gy = pos.y + y
        if(gy>=0) g[gy][gx] = 1
      }
    }
    setGrid(g)
    clearLines(g)
    spawn()
  }

  function clearLines(g){
    let removed = 0
    for(let y=ROWS-1;y>=0;y--){
      if(g[y].every(c=>c)){ g.splice(y,1); g.unshift(Array(COLS).fill(0)); removed++; y++ }
    }
    if(removed){ setScore(s=>s + removed*100) }
    setGrid(g)
  }

  function tick(){
    if(!running) return
    if(!piece) return
    const ny = pos.y+1
    if(!collide(piece, pos.x, ny)){
      setPos(p=>({x:p.x,y:p.y+1}))
    } else {
      if(pos.y<=0){ setRunning(false); submitScore(); return }
      lock()
    }
  }

  const onKey = useCallback((e) => {
    if(!piece) return
    if(e.key === 'ArrowLeft'){ if(!collide(piece, pos.x-1, pos.y)) setPos(p=>({x:p.x-1,y:p.y})) }
    if(e.key === 'ArrowRight'){ if(!collide(piece, pos.x+1, pos.y)) setPos(p=>({x:p.x+1,y:p.y})) }
    if(e.key === 'ArrowDown'){ if(!collide(piece, pos.x, pos.y+1)) setPos(p=>({x:p.x,y:p.y+1})) }
    if(e.key === ' ' || e.key === 'ArrowUp'){
      const r = rotate(piece)
      if(!collide(r, pos.x, pos.y)) setPiece(r)
    }
  }, [piece, pos, grid])

  useEffect(()=>{
    spawn()
    window.addEventListener('keydown', onKey)
    return ()=>{ window.removeEventListener('keydown', onKey) }
  }, [onKey])

  useEffect(()=>{
    const iv = setInterval(tick, 600)
    return ()=> clearInterval(iv)
  },[running, piece, pos, grid])

  useEffect(()=> draw(), [grid, piece, pos])

  function draw(){
    const cvs = canvasRef.current
    if(!cvs) return
    const ctx = cvs.getContext('2d')
    cvs.width = COLS*BLOCK; cvs.height = ROWS*BLOCK
    ctx.fillStyle = '#111'; ctx.fillRect(0,0,cvs.width,cvs.height)
    ctx.strokeStyle = '#222'
    for(let y=0;y<ROWS;y++) for(let x=0;x<COLS;x++){
      if(grid[y][x]){ ctx.fillStyle='#66ccff'; ctx.fillRect(x*BLOCK,y*BLOCK,BLOCK-1,BLOCK-1) }
    }
    if(piece){ ctx.fillStyle='#ffcc66'; for(let y=0;y<piece.length;y++) for(let x=0;x<piece[y].length;x++){
      if(piece[y][x]){
        const gx = pos.x + x, gy = pos.y + y
        if(gy>=0) ctx.fillRect(gx*BLOCK, gy*BLOCK, BLOCK-1, BLOCK-1)
      }
    }}
  }

  function toggleRunning(){
    if(running){
      setRunning(false)
      return
    }
    if(!piece){
      setGrid(emptyGrid())
      setScore(0)
      spawn()
    }
    setRunning(true)
  }

  async function submitScore(){
    try{
      await fetch('/api/score', {method:'POST', headers:{'Content-Type':'application/json', 'Authorization':'Bearer '+token}, body: JSON.stringify({score})})
    }catch(e){ console.log('submit failed',e) }
  }

  return (
    <div className="tetris">
      <div className="board">
        <canvas ref={canvasRef} />
      </div>
      <div className="info">
        <div>Score: {score}</div>
        <div className="controls">
          <button onClick={toggleRunning}>{running ? 'Pause' : 'Start'}</button>
        </div>
        {!running && <div className="gameover">Game Over</div>}
      </div>
    </div>
  )
}
