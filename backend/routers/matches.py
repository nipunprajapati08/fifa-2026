"""Matches router — CRUD + filtered queries."""
from __future__ import annotations

import re
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
import models, schemas

router = APIRouter(prefix="/api/matches", tags=["matches"])


def _parse_scorer_list(raw: str | None) -> list[str]:
    """Parse the raw scorer string from the API into a clean list."""
    if not raw or raw.strip() in ("null", "None", ""):
        return []
    # Remove surrounding braces/brackets and split by comma patterns
    cleaned = raw.strip().lstrip("{").rstrip("}")
    # Extract quoted items
    items = re.findall(r'"([^"]+)"', cleaned)
    if items:
        return [i.strip() for i in items if i.strip()]
    # Fallback — split by comma
    return [s.strip().strip('"').strip("'") for s in cleaned.split(",") if s.strip()]


def _enrich_match(match: models.Match, db: Session) -> dict:
    """Add team and stadium info to a match."""
    home_team = db.query(models.Team).filter_by(id=match.home_team_id).first() if match.home_team_id else None
    away_team = db.query(models.Team).filter_by(id=match.away_team_id).first() if match.away_team_id else None
    stadium = db.query(models.Stadium).filter_by(id=match.stadium_id).first() if match.stadium_id else None
    commentaries = db.query(models.Commentary).filter_by(match_id=match.id).order_by(models.Commentary.created_at.desc()).all()

    data = {
        "id": match.id,
        "home_team_id": match.home_team_id,
        "away_team_id": match.away_team_id,
        "home_team_name": match.home_team_name,
        "away_team_name": match.away_team_name,
        "home_score": match.home_score,
        "away_score": match.away_score,
        "home_scorers_list": _parse_scorer_list(match.home_scorers),
        "away_scorers_list": _parse_scorer_list(match.away_scorers),
        "home_penalty_score": match.home_penalty_score,
        "away_penalty_score": match.away_penalty_score,
        "home_penalty_scorers_list": _parse_scorer_list(match.home_penalty_scorers),
        "away_penalty_scorers_list": _parse_scorer_list(match.away_penalty_scorers),
        "group_name": match.group_name,
        "matchday": match.matchday,
        "local_date": match.local_date,
        "stadium_id": match.stadium_id,
        "finished": match.finished,
        "time_elapsed": match.time_elapsed,
        "match_type": match.match_type,
        "home_team_label": match.home_team_label,
        "away_team_label": match.away_team_label,
        "home_team": {"id": home_team.id, "name_en": home_team.name_en, "flag": home_team.flag, "fifa_code": home_team.fifa_code} if home_team else None,
        "away_team": {"id": away_team.id, "name_en": away_team.name_en, "flag": away_team.flag, "fifa_code": away_team.fifa_code} if away_team else None,
        "stadium": {"id": stadium.id, "name_en": stadium.name_en, "city": stadium.city, "country": stadium.country} if stadium else None,
        "commentaries": [
            {"id": c.id, "match_id": c.match_id, "author": c.author, "content": c.content, "created_at": c.created_at.isoformat(), "updated_at": c.updated_at.isoformat()}
            for c in commentaries
        ],
    }
    return data


@router.get("", response_model=None)
def get_matches(
    match_type: Optional[str] = Query(None, description="Filter by type: group, r32, qf, sf, final"),
    group: Optional[str] = Query(None, description="Filter by group name (A-L)"),
    team_id: Optional[str] = Query(None, description="Filter by team ID"),
    finished: Optional[bool] = Query(None, description="Filter by finished status"),
    db: Session = Depends(get_db),
):
    q = db.query(models.Match)
    if match_type:
        q = q.filter(models.Match.match_type == match_type)
    if group:
        q = q.filter(models.Match.group_name == group.upper())
    if team_id:
        q = q.filter(
            (models.Match.home_team_id == team_id) | (models.Match.away_team_id == team_id)
        )
    if finished is not None:
        q = q.filter(models.Match.finished == finished)

    matches = q.order_by(models.Match.matchday, models.Match.id).all()
    return [_enrich_match(m, db) for m in matches]


@router.get("/{match_id}", response_model=None)
def get_match(match_id: str, db: Session = Depends(get_db)):
    match = db.query(models.Match).filter_by(id=match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    return _enrich_match(match, db)
