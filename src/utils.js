export const PRIORITIES = ['high', 'medium', 'low']

export const PRIORITY_COLORS = {
  high: { bg: '#fdf0f0', color: '#c0392b' },
  medium: { bg: '#fef9ec', color: '#a07000' },
  low: { bg: '#f0faf3', color: '#276749' },
}

export const WEEKDAY_NAMES = ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export function todayStr() {
  return new Date().toISOString().split('T')[0]
}

export function fmtDate(d) {
  const today = todayStr()
  if (d === today) return 'today'
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  if (d === tomorrow.toISOString().split('T')[0]) return 'tomorrow'
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function nextRecurringDate(due, recur) {
  const dueDate = new Date(due + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (recur === 'daily') {
    const base = dueDate > today ? dueDate : today
    base.setDate(base.getDate() + 1)
    return base.toISOString().split('T')[0]
  }

  if (recur === 'monthly') {
    const targetDay = dueDate.getDate()
    let month = dueDate.getMonth() + 1
    let year = dueDate.getFullYear()

    // keep advancing month until we find one that has the target day
    while (true) {
      if (month > 11) { month = 0; year++ }
      const daysInMonth = new Date(year, month + 1, 0).getDate()
      if (daysInMonth >= targetDay) {
        return new Date(year, month, targetDay).toISOString().split('T')[0]
      }
      month++
    }
  }

  if (recur === 'yearly') {
    const next = new Date(dueDate)
    next.setFullYear(next.getFullYear() + 1)
    return next.toISOString().split('T')[0]
  }

  return due
}