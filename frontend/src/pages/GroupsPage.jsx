import GroupTable from '../components/GroupTable'
import { useGroups } from '../hooks/useGroups'
import { Trophy } from 'lucide-react'
import './GroupsPage.css'

export default function GroupsPage({ refreshInterval }) {
  const { data: groups = [], isLoading } = useGroups(refreshInterval)

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Group Standings</h1>
        <p className="page-subtitle">12 groups · 48 teams · Top 2 advance to Round of 32</p>
      </div>

      {/* Legend */}
      <div className="groups-legend">
        <span className="legend-item legend-1st">1st — Automatic qualification</span>
        <span className="legend-item legend-2nd">2nd — Automatic qualification</span>
        <span className="legend-item legend-3rd">3rd — Best of 12 may qualify</span>
      </div>

      {isLoading ? (
        <div className="grid-3">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 220, borderRadius: 'var(--radius-lg)' }} />
          ))}
        </div>
      ) : (
        <div className="grid-3 stagger">
          {groups.map(g => <GroupTable key={g.name} group={g} />)}
        </div>
      )}
    </div>
  )
}
