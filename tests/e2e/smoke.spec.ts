import { expect, test } from '@playwright/test'

test('base app loads', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByText(/insight/i)).toBeVisible()
})
