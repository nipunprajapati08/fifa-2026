import { useParams, Link } from 'react-router-dom'
import { useTeam } from '../hooks/useTeams'
import TeamFlag from '../components/TeamFlag'
import { ArrowLeft, Trophy, Target } from 'lucide-react'

export default function TeamDetailPage() {
  const { id } = useParams()
  const { data: team, isLoading } = useTeam(id)

  if (isLoading) return (
    <div className="page-container">
      <div className="skeleton" style={{ height: 200, borderRadius: 'var(--radius-xl)' }} />
    </div>
  )
  if (!team) return (
    <div className="page-container">
      <div className="error-state"><h3>Team not found</h3></div>
    </div>
  )

  const standing = team.standing

  return (
    <div className="page-container">
      <Link to="/teams" className="btn btn-ghost btn-sm" style={{ marginBottom: 20 }}>
        <ArrowLeft size={15} /> All Teams
      </Link>

      {/* Team hero */}
      <div className="card hero-gradient" style={{ padding: 32, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <TeamFlag team={team} size={64} />
          <div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 900, color: '#fff', marginBottom: 6 }}>
              {team.name_en}
            </h1>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <span className="badge badge-group">Group {team.group_name}</span>
              <span className="badge badge-finished">{team.fifa_code}</span>
            </div>
          </div>
        </div>

        {standing && (
          <div className="stat-strip" style={{ marginTop: 24 }}>
            {[
              { v: standing.mp, l: 'Played' },
              { v: standing.w, l: 'Won' },
              { v: standing.d, l: 'Drawn' },
              { v: standing.l, l: 'Lost' },
              { v: standing.gf, l: 'GF' },
              { v: standing.ga, l: 'GA' },
              { v: standing.gd > 0 ? `+${standing.gd}` : standing.gd, l: 'GD' },
              { v: standing.pts, l: 'Pts' },
            ].map(({ v, l }) => (
              <div key={l} className="stat-strip-item">
                <span className="stat-strip-value" style={{ fontSize: '1.3rem' }}>{v}</span>
                <span className="stat-strip-label">{l}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Matches */}
      <h2 className="section-title" style={{ marginBottom: 16 }}>
        <Trophy size={16} style={{ color: 'var(--gold)' }} />
        Match History
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {team.matches?.map(m => {
          const isHome = m.home_team_id === team.id
          const opponent = isHome ? m.away_team_name : m.home_team_name
          const myScore = isHome ? m.home_score : m.away_score
          const opScore = isHome ? m.away_score : m.home_score
          const hasScore = myScore !== null && opScore !== null
          const result = hasScore
            ? myScore > opScore ? 'W' : myScore < opScore ? 'L' : 'D'
            : '—'
          const resultColor = result === 'W' ? 'var(--green-live)' : result === 'L' ? 'var(--red-accent)' : 'var(--text-muted)'

          return (
            <Link
              key={m.id}
              to={`/matches/${m.id}`}
              style={{ textDecoration: 'none' }}
            >
              <div className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                <span style={{ fontWeight: 800, fontSize: '1rem', color: resultColor, minWidth: 20 }}>{result}</span>
                <div style={{ flex: 1, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {isHome ? 'vs' : '@'} <strong style={{ color: 'var(--text-primary)' }}>{opponent}</strong>
                </div>
                {hasScore && (
                  <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1rem' }}>
                    {myScore} – {opScore}
                  </span>
                )}
                <span className="badge badge-group" style={{ fontSize: '0.65rem' }}>
                  {m.match_type === 'group' ? `Grp ${m.group_name}` : m.match_type?.toUpperCase()}
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {m.local_date?.split(' ')[0]}
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
