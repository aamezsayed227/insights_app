import { useQuery } from '@tanstack/react-query'
import { useLiveQuery } from 'dexie-react-hooks'
import { readReadCacheEntry, writeThroughReadCache } from '@/lib/offline/repository'

export function useOfflineQuery<T>(
  entityType: string,
  entityId: string,
  queryFn: () => Promise<T>,
) {
  const query = useQuery<T>({
    queryKey: [entityType, entityId],
    // See useOfflineMutation for why: without this, TanStack Query pauses
    // the query and never calls queryFn while offline, so it would never
    // reach the failure branch this hook's read-cache fallback relies on.
    networkMode: 'always',
    // Retrying a request that's failing because the network is down just
    // delays the fallback below by several seconds (TanStack Query's
    // default is 3 attempts with exponential backoff) for no chance of a
    // different outcome. Fail once, fall back to the cache immediately.
    retry: false,
    queryFn: async () => {
      const result = await queryFn()
      await writeThroughReadCache(entityType, entityId, result)
      return result
    },
  })

  const cached = useLiveQuery(
    () => readReadCacheEntry<T>(entityType, entityId),
    [entityType, entityId],
  )

  if (query.isError && cached) {
    return {
      data: cached.data,
      isStale: true,
      cachedAt: cached.fetchedAt,
      isLoading: false,
      refetch: query.refetch,
    }
  }

  return {
    data: query.data,
    isStale: false,
    cachedAt: undefined,
    isLoading: query.isLoading,
    refetch: query.refetch,
  }
}
