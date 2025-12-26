import React, {useState, useEffect} from 'react'
import Login from './Login'
import Register from './Register'
import Tetris from './Tetris'
import Leaderboard from './Leaderboard'

function App(){
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [view, setView] = useState('game')

  useEffect(()=>{
    if(token) localStorage.setItem('token', token)
    else localStorage.removeItem('token')
  },[token])

  if(!token){
    return (
      <div className="auth">
        <h1>Tetris — Login or Register</h1>
        <div className="forms">
          <Login onLogin={t=>setToken(t)} />
          <Register onRegister={t=>setToken(t)} />
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <header>
        <button onClick={()=>{setToken(null)}}>Logout</button>
        <button onClick={()=>setView('game')}>Play</button>
        <button onClick={()=>setView('lb')}>Leaderboard</button>
      </header>
      <main>
        {view==='game' ? <Tetris token={token} /> : <Leaderboard />}
      </main>
    </div>
  )
}

export default App
