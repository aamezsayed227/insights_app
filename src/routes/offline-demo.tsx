import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect, useState } from 'react'
import { PendingSyncBadge } from '@/components/offline/PendingSyncBadge'
import { SyncReviewPanel } from '@/components/offline/SyncReviewPanel'
import { useOfflineMutation } from '@/hooks/useOfflineMutation'
import { useOfflineQuery } from '@/hooks/useOfflineQuery'
import { offlineDb } from '@/lib/offline/db'
import { getMockOutcome, mockApiGet, type MockOutcome, setMockOutcome } from '@/lib/offline/mockApi'
import { decryptOutboxRow } from '@/lib/offline/repository'
import { hasOfflineSession, initOfflineSession } from '@/lib/offline/session'
import { startSyncEngine, triggerSync } from '@/lib/offline/syncEngine'
import { useOutboxSummary } from '@/lib/offline/syncStore'
import type { OutboxRow, OutboxStatus } from '@/lib/offline/types'

const DEMO_ENTITY_TYPE = 'demo-note'
const DEMO_ENDPOINT = '/api/demo/notes'
const SEED_ENTITY_ID = 'seed-1'

function useDemoSession() {
  const [ready, setReady] = useState(hasOfflineSession())

  useEffect(() => {
    if (hasOfflineSession()) return
    void initOfflineSession('demo-session-secret').then(() => setReady(true))
  }, [])

  return ready
}

