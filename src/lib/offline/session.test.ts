import { beforeEach, describe, expect, it } from 'vitest'
import {
  clearOfflineSession,
  getSessionKey,
  hasOfflineSession,
  initOfflineSession,
  SessionKeyUnavailableError,
} from './session'

describe('offline session key lifecycle', () => {
  beforeEach(() => {
    clearOfflineSession()
  })

  it('has no session key before init', () => {
    expect(hasOfflineSession()).toBe(false)
    expect(() => getSessionKey()).toThrow(SessionKeyUnavailableError)
  })

  it('exposes the key after init', async () => {
    await initOfflineSession('secret-123')
    expect(hasOfflineSession()).toBe(true)
    expect(getSessionKey()).toBeDefined()
  })

  it('discards the key on clear (simulating logout / tab close)', async () => {
    await initOfflineSession('secret-123')
    clearOfflineSession()
    expect(hasOfflineSession()).toBe(false)
    expect(() => getSessionKey()).toThrow(SessionKeyUnavailableError)
  })
})
