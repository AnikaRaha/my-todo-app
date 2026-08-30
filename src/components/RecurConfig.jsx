import { todayStr } from '../utils'

export default function RecurConfig({
  recur, monthDay, setMonthDay,
  recurTime, setRecurTime, customDate, setCustomDate,
  customTime, setCustomTime, customTab, setCustomTab
}) {
  if (recur === 'daily') return (
    <div style={{ marginTop: 10, padding: '10px 12px', background: '#f9f9f9', borderRadius: 8, fontSize: 13, color: '#888' }}>
      ↻ Repeats every day
    </div>
  )

  if (recur === 'custom') return (
    <div style={{ marginTop: 10, background: '#f9f9f9', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ display: 'flex', borderBottom: '1px solid #e8e8e4' }}>
        {['monthly', 'yearly'].map(tab => (
          <button key={tab} onClick={() => setCustomTab(tab)} style={{
            flex: 1, padding: '9px', fontSize: 13, border: 'none', cursor: 'pointer',
            background: customTab === tab ? '#fff' : 'transparent',
            color: customTab === tab ? '#1a1a1a' : '#888',
            fontWeight: customTab === tab ? 600 : 400,
            borderBottom: customTab === tab ? '2px solid #1a1a1a' : '2px solid transparent',
          }}>{tab.charAt(0).toUpperCase() + tab.slice(1)}</button>
        ))}
      </div>

      {customTab === 'monthly' && (
        <div style={{ padding: '12px' }}>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>Repeat on day</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <select value={monthDay} onChange={e => setMonthDay(Number(e.target.value))}
              style={{ padding: '7px 10px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13 }}>
              {Array.from({ length: 28 }, (_, i) => i + 1).map(d => (
                <option key={d} value={d}>
                  {d}{['st', 'nd', 'rd'][d - 1] || 'th'} of each month
                </option>
              ))}
            </select>
            <span style={{ fontSize: 12, color: '#888' }}>at</span>
            <input type="time" value={recurTime} onChange={e => setRecurTime(e.target.value)}
              style={{ padding: '7px 10px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13 }} />
          </div>
        </div>
      )}

      {customTab === 'yearly' && (
        <div style={{ padding: '12px' }}>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>Repeats every year on</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <input type="date" value={customDate} min={todayStr()} onChange={e => setCustomDate(e.target.value)}
              style={{ padding: '7px 10px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13 }} />
            <span style={{ fontSize: 12, color: '#888' }}>at</span>
            <input type="time" value={customTime} onChange={e => setCustomTime(e.target.value)}
              style={{ padding: '7px 10px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13 }} />
          </div>
          <div style={{ fontSize: 11, color: '#aaa', marginTop: 8 }}>
            ↻ Will repeat every year on this date
          </div>
        </div>
      )}
    </div>
  )

  return null
}
