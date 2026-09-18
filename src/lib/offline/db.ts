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
