import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Activity, Target, Users, Trophy, Zap, ArrowRight, RefreshCw } from 'lucide-react'
import MatchCard from '../components/MatchCard'
import FootballParticles from '../components/FootballParticles'
import { useMatches } from '../hooks/useMatches'
import { useTournamentOverview } from '../hooks/useStats'
import { useCountUp } from '../hooks/useCountUp'
import './HomePage.css'

/* ── Animated stat item ─────────────────────────────────────────── */
function AnimatedStat({ value, label, icon: Icon }) {
  const displayVal = useCountUp(value)
  return (
    <div className="stat-strip-item stat-glow">
      <Icon size={16} style={{ color: 'var(--gold)', margin: '0 auto 4px' }} />
      <span className="stat-strip-value">{displayVal}</span>
      <span className="stat-strip-label">{label}</span>
    </div>
  )
}

/* ── Scroll-reveal hook ─────────────────────────────────────────── */
function useScrollReveal(selector = '.reveal') {
  useEffect(() => {
    const els = document.querySelectorAll(selector)
    if (!els.length) return
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('revealed')
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.1 }
    )
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [selector])
}

export default function HomePage({ refreshInterval }) {
  const { data: allMatches = [], isLoading, dataUpdatedAt } = useMatches({}, refreshInterval)
  const { data: overview } = useTournamentOverview(refreshInterval)

  useScrollReveal('.reveal')

  const liveMatches = allMatches.filter(
    m => !m.finished && m.time_elapsed && m.time_elapsed !== 'finished' && m.time_elapsed !== ''
  )
  const recentMatches = allMatches
    .filter(m => m.finished)
    .slice(-6)
    .reverse()

  const nextMatches = allMatches
    .filter(m => !m.finished && (!m.time_elapsed || m.time_elapsed === ''))
    .slice(0, 3)

  const lastUpdated = dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString() : null

  return (
    <div className="page-container">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <div className="home-hero hero-gradient animate-fadeIn">
        {/* Floating football particles */}
        <FootballParticles />

        {/* Aurora light rays */}
        <div className="hero-aurora" aria-hidden="true">
          <div className="aurora-ray ray-1" />
          <div className="aurora-ray ray-2" />
          <div className="aurora-ray ray-3" />
        </div>

        <div className="home-hero-content">
          <div className="home-hero-badge badge-pulse">
            <Zap size={13} />
            FIFA World Cup 2026 · USA · Canada · Mexico
          </div>
          <h1 className="home-hero-title">
            The World's Biggest<br />
            <span className="hero-title-gold hero-title-shimmer">Football Tournament</span>
          </h1>
          <p className="home-hero-sub">
            48 teams. 12 groups. Live scores, standings, stats and more.
          </p>
          <div className="home-hero-actions">
            <Link to="/matches" className="btn btn-primary btn-glow">
              View All Matches <ArrowRight size={16} />
            </Link>
            <Link to="/bracket" className="btn btn-ghost">
              Knockout Bracket
            </Link>
          </div>
        </div>

        {/* Big decorative football */}
        <div className="home-hero-decoration hero-ball-spin" aria-hidden="true">⚽</div>

        {/* Stadium spotlight beams */}
        <div className="hero-spotlight spot-left"  aria-hidden="true" />
        <div className="hero-spotlight spot-right" aria-hidden="true" />
      </div>

      {/* ── Stats strip ──────────────────────────────────────── */}
      {overview && (
        <div className="stat-strip animate-fadeInUp" style={{ marginBottom: 32 }}>
          {[
            { value: overview.total_teams,         label: 'Teams',          icon: Users    },
            { value: overview.finished_matches,    label: 'Matches Played', icon: Activity },
            { value: overview.total_goals,         label: 'Total Goals',    icon: Target   },
            { value: overview.avg_goals_per_match, label: 'Goals/Match',    icon: Trophy   },
          ].map(({ value, label, icon }) => (
            <AnimatedStat key={label} value={value} label={label} icon={icon} />
          ))}
        </div>
      )}

      {/* ── Refresh indicator ────────────────────────────────── */}
      {lastUpdated && (
        <div className="refresh-indicator">
          <RefreshCw size={12} />
          Last updated: {lastUpdated}
        </div>
      )}

      {/* ── Live Matches ─────────────────────────────────────── */}
      {liveMatches.length > 0 && (
        <section className="home-section reveal">
          <div className="section-header">
            <h2 className="section-title">
              <span className="live-dot" style={{ width: 8, height: 8 }} />
              Live Now
            </h2>
          </div>
          <div className="grid-auto stagger">
            {liveMatches.map(m => <MatchCard key={m.id} match={m} />)}
          </div>
        </section>
      )}

      {/* ── Next Matches ─────────────────────────────────────── */}
      {nextMatches.length > 0 && (
        <section className="home-section reveal">
          <div className="section-header">
            <h2 className="section-title">Next Matches</h2>
            <Link to="/matches" className="btn btn-ghost btn-sm">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid-3 stagger">
            {nextMatches.map(m => <MatchCard key={m.id} match={m} />)}
          </div>
        </section>
      )}

      {/* ── Latest Results ───────────────────────────────────── */}
      {isLoading ? (
        <div className="grid-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 160, borderRadius: 'var(--radius-lg)' }} />
          ))}
        </div>
      ) : (
        <section className="home-section reveal">
          <div className="section-header">
            <h2 className="section-title">Latest Results</h2>
            <Link to="/matches?tab=finished" className="btn btn-ghost btn-sm">
              All Results <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid-3 stagger">
            {recentMatches.map(m => <MatchCard key={m.id} match={m} />)}
          </div>
        </section>
      )}
    </div>
  )
}
