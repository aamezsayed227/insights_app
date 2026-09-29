// Confirmed directly (real Wi-Fi toggled off, event listeners armed
// beforehand): Safari can give ZERO connectivity signal at all — neither
// navigator.onLine flips nor the 'online'/'offline' events fire
// (webkit.org bug 225645). A same-origin probe doesn't help either, since
// this demo runs on localhost and loopback traffic never touches Wi-Fi.
// The only reliable signal is a real external request.
//
// captive.apple.com was tried here first and reverted: it's macOS's own
// captive-portal-check URL, which the OS appears to intercept/answer at
// the system level independent of real connectivity — a fetch to it kept
// "succeeding" even with Wi-Fi confirmed off. example.com (IANA's
// reserved documentation domain, not part of any OS captive-portal
// allowlist) is an ordinary request that has to actually leave the
// machine.
const EXTERNAL_PROBE_URL = 'https://example.com/'
const EXTERNAL_PROBE_TIMEOUT_MS = 2000

let lastKnownOnline: boolean | null = null

function handleOnline(): void {
  lastKnownOnline = true
}

function handleOffline(): void {
  lastKnownOnline = false
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)
}

export async function isBrowserOnline(): Promise<boolean> {
  // Trust these directions when they do fire/update correctly (not every
  // browser/scenario hits the WebKit bug above) — only navigator.onLine
  // reporting `true` is untrustworthy, never `false`.
  if (lastKnownOnline === false) return false
  if (!navigator.onLine) return false

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), EXTERNAL_PROBE_TIMEOUT_MS)

  try {
    // no-cors: we only care whether the request reaches the network at
    // all, not the (opaque) response — a captive portal or real 200 both
    // count as "online" for our purposes.
    await fetch(EXTERNAL_PROBE_URL, {
      mode: 'no-cors',
      cache: 'no-store',
      signal: controller.signal,
    })
    return true
  } catch {
    return false
  } finally {
    clearTimeout(timeoutId)
  }
}

export function resetConnectivityForTests(): void {
  lastKnownOnline = null
}
