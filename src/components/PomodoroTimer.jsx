import { useState, useEffect, useRef } from 'react'

const MODES = { focus: 25 * 60, short: 5 * 60, long: 15 * 60 }
const LABELS = { focus: 'Focus', short: 'Short Break', long: 'Long Break' }

export default function PomodoroTimer({ task, onClose, onNotify }) {
  const [mode, setMode] = useState('focus')
  const [timeLeft, setTimeLeft] = useState(MODES.focus)
  const [running, setRunning] = useState(false)
  const [count, setCount] = useState(0)
  const intervalRef = useRef(null)

  // The authoritative countdown value for the ticking logic below. Updated
  // synchronously at every write site (never via a setState updater — React's
  // StrictMode double-invokes functional updaters to check purity, which
  // would double any side effect placed inside one) so each tick always
  // reads the true current value with no render round-trip lag.
  const timeLeftRef = useRef(timeLeft)
  function updateTimeLeft(value) {
    timeLeftRef.current = value
    setTimeLeft(value)
  }

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => {
      const next = timeLeftRef.current - 1
      if (next > 0) {
        updateTimeLeft(next)
        return
      }
      setRunning(false)
      if (mode === 'focus') {
        const nextCount = count + 1
        const nextMode = nextCount % 4 === 0 ? 'long' : 'short'
        setCount(nextCount)
        setMode(nextMode)
        updateTimeLeft(MODES[nextMode])
        onNotify?.(`Pomodoro #${nextCount} completed for "${task.title}"! Time for a ${nextMode === 'long' ? 'long' : 'short'} break.`)
      } else {
        setMode('focus')
        updateTimeLeft(MODES.focus)
        onNotify?.(`Break over! Time to focus on "${task.title}"`)
      }
    }, 1000)
    intervalRef.current = id
    return () => clearInterval(id)
  }, [running, mode, count])

  function switchMode(m) {
    setMode(m); updateTimeLeft(MODES[m]); setRunning(false)
    clearInterval(intervalRef.current)
  }

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0')
  const secs = String(timeLeft % 60).padStart(2, '0')
  const circumference = 2 * Math.PI * 62
  const progress = 1 - (timeLeft / MODES[mode])

  return (
    <div data-testid="pomodoro-modal" className="pomodoro-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="pomodoro-modal">
        <div className="pomodoro-header">
          <span className="pomodoro-count-label">🍅 Pomodoro #{count + 1}</span>
          <button data-testid="close-btn" onClick={onClose} className="pomodoro-close-btn">✕</button>
        </div>
        <div data-testid="pomodoro-task-title" className="pomodoro-task-title">{task.title}</div>
        <div className="pomodoro-modes">
          {Object.keys(MODES).map(m => (
            <button key={m} onClick={() => switchMode(m)}
              className={`pomodoro-mode-btn${mode === m ? ' pomodoro-mode-btn--active' : ''}`}>
              {LABELS[m]}
            </button>
          ))}
        </div>
        <div className="pomodoro-ring">
          <svg width="160" height="160" viewBox="0 0 160 160">
            <circle cx="80" cy="80" r="62" fill="none" stroke="var(--border)" strokeWidth="8" />
            <circle cx="80" cy="80" r="62" fill="none"
              stroke={mode === 'focus' ? '#ef4444' : '#22c55e'} strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
              strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.5s' }}
            />
          </svg>
          <div className="pomodoro-display">
            <span data-testid="timer-display" className="pomodoro-time">{mins}:{secs}</span>
            <span className="pomodoro-mode-label">{LABELS[mode]}</span>
          </div>
        </div>
        <div className="pomodoro-controls">
          <button data-testid="reset-btn" onClick={() => switchMode('focus')} className="pomodoro-reset-btn">↺</button>
          <button onClick={() => setRunning(r => !r)} className="pomodoro-start-btn">
            {running ? 'Pause' : 'Start'}
          </button>
        </div>
        {count > 0 && <div data-testid="pomodoro-count" className="pomodoro-completed">🍅 × {count} completed</div>}
      </div>
    </div>
  )
}
