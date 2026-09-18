import { offlineDb } from './db'
import { decryptPayload, encryptPayload } from './crypto'
import { getSessionKey } from './session'
import type { OutboxRow } from './types'

export const READ_CACHE_MAX_ENTRIES = 200
export const READ_CACHE_TTL_MS = 72 * 60 * 60 * 1000

export async function enqueueOutboxRow(
  entityType: string,
  endpoint: string,
  payload: unknown,
): Promise<string> {
  const key = getSessionKey()
  const { ciphertext, iv } = await encryptPayload(key, payload)
  const id = crypto.randomUUID()

  await offlineDb.outbox.put({
    id,
    entityType,
    endpoint,
    encryptedPayload: ciphertext,
    iv,
    status: 'pending',
    retryCount: 0,
    createdAt: Date.now(),
  })

  return id
}

export async function decryptOutboxRow<T>(row: OutboxRow): Promise<T> {
  const key = getSessionKey()
  return decryptPayload<T>(key, row.encryptedPayload, row.iv)
}

export async function writeThroughReadCache(
  entityType: string,
  entityId: string,
  data: unknown,
): Promise<void> {
  const key = getSessionKey()
  const { ciphertext, iv } = await encryptPayload(key, data)

  await offlineDb.readCache.put({
    id: `${entityType}:${entityId}`,
    entityType,
    entityId,
    encryptedPayload: ciphertext,
    iv,
    fetchedAt: Date.now(),
  })

  await enforceReadCacheCap()
}

export async function readReadCacheEntry<T>(
  entityType: string,
  entityId: string,
): Promise<{ data: T; fetchedAt: number } | undefined> {
  const row = await offlineDb.readCache.get(`${entityType}:${entityId}`)
  if (!row) return undefined

  const key = getSessionKey()
  const data = await decryptPayload<T>(key, row.encryptedPayload, row.iv)
  return { data, fetchedAt: row.fetchedAt }
}

export async function purgeExpiredReadCache(now: number = Date.now()): Promise<void> {
  const cutoff = now - READ_CACHE_TTL_MS
  await offlineDb.readCache.where('fetchedAt').below(cutoff).delete()
}

export async function enforceReadCacheCap(): Promise<void> {
  const total = await offlineDb.readCache.count()
  const overflow = total - READ_CACHE_MAX_ENTRIES
  if (overflow <= 0) return

  const oldest = await offlineDb.readCache.orderBy('fetchedAt').limit(overflow).primaryKeys()
  await offlineDb.readCache.bulkDelete(oldest)
}

export async function purgeAllOfflineData(): Promise<void> {
  await offlineDb.outbox.clear()
  await offlineDb.readCache.clear()
}
