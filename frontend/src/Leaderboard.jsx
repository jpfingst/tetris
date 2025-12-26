import React, {useEffect, useState} from 'react'

export default function Leaderboard(){
  const [top, setTop] = useState([])

  useEffect(()=>{
    fetch('/api/leaderboard').then(r=>r.json()).then(j=>setTop(j.top || []))
  }, [])

  return (
    <div className="leaderboard">
      <h2>Top 10</h2>
      <ol>
        {top.map((t,i)=>(<li key={i}>{t.username} — {t.score}</li>))}
      </ol>
    </div>
  )
}
