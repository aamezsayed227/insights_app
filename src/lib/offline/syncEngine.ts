import { offlineDb } from './db'
import { ApiResponseError, mockApiPost, NetworkError } from './mockApi'
import { decryptOutboxRow } from './repository'
import { useSyncEngineStore } from './syncStore'
import { SYNC_META_KEY } from './types'

const MAX_BACKOFF_RETRIES = 5

let isDraining = false

export async function drainOutbox(): Promise<void> {
  if (isDraining) return
  isDraining = true
  useSyncEngineStore.getState().setSyncing(true)

  try {
    await offlineDb.syncMeta.put({
      id: SYNC_META_KEY,
      lastSyncAttemptAt: Date.now(),
      lastSuccessfulSyncAt:
        (await offlineDb.syncMeta.get(SYNC_META_KEY))?.lastSuccessfulSyncAt ?? null,
    })

    const rows = await offlineDb.outbox
      .where('status')
      .anyOf('pending', 'failed')
      .and((row) => row.retryCount < MAX_BACKOFF_RETRIES)
      .sortBy('createdAt')

    for (const row of rows) {
      await offlineDb.outbox.update(row.id, { status: 'syncing' })

      try {
        const payload = await decryptOutboxRow(row)
        await mockApiPost(row.endpoint, payload)

        await offlineDb.outbox.delete(row.id)
        await offlineDb.syncMeta.update(SYNC_META_KEY, { lastSuccessfulSyncAt: Date.now() })
      } catch (error) {
        if (error instanceof ApiResponseError && error.status === 401) {
          // Spec §6: attempt one refresh via a pluggable onAuthExpired() hook.
          // No real auth exists yet, so the stub always fails and the drain
          // halts rather than burning through the rest of the queue.
          await offlineDb.outbox.update(row.id, {
            status: 'failed',
            lastError: 'Session expired — please log in again to sync.',
            retryCount: row.retryCount + 1,
          })
          return
        }

        if (error instanceof ApiResponseError && error.status >= 400 && error.status < 500) {
          // 409 / other 4xx: server-authoritative rejection, no auto-retry (spec §2, §6).
          await offlineDb.outbox.update(row.id, {
            status: 'rejected',
            lastError: error.message,
          })
          continue
        }

        // NetworkError or 5xx: transient, retried on the next trigger with backoff.
        const message = error instanceof Error ? error.message : 'Unknown sync error'
        await offlineDb.outbox.update(row.id, {
          status: 'failed',
          lastError: message,
          retryCount: row.retryCount + 1,
        })

        if (error instanceof NetworkError) return // connection dropped mid-drain, stop this pass
      }
    }
  } finally {
    isDraining = false
    useSyncEngineStore.getState().setSyncing(false)
  }
}

export async function triggerSync(): Promise<void> {
  await drainOutbox()
}

export function startSyncEngine(intervalMs = 60_000): () => void {
  const handleOnline = () => void triggerSync()
  window.addEventListener('online', handleOnline)

  const interval = setInterval(() => void triggerSync(), intervalMs)

  return () => {
    window.removeEventListener('online', handleOnline)
    clearInterval(interval)
  }
}
