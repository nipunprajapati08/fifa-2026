"""Background sync service — polls worldcup26.ir and upserts data into SQLite."""

from __future__ import annotations
import httpx
import logging
import os
from sqlalchemy.orm import Session
from database import SessionLocal
import models

logger = logging.getLogger(__name__)

WORLDCUP_API_BASE = os.getenv("WORLDCUP_API_BASE", "https://worldcup26.ir")


def _parse_score(val):
    try:
        return int(val) if val and str(val).strip() not in ("", "null", "None") else None
    except (ValueError, TypeError):
        return None


def _clean_scorers(raw):
    """Convert the raw API scorer string to a clean comma-separated list."""
    if not raw or str(raw).strip() in ("null", "None", ""):
        return None
    return raw.strip()


async def sync_teams(db: Session):
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.get(f"{WORLDCUP_API_BASE}/get/teams")
        resp.raise_for_status()
        data = resp.json()

    for t in data.get("teams", []):
        existing = db.query(models.Team).filter_by(id=t["id"]).first()
        if existing:
            existing.name_en = t.get("name_en", existing.name_en)
            existing.name_fa = t.get("name_fa")
            existing.flag = t.get("flag")
            existing.fifa_code = t.get("fifa_code")
            existing.iso2 = t.get("iso2")
            existing.group_name = t.get("groups")
        else:
            db.add(models.Team(
                id=t["id"],
                name_en=t.get("name_en", "Unknown"),
                name_fa=t.get("name_fa"),
                flag=t.get("flag"),
                fifa_code=t.get("fifa_code"),
                iso2=t.get("iso2"),
                group_name=t.get("groups"),
            ))
    db.commit()
    logger.info(f"Teams synced: {len(data.get('teams', []))}")


async def sync_stadiums(db: Session):
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.get(f"{WORLDCUP_API_BASE}/get/stadiums")
        resp.raise_for_status()
        data = resp.json()

    for s in data.get("stadiums", []):
        existing = db.query(models.Stadium).filter_by(id=str(s.get("id", ""))).first()
        if existing:
            existing.name_en = s.get("name_en") or s.get("name") or existing.name_en
            existing.city = s.get("city")
            existing.country = s.get("country")
            existing.capacity = s.get("capacity")
        else:
            db.add(models.Stadium(
                id=str(s.get("id", "")),
                name_en=s.get("name_en") or s.get("name"),
                city=s.get("city"),
                country=s.get("country"),
                capacity=s.get("capacity"),
            ))
    db.commit()
    logger.info(f"Stadiums synced: {len(data.get('stadiums', []))}")


async def sync_matches(db: Session):
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.get(f"{WORLDCUP_API_BASE}/get/games")
        resp.raise_for_status()
        data = resp.json()

    for g in data.get("games", []):
        finished_raw = str(g.get("finished", "false")).upper()
        is_finished = finished_raw == "TRUE"

        existing = db.query(models.Match).filter_by(id=g["id"]).first()
        fields = dict(
            home_team_id=g.get("home_team_id"),
            away_team_id=g.get("away_team_id"),
            home_team_name=g.get("home_team_name_en"),
            away_team_name=g.get("away_team_name_en"),
            home_score=_parse_score(g.get("home_score")),
            away_score=_parse_score(g.get("away_score")),
            home_scorers=_clean_scorers(g.get("home_scorers")),
            away_scorers=_clean_scorers(g.get("away_scorers")),
            home_penalty_score=_parse_score(g.get("home_penalty_score")),
            away_penalty_score=_parse_score(g.get("away_penalty_score")),
            home_penalty_scorers=_clean_scorers(g.get("home_penalty_scorers")),
            away_penalty_scorers=_clean_scorers(g.get("away_penalty_scorers")),
            group_name=g.get("group"),
            matchday=_parse_score(g.get("matchday")),
            local_date=g.get("local_date"),
            stadium_id=str(g.get("stadium_id", "")),
            finished=is_finished,
            time_elapsed=g.get("time_elapsed"),
            match_type=g.get("type"),
            home_team_label=g.get("home_team_label"),
            away_team_label=g.get("away_team_label"),
        )
        if existing:
            for k, v in fields.items():
                setattr(existing, k, v)
        else:
            db.add(models.Match(id=g["id"], **fields))
    db.commit()
    logger.info(f"Matches synced: {len(data.get('games', []))}")


async def sync_groups(db: Session):
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.get(f"{WORLDCUP_API_BASE}/get/groups")
        resp.raise_for_status()
        data = resp.json()

    for grp in data.get("groups", []):
        group_name = grp.get("name", "")
        for t in grp.get("teams", []):
            pk = f"{group_name}_{t['team_id']}"
            existing = db.query(models.GroupStanding).filter_by(id=pk).first()
            fields = dict(
                group_name=group_name,
                team_id=t["team_id"],
                mp=int(t.get("mp", 0) or 0),
                w=int(t.get("w", 0) or 0),
                d=int(t.get("d", 0) or 0),
                l=int(t.get("l", 0) or 0),
                pts=int(t.get("pts", 0) or 0),
                gf=int(t.get("gf", 0) or 0),
                ga=int(t.get("ga", 0) or 0),
                gd=int(t.get("gd", 0) or 0),
            )
            if existing:
                for k, v in fields.items():
                    setattr(existing, k, v)
            else:
                db.add(models.GroupStanding(id=pk, **fields))
    db.commit()
    logger.info(f"Groups synced")


async def run_full_sync():
    """Run a full data sync from the external API into SQLite."""
    db = SessionLocal()
    try:
        logger.info("Starting full data sync...")
        await sync_teams(db)
        await sync_stadiums(db)
        await sync_matches(db)
        await sync_groups(db)
        logger.info("Full sync complete.")
    except Exception as e:
        logger.error(f"Sync failed: {e}")
    finally:
        db.close()
