import { expect, test } from '@playwright/test'

test.describe('Offline app shell', () => {
  test('reloads the page while offline once the service worker has cached it', async ({
    page,
    context,
  }) => {
    await page.goto('/offline-demo')
    await expect(page.getByRole('heading', { name: 'Offline capture demo' })).toBeVisible()

    // The first load registers and installs the service worker, but this
    // specific page isn't guaranteed to be *controlled* by it yet (that only
    // happens once it activates and claims clients). Reload once while still
    // online to be certain this page is SW-controlled before testing offline.
    await page.waitForFunction(() => navigator.serviceWorker.ready.then(() => true))
    await page.reload()
    await page.waitForFunction(() => navigator.serviceWorker.controller !== null, null, {
      timeout: 15_000,
    })

    await context.setOffline(true)
    await page.reload()

    await expect(page.getByRole('heading', { name: 'Offline capture demo' })).toBeVisible()
  })
})
