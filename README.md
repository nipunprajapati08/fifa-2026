# ⚽ FIFA World Cup 2026 Tracker

A beautiful, full-stack application for tracking the 2026 FIFA World Cup — live scores, group standings, knockout brackets, team pages, stats charts, and match commentary.

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Python · FastAPI · Uvicorn |
| **Database** | SQLite (via SQLAlchemy 2.x) |
| **Scheduler** | APScheduler (auto-syncs data every 60s) |
| **Data Source** | [worldcup26.ir](https://worldcup26.ir) — Free, no API key |
| **Frontend** | React 19 · Vite 6 |
| **State/Data** | TanStack Query v5 |
| **Charts** | Recharts |
| **Icons** | Lucide React |
| **Editor** | Tiptap 2 (match commentary) |

---

## 🚀 Getting Started

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The backend will:
1. Create `fifa2026.db` (SQLite)
2. Immediately sync data from worldcup26.ir
3. Poll for updates every 60 seconds

API docs available at: http://localhost:8000/docs

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at: http://localhost:5173

---

## ✨ Features

- **Home**: Hero banner, tournament stats strip, live/upcoming/recent matches
- **Matches**: Filter by stage (Group/R32/QF/SF/Final) + group + team search
- **Match Detail**: Scoreline, goalscorers, penalty shootout, **Tiptap commentary editor**
- **Groups**: 12 group standing tables with color-coded qualification positions
- **Bracket**: Visual knockout bracket from Round of 32 → Final
- **Teams**: 48 team cards with flags, clickable for full team stats & match history
- **Stats**: Top scorers, goals by group, match outcomes pie, matchday trend, goals radar
- **Light/Dark Mode**: Toggle in navbar, persisted in localStorage
- **Auto-refresh**: Configurable 10s / 30s / 1m / 5m / Off
