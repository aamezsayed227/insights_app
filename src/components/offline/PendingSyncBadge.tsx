import { useOutboxSummary, useSyncEngineStore } from '@/lib/offline/syncStore'
import { cn } from '@/lib/utils'

export function PendingSyncBadge() {
  const { pendingCount, failedCount, rejectedCount } = useOutboxSummary()
  const isSyncing = useSyncEngineStore((s) => s.isSyncing)
  const attentionCount = failedCount + rejectedCount
  const total = pendingCount + attentionCount

  if (total === 0) return null

  return (
    <div
      data-testid="pending-sync-badge"
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm',
        attentionCount > 0
          ? 'border-destructive/40 bg-destructive/10 text-destructive'
          : 'border-border bg-muted text-muted-foreground',
      )}
    >
      <span
        className={cn('size-2 rounded-full', isSyncing ? 'animate-pulse bg-current' : 'bg-current')}
      />
      <span>Pending sync</span>
      <span className="font-medium">{total}</span>
    </div>
  )
}
