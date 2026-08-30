import { test, expect } from '@playwright/test'
import { setup, addTask, taskCard } from './helpers.js'

test.describe('TS-08 Pomodoro Timer', () => {
  test.beforeEach(async ({ page }) => {
    await setup(page)
  })

  test('TC-08-01 Focus button appears on hover over pending task', async ({ page }) => {
    await addTask(page, { title: 'Pending focus task' })
    const card = taskCard(page, 'Pending focus task')
    await expect(card.getByTestId('task-focus-btn')).toHaveCount(0)
    await card.hover()
    await expect(card.getByTestId('task-focus-btn')).toBeVisible()
  })

  test('TC-08-02 Focus button hidden for done tasks', async ({ page }) => {
    await addTask(page, { title: 'Done focus task' })
    const card = taskCard(page, 'Done focus task')
    await card.getByTestId('task-checkbox').click()
    await card.hover()
    await expect(card.getByTestId('task-focus-btn')).toHaveCount(0)
  })

  test('TC-08-03 timer modal opens with task title', async ({ page }) => {
    await addTask(page, { title: 'Focus session task' })
    const card = taskCard(page, 'Focus session task')
    await card.hover()
    await card.getByTestId('task-focus-btn').click()
    const modal = page.getByTestId('pomodoro-modal')
    await expect(modal).toBeVisible()
    await expect(modal.getByTestId('pomodoro-task-title')).toHaveText('Focus session task')
  })

  test('TC-08-04 Focus mode is 25 minutes', async ({ page }) => {
    await addTask(page, { title: 'Timer task' })
    const card = taskCard(page, 'Timer task')
    await card.hover()
    await card.getByTestId('task-focus-btn').click()
    await expect(page.getByTestId('timer-display')).toHaveText('25:00')
  })

  test('TC-08-05 Short Break is 5 minutes', async ({ page }) => {
    await addTask(page, { title: 'Timer task' })
    const card = taskCard(page, 'Timer task')
    await card.hover()
    await card.getByTestId('task-focus-btn').click()
    const modal = page.getByTestId('pomodoro-modal')
    await modal.getByRole('button', { name: 'Short Break', exact: true }).click()
    await expect(page.getByTestId('timer-display')).toHaveText('05:00')
  })

  test('TC-08-06 Long Break is 15 minutes', async ({ page }) => {
    await addTask(page, { title: 'Timer task' })
    const card = taskCard(page, 'Timer task')
    await card.hover()
    await card.getByTestId('task-focus-btn').click()
    const modal = page.getByTestId('pomodoro-modal')
    await modal.getByRole('button', { name: 'Long Break', exact: true }).click()
    await expect(page.getByTestId('timer-display')).toHaveText('15:00')
  })

  test('TC-08-07 Start button begins countdown', async ({ page }) => {
    await addTask(page, { title: 'Timer task' })
    const card = taskCard(page, 'Timer task')
    await card.hover()
    await card.getByTestId('task-focus-btn').click()
    const modal = page.getByTestId('pomodoro-modal')
    await modal.getByRole('button', { name: 'Start', exact: true }).click()
    await page.clock.runFor(2000)
    await expect(page.getByTestId('timer-display')).toHaveText('24:58')
  })

  test('TC-08-08 Pause button pauses countdown at current value', async ({ page }) => {
    await addTask(page, { title: 'Timer task' })
    const card = taskCard(page, 'Timer task')
    await card.hover()
    await card.getByTestId('task-focus-btn').click()
    const modal = page.getByTestId('pomodoro-modal')
    await modal.getByRole('button', { name: 'Start', exact: true }).click()
    await page.clock.runFor(3000)
    await expect(page.getByTestId('timer-display')).toHaveText('24:57')
    await modal.getByRole('button', { name: 'Pause', exact: true }).click()
    await page.clock.runFor(3000)
    await expect(page.getByTestId('timer-display')).toHaveText('24:57')
  })

  test('TC-08-09 Reset resets to Focus 25:00', async ({ page }) => {
    await addTask(page, { title: 'Timer task' })
    const card = taskCard(page, 'Timer task')
    await card.hover()
    await card.getByTestId('task-focus-btn').click()
    const modal = page.getByTestId('pomodoro-modal')
    await modal.getByRole('button', { name: 'Start', exact: true }).click()
    await page.clock.runFor(5000)
    await modal.getByTestId('reset-btn').click()
    await expect(page.getByTestId('timer-display')).toHaveText('25:00')
    await expect(modal.getByRole('button', { name: 'Start', exact: true })).toBeVisible()
  })

  test('TC-08-10 pomodoro count shown after completing a 25-min focus session', async ({ page }) => {
    await addTask(page, { title: 'Timer task' })
    const card = taskCard(page, 'Timer task')
    await card.hover()
    await card.getByTestId('task-focus-btn').click()
    const modal = page.getByTestId('pomodoro-modal')
    await modal.getByRole('button', { name: 'Start', exact: true }).click()
    await page.clock.runFor(25 * 60 * 1000)
    await expect(modal.getByTestId('pomodoro-count')).toHaveText('🍅 × 1 completed')
    await expect(page.getByTestId('timer-display')).toHaveText('05:00')
  })

  test('TC-08-11 close modal does not affect the task', async ({ page }) => {
    await addTask(page, { title: 'Unaffected task' })
    const card = taskCard(page, 'Unaffected task')
    await card.hover()
    await card.getByTestId('task-focus-btn').click()
    const modal = page.getByTestId('pomodoro-modal')
    await modal.getByTestId('close-btn').click()
    await expect(modal).toHaveCount(0)
    await expect(taskCard(page, 'Unaffected task')).toHaveCSS('opacity', '1')
  })
})
