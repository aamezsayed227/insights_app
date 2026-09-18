import 'fake-indexeddb/auto'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { offlineDb } from '@/lib/offline/db'
import { setMockOutcome } from '@/lib/offline/mockApi'
import { clearOfflineSession } from '@/lib/offline/session'
import { useSyncEngineStore } from '@/lib/offline/syncStore'
import { OfflineDemoPage } from './offline-demo'

// The "Sync now" button is deliberately fire-and-forget (real UX doesn't
// block on it), so waiting for a DOM change alone can race drainOutbox()'s
// own cleanup (it resets isSyncing in a `finally`, after the row already
// changed). Waiting for isSyncing to fall back to false guarantees the
// whole call — including that cleanup — has finished before the next
// step runs, so the reentrancy guard is clear for the following test.
async function waitForDrainToSettle() {
  await waitFor(() => expect(useSyncEngineStore.getState().isSyncing).toBe(false))
}

function setOnline(online: boolean) {
  Object.defineProperty(navigator, 'onLine', { value: online, configurable: true })
}

function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return render(
    <QueryClientProvider client={client}>
      <OfflineDemoPage />
    </QueryClientProvider>,
  )
}

describe('OfflineDemoPage', () => {
  beforeEach(async () => {
    setOnline(true)
    setMockOutcome('success')
    useSyncEngineStore.getState().setSyncing(false)
    await offlineDb.outbox.clear()
    await offlineDb.readCache.clear()
  })

  afterEach(async () => {
    clearOfflineSession()
    await offlineDb.outbox.clear()
    await offlineDb.readCache.clear()
  })

  it('queues a note when offline and shows the pending badge', async () => {
    setOnline(false)
    renderPage()

    await waitFor(() => screen.getByLabelText(/note title/i))
    await userEvent.type(screen.getByLabelText(/note title/i), 'Ward round 14:00')
    await userEvent.click(screen.getByRole('button', { name: /save note/i }))

    await waitFor(() => expect(screen.getByTestId('pending-sync-badge')).toHaveTextContent('1'))
  })

  it('shows the queued note itself in a pending-notes list, not just the count', async () => {
    setOnline(false)
    renderPage()

    await waitFor(() => screen.getByLabelText(/note title/i))
    await userEvent.type(screen.getByLabelText(/note title/i), 'Ward round 14:00')
    await userEvent.click(screen.getByRole('button', { name: /save note/i }))

    await waitFor(() => expect(screen.getByText('Ward round 14:00')).toBeInTheDocument())
    expect(screen.getByText(/your notes \(not yet synced\)/i)).toBeInTheDocument()

    setOnline(true)
    await userEvent.click(screen.getByRole('button', { name: /sync now/i }))
    await waitForDrainToSettle()

    await waitFor(() => expect(screen.queryByText('Ward round 14:00')).not.toBeInTheDocument())
  })

  it('drains the queue and clears the badge after Sync now once back online', async () => {
    setOnline(false)
    renderPage()

    await waitFor(() => screen.getByLabelText(/note title/i))
    await userEvent.type(screen.getByLabelText(/note title/i), 'Ward round 14:00')
    await userEvent.click(screen.getByRole('button', { name: /save note/i }))
    await waitFor(() => expect(screen.getByTestId('pending-sync-badge')).toBeInTheDocument())

    setOnline(true)
    await userEvent.click(screen.getByRole('button', { name: /sync now/i }))

    await waitFor(() => expect(screen.queryByTestId('pending-sync-badge')).not.toBeInTheDocument())
    await waitForDrainToSettle()
  })

  it('surfaces a rejected entry in the review panel without auto-retry', async () => {
    // Rejections are a sync-engine outcome (spec §6): the row must have gone
    // through the outbox and been drained against a rejecting server.
    setOnline(false)
    renderPage()
    await waitFor(() => screen.getByLabelText(/note title/i))

    await userEvent.type(screen.getByLabelText(/note title/i), 'Duplicate entry test')
    await userEvent.click(screen.getByRole('button', { name: /save note/i }))
    await waitFor(() => expect(screen.getByTestId('pending-sync-badge')).toHaveTextContent('1'))

    setOnline(true)
    await userEvent.selectOptions(screen.getByLabelText(/server outcome/i), 'validationRejected')
    await userEvent.click(screen.getByRole('button', { name: /sync now/i }))
    await waitForDrainToSettle()

    await waitFor(() => expect(screen.getByText(/needs your review/i)).toBeInTheDocument())
    expect(screen.getByText(/duplicate or invalid entry/i)).toBeInTheDocument()
  })

  it('pre-fills the form and drops the old row when "Review & resubmit" is clicked', async () => {
    setOnline(false)
    renderPage()
    await waitFor(() => screen.getByLabelText(/note title/i))

    await userEvent.type(screen.getByLabelText(/note title/i), 'Duplicate entry test')
    await userEvent.click(screen.getByRole('button', { name: /save note/i }))
    await waitFor(() => expect(screen.getByTestId('pending-sync-badge')).toHaveTextContent('1'))

    setOnline(true)
    await userEvent.selectOptions(screen.getByLabelText(/server outcome/i), 'validationRejected')
    await userEvent.click(screen.getByRole('button', { name: /sync now/i }))
    await waitForDrainToSettle()
    await waitFor(() => expect(screen.getByText(/needs your review/i)).toBeInTheDocument())

    await userEvent.click(screen.getByRole('button', { name: /review & resubmit/i }))

    await waitFor(() =>
      expect(screen.getByLabelText(/note title/i)).toHaveValue('Duplicate entry test'),
    )
    expect(screen.queryByText(/needs your review/i)).not.toBeInTheDocument()
    expect(await offlineDb.outbox.count()).toBe(0)
  })

  it('falls back to the read-cache copy of the existing note when reloaded offline', async () => {
    renderPage()

    // First render populates readCache via a live (online) fetch.
    await waitFor(() =>
      expect(screen.getByText('Existing patient note (from server)')).toBeInTheDocument(),
    )
    expect(screen.queryByText(/offline copy/i)).not.toBeInTheDocument()

    setOnline(false)
    await userEvent.click(screen.getByRole('button', { name: /^reload$/i }))

    await waitFor(() => expect(screen.getByText(/offline copy/i)).toBeInTheDocument())
    expect(screen.getByText('Existing patient note (from server)')).toBeInTheDocument()
  })
})
