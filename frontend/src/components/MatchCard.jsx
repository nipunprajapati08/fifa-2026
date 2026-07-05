import { useNavigate } from 'react-router-dom'
import TeamFlag from './TeamFlag'
import { MapPin, Calendar } from 'lucide-react'

function getStatusBadge(match) {
  if (!match.finished && match.time_elapsed && match.time_elapsed !== 'finished') {
    return (
      <span className="badge badge-live">
        <span className="live-dot" />
        {match.time_elapsed === 'HT' ? 'Half Time' : `${match.time_elapsed}`}
      </span>
    )
  }
  if (match.finished) return <span className="badge badge-finished">FT</span>
  return <span className="badge badge-upcoming">Upcoming</span>
}

function getTypeBadge(match) {
  const labels = {
    group: `Group ${match.group_name}`,
    r32: 'Round of 32',
    qf: 'Quarter-Final',
    sf: 'Semi-Final',
    final: 'Final',
    third: '3rd Place',
  }
  return (
    <span className="badge badge-group">
      {labels[match.match_type] || match.match_type || 'Match'}
    </span>
  )
}

export default function MatchCard({ match, size = 'normal' }) {
  const navigate = useNavigate()
  const isSmall = size === 'small'

  if (!match) return null

  const hasScore = match.home_score !== null && match.away_score !== null
  const homeWin = hasScore && match.home_score > match.away_score
  const awayWin = hasScore && match.away_score > match.home_score
  const isPenalty = match.home_penalty_score !== null && match.away_penalty_score !== null

  return (
    <div
      className="match-card card animate-fadeInUp"
      onClick={() => navigate(`/matches/${match.id}`)}
      style={{ cursor: 'pointer' }}
    >
      {/* Top row: type badge + status */}
      <div className="match-card-top">
        {getTypeBadge(match)}
        {getStatusBadge(match)}
      </div>

      {/* Score area */}
      <div className="match-card-body">
        {/* Home team */}
        <div className={`match-team ${homeWin ? 'team-winner' : ''}`}>
          <TeamFlag
            team={{ name_en: match.home_team_name, flag: match.home_team?.flag }}
            size={isSmall ? 28 : 36}
          />
          <span className="match-team-name">
            {match.home_team?.fifa_code || match.home_team_name}
          </span>
        </div>

        {/* Score */}
        <div className="match-score-center">
          {hasScore ? (
            <>
              <div className="match-score-nums">
                <span className={homeWin ? 'score-win' : ''}>{match.home_score}</span>
                <span className="score-sep">–</span>
                <span className={awayWin ? 'score-win' : ''}>{match.away_score}</span>
              </div>
              {isPenalty && (
                <div className="match-penalty">
                  ({match.home_penalty_score} – {match.away_penalty_score} pen)
                </div>
              )}
            </>
          ) : (
            <div className="match-time">{match.local_date?.split(' ')[1] || 'TBD'}</div>
          )}
        </div>

        {/* Away team */}
        <div className={`match-team match-team-right ${awayWin ? 'team-winner' : ''}`}>
          <span className="match-team-name">
            {match.away_team?.fifa_code || match.away_team_name}
          </span>
          <TeamFlag
            team={{ name_en: match.away_team_name, flag: match.away_team?.flag }}
            size={isSmall ? 28 : 36}
          />
        </div>
      </div>

      {/* Footer: date + stadium */}
      {!isSmall && (
        <div className="match-card-footer">
          <span className="match-meta-item">
            <Calendar size={12} />
            {match.local_date?.split(' ')[0] || '—'}
          </span>
          {match.stadium && (
            <span className="match-meta-item">
              <MapPin size={12} />
              {match.stadium.name_en || `Stadium ${match.stadium_id}`}
              {match.stadium.city ? `, ${match.stadium.city}` : ''}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
