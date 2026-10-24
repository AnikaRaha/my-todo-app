export const PRIORITIES = ['high', 'medium', 'low']

export const PRIORITY_COLORS = {
  high: { bg: '#fdf0f0', color: '#c0392b' },
  medium: { bg: '#fef9ec', color: '#a07000' },
  low: { bg: '#f0faf3', color: '#276749' },
}

export const CATEGORIES = [
  { value: 'none', label: 'No category', emoji: '' },
  { value: 'personal', label: 'Personal', emoji: '👤' },
  { value: 'work', label: 'Work', emoji: '💼' },
  { value: 'shopping', label: 'Shopping', emoji: '🛒' },
  { value: 'health', label: 'Health', emoji: '❤️' },
  { value: 'study', label: 'Study', emoji: '📚' },
  { value: 'finance', label: 'Finance', emoji: '💰' },
]

export const WEEKDAY_NAMES = ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function toLocalDateStr(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function todayStr() {
  return toLocalDateStr(new Date())
}

export function fmtDate(d) {
  const today = todayStr()
  if (d === today) return 'today'
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  if (d === toLocalDateStr(tomorrow)) return 'tomorrow'
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function nextRecurringDate(due, recur) {
  const dueDate = new Date(due + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (recur === 'daily') {
    const base = dueDate > today ? dueDate : today
    base.setDate(base.getDate() + 1)
    return toLocalDateStr(base)
  }

  if (recur === 'weekly') {
    const base = dueDate > today ? dueDate : today
    base.setDate(base.getDate() + 7)
    return toLocalDateStr(base)
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
        return toLocalDateStr(new Date(year, month, targetDay))
      }
      month++
    }
  }

  if (recur === 'yearly') {
    const next = new Date(dueDate)
    next.setFullYear(next.getFullYear() + 1)
    return toLocalDateStr(next)
  }

  return due
}