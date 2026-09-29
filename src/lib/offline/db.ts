import Dexie, { type EntityTable } from 'dexie'
import type { OutboxRow, ReadCacheRow, SyncMetaRow } from './types'

export const offlineDb = new Dexie('insight-offline') as Dexie & {
  outbox: EntityTable<OutboxRow, 'id'>
  readCache: EntityTable<ReadCacheRow, 'id'>
  syncMeta: EntityTable<SyncMetaRow, 'id'>
}

offlineDb.version(1).stores({
  outbox: 'id, status, createdAt',
  readCache: 'id, entityType, fetchedAt',
  syncMeta: 'id',
})

// Works around webkit.org bug 309386: after Safari's NetworkProcess
// crashes/restarts (a network connectivity change can trigger this — the
// same trigger as disabling Wi-Fi), IndexedDB can be left permanently
// broken for the page's lifetime — cached connection proxies keep
// pointing at a dead connection, and every indexedDB.open() fails until
// the page reloads. Closing and reopening the Dexie connection forces a
// fresh indexedDB.open(), recovering without requiring a reload.
export async function withDbRecovery<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation()
  } catch {
    offlineDb.close()
    await offlineDb.open()
    return await operation()
  }
}
