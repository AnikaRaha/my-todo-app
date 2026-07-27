import { useState } from 'react'
import { todayStr, nextRecurringDate } from '../utils'

export default function RecurringDateModal({ task, onConfirm, onCancel }) {
  const suggested = nextRecurringDate(task.due, task.recur, task.recurConfig)
  const [nextDate, setNextDate] = useState(suggested)

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toISOString().split('T')[0]

  const inOneWeek = new Date()
  inOneWeek.setDate(inOneWeek.getDate() + 7)
  const inOneWeekStr = inOneWeek.toISOString().split('T')[0]

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: '1.5rem', width: 320, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Next occurrence</h3>
        <p style={{ fontSize: 13, color: '#888', marginBottom: 16 }}>
          "{task.title}" repeats {task.recur}. When should the next one be due?
        </p>
        <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
          {[['Suggested', suggested], ['Tomorrow', tomorrowStr], ['In 1 week', inOneWeekStr]].map(([label, date]) => (
            <button key={label} onClick={() => setNextDate(date)} style={{
              padding: '5px 12px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
              border: `1px solid ${nextDate === date ? '#1a1a1a' : '#ddd'}`,
              background: nextDate === date ? '#1a1a1a' : '#fff',
              color: nextDate === date ? '#fff' : '#555',
            }}>{label}</button>
          ))}
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 6 }}>Or pick a custom date</label>
          <input type="date" value={nextDate} min={todayStr()}
            onChange={e => setNextDate(e.target.value)}
            style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14 }}
          />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: '10px', borderRadius: 8, border: '1px solid #ddd', background: '#fff', fontSize: 14, color: '#555', cursor: 'pointer' }}>Cancel</button>
          <button onClick={() => onConfirm(nextDate)} style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: '#1a1a1a', color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>Confirm</button>
        </div>
      </div>
    </div>
  )
}
