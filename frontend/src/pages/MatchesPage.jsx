import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import MatchCard from '../components/MatchCard'
import { useMatches } from '../hooks/useMatches'
import { Search, Filter } from 'lucide-react'

const TYPE_TABS = [
  { key: 'all', label: 'All' },
  { key: 'group', label: 'Group Stage' },
  { key: 'r32', label: 'Round of 32' },
  { key: 'qf', label: 'Quarter-Finals' },
  { key: 'sf', label: 'Semi-Finals' },
  { key: 'final', label: 'Final' },
]

const GROUPS = ['A','B','C','D','E','F','G','H','I','J','K','L']

export default function MatchesPage({ refreshInterval }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [activeType, setActiveType] = useState('all')
  const [activeGroup, setActiveGroup] = useState('all')

  const params = {}
  if (activeType !== 'all') params.match_type = activeType
  if (activeGroup !== 'all') params.group = activeGroup

  const { data: matches = [], isLoading } = useMatches(params, refreshInterval)

  const filtered = matches.filter(m => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      m.home_team_name?.toLowerCase().includes(q) ||
      m.away_team_name?.toLowerCase().includes(q)
    )
  })

  // Group by date
  const byDate = {}
  filtered.forEach(m => {
    const date = m.local_date?.split(' ')[0] || 'TBD'
    if (!byDate[date]) byDate[date] = []
    byDate[date].push(m)
  })

  const formatDate = (d) => {
    if (!d || d === 'TBD') return 'TBD'
    try {
      const [month, day, year] = d.split('/')
      return new Date(`${year}-${month}-${day}`).toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric'
      })
    } catch { return d }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Matches</h1>
        <p className="page-subtitle">All {matches.length} matches across the tournament</p>
      </div>

      {/* Filter bar */}
      <div className="matches-filters">
        {/* Type tabs */}
        <div className="tabs">
          {TYPE_TABS.map(t => (
            <button
              key={t.key}
              className={`tab ${activeType === t.key ? 'active' : ''}`}
              onClick={() => { setActiveType(t.key); setActiveGroup('all') }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Group filter (only in group stage) */}
        {(activeType === 'all' || activeType === 'group') && (
          <div className="tabs" style={{ flexWrap: 'wrap' }}>
            <button
              className={`tab ${activeGroup === 'all' ? 'active' : ''}`}
              onClick={() => setActiveGroup('all')}
            >
              All Groups
            </button>
            {GROUPS.map(g => (
              <button
                key={g}
                className={`tab ${activeGroup === g ? 'active' : ''}`}
                onClick={() => setActiveGroup(g)}
              >
                {g}
              </button>
            ))}
          </div>
        )}

        {/* Search */}
        <div className="matches-search">
          <Search size={15} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search teams..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="matches-search-input"
          />
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="grid-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 160, borderRadius: 'var(--radius-lg)' }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="error-state">
          <Filter size={32} style={{ color: 'var(--text-muted)' }} />
          <h3>No matches found</h3>
          <p>Try adjusting your filters</p>
        </div>
      ) : (
        Object.entries(byDate).map(([date, dayMatches]) => (
          <section key={date} style={{ marginBottom: 36 }}>
            <div className="matches-date-header">
              <span className="matches-date-label">{formatDate(date)}</span>
              <span className="badge badge-group">{dayMatches.length} matches</span>
            </div>
            <div className="grid-3 stagger">
              {dayMatches.map(m => <MatchCard key={m.id} match={m} />)}
            </div>
          </section>
        ))
      )}
    </div>
  )
}
