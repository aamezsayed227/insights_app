import { useLiveQuery } from 'dexie-react-hooks'
import { offlineDb } from '@/lib/offline/db'
import { decryptOutboxRow } from '@/lib/offline/repository'
import type { OutboxRow } from '@/lib/offline/types'

interface SyncReviewPanelProps {
  onResubmit: (row: OutboxRow, payload: unknown) => void
}

export function SyncReviewPanel({ onResubmit }: SyncReviewPanelProps) {
  const rejectedRows = useLiveQuery(
    () => offlineDb.outbox.where('status').equals('rejected').sortBy('createdAt'),
    [],
    [],
  )

  if (rejectedRows.length === 0) return null

  return (
    <section aria-label="Rejected offline entries" className="flex flex-col gap-2">
      <h2 className="text-foreground text-sm font-medium">Needs your review</h2>
      {rejectedRows.map((row) => (
        <RejectedRow key={row.id} row={row} onResubmit={onResubmit} />
      ))}
    </section>
  )
}

function RejectedRow({
  row,
  onResubmit,
}: {
  row: OutboxRow
  onResubmit: SyncReviewPanelProps['onResubmit']
}) {
  return (
    <div className="border-destructive/30 bg-destructive/5 flex items-center justify-between gap-4 rounded-md border px-3 py-2 text-sm">
      <div>
        <p className="text-foreground font-medium">{row.entityType}</p>
        <p className="text-destructive">{row.lastError}</p>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          className="border-border rounded-md border px-2 py-1 text-xs"
          onClick={async () => {
            const payload = await decryptOutboxRow(row)
            onResubmit(row, payload)
          }}
        >
          Review &amp; resubmit
        </button>
        <button
          type="button"
          className="border-border rounded-md border px-2 py-1 text-xs"
          onClick={() => offlineDb.outbox.delete(row.id)}
        >
          Discard
        </button>
      </div>
    </div>
  )
}
