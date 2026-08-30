import { test, expect } from '@playwright/test'
import { setup, addTask, taskCard, dateStr } from './helpers.js'

test.describe('TS-06 Filtering', () => {
  test.beforeEach(async ({ page }) => {
    await setup(page)
  })

  test('TC-06-01 "All" filter shows all tasks regardless of status', async ({ page }) => {
    await addTask(page, { title: 'All pending' })
    await addTask(page, { title: 'All done' })
    await taskCard(page, 'All done').getByTestId('task-checkbox').click()
    await page.getByTestId('filter-all').click()
    await expect(page.getByTestId('task-card')).toHaveCount(2)
  })

  test('TC-06-02 "Today" filter shows only pending tasks due today', async ({ page }) => {
    await addTask(page, { title: 'Pending today', due: dateStr(0) })
    await addTask(page, { title: 'Pending tomorrow', due: dateStr(1) })
    await addTask(page, { title: 'Done today', due: dateStr(0) })
    await taskCard(page, 'Done today').getByTestId('task-checkbox').click()

    await page.getByTestId('filter-today').click()
    await expect(page.getByTestId('task-card')).toHaveCount(1)
    await expect(taskCard(page, 'Pending today')).toBeVisible()
  })

  test('TC-06-03 "High" filter shows only High priority pending tasks', async ({ page }) => {
    await addTask(page, { title: 'High pending', priority: 'high' })
    await addTask(page, { title: 'Medium pending', priority: 'medium' })
    await addTask(page, { title: 'High done', priority: 'high' })
    await taskCard(page, 'High done').getByTestId('task-checkbox').click()

    await page.getByTestId('filter-high').click()
    await expect(page.getByTestId('task-card')).toHaveCount(1)
    await expect(taskCard(page, 'High pending')).toBeVisible()
  })

  test('TC-06-04 "Pending" filter shows only incomplete tasks', async ({ page }) => {
    await addTask(page, { title: 'Pending A' })
    await addTask(page, { title: 'Pending B' })
    await addTask(page, { title: 'Done C' })
    await taskCard(page, 'Done C').getByTestId('task-checkbox').click()

    await page.getByTestId('filter-pending').click()
    await expect(page.getByTestId('task-card')).toHaveCount(2)
    await expect(taskCard(page, 'Done C')).toHaveCount(0)
  })

  test('TC-06-05 "Done" filter shows only completed tasks', async ({ page }) => {
    await addTask(page, { title: 'Pending X' })
    await addTask(page, { title: 'Done Y' })
    await addTask(page, { title: 'Done Z' })
    await taskCard(page, 'Done Y').getByTestId('task-checkbox').click()
    await taskCard(page, 'Done Z').getByTestId('task-checkbox').click()

    await page.getByTestId('filter-done').click()
    await expect(page.getByTestId('task-card')).toHaveCount(2)
    await expect(taskCard(page, 'Pending X')).toHaveCount(0)
  })

  test('TC-06-06 active filter is highlighted with dark background', async ({ page }) => {
    for (const f of ['all', 'today', 'high', 'pending', 'done']) {
      await page.getByTestId(`filter-${f}`).click()
      await expect(page.getByTestId(`filter-${f}`)).toHaveCSS('background-color', 'rgb(26, 26, 26)')
      const others = ['all', 'today', 'high', 'pending', 'done'].filter(x => x !== f)
      for (const o of others) {
        await expect(page.getByTestId(`filter-${o}`)).toHaveCSS('background-color', 'rgb(255, 255, 255)')
      }
    }
  })

  test('TC-06-07 empty state shown when no tasks match filter', async ({ page }) => {
    await addTask(page, { title: 'Only pending task' })
    await page.getByTestId('filter-done').click()
    await expect(page.getByTestId('task-card')).toHaveCount(0)
    await expect(page.getByTestId('empty-state')).toBeVisible()
    await expect(page.getByTestId('empty-state')).toHaveText('No tasks here. Add one above!')
  })
})
