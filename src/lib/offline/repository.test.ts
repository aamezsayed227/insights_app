import 'fake-indexeddb/auto'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { offlineDb } from './db'
import {
  decryptOutboxRow,
  enforceReadCacheCap,
  enqueueOutboxRow,
  purgeAllOfflineData,
  purgeExpiredReadCache,
  READ_CACHE_MAX_ENTRIES,
  readReadCacheEntry,
  writeThroughReadCache,
} from './repository'
import { clearOfflineSession, initOfflineSession } from './session'

describe('offline repository', () => {
  beforeEach(async () => {
    await offlineDb.outbox.clear()
    await offlineDb.readCache.clear()
    await initOfflineSession('repo-test-secret')
  })

  afterEach(async () => {
    clearOfflineSession()
    await offlineDb.outbox.clear()
    await offlineDb.readCache.clear()
  })

  it('enqueues an encrypted outbox row and decrypts it back', async () => {
    const id = await enqueueOutboxRow('demo-note', '/api/demo/notes', { title: 'Round obs' })
    const row = await offlineDb.outbox.get(id)

    expect(row?.status).toBe('pending')
    expect(row?.encryptedPayload).not.toContain('Round obs')

    const decrypted = await decryptOutboxRow<{ title: string }>(row!)
    expect(decrypted.title).toBe('Round obs')
  })

  it('writes through to the read cache and reads it back decrypted', async () => {
    await writeThroughReadCache('demo-note', 'seed-1', { title: 'Existing note' })
    const entry = await readReadCacheEntry<{ title: string }>('demo-note', 'seed-1')

    expect(entry?.data.title).toBe('Existing note')
    expect(entry?.fetchedAt).toBeTypeOf('number')
  })

  it('purges read-cache rows older than the TTL', async () => {
    await writeThroughReadCache('demo-note', 'stale-1', { title: 'Old' })
    const now = Date.now()
    const eightyHoursMs = 80 * 60 * 60 * 1000

    await purgeExpiredReadCache(now + eightyHoursMs)

    expect(await readReadCacheEntry('demo-note', 'stale-1')).toBeUndefined()
  })

  it('LRU-evicts past the read-cache entry cap', async () => {
    for (let i = 0; i < READ_CACHE_MAX_ENTRIES + 5; i++) {
      await writeThroughReadCache('demo-note', `entry-${i}`, { title: `Note ${i}` })
    }

    await enforceReadCacheCap()

    const remaining = await offlineDb.readCache.count()
    expect(remaining).toBe(READ_CACHE_MAX_ENTRIES)
    expect(await readReadCacheEntry('demo-note', 'entry-0')).toBeUndefined()
    expect(
      await readReadCacheEntry('demo-note', `entry-${READ_CACHE_MAX_ENTRIES + 4}`),
    ).toBeDefined()
  })

  it('purges all offline data (logout)', async () => {
    await enqueueOutboxRow('demo-note', '/api/demo/notes', { title: 'x' })
    await writeThroughReadCache('demo-note', 'seed-1', { title: 'y' })

    await purgeAllOfflineData()

    expect(await offlineDb.outbox.count()).toBe(0)
    expect(await offlineDb.readCache.count()).toBe(0)
  })
})
