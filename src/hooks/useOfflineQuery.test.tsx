import 'fake-indexeddb/auto'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { offlineDb } from '@/lib/offline/db'
import { clearOfflineSession, initOfflineSession } from '@/lib/offline/session'
import { useOfflineQuery } from './useOfflineQuery'

function wrapper({ children }: PropsWithChildren) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

describe('useOfflineQuery', () => {
  beforeEach(async () => {
    await initOfflineSession('query-hook-secret')
    await offlineDb.readCache.clear()
  })

  afterEach(async () => {
    clearOfflineSession()
    await offlineDb.readCache.clear()
  })

  it('returns live data and caches it on success', async () => {
    const queryFn = () => Promise.resolve({ title: 'Live note' })
    const { result } = renderHook(() => useOfflineQuery('demo-note', 'seed-1', queryFn), {
      wrapper,
    })

    await waitFor(() => expect(result.current.data).toEqual({ title: 'Live note' }))
    expect(result.current.isStale).toBe(false)

    const cached = await offlineDb.readCache.get('demo-note:seed-1')
    expect(cached).toBeDefined()
  })

  it('falls back to the read cache and flags stale when the fetch fails', async () => {
    // Seed the cache first via a successful run.
    const okQueryFn = () => Promise.resolve({ title: 'Cached note' })
    const first = renderHook(() => useOfflineQuery('demo-note', 'seed-2', okQueryFn), { wrapper })
    await waitFor(() => expect(first.result.current.data).toEqual({ title: 'Cached note' }))

    const failingQueryFn = () => Promise.reject(new Error('offline'))
    const { result } = renderHook(() => useOfflineQuery('demo-note', 'seed-2', failingQueryFn), {
      wrapper,
    })

    await waitFor(() => expect(result.current.isStale).toBe(true))
    expect(result.current.data).toEqual({ title: 'Cached note' })
    expect(result.current.cachedAt).toBeTypeOf('number')
  })
})
