import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/shared/http/client'
import type { ServerInfo, Session } from '../types'

export const SESSION_QUERY_KEY = ['session'] as const

export function useSession() {
  return useQuery({
    queryKey: SESSION_QUERY_KEY,
    queryFn: async (): Promise<Session> => {
      const info = await apiFetch<ServerInfo>('/info')
      return {
        username: info.username,
        serverVersion: info.serverVersion,
        systemMode: info.systemMode,
        product: info.product,
        privileges: info.privileges,
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  })
}
