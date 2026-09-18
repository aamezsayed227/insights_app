import 'fake-indexeddb/auto'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
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
    setMockOutcome('success')
    await initOfflineSession('mutation-hook-secret')
    await offlineDb.outbox.clear()
  })

  afterEach(async () => {
    clearOfflineSession()
    await offlineDb.outbox.clear()
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
})
