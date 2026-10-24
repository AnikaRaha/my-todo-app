import { useState, useEffect, useRef } from 'react'
import { PRIORITIES, todayStr, nextRecurringDate } from './utils'
import PomodoroTimer from './components/PomodoroTimer'
import TaskCard from './components/TaskCard'

export default function App() {
  // ── State ──────────────────────────────────────────────────────────────
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('tasks')
    return saved ? JSON.parse(saved) : []
  })
  const [input, setInput] = useState('')
  const [priority, setPriority] = useState('medium')
  const [due, setDue] = useState(todayStr())
  const [recur, setRecur] = useState('none')
  const [notes, setNotes] = useState('')
  const [showNotes, setShowNotes] = useState(false)
  const [filter, setFilter] = useState('all')
  const [sortBy, setSortBy] = useState('added')
  const [search, setSearch] = useState('')
  const [focusTask, setFocusTask] = useState(null)
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('dark-mode')
    if (saved !== null) return JSON.parse(saved)
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })
  const [toast, setToast] = useState(null)

  const inputRef = useRef(null)
  const searchRef = useRef(null)
  const toastTimer = useRef(null)

  // ── Effects ────────────────────────────────────────────────────────────
  useEffect(() => { localStorage.setItem('tasks', JSON.stringify(tasks)) }, [tasks])

  useEffect(() => {
    localStorage.setItem('dark-mode', JSON.stringify(dark))
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  // Keyboard shortcuts
  useEffect(() => {
    function handleKey(e) {
      const tag = e.target.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
        if (e.key === 'Escape') e.target.blur()
        return
      }
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault()
        inputRef.current?.focus()
      }
      if (e.key === '/') {
        e.preventDefault()
        searchRef.current?.focus()
      }
      if (e.key === 'Escape' && focusTask) {
        setFocusTask(null)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [focusTask])

  // ── Handlers ───────────────────────────────────────────────────────────
  function addTask() {
    if (!input.trim()) return
    setTasks(prev => [{
      id: Date.now(), title: input.trim(), priority,
      due,
      recur: recur === 'none' ? null : recur,
      recurConfig: null,
      notes: notes.trim() || null,
      done: false, addedAt: Date.now()
    }, ...prev])
    setInput(''); setDue(todayStr()); setRecur('none'); setNotes(''); setShowNotes(false)
  }

  function completeTask(task) {
    if (task.done) {
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, done: false } : t))
    } else if (task.recur) {
      const nextDate = nextRecurringDate(task.due, task.recur)
      setTasks(prev => [
        { ...task, id: Date.now(), due: nextDate, done: false, addedAt: Date.now() },
        ...prev.map(t => t.id === task.id ? { ...t, done: true } : t)
      ])
    } else {
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, done: true } : t))
    }
  }

  function deleteTask(id) {
    const task = tasks.find(t => t.id === id)
    setTasks(prev => prev.filter(t => t.id !== id))
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast({ task, message: `"${task.title}" deleted` })
    toastTimer.current = setTimeout(() => setToast(null), 4000)
  }

  function undoDelete() {
    if (!toast) return
    setTasks(prev => [toast.task, ...prev])
    setToast(null)
    if (toastTimer.current) clearTimeout(toastTimer.current)
  }

  function editTask(id, title) { setTasks(prev => prev.map(t => t.id === id ? { ...t, title } : t)) }

  // ── Derived data ───────────────────────────────────────────────────────
  const today = todayStr()

  let filtered = tasks.filter(t => {
    if (filter === 'today') return t.due === today && !t.done
    if (filter === 'high') return t.priority === 'high' && !t.done
    if (filter === 'pending') return !t.done
    if (filter === 'done') return t.done
    return true
  })

  if (search.trim()) {
    const q = search.toLowerCase()
    filtered = filtered.filter(t =>
      t.title.toLowerCase().includes(q) ||
      (t.notes && t.notes.toLowerCase().includes(q))
    )
  }

  filtered = [...filtered].sort((a, b) => {
    if (sortBy === 'due') return a.due.localeCompare(b.due)
    if (sortBy === 'priority') return PRIORITIES.indexOf(a.priority) - PRIORITIES.indexOf(b.priority)
    return b.addedAt - a.addedAt
  })

  const stats = {
    today: tasks.filter(t => t.due === today && !t.done).length,
    done: tasks.filter(t => t.done).length,
    overdue: tasks.filter(t => !t.done && t.due < today).length,
  }

  const totalTasks = tasks.length
  const progressPct = totalTasks > 0 ? Math.round((stats.done / totalTasks) * 100) : 0

  const filterCounts = {
    all: tasks.length,
    today: stats.today,
    high: tasks.filter(t => t.priority === 'high' && !t.done).length,
    pending: tasks.filter(t => !t.done).length,
    done: stats.done,
  }

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="app">
      {focusTask && <PomodoroTimer task={focusTask} onClose={() => setFocusTask(null)} />}

      {/* Header */}
      <div className="header">
        <div className="header-left">
          <h1 className="header-title">
            <span className="header-title-icon">⚡</span> Taskflow
          </h1>
          <p className="header-date">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button className="dark-toggle" onClick={() => setDark(d => !d)} title="Toggle dark mode">
          {dark ? '☀️' : '🌙'}
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {[['Today', stats.today, false], ['Completed', stats.done, false], ['Overdue', stats.overdue, true]].map(([label, val, isDanger]) => (
          <div key={label} className="stat-card">
            <div className="stat-label">{label}</div>
            <div data-testid={`stat-${label.toLowerCase()}-value`} className={`stat-value${isDanger && val > 0 ? ' stat-value--danger' : ''}`}>{val}</div>
          </div>
        ))}
      </div>

      {/* Progress */}
      {totalTasks > 0 && (
        <div className="progress-section">
          <div className="progress-header">
            <span className="progress-label">Progress</span>
            <span className="progress-pct">{progressPct}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      )}

      {/* Add task */}
      <div className="add-section">
        <div className="add-row">
          <input ref={inputRef} data-testid="task-input" value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTask()}
            placeholder="Add a task…"
            className="add-input"
          />
          <button onClick={addTask} className="add-btn">Add</button>
        </div>
        <div className="options-row">
          <input data-testid="due-date-input" type="date" value={due} onChange={e => setDue(e.target.value)}
            className="input-field" />
          <select data-testid="priority-select" value={priority} onChange={e => setPriority(e.target.value)}
            className="input-field">
            {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
          </select>
          <select data-testid="recur-select" value={recur} onChange={e => setRecur(e.target.value)}
            className="input-field">
            <option value="none">No repeat</option>
            <option value="daily">↻ Daily</option>
            <option value="weekly">↻ Weekly</option>
            <option value="monthly">↻ Monthly</option>
            <option value="yearly">↻ Yearly</option>
          </select>
          <button className="notes-toggle" onClick={() => setShowNotes(s => !s)}>
            {showNotes ? '− Hide notes' : '+ Add notes'}
          </button>
        </div>
        {showNotes && (
          <textarea className="notes-input" value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="Add notes or description…" />
        )}
      </div>

      {/* Search */}
      <div className="search-wrapper">
        <span className="search-icon">🔍</span>
        <input ref={searchRef} className="search-bar" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search tasks…" />
        <span className="search-shortcut">/</span>
      </div>

      {/* Filters + Sort */}
      <div className="filters-bar">
        <div className="filters-group">
          {['all', 'today', 'high', 'pending', 'done'].map(f => (
            <button key={f} data-testid={`filter-${f}`} onClick={() => setFilter(f)}
              className={`filter-btn${filter === f ? ' filter-btn--active' : ''}`}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
              <span className="filter-badge">{filterCounts[f]}</span>
            </button>
          ))}
        </div>
        <select data-testid="sort-select" value={sortBy} onChange={e => setSortBy(e.target.value)}
          className="sort-select">
          <option value="added">Sort: Date added</option>
          <option value="due">Sort: Due date</option>
          <option value="priority">Sort: Priority</option>
        </select>
      </div>

      {/* Task list */}
      {filtered.length === 0 ? (
        <div data-testid="empty-state" className="empty-state">
          <span className="empty-icon">📝</span>
          {search ? 'No tasks match your search' : 'No tasks here yet'}
          <div className="empty-subtitle">
            {search ? 'Try a different search term' : 'Press N to add your first task!'}
          </div>
        </div>
      ) : (
        <div data-testid="task-list" className="task-list">
          {filtered.map(task => (
            <TaskCard key={task.id} task={task}
              onComplete={completeTask} onDelete={deleteTask}
              onEdit={editTask} onFocus={setFocusTask}
            />
          ))}
        </div>
      )}

      {/* Undo Toast */}
      <div className={`toast${toast ? ' toast--visible' : ''}`}>
        <span>{toast?.message}</span>
        <button className="toast-undo" onClick={undoDelete}>Undo</button>
      </div>
    </div>
  )
}
