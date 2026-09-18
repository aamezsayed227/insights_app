const HKDF_SALT = new TextEncoder().encode('insight-offline-outbox-v1')
const HKDF_INFO = new TextEncoder().encode('insight-offline-session-key')

function toBase64(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

function fromBase64(value: string): Uint8Array<ArrayBuffer> {
  const binary = atob(value)
  const bytes = new Uint8Array(new ArrayBuffer(binary.length))
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

/**
 * Derives the session's AES-GCM key from a server-issued session secret via HKDF.
 * Spec §5: this key is held in memory only by the caller — this function never persists it.
 */
export async function deriveSessionKey(sessionSecret: string): Promise<CryptoKey> {
  const secretBytes = new TextEncoder().encode(sessionSecret)
  const baseKey = await crypto.subtle.importKey('raw', secretBytes, 'HKDF', false, ['deriveKey'])

  return crypto.subtle.deriveKey(
    { name: 'HKDF', hash: 'SHA-256', salt: HKDF_SALT, info: HKDF_INFO },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
}

export async function encryptPayload(
  key: CryptoKey,
  data: unknown,
): Promise<{ ciphertext: string; iv: string }> {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const plaintext = new TextEncoder().encode(JSON.stringify(data))

  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plaintext)

  return {
    ciphertext: toBase64(new Uint8Array(encrypted)),
    iv: toBase64(iv),
  }
}

export async function decryptPayload<T>(
  key: CryptoKey,
  ciphertext: string,
  iv: string,
): Promise<T> {
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: fromBase64(iv) },
    key,
    fromBase64(ciphertext),
  )

  return JSON.parse(new TextDecoder().decode(decrypted)) as T
}
