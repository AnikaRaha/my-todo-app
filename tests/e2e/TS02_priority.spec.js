import { test, expect } from '@playwright/test'
import { setup, addTask, taskCard } from './helpers.js'

test.describe('TS-02 Priority Management', () => {
  test.beforeEach(async ({ page }) => {
    await setup(page)
  })

  test('TC-02-01 default priority is Medium', async ({ page }) => {
    await expect(page.getByTestId('priority-select')).toHaveValue('medium')
  })

  test('TC-02-02 set High priority shows red High badge', async ({ page }) => {
    await addTask(page, { title: 'High prio task', priority: 'high' })
    const badge = taskCard(page, 'High prio task').getByTestId('task-priority')
    await expect(badge).toHaveText('high')
    await expect(badge).toHaveCSS('color', 'rgb(192, 57, 43)')
  })

  test('TC-02-03 set Medium priority shows amber Medium badge', async ({ page }) => {
    await addTask(page, { title: 'Medium prio task', priority: 'medium' })
    const badge = taskCard(page, 'Medium prio task').getByTestId('task-priority')
    await expect(badge).toHaveText('medium')
    await expect(badge).toHaveCSS('color', 'rgb(160, 112, 0)')
  })

  test('TC-02-04 set Low priority shows green Low badge', async ({ page }) => {
    await addTask(page, { title: 'Low prio task', priority: 'low' })
    const badge = taskCard(page, 'Low prio task').getByTestId('task-priority')
    await expect(badge).toHaveText('low')
    await expect(badge).toHaveCSS('color', 'rgb(39, 103, 73)')
  })

  test('TC-02-05 all 3 priority options available', async ({ page }) => {
    const options = page.getByTestId('priority-select').locator('option')
    await expect(options).toHaveText(['High', 'Medium', 'Low'])
  })
})
