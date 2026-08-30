import { test, expect } from '@playwright/test'
import { setup, addTask, taskCard, dateStr } from './helpers.js'

test.describe('TS-03 Due Date Management', () => {
  test.beforeEach(async ({ page }) => {
    await setup(page)
  })

  test('TC-03-01 default due date is today', async ({ page }) => {
    await expect(page.getByTestId('due-date-input')).toHaveValue(dateStr(0))
  })

  test('TC-03-02 task due today shows "today"', async ({ page }) => {
    await addTask(page, { title: 'Today task', due: dateStr(0) })
    await expect(taskCard(page, 'Today task').getByTestId('task-due')).toHaveText('today')
  })

  test('TC-03-03 task due tomorrow shows "tomorrow"', async ({ page }) => {
    await addTask(page, { title: 'Tomorrow task', due: dateStr(1) })
    await expect(taskCard(page, 'Tomorrow task').getByTestId('task-due')).toHaveText('tomorrow')
  })

  test('TC-03-04 future date shows "Mon DD, YYYY" format', async ({ page }) => {
    await addTask(page, { title: 'Future task', due: dateStr(5) })
    await expect(taskCard(page, 'Future task').getByTestId('task-due')).toHaveText('Aug 20, 2026')
  })

  test('TC-03-05 overdue task shows warning', async ({ page }) => {
    await addTask(page, { title: 'Overdue task', due: dateStr(-3) })
    const due = taskCard(page, 'Overdue task').getByTestId('task-due')
    await expect(due).toHaveText('⚠ overdue')
    await expect(due).toHaveCSS('color', 'rgb(192, 57, 43)')
  })

  test('TC-03-06 completed task does not show overdue', async ({ page }) => {
    await addTask(page, { title: 'Overdue then done', due: dateStr(-3) })
    const card = taskCard(page, 'Overdue then done')
    await expect(card.getByTestId('task-due')).toHaveText('⚠ overdue')
    await card.getByTestId('task-checkbox').click()
    await expect(card.getByTestId('task-due')).not.toHaveText('⚠ overdue')
  })
})
