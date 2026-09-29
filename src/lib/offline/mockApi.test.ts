import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { resetConnectivityForTests } from './connectivity'
import {
  ApiResponseError,
  getMockOutcome,
  mockApiGet,
  mockApiPost,
  NetworkError,
  setMockOutcome,
} from './mockApi'

function setOnline(online: boolean) {
  Object.defineProperty(navigator, 'onLine', { value: online, configurable: true })
}

describe('mock API client', () => {
  beforeEach(() => {
    setMockOutcome('success')
    setOnline(true)
    resetConnectivityForTests()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    setOnline(true)
    resetConnectivityForTests()
  })

  it('defaults to the success outcome', () => {
    expect(getMockOutcome()).toBe('success')
  })

  it('resolves with 201 on the success outcome', async () => {
    const promise = mockApiPost('/api/demo/notes', { title: 'x' })
    await vi.runAllTimersAsync()
    await expect(promise).resolves.toEqual({ status: 201, body: { message: 'created' } })
  })

  it('throws ApiResponseError(409) on validationRejected', async () => {
    setMockOutcome('validationRejected')
    const promise = mockApiPost('/api/demo/notes', { title: 'x' })
    promise.catch(() => {}) // avoid an unhandled-rejection warning while timers run below
    await vi.runAllTimersAsync()
    await expect(promise).rejects.toMatchObject({ status: 409 })
    await expect(promise).rejects.toBeInstanceOf(ApiResponseError)
  })

  it('throws ApiResponseError(401) on authExpired', async () => {
    setMockOutcome('authExpired')
    const promise = mockApiPost('/api/demo/notes', { title: 'x' })
    promise.catch(() => {})
    await vi.runAllTimersAsync()
    await expect(promise).rejects.toMatchObject({ status: 401 })
  })

  it('throws ApiResponseError(500) on serverError', async () => {
    setMockOutcome('serverError')
    const promise = mockApiPost('/api/demo/notes', { title: 'x' })
    promise.catch(() => {})
    await vi.runAllTimersAsync()
    await expect(promise).rejects.toMatchObject({ status: 500 })
  })

  it('throws NetworkError when the browser is offline, regardless of outcome', async () => {
    setOnline(false)
    await expect(mockApiPost('/api/demo/notes', { title: 'x' })).rejects.toBeInstanceOf(
      NetworkError,
    )
  })

  it('mockApiGet returns the seed when online', async () => {
    const promise = mockApiGet('/api/demo/notes/seed-1', { title: 'Seed note' })
    await vi.runAllTimersAsync()
    await expect(promise).resolves.toEqual({ title: 'Seed note' })
  })

  it('mockApiGet throws NetworkError when offline', async () => {
    setOnline(false)
    await expect(
      mockApiGet('/api/demo/notes/seed-1', { title: 'Seed note' }),
    ).rejects.toBeInstanceOf(NetworkError)
  })

  // Safari's navigator.onLine can stay `true` after Wi-Fi is disabled
  // (webkit.org bug 225645) — an 'offline' event should still be trusted.
  it('throws NetworkError when the offline event fired even though navigator.onLine is stale-true', async () => {
    window.dispatchEvent(new Event('offline'))
    const promise = mockApiPost('/api/demo/notes', { title: 'x' })
    promise.catch(() => {})
    await vi.runAllTimersAsync()
    await expect(promise).rejects.toBeInstanceOf(NetworkError)
  })

  // The full real-world case, confirmed directly against Safari 27 with
  // Wi-Fi genuinely disabled: navigator.onLine stays `true` AND neither
  // the 'online' nor 'offline' event fires at all. The external probe in
  // connectivity.ts is the only signal left — assertOnline must use it.
  it('throws NetworkError when navigator.onLine is stale-true, no event fires, and the external probe fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Load failed')))
    const promise = mockApiPost('/api/demo/notes', { title: 'x' })
    promise.catch(() => {})
    await vi.runAllTimersAsync()
    await expect(promise).rejects.toBeInstanceOf(NetworkError)
  })
})
