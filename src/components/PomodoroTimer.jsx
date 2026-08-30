import { useState, useEffect, useRef } from 'react'

const MODES = { focus: 25 * 60, short: 5 * 60, long: 15 * 60 }
const LABELS = { focus: 'Focus', short: 'Short Break', long: 'Long Break' }

export default function PomodoroTimer({ task, onClose }) {
  const [mode, setMode] = useState('focus')
  const [timeLeft, setTimeLeft] = useState(MODES.focus)
  const [running, setRunning] = useState(false)
  const [count, setCount] = useState(0)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(intervalRef.current)
            setRunning(false)
            if (mode === 'focus') {
              setCount(c => {
                const next = c + 1
                const nextMode = next % 4 === 0 ? 'long' : 'short'
                setMode(nextMode)
                setTimeLeft(MODES[nextMode])
                return next
              })
            } else {
              setMode('focus')
              setTimeLeft(MODES.focus)
            }
            return 0
          }
          return t - 1
        })
      }, 1000)
    }
    return () => clearInterval(intervalRef.current)
  }, [running, mode])

  function switchMode(m) {
    setMode(m); setTimeLeft(MODES[m]); setRunning(false)
    clearInterval(intervalRef.current)
  }

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0')
  const secs = String(timeLeft % 60).padStart(2, '0')
  const circumference = 2 * Math.PI * 54

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: '2rem', width: 340, textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 13, color: '#888' }}>🍅 Pomodoro #{count + 1}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, color: '#aaa', cursor: 'pointer' }}>✕</button>
        </div>
        <div style={{ fontSize: 13, fontWeight: 500, color: '#555', marginBottom: 16 }}>{task.title}</div>
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 24 }}>
          {Object.keys(MODES).map(m => (
            <button key={m} onClick={() => switchMode(m)} style={{
              padding: '5px 12px', borderRadius: 20, border: 'none', fontSize: 12, cursor: 'pointer',
              background: mode === m ? '#1a1a1a' : '#f0f0f0', color: mode === m ? '#fff' : '#555'
            }}>{LABELS[m]}</button>
          ))}
        </div>
        <div style={{ position: 'relative', width: 140, height: 140, margin: '0 auto 24px' }}>
          <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="70" cy="70" r="54" fill="none" stroke="#f0f0f0" strokeWidth="8" />
            <circle cx="70" cy="70" r="54" fill="none"
              stroke={mode === 'focus' ? '#c0392b' : '#276749'} strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (timeLeft / MODES[mode])}
              strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.5s' }}
            />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 32, fontWeight: 600, letterSpacing: 2 }}>{mins}:{secs}</span>
            <span style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>{LABELS[mode]}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button onClick={() => switchMode('focus')} style={{ padding: '10px 16px', borderRadius: 10, border: '1px solid #ddd', background: '#fff', fontSize: 18, color: '#555', cursor: 'pointer' }}>↺</button>
          <button onClick={() => setRunning(r => !r)} style={{ padding: '10px 32px', borderRadius: 10, border: 'none', background: '#1a1a1a', color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
            {running ? 'Pause' : 'Start'}
          </button>
        </div>
        {count > 0 && <div style={{ marginTop: 16, fontSize: 13, color: '#888' }}>🍅 × {count} completed</div>}
      </div>
    </div>
  )
}
