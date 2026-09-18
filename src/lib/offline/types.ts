export type OutboxStatus = 'pending' | 'syncing' | 'synced' | 'failed' | 'rejected'

export interface OutboxRow {
  id: string
  entityType: string
  endpoint: string
  encryptedPayload: string
  iv: string
  status: OutboxStatus
  retryCount: number
  lastError?: string
  createdAt: number
}

export interface ReadCacheRow {
  id: string // `${entityType}:${entityId}`
  entityType: string
  entityId: string
  encryptedPayload: string
  iv: string
  fetchedAt: number
}

export interface SyncMetaRow {
  id: string
  lastSyncAttemptAt: number | null
  lastSuccessfulSyncAt: number | null
}

export const SYNC_META_KEY = 'singleton'
