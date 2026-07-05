import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTeams } from '../hooks/useTeams'
import TeamFlag from '../components/TeamFlag'
import { Search } from 'lucide-react'
import './TeamsPage.css'

const GROUPS = ['All', 'A','B','C','D','E','F','G','H','I','J','K','L']

export default function TeamsPage() {
  const [search, setSearch] = useState('')
  const [activeGroup, setActiveGroup] = useState('All')

  const { data: teams = [], isLoading } = useTeams(
    activeGroup !== 'All' ? { group: activeGroup } : {}
  )

  const filtered = teams.filter(t =>
    !search ||
    t.name_en?.toLowerCase().includes(search.toLowerCase()) ||
    t.fifa_code?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Teams</h1>
        <p className="page-subtitle">48 nations competing in the 2026 FIFA World Cup</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
        <div className="tabs" style={{ flexWrap: 'wrap' }}>
          {GROUPS.map(g => (
            <button
              key={g}
              className={`tab ${activeGroup === g ? 'active' : ''}`}
              onClick={() => setActiveGroup(g)}
            >
              {g === 'All' ? 'All Groups' : `Group ${g}`}
            </button>
          ))}
        </div>
        <div className="matches-search" style={{ maxWidth: 320 }}>
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

      {/* Grid */}
      {isLoading ? (
        <div className="grid-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 100, borderRadius: 'var(--radius-lg)' }} />
          ))}
        </div>
      ) : (
        <div className="teams-grid stagger">
          {filtered.map(t => (
            <Link key={t.id} to={`/teams/${t.id}`} className="team-card card">
              <TeamFlag team={t} size={48} />
              <div className="team-card-info">
                <div className="team-card-name">{t.name_en}</div>
                <div className="team-card-sub">
                  <span className="badge badge-group" style={{ fontSize: '0.65rem' }}>
                    Group {t.group_name}
                  </span>
                  <span className="team-card-code">{t.fifa_code}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
