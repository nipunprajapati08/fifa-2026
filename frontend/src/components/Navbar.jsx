import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Sun, Moon, Trophy, Activity, Users, BarChart2, GitBranch, List } from 'lucide-react'
import './Navbar.css'

const navItems = [
  { to: '/',        label: 'Home',     icon: Activity },
  { to: '/matches', label: 'Matches',  icon: List },
  { to: '/groups',  label: 'Groups',   icon: Trophy },
  { to: '/bracket', label: 'Bracket',  icon: GitBranch },
  { to: '/teams',   label: 'Teams',    icon: Users },
  { to: '/stats',   label: 'Stats',    icon: BarChart2 },
]

export default function Navbar({ theme, onToggleTheme }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <NavLink to="/" className="navbar-logo" onClick={() => setMobileOpen(false)}>
          <div className="navbar-logo-icon">
            <span>⚽</span>
          </div>
          <div>
            <span className="navbar-logo-title">FIFA 2026</span>
            <span className="navbar-logo-sub">World Cup Tracker</span>
          </div>
        </NavLink>

        {/* Desktop Nav */}
        <nav className="navbar-nav">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={15} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Actions */}
        <div className="navbar-actions">
          <button
            className="btn btn-ghost btn-icon"
            onClick={onToggleTheme}
            aria-label="Toggle theme"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            className="navbar-hamburger"
            onClick={() => setMobileOpen(v => !v)}
            aria-label="Toggle menu"
          >
            <span className={`hamburger-line ${mobileOpen ? 'open' : ''}`} />
            <span className={`hamburger-line ${mobileOpen ? 'open' : ''}`} />
            <span className={`hamburger-line ${mobileOpen ? 'open' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <nav className="navbar-mobile">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `navbar-mobile-link ${isActive ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  )
}
