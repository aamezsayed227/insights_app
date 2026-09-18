import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    // A production build, not the dev server: Playwright's context.setOffline()
    // blocks ALL network requests, including the dev server's on-demand ES
    // module fetches — which breaks unrelated app code that hasn't loaded yet,
    // not just the request our offline logic is meant to intercept. A build
    // is fully bundled, so nothing needs a network fetch once the page loads.
    command: 'pnpm build && pnpm preview --port 5173',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
