import { deriveSessionKey } from './crypto'

export class SessionKeyUnavailableError extends Error {
  constructor() {
    super('Offline session key is not available — call initOfflineSession() after login first.')
    this.name = 'SessionKeyUnavailableError'
  }
}

// Module-scope only: per spec §5, this key must never be written to
// IndexedDB, localStorage, or sessionStorage. It intentionally dies
// with the JS module instance (tab close, hard refresh, logout).
let sessionKey: CryptoKey | null = null

export async function initOfflineSession(sessionSecret: string): Promise<void> {
  sessionKey = await deriveSessionKey(sessionSecret)
}

export function hasOfflineSession(): boolean {
  return sessionKey !== null
}

export function getSessionKey(): CryptoKey {
  if (!sessionKey) throw new SessionKeyUnavailableError()
  return sessionKey
}

export function clearOfflineSession(): void {
  sessionKey = null
}
