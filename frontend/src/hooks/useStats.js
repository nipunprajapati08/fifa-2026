import { useQuery } from '@tanstack/react-query'
import {
  fetchTopScorers, fetchGoalsByGroup,
  fetchResultsSummary, fetchGoalsPerMatchday, fetchTournamentOverview,
} from '../utils/api'

export const useTopScorers = (limit = 20, refreshInterval = 30000) =>
  useQuery({
    queryKey: ['stats', 'top-scorers', limit],
    queryFn: () => fetchTopScorers(limit),
    refetchInterval: refreshInterval,
    staleTime: 15000,
  })

export const useGoalsByGroup = (refreshInterval = 30000) =>
  useQuery({
    queryKey: ['stats', 'goals-by-group'],
    queryFn: fetchGoalsByGroup,
    refetchInterval: refreshInterval,
    staleTime: 15000,
  })

export const useResultsSummary = (refreshInterval = 30000) =>
  useQuery({
    queryKey: ['stats', 'results-summary'],
    queryFn: fetchResultsSummary,
    refetchInterval: refreshInterval,
    staleTime: 15000,
  })

export const useGoalsPerMatchday = (refreshInterval = 30000) =>
  useQuery({
    queryKey: ['stats', 'goals-per-matchday'],
    queryFn: fetchGoalsPerMatchday,
    refetchInterval: refreshInterval,
    staleTime: 15000,
  })

export const useTournamentOverview = (refreshInterval = 30000) =>
  useQuery({
    queryKey: ['stats', 'tournament-overview'],
    queryFn: fetchTournamentOverview,
    refetchInterval: refreshInterval,
    staleTime: 10000,
  })
