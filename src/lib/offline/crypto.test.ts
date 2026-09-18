import { describe, expect, it } from 'vitest'
import { decryptPayload, deriveSessionKey, encryptPayload } from './crypto'

describe('offline crypto', () => {
  it('round-trips a payload through encrypt/decrypt', async () => {
    const key = await deriveSessionKey('session-secret-abc')
    const original = { note: 'Patient observed stable, obs offline', priority: 2 }

    const { ciphertext, iv } = await encryptPayload(key, original)
    expect(ciphertext).not.toContain('Patient observed')

    const decrypted = await decryptPayload<typeof original>(key, ciphertext, iv)
    expect(decrypted).toEqual(original)
  })

  it('uses a different IV for every encryption call', async () => {
    const key = await deriveSessionKey('session-secret-abc')
    const first = await encryptPayload(key, { a: 1 })
    const second = await encryptPayload(key, { a: 1 })

    expect(first.iv).not.toBe(second.iv)
  })

  it('fails closed when decrypting with the wrong key', async () => {
    const key = await deriveSessionKey('session-secret-abc')
    const wrongKey = await deriveSessionKey('different-secret')
    const { ciphertext, iv } = await encryptPayload(key, { a: 1 })

    await expect(decryptPayload(wrongKey, ciphertext, iv)).rejects.toThrow()
  })
})
