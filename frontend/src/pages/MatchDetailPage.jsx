import { useParams, Link } from 'react-router-dom'
import { useMatch } from '../hooks/useMatches'
import TeamFlag from '../components/TeamFlag'
import CommentaryEditor from '../components/CommentaryEditor'
import '../components/CommentaryEditor.css'
import '../pages/MatchDetailPage.css'
import { ArrowLeft, MapPin, Calendar, Shield } from 'lucide-react'

function ScorerList({ scorers, side }) {
  if (!scorers || scorers.length === 0) return null
  return (
    <ul className="scorer-list">
      {scorers.map((s, i) => (
        <li key={i} className={`scorer-item ${side}`}>
          <span className="scorer-icon">⚽</span>
          <span>{s}</span>
        </li>
      ))}
    </ul>
  )
}

export default function MatchDetailPage({ refreshInterval }) {
  const { id } = useParams()
  const { data: match, isLoading, error } = useMatch(id, refreshInterval)

  if (isLoading) return (
    <div className="page-container">
      <div className="skeleton" style={{ height: 300, borderRadius: 'var(--radius-xl)' }} />
    </div>
  )

  if (error || !match) return (
    <div className="page-container">
      <div className="error-state">
        <h3>Match not found</h3>
        <Link to="/matches" className="btn btn-primary" style={{ marginTop: 12 }}>
          <ArrowLeft size={15} /> Back to Matches
        </Link>
      </div>
    </div>
  )

  const hasScore = match.home_score !== null && match.away_score !== null
  const homeWin = hasScore && match.home_score > match.away_score
  const awayWin = hasScore && match.away_score > match.home_score
  const isPenalty = match.home_penalty_score !== null && match.away_penalty_score !== null

  const typeLabels = {
    group: `Group ${match.group_name} — Matchday ${match.matchday}`,
    r32: 'Round of 32',
    qf: 'Quarter-Final',
    sf: 'Semi-Final',
    final: 'Final',
  }

  return (
    <div className="page-container">
      {/* Back */}
      <Link to="/matches" className="btn btn-ghost btn-sm" style={{ marginBottom: 20 }}>
        <ArrowLeft size={15} /> Back to Matches
      </Link>

      {/* Hero match card */}
      <div className="match-detail-hero hero-gradient animate-fadeIn">
        {/* Header */}
        <div className="match-detail-meta">
          <span className="badge badge-group">
            {typeLabels[match.match_type] || match.match_type}
          </span>
          {match.finished
            ? <span className="badge badge-finished">Full Time</span>
            : <span className="badge badge-live"><span className="live-dot"/>Live</span>
          }
        </div>

        {/* Score */}
        <div className="match-detail-score">
          {/* Home */}
          <div className={`match-detail-team ${homeWin ? 'winner' : ''}`}>
            <TeamFlag
              team={match.home_team || { name_en: match.home_team_name }}
              size={56}
            />
            <div className="match-detail-team-name">
              {match.home_team?.name_en || match.home_team_name}
            </div>
            {match.home_team_label && (
              <div className="match-detail-team-label">{match.home_team_label}</div>
            )}
          </div>

          {/* Numbers */}
          <div className="match-detail-numbers">
            {hasScore ? (
              <>
                <div className="match-detail-scoreline">
                  <span className={homeWin ? 'score-win' : ''}>{match.home_score}</span>
                  <span className="score-sep">–</span>
                  <span className={awayWin ? 'score-win' : ''}>{match.away_score}</span>
                </div>
                {isPenalty && (
                  <div className="match-detail-penalty">
                    ({match.home_penalty_score} – {match.away_penalty_score} pens)
                  </div>
                )}
              </>
            ) : (
              <div className="match-detail-time">
                {match.local_date?.split(' ')[1] || 'TBD'}
              </div>
            )}
          </div>

          {/* Away */}
          <div className={`match-detail-team ${awayWin ? 'winner' : ''}`}>
            <TeamFlag
              team={match.away_team || { name_en: match.away_team_name }}
              size={56}
            />
            <div className="match-detail-team-name">
              {match.away_team?.name_en || match.away_team_name}
            </div>
            {match.away_team_label && (
              <div className="match-detail-team-label">{match.away_team_label}</div>
            )}
          </div>
        </div>

        {/* Info strip */}
        <div className="match-detail-info">
          <span className="match-meta-item">
            <Calendar size={13} />
            {match.local_date || '—'}
          </span>
          {match.stadium && (
            <span className="match-meta-item">
              <MapPin size={13} />
              {match.stadium.name_en}
              {match.stadium.city ? `, ${match.stadium.city}` : ''}
            </span>
          )}
        </div>
      </div>

      {/* Scorers */}
      {(match.home_scorers_list?.length > 0 || match.away_scorers_list?.length > 0) && (
        <div className="card match-scorers-card animate-fadeInUp">
          <h2 className="section-title" style={{ marginBottom: 16 }}>
            <Shield size={16} style={{ color: 'var(--gold)' }} />
            Goals
          </h2>
          <div className="match-scorers-grid">
            <div>
              <ScorerList scorers={match.home_scorers_list} side="home" />
            </div>
            <div>
              <ScorerList scorers={match.away_scorers_list} side="away" />
            </div>
          </div>

          {/* Penalty scorers */}
          {isPenalty && (
            <>
              <div className="divider" />
              <h3 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 10 }}>
                Penalty Shootout
              </h3>
              <div className="match-scorers-grid">
                <div>
                  <ScorerList scorers={match.home_penalty_scorers_list} side="home" />
                </div>
                <div>
                  <ScorerList scorers={match.away_penalty_scorers_list} side="away" />
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Commentary */}
      <div className="card animate-fadeInUp" style={{ marginTop: 24 }}>
        <CommentaryEditor matchId={match.id} />
      </div>
    </div>
  )
}
