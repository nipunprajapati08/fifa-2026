import { Link } from 'react-router-dom'
import TeamFlag from './TeamFlag'

export default function GroupTable({ group }) {
  if (!group) return null
  const { name, standings } = group

  return (
    <div className="card group-table-card">
      <div className="group-table-header">
        <div className="group-label">Group {name}</div>
      </div>
      <div className="table-wrapper">
        <table className="standings-table">
          <thead>
            <tr>
              <th style={{ width: '40%' }}>Team</th>
              <th>MP</th>
              <th>W</th>
              <th>D</th>
              <th>L</th>
              <th>GD</th>
              <th>Pts</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((row, idx) => {
              const rowClass =
                idx === 0 ? 'rank-1' :
                idx === 1 ? 'rank-2' :
                idx === 2 ? 'rank-qualified' : ''
              return (
                <tr key={row.team_id} className={rowClass}>
                  <td>
                    <Link to={`/teams/${row.team_id}`} className="team-row-link">
                      <span className="rank-num">{idx + 1}</span>
                      <TeamFlag
                        team={row.team}
                        size={22}
                      />
                      <span className="team-row-name">
                        {row.team?.name_en || `Team ${row.team_id}`}
                      </span>
                    </Link>
                  </td>
                  <td>{row.mp}</td>
                  <td>{row.w}</td>
                  <td>{row.d}</td>
                  <td>{row.l}</td>
                  <td style={{ color: row.gd > 0 ? 'var(--green-live)' : row.gd < 0 ? 'var(--red-accent)' : 'inherit' }}>
                    {row.gd > 0 ? `+${row.gd}` : row.gd}
                  </td>
                  <td style={{ fontWeight: 700, color: idx < 2 ? 'var(--gold)' : 'var(--text-primary)' }}>
                    {row.pts}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
