import 'fake-indexeddb/auto'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { offlineDb } from './db'
import { setMockOutcome } from './mockApi'
import { enqueueOutboxRow } from './repository'
import { clearOfflineSession, initOfflineSession } from './session'
import { drainOutbox } from './syncEngine'

function setOnline(online: boolean) {
  Object.defineProperty(navigator, 'onLine', { value: online, configurable: true })
}

describe('sync engine drain', () => {
  beforeEach(async () => {
    setOnline(true)
    setMockOutcome('success')
    await initOfflineSession('sync-engine-secret')
    await offlineDb.outbox.clear()
  })

  afterEach(async () => {
    clearOfflineSession()
    await offlineDb.outbox.clear()
  })

  it('deletes the row on a 2xx response', async () => {
    const id = await enqueueOutboxRow('demo-note', '/api/demo/notes', { title: 'x' })

    await drainOutbox()

    expect(await offlineDb.outbox.get(id)).toBeUndefined()
  })

  it('marks the row rejected with no retry on a 409', async () => {
    setMockOutcome('validationRejected')
    const id = await enqueueOutboxRow('demo-note', '/api/demo/notes', { title: 'x' })

    await drainOutbox()

    const row = await offlineDb.outbox.get(id)
    expect(row?.status).toBe('rejected')
    expect(row?.lastError).toContain('rejected')
  })

  it('marks the row failed and keeps it queued on a 5xx', async () => {
    setMockOutcome('serverError')
    const id = await enqueueOutboxRow('demo-note', '/api/demo/notes', { title: 'x' })

    await drainOutbox()

    const row = await offlineDb.outbox.get(id)
    expect(row?.status).toBe('failed')
    expect(row?.retryCount).toBe(1)
  })

  it('marks the row failed and stops draining on a 401', async () => {
    setMockOutcome('authExpired')
    const firstId = await enqueueOutboxRow('demo-note', '/api/demo/notes', { title: 'first' })
    await new Promise((r) => setTimeout(r, 5)) // ensure distinct createdAt so drain order is deterministic
    setMockOutcome('success')
    const secondId = await enqueueOutboxRow('demo-note', '/api/demo/notes', { title: 'second' })
    setMockOutcome('authExpired')

    await drainOutbox()

    const first = await offlineDb.outbox.get(firstId)
    const second = await offlineDb.outbox.get(secondId)
    expect(first?.status).toBe('failed')
    expect(first?.lastError).toContain('expired')
    expect(second?.status).toBe('pending') // never reached — drain stopped
  })

  it('processes rows oldest-first', async () => {
    const firstId = await enqueueOutboxRow('demo-note', '/api/demo/notes', { title: 'first' })
    await new Promise((r) => setTimeout(r, 5))
    const secondId = await enqueueOutboxRow('demo-note', '/api/demo/notes', { title: 'second' })

    const order: string[] = []
    setMockOutcome('validationRejected') // avoid deleting rows so we can inspect order after
    await drainOutbox()

    const rows = await offlineDb.outbox.orderBy('createdAt').toArray()
    order.push(...rows.map((r) => r.id))
    expect(order).toEqual([firstId, secondId])
  })

  it('does nothing when offline', async () => {
    setOnline(false)
    const id = await enqueueOutboxRow('demo-note', '/api/demo/notes', { title: 'x' })

    await drainOutbox()

    const row = await offlineDb.outbox.get(id)
    expect(row?.status).toBe('failed')
  })
})
