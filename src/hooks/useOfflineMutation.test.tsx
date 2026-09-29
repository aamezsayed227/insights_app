import 'fake-indexeddb/auto'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { resetConnectivityForTests } from '@/lib/offline/connectivity'
import { offlineDb } from '@/lib/offline/db'
import { setMockOutcome } from '@/lib/offline/mockApi'
import { clearOfflineSession, initOfflineSession } from '@/lib/offline/session'
import { useOfflineMutation } from './useOfflineMutation'

function setOnline(online: boolean) {
  Object.defineProperty(navigator, 'onLine', { value: online, configurable: true })
}

function wrapper({ children }: PropsWithChildren) {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

describe('useOfflineMutation', () => {
  beforeEach(async () => {
    setOnline(true)
    resetConnectivityForTests()
    setMockOutcome('success')
    await initOfflineSession('mutation-hook-secret')
    await offlineDb.outbox.clear()
  })

  afterEach(async () => {
    clearOfflineSession()
    await offlineDb.outbox.clear()
    resetConnectivityForTests()
  })

  it('submits directly when online and successful', async () => {
    const { result } = renderHook(() => useOfflineMutation('demo-note', '/api/demo/notes'), {
      wrapper,
    })

    await act(async () => {
      await result.current.mutateAsync({ title: 'Online note' })
    })

    await waitFor(() => expect(result.current.data).toEqual({ queued: false }))
    expect(await offlineDb.outbox.count()).toBe(0)
  })

  it('queues to the outbox when offline', async () => {
    setOnline(false)
    const { result } = renderHook(() => useOfflineMutation('demo-note', '/api/demo/notes'), {
      wrapper,
    })

    await act(async () => {
      await result.current.mutateAsync({ title: 'Offline note' })
    })

    await waitFor(() => expect(result.current.data).toEqual({ queued: true }))
    expect(await offlineDb.outbox.count()).toBe(1)
  })

  // Reproduces the real Safari bug: navigator.onLine stays `true` after
  // Wi-Fi is disabled (webkit.org bug 225645), so the hook must not trust
  // it alone or the note silently vanishes instead of queuing.
  it('queues to the outbox when the offline event fired even though navigator.onLine is stale-true', async () => {
    setOnline(true)
    window.dispatchEvent(new Event('offline'))

    const { result } = renderHook(() => useOfflineMutation('demo-note', '/api/demo/notes'), {
      wrapper,
    })

    await act(async () => {
      await result.current.mutateAsync({ title: 'Safari stale-online note' })
    })

    await waitFor(() => expect(result.current.data).toEqual({ queued: true }))
    expect(await offlineDb.outbox.count()).toBe(1)
  })

  // The full real-world case, confirmed directly against Safari 27 with
  // Wi-Fi genuinely disabled: navigator.onLine stays `true` AND neither
  // the 'online' nor 'offline' event fires. Only the external probe in
  // connectivity.ts can catch this.
  it('queues to the outbox when navigator.onLine is stale-true, no event fires, and the external probe fails', async () => {
    setOnline(true)
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Load failed')))

    const { result } = renderHook(() => useOfflineMutation('demo-note', '/api/demo/notes'), {
      wrapper,
    })

    await act(async () => {
      await result.current.mutateAsync({ title: 'Real Safari wifi-off note' })
    })

    await waitFor(() => expect(result.current.data).toEqual({ queued: true }))
    expect(await offlineDb.outbox.count()).toBe(1)
  })
})
