// Stands in for Insight's real backend for this demo. Spec §5's "Transport
// security" section requires TLS 1.2+ on every real sync request — there is
// no live endpoint yet, so that requirement is enforced when a real API
// client replaces this file, not here.

export type MockOutcome = 'success' | 'validationRejected' | 'authExpired' | 'serverError'

export class NetworkError extends Error {
  constructor(message = 'Network unreachable') {
    super(message)
    this.name = 'NetworkError'
  }
}

export class ApiResponseError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiResponseError'
    this.status = status
  }
}

let currentOutcome: MockOutcome = 'success'

export function setMockOutcome(outcome: MockOutcome): void {
  currentOutcome = outcome
}

export function getMockOutcome(): MockOutcome {
  return currentOutcome
}

const SIMULATED_LATENCY_MS = 250

function simulateLatency(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, SIMULATED_LATENCY_MS))
}

function assertOnline(): void {
  if (!navigator.onLine) throw new NetworkError()
}

export async function mockApiPost(
  endpoint: string,
  _payload: unknown,
): Promise<{ status: number; body: { message: string } }> {
  assertOnline()
  await simulateLatency()
  assertOnline() // connectivity can drop mid-flight in a real demo

  switch (currentOutcome) {
    case 'success':
      return { status: 201, body: { message: 'created' } }
    case 'validationRejected':
      throw new ApiResponseError(409, `${endpoint} rejected: duplicate or invalid entry`)
    case 'authExpired':
      throw new ApiResponseError(401, 'Session expired')
    case 'serverError':
      throw new ApiResponseError(500, 'Internal server error')
  }
}

export async function mockApiGet<T>(_endpoint: string, seed: T): Promise<T> {
  assertOnline()
  await simulateLatency()
  assertOnline()
  return seed
}
