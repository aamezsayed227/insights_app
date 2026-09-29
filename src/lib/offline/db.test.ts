import 'fake-indexeddb/auto'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { offlineDb, withDbRecovery } from './db'
import { SYNC_META_KEY } from './types'

describe('offlineDb schema', () => {
  beforeEach(async () => {
    await offlineDb.outbox.clear()
    await offlineDb.readCache.clear()
    await offlineDb.syncMeta.clear()
  })

  afterEach(async () => {
    await offlineDb.outbox.clear()
    await offlineDb.readCache.clear()
    await offlineDb.syncMeta.clear()
  })

  it('stores and retrieves an outbox row', async () => {
    await offlineDb.outbox.put({
      id: 'row-1',
      entityType: 'demo-note',
      endpoint: '/api/demo/notes',
      encryptedPayload: 'cipher',
      iv: 'iv',
      status: 'pending',
      retryCount: 0,
      createdAt: Date.now(),
    })

    const row = await offlineDb.outbox.get('row-1')
    expect(row?.status).toBe('pending')
  })

  it('stores and retrieves a readCache row', async () => {
    await offlineDb.readCache.put({
      id: 'demo-note:seed-1',
      entityType: 'demo-note',
      entityId: 'seed-1',
      encryptedPayload: 'cipher',
      iv: 'iv',
      fetchedAt: Date.now(),
    })

    const row = await offlineDb.readCache.get('demo-note:seed-1')
    expect(row?.entityId).toBe('seed-1')
  })

  it('stores a single syncMeta row keyed by SYNC_META_KEY', async () => {
    await offlineDb.syncMeta.put({
      id: SYNC_META_KEY,
      lastSyncAttemptAt: null,
      lastSuccessfulSyncAt: null,
    })

    const row = await offlineDb.syncMeta.get(SYNC_META_KEY)
    expect(row?.id).toBe(SYNC_META_KEY)
  })
})

describe('withDbRecovery', () => {
  afterEach(async () => {
    await offlineDb.outbox.clear()
  })

  it('returns the result on the first try when the operation succeeds', async () => {
    const result = await withDbRecovery(() => Promise.resolve('ok'))
    expect(result).toBe('ok')
  })

  // Simulates webkit.org bug 309386: a broken IndexedDB connection makes
  // the first attempt fail, but a fresh connection (close + reopen) lets
  // the same operation succeed on retry.
  it('closes, reopens, and retries once when the operation throws', async () => {
    let attempt = 0
    const operation = vi.fn(async () => {
      attempt += 1
      if (attempt === 1) throw new Error('connection is broken')
      await offlineDb.outbox.put({
        id: 'recovered-row',
        entityType: 'demo-note',
        endpoint: '/api/demo/notes',
        encryptedPayload: 'cipher',
        iv: 'iv',
        status: 'pending',
        retryCount: 0,
        createdAt: Date.now(),
      })
      return 'recovered'
    })

    const result = await withDbRecovery(operation)

    expect(result).toBe('recovered')
    expect(operation).toHaveBeenCalledTimes(2)
    expect(await offlineDb.outbox.get('recovered-row')).toBeDefined()
  })

  it('propagates the error when the retry also fails', async () => {
    const operation = vi.fn(() => Promise.reject(new Error('still broken')))
    await expect(withDbRecovery(operation)).rejects.toThrow('still broken')
    expect(operation).toHaveBeenCalledTimes(2)
  })
})
