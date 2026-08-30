import { test, expect } from '@playwright/test'
import { setup, addTask, taskCard, dateStr } from './helpers.js'

test.describe('TS-05 Statistics Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await setup(page)
  })

  test('TC-05-01 today counter shows correct count', async ({ page }) => {
    await addTask(page, { title: 'Today one', due: dateStr(0) })
    await addTask(page, { title: 'Today two', due: dateStr(0) })
    await expect(page.getByTestId('stat-today-value')).toHaveText('2')
  })

  test('TC-05-02 completed counter increments', async ({ page }) => {
    await addTask(page, { title: 'To complete' })
    await expect(page.getByTestId('stat-completed-value')).toHaveText('0')
    await taskCard(page, 'To complete').getByTestId('task-checkbox').click()
    await expect(page.getByTestId('stat-completed-value')).toHaveText('1')
  })

  test('TC-05-03 overdue counter shows in red', async ({ page }) => {
    await addTask(page, { title: 'Late task', due: dateStr(-2) })
    await expect(page.getByTestId('stat-overdue-value')).toHaveText('1')
    await expect(page.getByTestId('stat-overdue-value')).toHaveCSS('color', 'rgb(192, 57, 43)')
  })

  test('TC-05-04 counters update in real time on add/complete/delete', async ({ page }) => {
    await addTask(page, { title: 'RT task', due: dateStr(0) })
    await expect(page.getByTestId('stat-today-value')).toHaveText('1')

    await taskCard(page, 'RT task').getByTestId('task-checkbox').click()
    await expect(page.getByTestId('stat-completed-value')).toHaveText('1')
    await expect(page.getByTestId('stat-today-value')).toHaveText('0')

    const card = taskCard(page, 'RT task')
    await card.hover()
    await card.getByTestId('task-delete-btn').click()
    await expect(page.getByTestId('stat-completed-value')).toHaveText('0')
  })

  test('TC-05-05 completed task due today leaves Today counter', async ({ page }) => {
    await addTask(page, { title: 'Due today done', due: dateStr(0) })
    await expect(page.getByTestId('stat-today-value')).toHaveText('1')
    await taskCard(page, 'Due today done').getByTestId('task-checkbox').click()
    await expect(page.getByTestId('stat-today-value')).toHaveText('0')
  })
})
