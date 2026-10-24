import { useState, useEffect, useRef } from 'react'
import { CATEGORIES, todayStr, fmtDate } from '../utils'

export default function TaskCard({ task, onComplete, onDelete, onEdit, onFocus, onAddSubtask, onToggleSubtask, onDeleteSubtask }) {
  const [editing, setEditing] = useState(false)
  const [editVal, setEditVal] = useState(task.title)
  const [showNotes, setShowNotes] = useState(false)
  const [showSubtasks, setShowSubtasks] = useState(false)
  const [subtaskInput, setSubtaskInput] = useState('')
  const inputRef = useRef(null)
  const subtaskInputRef = useRef(null)

  useEffect(() => { if (editing) inputRef.current?.focus() }, [editing])
  useEffect(() => { if (showSubtasks && subtaskInputRef.current) subtaskInputRef.current.focus() }, [showSubtasks])

  function submitEdit() {
    if (editVal.trim()) onEdit(task.id, editVal.trim())
    setEditing(false)
  }

  function handleAddSubtask() {
    if (!subtaskInput.trim()) return
    onAddSubtask(task.id, subtaskInput.trim())
    setSubtaskInput('')
  }

  const today = todayStr()
  const isOverdue = !task.done && task.due < today
  const subtasks = task.subtasks || []
  const subtasksDone = subtasks.filter(s => s.done).length
  const categoryObj = CATEGORIES.find(c => c.value === task.category) || null

  function recurLabel() {
    if (!task.recur) return null
    return '↻ ' + task.recur
  }

  return (
    <div
      data-testid="task-card"
      data-title={task.title}
      className={`task-card${task.done ? ' task-card--done' : ''} task-card--priority-${task.priority}`}
    >
      <button data-testid="task-checkbox" onClick={() => onComplete(task)}
        className={`task-checkbox${task.done ? ' task-checkbox--done' : ''}`}>
        {task.done && <span className="check-icon">✓</span>}
      </button>

      <div className="task-content">
        {editing ? (
          <input data-testid="task-edit-input" ref={inputRef} value={editVal}
            onChange={e => setEditVal(e.target.value)}
            onBlur={submitEdit}
            onKeyDown={e => { if (e.key === 'Enter') submitEdit(); if (e.key === 'Escape') setEditing(false) }}
            className="task-edit-input" />
        ) : (
          <>
            <div
              data-testid="task-title"
              onDoubleClick={() => !task.done && setEditing(true)}
              title={task.done ? '' : 'Double-click to edit'}
              className={`task-title${task.done ? ' task-title--done' : ''}`}
            >
              {task.title}
              {task.recur && (
                <span data-testid="task-recur" className="task-recur-badge">{recurLabel()}</span>
              )}
            </div>
            {task.notes && (
              <div className="task-notes-preview" onClick={() => setShowNotes(s => !s)}>
                {showNotes ? task.notes : task.notes.length > 60 ? task.notes.slice(0, 60) + '…' : task.notes}
              </div>
            )}
          </>
        )}

        <div className="task-meta">
          <span data-testid="task-priority" className={`priority-badge priority-badge--${task.priority}`}>{task.priority}</span>
          <span data-testid="task-due" className={`task-due${isOverdue ? ' task-due--overdue' : ''}`}>
            {isOverdue ? '⚠ overdue' : fmtDate(task.due)}
          </span>
          {categoryObj && (
            <span className={`category-badge category-badge--${task.category}`}>{categoryObj.emoji} {categoryObj.label}</span>
          )}
          {subtasks.length > 0 && (
            <span className="subtask-counter" onClick={() => setShowSubtasks(s => !s)}>
              ☑ {subtasksDone}/{subtasks.length}
            </span>
          )}
        </div>

        {/* Subtasks */}
        {(showSubtasks || subtasks.length > 0) && !task.done && (
          <div className="subtask-section">
            {subtasks.length > 0 && (
              <div className="subtask-mini-progress">
                <div className="subtask-mini-track">
                  <div className="subtask-mini-fill" style={{ width: subtasks.length > 0 ? `${(subtasksDone / subtasks.length) * 100}%` : '0%' }} />
                </div>
              </div>
            )}
            {subtasks.map(s => (
              <div key={s.id} className="subtask-item">
                <button
                  className={`subtask-checkbox${s.done ? ' subtask-checkbox--done' : ''}`}
                  onClick={() => onToggleSubtask(task.id, s.id)}>
                  {s.done && '✓'}
                </button>
                <span className={`subtask-text${s.done ? ' subtask-text--done' : ''}`}>{s.text}</span>
                <button className="subtask-delete" onClick={() => onDeleteSubtask(task.id, s.id)}>×</button>
              </div>
            ))}
            <div className="subtask-add-row">
              <input
                ref={subtaskInputRef}
                className="subtask-input"
                value={subtaskInput}
                onChange={e => setSubtaskInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddSubtask()}
                placeholder="Add subtask…" />
              <button className="subtask-add-btn" onClick={handleAddSubtask}>+</button>
            </div>
          </div>
        )}
      </div>

      <div className="task-actions">
        {!task.done && (
          <>
            <button onClick={() => setShowSubtasks(s => !s)} className="task-action-btn" title="Subtasks">☑</button>
            <button data-testid="task-focus-btn" onClick={() => onFocus(task)} className="task-action-btn">🍅</button>
          </>
        )}
        <button data-testid="task-delete-btn" onClick={() => onDelete(task.id)} className="task-delete-btn">🗑</button>
      </div>
    </div>
  )
}
