import 'fake-indexeddb/auto'
import { renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { offlineDb } from './db'
import { useOutboxSummary, useSyncEngineStore } from './syncStore'

describe('useOutboxSummary', () => {
  beforeEach(async () => {
    await offlineDb.outbox.clear()
  })

  afterEach(async () => {
    await offlineDb.outbox.clear()
  })

  it('counts rows by status reactively', async () => {
    const { result } = renderHook(() => useOutboxSummary())

    await waitFor(() => expect(result.current.pendingCount).toBe(0))

    await offlineDb.outbox.put({
      id: 'a',
      entityType: 'demo-note',
      endpoint: '/api/demo/notes',
      encryptedPayload: 'c',
      iv: 'i',
      status: 'pending',
      retryCount: 0,
      createdAt: Date.now(),
    })
    await offlineDb.outbox.put({
      id: 'b',
      entityType: 'demo-note',
      endpoint: '/api/demo/notes',
      encryptedPayload: 'c',
      iv: 'i',
      status: 'rejected',
      retryCount: 0,
      createdAt: Date.now(),
    })

    await waitFor(() => expect(result.current.pendingCount).toBe(1))
    await waitFor(() => expect(result.current.rejectedCount).toBe(1))
  })
})

describe('useSyncEngineStore', () => {
  it('toggles isSyncing', () => {
    const { result } = renderHook(() => useSyncEngineStore())
    expect(result.current.isSyncing).toBe(false)

    result.current.setSyncing(true)
    expect(useSyncEngineStore.getState().isSyncing).toBe(true)
  })
})
