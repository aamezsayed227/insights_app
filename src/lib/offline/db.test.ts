import 'fake-indexeddb/auto'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { offlineDb } from './db'
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
