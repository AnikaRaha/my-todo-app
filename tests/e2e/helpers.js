// Fixed "today" used across all suites so date/recurrence assertions are
// deterministic regardless of when the suite actually runs.
export const FIXED_NOW = new Date('2026-08-15T10:00:00')

function pad(n) {
  return String(n).padStart(2, '0')
}

// Formats FIXED_NOW (or another base date) + offsetDays as YYYY-MM-DD,
// matching the app's own local-date formatting (src/utils.js toLocalDateStr).
export function dateStr(offsetDays = 0, base = FIXED_NOW) {
  const d = new Date(base)
  d.setDate(d.getDate() + offsetDays)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

// Installs a fully-paused fake clock (install() alone keeps real time ticking
// on top of the fixed start point — pauseAt() is what actually freezes it),
// then loads the app with a clean localStorage.
export async function setup(page, { time = FIXED_NOW } = {}) {
  await page.clock.install({ time })
  await page.clock.pauseAt(time)
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
}

// The app derives each task's id from Date.now(). With the clock frozen for
// deterministic date assertions, back-to-back adds would otherwise collide
// on the same id — so nudge fake time forward after each add to keep ids
// (and addedAt) unique, same as they would be with a real, ticking clock.
export async function addTask(page, { title, priority, due, recur } = {}) {
  await page.getByTestId('task-input').fill(title)
  if (due) await page.getByTestId('due-date-input').fill(due)
  if (priority) await page.getByTestId('priority-select').selectOption(priority)
  if (recur) await page.getByTestId('recur-select').selectOption(recur)
  await page.getByRole('button', { name: 'Add', exact: true }).click()
  await page.clock.fastForward(1000)
}

// Scoped by the stable data-title attribute (not by rendered text) so the
// locator keeps resolving even while the title is being edited in-place.
export function taskCard(page, title) {
  return page.locator(`[data-testid="task-card"][data-title="${title}"]`)
}
