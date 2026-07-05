import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend, LineChart, Line, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts'
import {
  useTopScorers, useGoalsByGroup, useResultsSummary, useGoalsPerMatchday
} from '../hooks/useStats'
import TeamFlag from '../components/TeamFlag'
import { Trophy, Target, TrendingUp, PieChart as PieIcon } from 'lucide-react'
import './StatsPage.css'

const COLORS = ['#FFD700', '#3b82f6', '#00ff87', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip-label">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || 'var(--gold)' }}>
          {p.name}: <strong>{typeof p.value === 'number' ? p.value.toFixed(p.name === 'Avg/Match' ? 1 : 0) : p.value}</strong>
        </p>
      ))}
    </div>
  )
}

// recharts v3: use shape prop on Pie slices instead of deprecated Cell
const PieSlice = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, index } = props
  // Just forward to a simple sector — recharts v3 handles this via Cell still for now
  return null
}

export default function StatsPage({ refreshInterval }) {
  const { data: scorers = [] } = useTopScorers(15, refreshInterval)
  const { data: goalsByGroup = [] } = useGoalsByGroup(refreshInterval)
  const { data: results } = useResultsSummary(refreshInterval)
  const { data: goalsPerDay = [] } = useGoalsPerMatchday(refreshInterval)

  const pieData = results ? [
    { name: 'Home Wins', value: results.home_wins },
    { name: 'Away Wins', value: results.away_wins },
    { name: 'Draws', value: results.draws },
  ] : []

  const matchdayGoals = goalsPerDay.filter(d => d.match_type === 'group')

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Tournament Stats</h1>
        <p className="page-subtitle">Live analytics and visualizations</p>
      </div>

      <div className="stats-grid">

        {/* Top Scorers */}
        <div className="card stats-card-wide animate-fadeInUp">
          <div className="section-header">
            <h2 className="section-title"><Trophy size={16} />Top Goal Scorers</h2>
            <span className="badge badge-group">Top {scorers.length}</span>
          </div>
          <div className="top-scorers-list">
            {scorers.slice(0, 10).map((s, i) => (
              <div key={s.name} className="scorer-row">
                <span className="scorer-rank">{i + 1}</span>
                <TeamFlag
                  team={{ name_en: s.team_name, flag: s.team_flag }}
                  size={22}
                />
                <span className="scorer-name">{s.name}</span>
                <span className="scorer-team">{s.team_name}</span>
                <div className="scorer-bar-wrap">
                  <div
                    className="scorer-bar"
                    style={{ width: `${(s.goals / (scorers[0]?.goals || 1)) * 100}%` }}
                  />
                </div>
                <span className="scorer-goals">{s.goals}</span>
              </div>
            ))}
            {scorers.length === 0 && (
              <p style={{ color: 'var(--text-muted)', padding: '20px 0', textAlign: 'center' }}>
                Scorer data will appear once matches have been played
              </p>
            )}
          </div>
        </div>

        {/* Goals by Group */}
        <div className="card animate-fadeInUp">
          <div className="section-header">
            <h2 className="section-title"><Target size={16} />Goals by Group</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={goalsByGroup} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="group" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="total_goals" name="Total Goals" fill="#FFD700" radius={[4, 4, 0, 0]} />
              <Bar dataKey="avg_goals" name="Avg/Match" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Results Pie */}
        <div className="card animate-fadeInUp">
          <div className="section-header">
            <h2 className="section-title"><PieIcon size={16} />Match Outcomes</h2>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={55}
                dataKey="value"
                paddingAngle={3}
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(value) => (
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
          {results && (
            <div className="results-summary">
              <div className="results-item" style={{ color: COLORS[0] }}>
                <strong>{results.home_wins}</strong> Home wins
              </div>
              <div className="results-item" style={{ color: COLORS[1] }}>
                <strong>{results.away_wins}</strong> Away wins
              </div>
              <div className="results-item" style={{ color: COLORS[2] }}>
                <strong>{results.draws}</strong> Draws
              </div>
            </div>
          )}
        </div>

        {/* Goals trend */}
        <div className="card animate-fadeInUp">
          <div className="section-header">
            <h2 className="section-title"><TrendingUp size={16} />Goals per Matchday</h2>
            <span className="text-muted text-xs">Group stage</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={matchdayGoals} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="matchday"
                tickFormatter={v => `MD ${v}`}
                tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
              />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="goals"
                name="Goals"
                stroke="#FFD700"
                strokeWidth={3}
                dot={{ fill: '#FFD700', r: 5 }}
                activeDot={{ r: 7, fill: '#fff' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Avg goals radar */}
        {goalsByGroup.length > 0 && (
          <div className="card animate-fadeInUp">
            <div className="section-header">
              <h2 className="section-title"><Target size={16} />Avg Goals Radar</h2>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={goalsByGroup}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="group" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <PolarRadiusAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                <Radar
                  name="Avg Goals"
                  dataKey="avg_goals"
                  stroke="#FFD700"
                  fill="#FFD700"
                  fillOpacity={0.2}
                />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}

      </div>
    </div>
  )
}
