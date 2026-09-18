import 'fake-indexeddb/auto'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { offlineDb } from '@/lib/offline/db'
import { SyncReviewPanel } from './SyncReviewPanel'

describe('SyncReviewPanel', () => {
  beforeEach(async () => {
    await offlineDb.outbox.clear()
    await offlineDb.outbox.put({
      id: 'rejected-1',
      entityType: 'demo-note',
      endpoint: '/api/demo/notes',
      encryptedPayload: 'c',
      iv: 'i',
      status: 'rejected',
      retryCount: 0,
      lastError: 'demo-note rejected: duplicate or invalid entry',
      createdAt: Date.now(),
    })
  })

  afterEach(async () => {
    await offlineDb.outbox.clear()
  })

  it('lists rejected rows with the server reason', async () => {
    render(<SyncReviewPanel onResubmit={() => {}} />)
    await waitFor(() => expect(screen.getByText(/duplicate or invalid entry/)).toBeInTheDocument())
  })

  it('calls onResubmit and discards the row when Discard is clicked', async () => {
    const onResubmit = vi.fn()
    render(<SyncReviewPanel onResubmit={onResubmit} />)

    await waitFor(() => screen.getByRole('button', { name: /discard/i }))
    await userEvent.click(screen.getByRole('button', { name: /discard/i }))

    await waitFor(async () => expect(await offlineDb.outbox.get('rejected-1')).toBeUndefined())
  })
})
