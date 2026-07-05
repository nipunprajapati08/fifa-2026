"""Stats router — aggregated analytics for charts."""
from __future__ import annotations

import re
from collections import defaultdict
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
import models

router = APIRouter(prefix="/api/stats", tags=["stats"])


def _extract_scorers(raw: str | None) -> list[str]:
    if not raw or raw.strip() in ("null", "None", ""):
        return []
    cleaned = raw.strip().lstrip("{").rstrip("}")
    items = re.findall(r'"([^"]+)"', cleaned)
    if items:
        return [i.strip() for i in items if i.strip()]
    return [s.strip().strip('"').strip("'") for s in cleaned.split(",") if s.strip()]


def _parse_scorer_name(entry: str) -> str:
    """Strip the minute suffix from scorer entry, e.g. 'Messi 45'' -> 'Messi'."""
    return re.sub(r"\s+\d+['+]*(\(.*?\))?$", "", entry).strip()


@router.get("/top-scorers")
def top_scorers(db: Session = Depends(get_db), limit: int = 20):
    matches = db.query(models.Match).filter(models.Match.finished == True).all()
    teams_map = {t.id: t for t in db.query(models.Team).all()}

    scorer_goals: dict[str, dict] = {}

    for match in matches:
        for side in [("home_scorers", "home_team_id"), ("away_scorers", "away_team_id")]:
            raw_key, team_key = side
            raw = getattr(match, raw_key)
            team_id = getattr(match, team_key)
            team = teams_map.get(team_id)

            for entry in _extract_scorers(raw):
                # Skip own goals for scorer list
                if "(OG)" in entry or "(og)" in entry:
                    continue
                name = _parse_scorer_name(entry)
                if not name:
                    continue
                if name not in scorer_goals:
                    scorer_goals[name] = {
                        "name": name,
                        "goals": 0,
                        "team_name": team.name_en if team else None,
                        "team_flag": team.flag if team else None,
                    }
                scorer_goals[name]["goals"] += 1

    sorted_scorers = sorted(scorer_goals.values(), key=lambda x: -x["goals"])
    return sorted_scorers[:limit]


@router.get("/goals-by-group")
def goals_by_group(db: Session = Depends(get_db)):
    matches = db.query(models.Match).filter(
        models.Match.finished == True,
        models.Match.match_type == "group",
    ).all()

    group_data: dict[str, dict] = {}
    for m in matches:
        g = m.group_name or "?"
        if g not in group_data:
            group_data[g] = {"group": g, "total_goals": 0, "matches_played": 0}
        home = m.home_score or 0
        away = m.away_score or 0
        group_data[g]["total_goals"] += home + away
        group_data[g]["matches_played"] += 1

    result = []
    for v in group_data.values():
        mp = v["matches_played"]
        result.append({
            **v,
            "avg_goals": round(v["total_goals"] / mp, 2) if mp > 0 else 0,
        })
    return sorted(result, key=lambda x: x["group"])


@router.get("/results-summary")
def results_summary(db: Session = Depends(get_db)):
    matches = db.query(models.Match).filter(models.Match.finished == True).all()
    home_wins = draws = away_wins = 0
    for m in matches:
        hs = m.home_score or 0
        as_ = m.away_score or 0
        if hs > as_:
            home_wins += 1
        elif hs < as_:
            away_wins += 1
        else:
            draws += 1
    return {
        "home_wins": home_wins,
        "away_wins": away_wins,
        "draws": draws,
        "total_matches": len(matches),
    }


@router.get("/goals-per-matchday")
def goals_per_matchday(db: Session = Depends(get_db)):
    matches = db.query(models.Match).filter(models.Match.finished == True).all()
    data: dict[tuple, dict] = {}
    for m in matches:
        key = (m.matchday or 0, m.match_type or "unknown")
        if key not in data:
            data[key] = {"matchday": m.matchday or 0, "goals": 0, "match_type": m.match_type or "unknown"}
        data[key]["goals"] += (m.home_score or 0) + (m.away_score or 0)

    return sorted(data.values(), key=lambda x: (x["matchday"], x["match_type"]))


@router.get("/tournament-overview")
def tournament_overview(db: Session = Depends(get_db)):
    total_matches = db.query(models.Match).count()
    finished = db.query(models.Match).filter(models.Match.finished == True).count()
    live = db.query(models.Match).filter(
        models.Match.finished == False,
        models.Match.time_elapsed.notin_(["", "finished", None])
    ).count()
    all_matches = db.query(models.Match).filter(models.Match.finished == True).all()
    total_goals = sum((m.home_score or 0) + (m.away_score or 0) for m in all_matches)
    teams = db.query(models.Team).count()

    return {
        "total_matches": total_matches,
        "finished_matches": finished,
        "live_matches": live,
        "total_goals": total_goals,
        "total_teams": teams,
        "avg_goals_per_match": round(total_goals / finished, 2) if finished > 0 else 0,
    }
