import { test, expect } from '@playwright/test'
import { setup, addTask, taskCard, dateStr } from './helpers.js'

test.describe('TS-04 Recurring Tasks', () => {
  test.beforeEach(async ({ page }) => {
    await setup(page)
  })

  test('TC-04-01 default recurrence is No repeat', async ({ page }) => {
    await expect(page.getByTestId('recur-select')).toHaveValue('none')
  })

  test('TC-04-02 daily recurrence label shown', async ({ page }) => {
    await addTask(page, { title: 'Daily labeled', recur: 'daily' })
    await expect(taskCard(page, 'Daily labeled').getByTestId('task-recur')).toHaveText('↻ daily')
  })

  test('TC-04-03 monthly recurrence label shown', async ({ page }) => {
    await addTask(page, { title: 'Monthly labeled', recur: 'monthly' })
    await expect(taskCard(page, 'Monthly labeled').getByTestId('task-recur')).toHaveText('↻ monthly')
  })

  test('TC-04-04 yearly recurrence label shown', async ({ page }) => {
    await addTask(page, { title: 'Yearly labeled', recur: 'yearly' })
    await expect(taskCard(page, 'Yearly labeled').getByTestId('task-recur')).toHaveText('↻ yearly')
  })

  test('TC-04-05 complete daily task creates next with tomorrow date', async ({ page }) => {
    await addTask(page, { title: 'Daily complete', due: dateStr(0), recur: 'daily' })
    await taskCard(page, 'Daily complete').getByTestId('task-checkbox').click()
    await expect(page.getByTestId('task-card')).toHaveCount(2)
    const next = taskCard(page, 'Daily complete').filter({ hasText: 'tomorrow' })
    await expect(next.getByTestId('task-due')).toHaveText('tomorrow')
  })

  test('TC-04-06 complete monthly task creates next with same day next month', async ({ page }) => {
    await addTask(page, { title: 'Monthly complete', due: dateStr(0), recur: 'monthly' })
    await taskCard(page, 'Monthly complete').getByTestId('task-checkbox').click()
    const next = taskCard(page, 'Monthly complete').filter({ hasText: 'Sep 15, 2026' })
    await expect(next.getByTestId('task-due')).toHaveText('Sep 15, 2026')
  })

  test('TC-04-07 complete yearly task creates next with same date next year', async ({ page }) => {
    await addTask(page, { title: 'Yearly complete', due: dateStr(0), recur: 'yearly' })
    await taskCard(page, 'Yearly complete').getByTestId('task-checkbox').click()
    const next = taskCard(page, 'Yearly complete').filter({ hasText: 'Aug 15, 2027' })
    await expect(next.getByTestId('task-due')).toHaveText('Aug 15, 2027')
  })

  test('TC-04-08 no modal appears on completion', async ({ page }) => {
    await addTask(page, { title: 'No modal task', recur: 'daily' })
    await taskCard(page, 'No modal task').getByTestId('task-checkbox').click()
    await expect(page.getByTestId('pomodoro-modal')).toHaveCount(0)
    await expect(page.getByRole('dialog')).toHaveCount(0)
  })

  test('TC-04-09 completed recurring task stays visible with strikethrough', async ({ page }) => {
    await addTask(page, { title: 'Stays visible', due: dateStr(0), recur: 'daily' })
    await taskCard(page, 'Stays visible').getByTestId('task-checkbox').click()
    const original = taskCard(page, 'Stays visible').filter({ hasText: 'today' })
    await expect(original).toBeVisible()
    await expect(original).toHaveCSS('opacity', '0.5')
    await expect(original.getByTestId('task-title')).toHaveCSS('text-decoration-line', 'line-through')
  })

  test('TC-04-10 daily future task: next date = due+1', async ({ page }) => {
    await addTask(page, { title: 'Future daily', due: dateStr(5), recur: 'daily' })
    await taskCard(page, 'Future daily').getByTestId('task-checkbox').click()
    const next = taskCard(page, 'Future daily').filter({ hasText: 'Aug 21, 2026' })
    await expect(next.getByTestId('task-due')).toHaveText('Aug 21, 2026')
  })

  test('TC-04-11 monthly 31st skips short months', async ({ page }) => {
    await addTask(page, { title: 'Jan 31 monthly', due: '2027-01-31', recur: 'monthly' })
    await taskCard(page, 'Jan 31 monthly').getByTestId('task-checkbox').click()
    const next = taskCard(page, 'Jan 31 monthly').filter({ hasText: 'Mar 31, 2027' })
    await expect(next.getByTestId('task-due')).toHaveText('Mar 31, 2027')
  })

  test('TC-04-12 yearly next date = same date + 1 year', async ({ page }) => {
    await addTask(page, { title: 'Aug 30 yearly', due: '2026-08-30', recur: 'yearly' })
    await taskCard(page, 'Aug 30 yearly').getByTestId('task-checkbox').click()
    const next = taskCard(page, 'Aug 30 yearly').filter({ hasText: 'Aug 30, 2027' })
    await expect(next.getByTestId('task-due')).toHaveText('Aug 30, 2027')
  })
})
