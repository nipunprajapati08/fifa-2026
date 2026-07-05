import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

export const fetchMatches = (params = {}) =>
  api.get('/matches', { params }).then(r => r.data)

export const fetchMatch = (id) =>
  api.get(`/matches/${id}`).then(r => r.data)

export const fetchGroups = () =>
  api.get('/groups').then(r => r.data)

export const fetchTeams = (params = {}) =>
  api.get('/teams', { params }).then(r => r.data)

export const fetchTeam = (id) =>
  api.get(`/teams/${id}`).then(r => r.data)

export const fetchTopScorers = (limit = 20) =>
  api.get('/stats/top-scorers', { params: { limit } }).then(r => r.data)

export const fetchGoalsByGroup = () =>
  api.get('/stats/goals-by-group').then(r => r.data)

export const fetchResultsSummary = () =>
  api.get('/stats/results-summary').then(r => r.data)

export const fetchGoalsPerMatchday = () =>
  api.get('/stats/goals-per-matchday').then(r => r.data)

export const fetchTournamentOverview = () =>
  api.get('/stats/tournament-overview').then(r => r.data)

export const fetchCommentary = (matchId) =>
  api.get(`/commentary/${matchId}`).then(r => r.data)

export const createCommentary = (payload) =>
  api.post('/commentary', payload).then(r => r.data)

export const updateCommentary = (id, payload) =>
  api.put(`/commentary/${id}`, payload).then(r => r.data)

export const deleteCommentary = (id) =>
  api.delete(`/commentary/${id}`).then(r => r.data)

export default api
