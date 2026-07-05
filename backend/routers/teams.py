"""Teams router."""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from database import get_db
import models

router = APIRouter(prefix="/api/teams", tags=["teams"])


@router.get("")
def get_teams(
    group: Optional[str] = Query(None, description="Filter by group name"),
    db: Session = Depends(get_db),
):
    q = db.query(models.Team)
    if group:
        q = q.filter(models.Team.group_name == group.upper())
    teams = q.order_by(models.Team.group_name, models.Team.name_en).all()
    return [
        {
            "id": t.id,
            "name_en": t.name_en,
            "name_fa": t.name_fa,
            "flag": t.flag,
            "fifa_code": t.fifa_code,
            "iso2": t.iso2,
            "group_name": t.group_name,
        }
        for t in teams
    ]


@router.get("/{team_id}")
def get_team(team_id: str, db: Session = Depends(get_db)):
    team = db.query(models.Team).filter_by(id=team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    # Get standing
    standing = db.query(models.GroupStanding).filter_by(team_id=team_id).first()

    # Get all matches for this team
    matches = db.query(models.Match).filter(
        (models.Match.home_team_id == team_id) | (models.Match.away_team_id == team_id)
    ).order_by(models.Match.matchday).all()

    return {
        "id": team.id,
        "name_en": team.name_en,
        "name_fa": team.name_fa,
        "flag": team.flag,
        "fifa_code": team.fifa_code,
        "iso2": team.iso2,
        "group_name": team.group_name,
        "standing": {
            "mp": standing.mp, "w": standing.w, "d": standing.d, "l": standing.l,
            "pts": standing.pts, "gf": standing.gf, "ga": standing.ga, "gd": standing.gd,
        } if standing else None,
        "matches": [
            {
                "id": m.id,
                "home_team_name": m.home_team_name,
                "away_team_name": m.away_team_name,
                "home_score": m.home_score,
                "away_score": m.away_score,
                "home_team_id": m.home_team_id,
                "away_team_id": m.away_team_id,
                "local_date": m.local_date,
                "finished": m.finished,
                "match_type": m.match_type,
                "group_name": m.group_name,
            }
            for m in matches
        ],
    }
