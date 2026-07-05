"""Pydantic v2 schemas for request/response validation."""

from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


# ─── Team ────────────────────────────────────────────────────────────────────

class TeamBase(BaseModel):
    id: str
    name_en: str
    name_fa: Optional[str] = None
    flag: Optional[str] = None
    fifa_code: Optional[str] = None
    iso2: Optional[str] = None
    group_name: Optional[str] = None

    model_config = {"from_attributes": True}


# ─── Stadium ─────────────────────────────────────────────────────────────────

class StadiumBase(BaseModel):
    id: str
    name_en: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    capacity: Optional[int] = None

    model_config = {"from_attributes": True}


# ─── Match ───────────────────────────────────────────────────────────────────

class MatchBase(BaseModel):
    id: str
    home_team_id: Optional[str] = None
    away_team_id: Optional[str] = None
    home_team_name: Optional[str] = None
    away_team_name: Optional[str] = None
    home_score: Optional[int] = None
    away_score: Optional[int] = None
    home_scorers: Optional[str] = None
    away_scorers: Optional[str] = None
    home_penalty_score: Optional[int] = None
    away_penalty_score: Optional[int] = None
    home_penalty_scorers: Optional[str] = None
    away_penalty_scorers: Optional[str] = None
    group_name: Optional[str] = None
    matchday: Optional[int] = None
    local_date: Optional[str] = None
    stadium_id: Optional[str] = None
    finished: Optional[bool] = False
    time_elapsed: Optional[str] = None
    match_type: Optional[str] = None
    home_team_label: Optional[str] = None
    away_team_label: Optional[str] = None

    model_config = {"from_attributes": True}


# ─── Group Standing ──────────────────────────────────────────────────────────

class GroupStandingOut(BaseModel):
    team_id: str
    group_name: str
    mp: int
    w: int
    d: int
    l: int
    pts: int
    gf: int
    ga: int
    gd: int
    team: Optional[TeamBase] = None

    model_config = {"from_attributes": True}


class GroupOut(BaseModel):
    name: str
    standings: List[GroupStandingOut]


# ─── Commentary ──────────────────────────────────────────────────────────────

class CommentaryCreate(BaseModel):
    match_id: str
    author: Optional[str] = "Anonymous"
    content: str   # Tiptap HTML


class CommentaryOut(BaseModel):
    id: int
    match_id: str
    author: Optional[str] = None
    content: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ─── Stats ───────────────────────────────────────────────────────────────────

class TopScorer(BaseModel):
    name: str
    goals: int
    team_name: Optional[str] = None
    team_flag: Optional[str] = None


class GoalsByGroup(BaseModel):
    group: str
    total_goals: int
    matches_played: int
    avg_goals: float


class ResultsSummary(BaseModel):
    home_wins: int
    away_wins: int
    draws: int
    total_matches: int


class GoalsPerMatchday(BaseModel):
    matchday: int
    goals: int
    match_type: str
