import { useQuery } from '@tanstack/react-query'
import { fetchMatches, fetchMatch } from '../utils/api'

export const useMatches = (params = {}, refreshInterval = 30000) =>
  useQuery({
    queryKey: ['matches', params],
    queryFn: () => fetchMatches(params),
    refetchInterval: refreshInterval,
    staleTime: 10000,
  })

export const useMatch = (id) =>
  useQuery({
    queryKey: ['match', id],
    queryFn: () => fetchMatch(id),
    enabled: !!id,
    refetchInterval: 30000,
    staleTime: 10000,
  })
