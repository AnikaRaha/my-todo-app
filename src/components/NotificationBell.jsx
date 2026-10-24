import { useState, useRef, useEffect } from 'react'

function timeAgo(time) {
  const diff = Date.now() - time
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export default function NotificationBell({ notifications, onMarkAllRead, onClear, onRequestPermission }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handle(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  const unread = notifications.filter(n => !n.read).length
  const canRequestPermission = typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default'

  return (
    <div className="notif-wrapper" ref={ref}>
      <button className="header-btn notif-bell" onClick={() => { setOpen(o => !o); if (!open && onRequestPermission) onRequestPermission() }} title="Notifications">
        🔔
        {unread > 0 && <span className="notif-badge">{unread}</span>}
      </button>
      {open && (
        <div className="notif-dropdown">
          <div className="notif-header">
            <span className="notif-title">Notifications</span>
            <div className="notif-header-actions">
              {unread > 0 && <button className="notif-action" onClick={onMarkAllRead}>Mark read</button>}
              {notifications.length > 0 && <button className="notif-action" onClick={onClear}>Clear</button>}
            </div>
          </div>
          {canRequestPermission && (
            <button className="notif-permission-btn" onClick={onRequestPermission}>
              🔔 Enable browser notifications
            </button>
          )}
          {notifications.length === 0 ? (
            <div className="notif-empty">No notifications yet</div>
          ) : (
            <div className="notif-list">
              {notifications.slice(0, 30).map(n => (
                <div key={n.id} className={`notif-item${n.read ? '' : ' notif-item--unread'}`}>
                  <span className="notif-item-icon">
                    {n.type === 'overdue' ? '⚠️' : n.type === 'pomodoro' ? '🍅' : n.type === 'due-today' ? '📅' : '🔔'}
                  </span>
                  <div className="notif-item-content">
                    <span className="notif-item-message">{n.message}</span>
                    <span className="notif-item-time">{timeAgo(n.time)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
