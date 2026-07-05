"""Groups router — standings with team info joined."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
import models

router = APIRouter(prefix="/api/groups", tags=["groups"])


@router.get("")
def get_groups(db: Session = Depends(get_db)):
    standings = db.query(models.GroupStanding).all()
    teams_map = {t.id: t for t in db.query(models.Team).all()}

    groups_dict: dict = {}
    for s in standings:
        gn = s.group_name
        if gn not in groups_dict:
            groups_dict[gn] = {"name": gn, "standings": []}
        team = teams_map.get(s.team_id)
        groups_dict[gn]["standings"].append({
            "team_id": s.team_id,
            "group_name": s.group_name,
            "mp": s.mp,
            "w": s.w,
            "d": s.d,
            "l": s.l,
            "pts": s.pts,
            "gf": s.gf,
            "ga": s.ga,
            "gd": s.gd,
            "team": {
                "id": team.id,
                "name_en": team.name_en,
                "flag": team.flag,
                "fifa_code": team.fifa_code,
                "iso2": team.iso2,
            } if team else None,
        })

    # Sort standings by pts desc, then gd desc, then gf desc
    for g in groups_dict.values():
        g["standings"].sort(key=lambda x: (-x["pts"], -x["gd"], -x["gf"]))

    # Sort groups alphabetically A-L
    return sorted(groups_dict.values(), key=lambda x: x["name"])
