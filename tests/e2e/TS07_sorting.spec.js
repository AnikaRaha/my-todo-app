import { test, expect } from '@playwright/test'
import { setup, addTask, taskCard, dateStr } from './helpers.js'

async function titleOrder(page) {
  return page.getByTestId('task-list').getByTestId('task-title').allTextContents()
}

test.describe('TS-07 Sorting', () => {
  test.beforeEach(async ({ page }) => {
    await setup(page)
  })

  test('TC-07-01 sort by Date added shows newest first', async ({ page }) => {
    await addTask(page, { title: 'First added' })
    await addTask(page, { title: 'Second added' })
    await addTask(page, { title: 'Third added' })
    await page.getByTestId('sort-select').selectOption('added')
    await expect.poll(() => titleOrder(page)).toEqual(['Third added', 'Second added', 'First added'])
  })

  test('TC-07-02 sort by Due date shows earliest first', async ({ page }) => {
    await addTask(page, { title: 'Due later', due: dateStr(5) })
    await addTask(page, { title: 'Due soonest', due: dateStr(0) })
    await addTask(page, { title: 'Due middle', due: dateStr(2) })
    await page.getByTestId('sort-select').selectOption('due')
    await expect.poll(() => titleOrder(page)).toEqual(['Due soonest', 'Due middle', 'Due later'])
  })

  test('TC-07-03 sort by Priority shows High to Low', async ({ page }) => {
    await addTask(page, { title: 'Low task', priority: 'low' })
    await addTask(page, { title: 'High task', priority: 'high' })
    await addTask(page, { title: 'Medium task', priority: 'medium' })
    await page.getByTestId('sort-select').selectOption('priority')
    await expect.poll(() => titleOrder(page)).toEqual(['High task', 'Medium task', 'Low task'])
  })

  test('TC-07-04 sort works with active filter applied', async ({ page }) => {
    await addTask(page, { title: 'Pending later', due: dateStr(5) })
    await addTask(page, { title: 'Pending soonest', due: dateStr(0) })
    await addTask(page, { title: 'Done soonest', due: dateStr(0) })
    await taskCard(page, 'Done soonest').getByTestId('task-checkbox').click()

    await page.getByTestId('filter-pending').click()
    await page.getByTestId('sort-select').selectOption('due')
    await expect.poll(() => titleOrder(page)).toEqual(['Pending soonest', 'Pending later'])
  })
})
