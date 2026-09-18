import { useMutation } from '@tanstack/react-query'
import { mockApiPost, NetworkError } from '@/lib/offline/mockApi'
import { enqueueOutboxRow } from '@/lib/offline/repository'

export function useOfflineMutation<TInput extends Record<string, unknown>>(
  entityType: string,
  endpoint: string,
) {
  return useMutation<{ queued: boolean }, Error, TInput>({
    // TanStack Query's default networkMode ('online') pauses the mutation
    // and never calls mutationFn at all while the browser reports itself
    // offline — which would make our own navigator.onLine check below
    // unreachable. 'always' hands control of offline handling entirely
    // to this function, which is the whole point of this hook.
    networkMode: 'always',
    mutationFn: async (input) => {
      if (!navigator.onLine) {
        await enqueueOutboxRow(entityType, endpoint, input)
        return { queued: true }
      }

      try {
        await mockApiPost(endpoint, input)
        return { queued: false }
      } catch (error) {
        if (error instanceof NetworkError) {
          await enqueueOutboxRow(entityType, endpoint, input)
          return { queued: true }
        }
        throw error
      }
    },
  })
}
