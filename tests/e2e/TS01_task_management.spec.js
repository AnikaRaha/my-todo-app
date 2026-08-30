import { test, expect } from '@playwright/test'
import { setup, addTask, taskCard } from './helpers.js'

test.describe('TS-01 Task Management', () => {
  test.beforeEach(async ({ page }) => {
    await setup(page)
  })

  test('TC-01-01 create task with valid title appears at top of list', async ({ page }) => {
    await addTask(page, { title: 'Buy groceries' })
    const cards = page.getByTestId('task-card')
    await expect(cards).toHaveCount(1)
    await expect(cards.first().getByTestId('task-title')).toHaveText('Buy groceries')
  })

  test('TC-01-02 create task by pressing Enter clears input', async ({ page }) => {
    await page.getByTestId('task-input').fill('Call dentist')
    await page.getByTestId('task-input').press('Enter')
    await expect(taskCard(page, 'Call dentist')).toHaveCount(1)
    await expect(page.getByTestId('task-input')).toHaveValue('')
  })

  test('TC-01-03 reject empty task', async ({ page }) => {
    await page.getByRole('button', { name: 'Add', exact: true }).click()
    await expect(page.getByTestId('task-card')).toHaveCount(0)
    await expect(page.getByTestId('empty-state')).toBeVisible()
  })

  test('TC-01-04 reject whitespace-only task', async ({ page }) => {
    await page.getByTestId('task-input').fill('   ')
    await page.getByRole('button', { name: 'Add', exact: true }).click()
    await expect(page.getByTestId('task-card')).toHaveCount(0)
  })

  test('TC-01-05 input clears after add', async ({ page }) => {
    await addTask(page, { title: 'Read a book' })
    await expect(page.getByTestId('task-input')).toHaveValue('')
  })

  test('TC-01-06 edit task by double-click', async ({ page }) => {
    await addTask(page, { title: 'Original title' })
    const card = taskCard(page, 'Original title')
    await card.getByTestId('task-title').dblclick()
    const editInput = card.getByTestId('task-edit-input')
    await editInput.fill('Updated title')
    await editInput.press('Enter')
    await expect(page.getByTestId('task-card').getByTestId('task-title')).toHaveText('Updated title')
  })

  test('TC-01-07 cancel edit with Escape restores original title', async ({ page }) => {
    await addTask(page, { title: 'Keep me' })
    const card = taskCard(page, 'Keep me')
    await card.getByTestId('task-title').dblclick()
    const editInput = card.getByTestId('task-edit-input')
    await editInput.fill('Should not save')
    await editInput.press('Escape')
    await expect(card.getByTestId('task-title')).toHaveText('Keep me')
  })

  test('TC-01-08 cannot edit completed task', async ({ page }) => {
    await addTask(page, { title: 'Done task' })
    const card = taskCard(page, 'Done task')
    await card.getByTestId('task-checkbox').click()
    await card.getByTestId('task-title').dblclick()
    await expect(card.getByTestId('task-edit-input')).toHaveCount(0)
  })

  test('TC-01-09 reject empty edit keeps original title', async ({ page }) => {
    await addTask(page, { title: 'Non-empty title' })
    const card = taskCard(page, 'Non-empty title')
    await card.getByTestId('task-title').dblclick()
    const editInput = card.getByTestId('task-edit-input')
    await editInput.fill('')
    await editInput.press('Enter')
    await expect(page.getByTestId('task-card').getByTestId('task-title')).toHaveText('Non-empty title')
  })

  test('TC-01-10 delete pending task removes it from list', async ({ page }) => {
    await addTask(page, { title: 'Delete me' })
    const card = taskCard(page, 'Delete me')
    await card.hover()
    await card.getByTestId('task-delete-btn').click()
    await expect(page.getByTestId('task-card')).toHaveCount(0)
  })

  test('TC-01-11 delete icon appears on hover only', async ({ page }) => {
    await addTask(page, { title: 'Hover test' })
    const card = taskCard(page, 'Hover test')
    await expect(card.getByTestId('task-delete-btn')).toHaveCount(0)
    await card.hover()
    await expect(card.getByTestId('task-delete-btn')).toBeVisible()
    await page.getByRole('heading', { name: 'My tasks' }).hover()
    await expect(card.getByTestId('task-delete-btn')).toHaveCount(0)
  })

  test('TC-01-12 delete completed task', async ({ page }) => {
    await addTask(page, { title: 'Finish then delete' })
    const card = taskCard(page, 'Finish then delete')
    await card.getByTestId('task-checkbox').click()
    await card.hover()
    await card.getByTestId('task-delete-btn').click()
    await expect(page.getByTestId('task-card')).toHaveCount(0)
  })

  test('TC-01-13 complete a task shows strikethrough and reduced opacity', async ({ page }) => {
    await addTask(page, { title: 'Complete me' })
    const card = taskCard(page, 'Complete me')
    await card.getByTestId('task-checkbox').click()
    await expect(card).toHaveCSS('opacity', '0.5')
    await expect(card.getByTestId('task-title')).toHaveCSS('text-decoration-line', 'line-through')
  })

  test('TC-01-14 undo task completion reverts to pending', async ({ page }) => {
    await addTask(page, { title: 'Toggle me' })
    const card = taskCard(page, 'Toggle me')
    await card.getByTestId('task-checkbox').click()
    await expect(card).toHaveCSS('opacity', '0.5')
    await card.getByTestId('task-checkbox').click()
    await expect(card).toHaveCSS('opacity', '1')
    await expect(card.getByTestId('task-title')).toHaveCSS('text-decoration-line', 'none')
  })

  test('TC-01-15 non-recurring task stays done until manually undone', async ({ page }) => {
    await addTask(page, { title: 'Stay done' })
    const card = taskCard(page, 'Stay done')
    await card.getByTestId('task-checkbox').click()
    await expect(card).toHaveCSS('opacity', '0.5')
    // no new task should have been spawned, and it stays done with no further action
    await expect(page.getByTestId('task-card')).toHaveCount(1)
    await expect(card).toHaveCSS('opacity', '0.5')
  })
})
