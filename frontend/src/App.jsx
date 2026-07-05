import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import MatchesPage from './pages/MatchesPage'
import MatchDetailPage from './pages/MatchDetailPage'
import GroupsPage from './pages/GroupsPage'
import BracketPage from './pages/BracketPage'
import TeamsPage from './pages/TeamsPage'
import TeamDetailPage from './pages/TeamDetailPage'
import StatsPage from './pages/StatsPage'
import './components/MatchCard.css'
import './components/GroupTable.css'
import './components/CommentaryEditor.css'
import './pages/MatchesPage.css'
import './pages/MatchDetailPage.css'
import { RefreshCw, Clock } from 'lucide-react'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
})

const REFRESH_OPTIONS = [
  { label: '10s', value: 10000 },
  { label: '30s', value: 30000 },
  { label: '1m', value: 60000 },
  { label: '5m', value: 300000 },
  { label: 'Off', value: false },
]

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('fifa-theme') || 'dark')
  const [refreshInterval, setRefreshInterval] = useState(30000)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('fifa-theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Navbar theme={theme} onToggleTheme={toggleTheme} />

        {/* Refresh rate selector */}
        <div className="refresh-bar">
          <Clock size={13} style={{ color: 'var(--text-muted)' }} />
          <span className="refresh-bar-label">Auto-refresh:</span>
          {REFRESH_OPTIONS.map(opt => (
            <button
              key={opt.label}
              className={`refresh-opt ${refreshInterval === opt.value ? 'active' : ''}`}
              onClick={() => setRefreshInterval(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <main>
          <Routes>
            <Route path="/" element={<HomePage refreshInterval={refreshInterval} />} />
            <Route path="/matches" element={<MatchesPage refreshInterval={refreshInterval} />} />
            <Route path="/matches/:id" element={<MatchDetailPage refreshInterval={refreshInterval} />} />
            <Route path="/groups" element={<GroupsPage refreshInterval={refreshInterval} />} />
            <Route path="/bracket" element={<BracketPage refreshInterval={refreshInterval} />} />
            <Route path="/teams" element={<TeamsPage />} />
            <Route path="/teams/:id" element={<TeamDetailPage />} />
            <Route path="/stats" element={<StatsPage refreshInterval={refreshInterval} />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="app-footer">
          <span>FIFA World Cup 2026 Tracker</span>
          <span className="footer-dot">·</span>
          <span>Data from worldcup26.ir</span>
          <span className="footer-dot">·</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <RefreshCw size={11} /> Syncing every {Math.round(30)} s
          </span>
        </footer>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
