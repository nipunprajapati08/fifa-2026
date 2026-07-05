import { useQuery } from '@tanstack/react-query'
import { fetchGroups } from '../utils/api'

export const useGroups = (refreshInterval = 30000) =>
  useQuery({
    queryKey: ['groups'],
    queryFn: fetchGroups,
    refetchInterval: refreshInterval,
    staleTime: 15000,
  })
