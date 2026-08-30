import { useState, useEffect } from 'react'
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
  const [filter, setFilter] = useState('all')
  const [sortBy, setSortBy] = useState('added')
  const [focusTask, setFocusTask] = useState(null)

  // ── Effects ────────────────────────────────────────────────────────────
  useEffect(() => { localStorage.setItem('tasks', JSON.stringify(tasks)) }, [tasks])

  // ── Handlers ───────────────────────────────────────────────────────────
  function addTask() {
    if (!input.trim()) return
    setTasks(prev => [{
      id: Date.now(), title: input.trim(), priority,
      due,
      recur: recur === 'none' ? null : recur,
      recurConfig: null,
      done: false, addedAt: Date.now()
    }, ...prev])
    setInput(''); setDue(todayStr()); setRecur('none')
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

  function deleteTask(id) { setTasks(prev => prev.filter(t => t.id !== id)) }
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

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '2rem 1rem' }}>
      {focusTask && <PomodoroTimer task={focusTask} onClose={() => setFocusTask(null)} />}

      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 4 }}>My tasks</h1>
      <p style={{ color: '#888', fontSize: 14, marginBottom: 24 }}>
        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
      </p>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 24 }}>
        {[['Today', stats.today, '#1a1a1a'], ['Completed', stats.done, '#1a1a1a'], ['Overdue', stats.overdue, '#c0392b']].map(([label, val, color]) => (
          <div key={label} style={{ background: '#fff', borderRadius: 10, padding: '12px 16px', border: '1px solid #e8e8e4' }}>
            <div style={{ fontSize: 12, color: '#888' }}>{label}</div>
            <div data-testid={`stat-${label.toLowerCase()}-value`} style={{ fontSize: 24, fontWeight: 600, color }}>{val}</div>
          </div>
        ))}
      </div>

      {/* Add task */}
      <div style={{ background: '#fff', border: '1px solid #e8e8e4', borderRadius: 12, padding: '14px', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <input data-testid="task-input" value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTask()}
            placeholder="Add a task…"
            style={{ flex: 1, padding: '9px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14 }}
          />
          <button onClick={addTask} style={{ background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 20px', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>Add</button>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input data-testid="due-date-input" type="date" value={due} onChange={e => setDue(e.target.value)}
            style={{ padding: '7px 10px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13, color: '#555' }}
          />
          <select data-testid="priority-select" value={priority} onChange={e => setPriority(e.target.value)}
            style={{ padding: '7px 10px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13, color: '#555' }}>
            {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
          </select>
          <select data-testid="recur-select" value={recur} onChange={e => setRecur(e.target.value)}
            style={{ padding: '7px 10px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13, color: '#555' }}>
            <option value="none">No repeat</option>
            <option value="daily">↻ Daily</option>
            <option value="monthly">↻ Monthly</option>
            <option value="yearly">↻ Yearly</option>
          </select>
        </div>
      </div>

      {/* Filters + Sort */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['all', 'today', 'high', 'pending', 'done'].map(f => (
            <button key={f} data-testid={`filter-${f}`} onClick={() => setFilter(f)} style={{
              padding: '5px 14px', borderRadius: 20, fontSize: 13, border: '1px solid #ddd', cursor: 'pointer',
              background: filter === f ? '#1a1a1a' : '#fff', color: filter === f ? '#fff' : '#555',
            }}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>
          ))}
        </div>
        <select data-testid="sort-select" value={sortBy} onChange={e => setSortBy(e.target.value)}
          style={{ padding: '5px 10px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13, color: '#555', cursor: 'pointer' }}>
          <option value="added">Sort: Date added</option>
          <option value="due">Sort: Due date</option>
          <option value="priority">Sort: Priority</option>
        </select>
      </div>

      {/* Task list */}
      {filtered.length === 0 ? (
        <div data-testid="empty-state" style={{ textAlign: 'center', padding: '3rem', color: '#aaa', fontSize: 14 }}>No tasks here. Add one above!</div>
      ) : (
        <div data-testid="task-list" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {filtered.map(task => (
            <TaskCard key={task.id} task={task}
              onComplete={completeTask} onDelete={deleteTask}
              onEdit={editTask} onFocus={setFocusTask}
            />
          ))}
        </div>
      )}
    </div>
  )
}
