import { expect, test } from '@playwright/test'

test.describe('Offline capture demo', () => {
  test('queues a note offline and syncs it once back online', async ({ page, context }) => {
    await page.goto('/offline-demo')
    await expect(page.getByRole('heading', { name: 'Offline capture demo' })).toBeVisible()

    await context.setOffline(true)

    await page.getByLabel(/note title/i).fill('Ward round 14:00')
    await page.getByRole('button', { name: /save note/i }).click()

    await expect(page.getByTestId('pending-sync-badge')).toContainText('1')

    await context.setOffline(false)
    await page.getByRole('button', { name: /sync now/i }).click()

    await expect(page.getByTestId('pending-sync-badge')).toHaveCount(0)
  })

  test('surfaces a rejected entry for review without auto-retrying it', async ({
    page,
    context,
  }) => {
    await page.goto('/offline-demo')
    await expect(page.getByRole('heading', { name: 'Offline capture demo' })).toBeVisible()

    // Rejections are a sync-engine outcome (spec §6): the row has to go
    // through the outbox and be drained against a rejecting server.
    await context.setOffline(true)
    await page.getByLabel(/note title/i).fill('Duplicate ward entry')
    await page.getByRole('button', { name: /save note/i }).click()
    await expect(page.getByTestId('pending-sync-badge')).toContainText('1')

    await context.setOffline(false)
    await page.getByLabel(/server outcome/i).selectOption('validationRejected')
    await page.getByRole('button', { name: /sync now/i }).click()

    await expect(page.getByText(/needs your review/i)).toBeVisible()
    await expect(page.getByText(/duplicate or invalid entry/i)).toBeVisible()

    // Switching outcome back to success and clicking Sync now must not
    // touch the rejected row — server-authoritative, no auto-retry.
    await page.getByLabel(/server outcome/i).selectOption('success')
    await page.getByRole('button', { name: /sync now/i }).click()
    await expect(page.getByText(/needs your review/i)).toBeVisible()
  })

  test('"Review & resubmit" pre-fills the form and clears the rejected row', async ({
    page,
    context,
  }) => {
    await page.goto('/offline-demo')
    await expect(page.getByRole('heading', { name: 'Offline capture demo' })).toBeVisible()

    await context.setOffline(true)
    await page.getByLabel(/note title/i).fill('Duplicate ward entry')
    await page.getByRole('button', { name: /save note/i }).click()
    await expect(page.getByTestId('pending-sync-badge')).toContainText('1')

    await context.setOffline(false)
    await page.getByLabel(/server outcome/i).selectOption('validationRejected')
    await page.getByRole('button', { name: /sync now/i }).click()
    await expect(page.getByText(/needs your review/i)).toBeVisible()

    await page.getByRole('button', { name: /review & resubmit/i }).click()

    await expect(page.getByLabel(/note title/i)).toHaveValue('Duplicate ward entry')
    await expect(page.getByText(/needs your review/i)).not.toBeVisible()
  })

  test('falls back to the read-cache copy of the existing note when reloaded offline', async ({
    page,
    context,
  }) => {
    await page.goto('/offline-demo')
    await expect(page.getByRole('heading', { name: 'Offline capture demo' })).toBeVisible()

    // First render populates readCache via a live (online) fetch.
    await expect(page.getByText('Existing patient note (from server)')).toBeVisible()
    await expect(page.getByText(/offline copy/i)).not.toBeVisible()

    await context.setOffline(true)
    await page.getByRole('button', { name: /^reload$/i }).click()

    await expect(page.getByText(/offline copy/i)).toBeVisible()
    await expect(page.getByText('Existing patient note (from server)')).toBeVisible()
  })
})