function useBeforeUnloadWarning(pendingCount: number) {
  useEffect(() => {
    function handler(event: BeforeUnloadEvent) {
      if (pendingCount === 0) return
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [pendingCount])
}

export function OfflineDemoPage() {
  const sessionReady = useDemoSession()

  useEffect(() => startSyncEngine(), [])

  const { pendingCount } = useOutboxSummary()
  useBeforeUnloadWarning(pendingCount)

  // Bumped on every resubmit so NoteCaptureForm remounts with fresh initial
  // state — React's recommended way to reset state from an external trigger,
  // instead of an effect that calls setState (see NoteCaptureForm).
  const [resubmitNonce, setResubmitNonce] = useState(0)
  const [prefillTitle, setPrefillTitle] = useState<string | undefined>(undefined)

  if (!sessionReady) {
    return <p className="text-muted-foreground p-8 text-sm">Starting offline session…</p>
  }

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 p-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-foreground text-xl font-semibold">Offline capture demo</h1>
        <p className="text-muted-foreground text-sm">
          Turn off your network (DevTools → Network → Offline) and save a note — it queues locally,
          encrypted, and syncs automatically the moment you're back online.
        </p>
      </header>

      <div className="flex items-center justify-between gap-4">
        <PendingSyncBadge />
        <button
          type="button"
          className="border-border rounded-md border px-3 py-1.5 text-sm"
          onClick={() => void triggerSync()}
        >
          Sync now
        </button>
      </div>

      <DemoOutcomeControls />
      <NoteCaptureForm key={resubmitNonce} initialTitle={prefillTitle} />
      <PendingNotesList />
      <SyncReviewPanel
        onResubmit={async (row: OutboxRow, payload: unknown) => {
          // Create-only, server-authoritative design (spec §2, §7): resolving a
          // rejection is always re-submit-or-discard, never a merge — so the old
          // rejected row is removed the moment its payload reopens in the form.
          const { title } = payload as { title: string }
          setPrefillTitle(title)
          setResubmitNonce((n) => n + 1)
          await offlineDb.outbox.delete(row.id)
        }}
      />
      <ExistingNoteViewer />
    </main>
  )
}

function DemoOutcomeControls() {
  const [outcome, setOutcome] = useState<MockOutcome>(getMockOutcome())

  return (
    <div className="border-border bg-muted/40 flex items-center gap-3 rounded-md border p-3 text-sm">
      <label htmlFor="mock-outcome" className="text-muted-foreground">
        Server outcome
      </label>
      <select
        id="mock-outcome"
        aria-label="Server outcome"
        className="border-border bg-background rounded-md border px-2 py-1"
        value={outcome}
        onChange={(event) => {
          const value = event.target.value as MockOutcome
          setOutcome(value)
          setMockOutcome(value)
        }}
      >
        <option value="success">Success (2xx)</option>
        <option value="validationRejected">Rejected (409)</option>
        <option value="authExpired">Auth expired (401)</option>
        <option value="serverError">Server error (5xx)</option>
      </select>
      <span className="text-muted-foreground text-xs">
        Demo-only control — simulates the backend response.
      </span>
    </div>
  )
}

interface NoteCaptureFormProps {
  initialTitle?: string
}

function NoteCaptureForm({ initialTitle = '' }: NoteCaptureFormProps) {
  const mutation = useOfflineMutation<{ title: string }>(DEMO_ENTITY_TYPE, DEMO_ENDPOINT)
  const [title, setTitle] = useState(initialTitle)

  return (
    <form
      className="border-border flex flex-col gap-3 rounded-md border p-4"
      onSubmit={(event) => {
        event.preventDefault()
        if (!title.trim()) return
        mutation.mutate({ title })
        setTitle('')
      }}
    >
      <label htmlFor="note-title" className="text-foreground text-sm font-medium">
        Note title
      </label>
      <input
        id="note-title"
        className="border-border bg-background rounded-md border px-3 py-2 text-sm"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="e.g. Ward round observation"
      />
      <button
        type="submit"
        className="bg-primary text-primary-foreground self-start rounded-md px-3 py-1.5 text-sm"
      >
        Save note
      </button>
      {mutation.data?.queued && (
        <p className="text-muted-foreground text-xs">Saved locally — will sync when back online.</p>
      )}
    </form>
  )
}

const STATUS_LABEL: Record<OutboxStatus, string> = {
  pending: 'pending',
  syncing: 'syncing…',
  synced: 'synced',
  failed: 'retrying',
  rejected: 'rejected',
}

// Not yet synced == everything the review panel below doesn't already
// own. `rejected` rows get their own review/discard actions there, so
// they're excluded here to avoid showing the same row in two places.
function PendingNotesList() {
  const rows = useLiveQuery(
    () =>
      offlineDb.outbox.where('status').anyOf('pending', 'syncing', 'failed').sortBy('createdAt'),
    [],
    [],
  )
  const [titles, setTitles] = useState<Record<string, string>>({})

  useEffect(() => {
    let cancelled = false
    void Promise.all(
      rows.map(async (row) => {
        // The session key can disappear mid-flight (logout, tab closing) —
        // per spec §5 that's by design, so a decrypt failure here is
        // expected, not exceptional: skip the row rather than reject.
        try {
          const { title } = await decryptOutboxRow<{ title: string }>(row)
          return [row.id, title] as const
        } catch {
          return null
        }
      }),
    ).then((entries) => {
      if (!cancelled) {
        setTitles(Object.fromEntries(entries.filter((entry) => entry !== null)))
      }
    })
    return () => {
      cancelled = true
    }
  }, [rows])

  if (rows.length === 0) return null

  return (
    <section aria-label="Your offline notes" className="flex flex-col gap-2">
      <h2 className="text-foreground text-sm font-medium">Your notes (not yet synced)</h2>
      {rows.map((row) => (
        <div
          key={row.id}
          className="border-border flex items-center justify-between gap-4 rounded-md border p-3 text-sm"
        >
          <span className="text-foreground">{titles[row.id] ?? '…'}</span>
          <span
            className={
              row.status === 'failed' ? 'text-destructive text-xs' : 'text-muted-foreground text-xs'
            }
          >
            {STATUS_LABEL[row.status]}
          </span>
        </div>
      ))}
    </section>
  )
}

function ExistingNoteViewer() {
  const { data, isStale, cachedAt, isLoading, refetch } = useOfflineQuery(
    DEMO_ENTITY_TYPE,
    SEED_ENTITY_ID,
    () => mockApiGet(DEMO_ENDPOINT, { title: 'Existing patient note (from server)' }),
  )

  if (isLoading) return <p className="text-muted-foreground text-sm">Loading…</p>

  return (
    <div className="border-border flex flex-col gap-2 rounded-md border p-4 text-sm">
      <div className="flex items-center justify-between gap-4">
        <p className="text-foreground font-medium">
          {data?.title ?? 'No data available offline yet'}
        </p>
        <button
          type="button"
          className="border-border shrink-0 rounded-md border px-2 py-1 text-xs"
          onClick={() => void refetch()}
        >
          Reload
        </button>
      </div>
      {isStale && cachedAt ? (
        <p className="text-muted-foreground text-xs">
          Offline copy · last updated {new Date(cachedAt).toLocaleTimeString()}
        </p>
      ) : (
        <p className="text-muted-foreground text-xs">
          Live from server. Go offline, then click Reload — it reads this from the encrypted local
          cache instead.
        </p>
      )}
    </div>
  )
}
