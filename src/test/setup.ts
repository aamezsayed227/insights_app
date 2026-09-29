import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach, vi } from 'vitest'

// connectivity.ts's isBrowserOnline() does a real fetch() when
// navigator.onLine is true — stub it to succeed by default so "online"
// tests stay fast and hermetic; a test can override this to simulate a
// failed probe.
beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 200 })))
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})
