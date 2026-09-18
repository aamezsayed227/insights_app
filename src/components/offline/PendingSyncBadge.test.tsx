import 'fake-indexeddb/auto'
import { render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { offlineDb } from '@/lib/offline/db'
import { PendingSyncBadge } from './PendingSyncBadge'

describe('PendingSyncBadge', () => {
  beforeEach(async () => {
    await offlineDb.outbox.clear()
  })

  afterEach(async () => {
    await offlineDb.outbox.clear()
  })

  it('shows nothing when there is nothing pending', async () => {
    render(<PendingSyncBadge />)
    await waitFor(() => expect(screen.queryByTestId('pending-sync-badge')).not.toBeInTheDocument())
  })

  it('shows the pending count', async () => {
    render(<PendingSyncBadge />)

    await offlineDb.outbox.put({
      id: 'a',
      entityType: 'demo-note',
      endpoint: '/api/demo/notes',
      encryptedPayload: 'c',
      iv: 'i',
      status: 'pending',
      retryCount: 0,
      createdAt: Date.now(),
    })

    await waitFor(() => expect(screen.getByTestId('pending-sync-badge')).toHaveTextContent('1'))
  })
})
