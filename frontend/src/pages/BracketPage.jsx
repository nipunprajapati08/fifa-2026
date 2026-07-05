import { useNavigate } from 'react-router-dom'
import { useMatches } from '../hooks/useMatches'
import TeamFlag from '../components/TeamFlag'
import './BracketPage.css'

const STAGES = [
  { key: 'r32', label: 'Round of 32' },
  { key: 'qf',  label: 'Quarter-Finals' },
  { key: 'sf',  label: 'Semi-Finals' },
  { key: 'final', label: 'Final' },
]

function BracketMatch({ match, onClick }) {
  if (!match) {
    return (
      <div className="bracket-match bracket-match-empty">
        <div className="bracket-team"><span className="bracket-tbd">TBD</span></div>
        <div className="bracket-team"><span className="bracket-tbd">TBD</span></div>
      </div>
    )
  }

  const hasScore = match.home_score !== null && match.away_score !== null
  const homeWin = hasScore && match.home_score > match.away_score
  const awayWin = hasScore && match.away_score > match.home_score
  const isPen = match.home_penalty_score !== null && match.away_penalty_score !== null

  return (
    <div className="bracket-match" onClick={() => onClick(match.id)} title="View match">
      <div className={`bracket-team ${homeWin ? 'winner' : ''}`}>
        <TeamFlag
          team={match.home_team || { name_en: match.home_team_name }}
          size={20}
        />
        <span className="bracket-team-name">
          {match.home_team?.fifa_code || match.home_team_name?.slice(0, 12) || match.home_team_label || 'TBD'}
        </span>
        {hasScore && (
          <span className="bracket-score">
            {match.home_score}
            {isPen ? `(${match.home_penalty_score})` : ''}
          </span>
        )}
      </div>
      <div className={`bracket-team ${awayWin ? 'winner' : ''}`}>
        <TeamFlag
          team={match.away_team || { name_en: match.away_team_name }}
          size={20}
        />
        <span className="bracket-team-name">
          {match.away_team?.fifa_code || match.away_team_name?.slice(0, 12) || match.away_team_label || 'TBD'}
        </span>
        {hasScore && (
          <span className="bracket-score">
            {match.away_score}
            {isPen ? `(${match.away_penalty_score})` : ''}
          </span>
        )}
      </div>
    </div>
  )
}

export default function BracketPage({ refreshInterval }) {
  const navigate = useNavigate()
  const { data: allMatches = [], isLoading } = useMatches({}, refreshInterval)

  const matchesByType = {}
  STAGES.forEach(s => {
    matchesByType[s.key] = allMatches.filter(m => m.match_type === s.key)
  })

  if (isLoading) return (
    <div className="page-container">
      <div className="skeleton" style={{ height: 600, borderRadius: 'var(--radius-xl)' }} />
    </div>
  )

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Knockout Bracket</h1>
        <p className="page-subtitle">Round of 32 → Quarter-Finals → Semi-Finals → Final</p>
      </div>

      <div className="bracket-outer">
        {STAGES.map(stage => (
          <div key={stage.key} className="bracket-stage">
            <div className="bracket-stage-label">{stage.label}</div>
            <div className="bracket-round">
              {matchesByType[stage.key].length > 0
                ? matchesByType[stage.key].map(m => (
                    <BracketMatch
                      key={m.id}
                      match={m}
                      onClick={id => navigate(`/matches/${id}`)}
                    />
                  ))
                : [1, 2].map(i => <BracketMatch key={i} match={null} onClick={() => {}} />)
              }
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
