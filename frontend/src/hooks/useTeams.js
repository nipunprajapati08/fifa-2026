import { useQuery } from '@tanstack/react-query'
import { fetchTeams, fetchTeam } from '../utils/api'

export const useTeams = (params = {}) =>
  useQuery({
    queryKey: ['teams', params],
    queryFn: () => fetchTeams(params),
    staleTime: 60000,
  })

export const useTeam = (id) =>
  useQuery({
    queryKey: ['team', id],
    queryFn: () => fetchTeam(id),
    enabled: !!id,
    staleTime: 30000,
  })
