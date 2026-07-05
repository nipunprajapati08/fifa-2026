export default function TeamFlag({ team, size = 32, showName = false, className = '' }) {
  if (!team) return null
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} className={className}>
      {team.flag ? (
        <img
          src={team.flag}
          alt={team.name_en || team.name || ''}
          width={size}
          height={Math.round(size * 0.67)}
          className="flag-img"
          loading="lazy"
          onError={e => { e.target.style.display = 'none' }}
        />
      ) : (
        <div
          style={{
            width: size,
            height: Math.round(size * 0.67),
            background: 'var(--bg-card-hover)',
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 10,
            color: 'var(--text-muted)',
          }}
        >
          {team.fifa_code || '??'}
        </div>
      )}
      {showName && (
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          {team.name_en || team.name}
        </span>
      )}
    </div>
  )
}
