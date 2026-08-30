import { useState, useEffect, useRef } from 'react'
import { PRIORITY_COLORS, todayStr, fmtDate } from '../utils'

export default function TaskCard({ task, onComplete, onDelete, onEdit, onFocus }) {
  const [hovered, setHovered] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editVal, setEditVal] = useState(task.title)
  const inputRef = useRef(null)

  useEffect(() => { if (editing) inputRef.current?.focus() }, [editing])

  function submitEdit() {
    if (editVal.trim()) onEdit(task.id, editVal.trim())
    setEditing(false)
  }

  const today = todayStr()
  const isOverdue = !task.done && task.due < today
  const p = PRIORITY_COLORS[task.priority]

  function recurLabel() {
    if (!task.recur) return null
    if (task.recur === 'daily') return '↻ daily'
    if (task.recur === 'monthly') return '↻ monthly'
    if (task.recur === 'yearly') return '↻ yearly'
    return '↻ ' + task.recur
  }

  return (
    <div
      data-testid="task-card"
      data-title={task.title}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#fff', borderRadius: 10, padding: '12px 14px',
        display: 'flex', alignItems: 'center', gap: 12,
        border: `1px solid ${hovered ? '#ccc' : '#e8e8e4'}`,
        opacity: task.done ? 0.5 : 1, transition: 'border-color 0.15s',
      }}
    >
      <div data-testid="task-checkbox" onClick={() => onComplete(task)} style={{
        width: 20, height: 20, borderRadius: '50%', flexShrink: 0, cursor: 'pointer',
        border: task.done ? 'none' : '1.5px solid #ccc',
        background: task.done ? '#1a1a1a' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {task.done && <span style={{ color: '#fff', fontSize: 11 }}>✓</span>}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        {editing ? (
          <input data-testid="task-edit-input" ref={inputRef} value={editVal}
            onChange={e => setEditVal(e.target.value)}
            onBlur={submitEdit}
            onKeyDown={e => { if (e.key === 'Enter') submitEdit(); if (e.key === 'Escape') setEditing(false) }}
            style={{ width: '100%', fontSize: 14, border: 'none', borderBottom: '1px solid #ccc', outline: 'none', padding: '2px 0' }}
          />
        ) : (
          <div
            data-testid="task-title"
            onDoubleClick={() => !task.done && setEditing(true)}
            title={task.done ? '' : 'Double-click to edit'}
            style={{ fontSize: 14, textDecoration: task.done ? 'line-through' : 'none', color: task.done ? '#aaa' : '#1a1a1a', cursor: task.done ? 'default' : 'text' }}
          >
            {task.title}
            {task.recur && (
              <span data-testid="task-recur" style={{ marginLeft: 6, fontSize: 11, color: '#aaa' }}>{recurLabel()}</span>
            )}
          </div>
        )}
        <div style={{ display: 'flex', gap: 6, marginTop: 5, alignItems: 'center', flexWrap: 'wrap' }}>
          <span data-testid="task-priority" style={{ fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 20, background: p.bg, color: p.color }}>{task.priority}</span>
          <span data-testid="task-due" style={{ fontSize: 12, color: isOverdue ? '#c0392b' : '#888' }}>
            {isOverdue ? '⚠ overdue' : fmtDate(task.due)}
          </span>
        </div>
      </div>

      {hovered && (
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {!task.done && (
            <button data-testid="task-focus-btn" onClick={() => onFocus(task)} style={{ padding: '4px 10px', borderRadius: 8, border: '1px solid #ddd', background: '#fff', fontSize: 12, color: '#555', cursor: 'pointer' }}>🍅 Focus</button>
          )}
          <button data-testid="task-delete-btn" onClick={() => onDelete(task.id)} style={{ background: 'none', border: 'none', color: '#bbb', fontSize: 18, padding: 4, cursor: 'pointer' }}>🗑</button>
        </div>
      )}
    </div>
  )
}
