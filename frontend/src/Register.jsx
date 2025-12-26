import React, {useState} from 'react'

export default function Register({onRegister}){
  const [u,setU]=useState('')
  const [p,setP]=useState('')
  const [err,setErr]=useState('')

  async function submit(e){
    e.preventDefault()
    setErr('')
    const res = await fetch('/api/register', {
      method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({username:u,password:p})
    })
    const j = await res.json()
    if(res.ok && j.token){ onRegister(j.token) }
    else setErr(j.error || 'register failed')
  }

  return (
    <form className="box" onSubmit={submit}>
      <h3>Register</h3>
      <input placeholder="username" value={u} onChange={e=>setU(e.target.value)} />
      <input placeholder="password" type="password" value={p} onChange={e=>setP(e.target.value)} />
      <button>Register</button>
      {err && <div className="error">{err}</div>}
    </form>
  )
}
