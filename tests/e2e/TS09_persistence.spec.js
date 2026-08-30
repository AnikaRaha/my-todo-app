import { test, expect } from '@playwright/test'
import { setup, addTask, taskCard } from './helpers.js'

test.describe('TS-09 Data Persistence', () => {
  test.beforeEach(async ({ page }) => {
    await setup(page)
  })

  test('TC-09-01 tasks persist on page refresh', async ({ page }) => {
    await addTask(page, { title: 'Persist A' })
    await addTask(page, { title: 'Persist B' })
    await page.reload()
    await expect(page.getByTestId('task-card')).toHaveCount(2)
    await expect(taskCard(page, 'Persist A')).toBeVisible()
    await expect(taskCard(page, 'Persist B')).toBeVisible()
  })

  test('TC-09-02 completed state persists across refresh', async ({ page }) => {
    await addTask(page, { title: 'Persist done' })
    await taskCard(page, 'Persist done').getByTestId('task-checkbox').click()
    await page.reload()
    await expect(taskCard(page, 'Persist done')).toHaveCSS('opacity', '0.5')
  })

  test('TC-09-03 deleted task does not return after refresh', async ({ page }) => {
    await addTask(page, { title: 'Persist delete' })
    const card = taskCard(page, 'Persist delete')
    await card.hover()
    await card.getByTestId('task-delete-btn').click()
    await page.reload()
    await expect(taskCard(page, 'Persist delete')).toHaveCount(0)
  })

  test('TC-09-04 tasks save automatically and survive reopening the page', async ({ page, context }) => {
    await addTask(page, { title: 'Auto saved' })
    await page.close()

    const reopened = await context.newPage()
    await reopened.goto('/')
    await expect(taskCard(reopened, 'Auto saved')).toBeVisible()
    await reopened.close()
  })

  test('TC-09-05 localStorage key is "tasks"', async ({ page }) => {
    await addTask(page, { title: 'Storage key check' })
    const raw = await page.evaluate(() => localStorage.getItem('tasks'))
    expect(raw).not.toBeNull()
    const parsed = JSON.parse(raw)
    expect(Array.isArray(parsed)).toBe(true)
    expect(parsed.some(t => t.title === 'Storage key check')).toBe(true)
  })
})
