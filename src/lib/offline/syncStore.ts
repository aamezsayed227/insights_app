import { useLiveQuery } from 'dexie-react-hooks'
import { create } from 'zustand'
import { offlineDb } from './db'
import { SYNC_META_KEY } from './types'

interface SyncEngineState {
  isSyncing: boolean
  setSyncing: (value: boolean) => void
}

export const useSyncEngineStore = create<SyncEngineState>((set) => ({
  isSyncing: false,
  setSyncing: (value) => set({ isSyncing: value }),
}))

export function useOutboxSummary() {
  const rows = useLiveQuery(() => offlineDb.outbox.toArray(), [], [])
  const meta = useLiveQuery(() => offlineDb.syncMeta.get(SYNC_META_KEY), [])

  return {
    pendingCount: rows.filter((r) => r.status === 'pending').length,
    syncingCount: rows.filter((r) => r.status === 'syncing').length,
    failedCount: rows.filter((r) => r.status === 'failed').length,
    rejectedCount: rows.filter((r) => r.status === 'rejected').length,
    lastSuccessfulSyncAt: meta?.lastSuccessfulSyncAt ?? null,
  }
}
