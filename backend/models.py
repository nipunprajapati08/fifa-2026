"""SQLAlchemy ORM models for FIFA World Cup 2026."""

from sqlalchemy import Column, String, Integer, Boolean, Text, DateTime, Float
from sqlalchemy.sql import func
from database import Base


class Team(Base):
    __tablename__ = "teams"

    id = Column(String, primary_key=True)
    name_en = Column(String, nullable=False)
    name_fa = Column(String, nullable=True)
    flag = Column(String, nullable=True)
    fifa_code = Column(String, nullable=True)
    iso2 = Column(String, nullable=True)
    group_name = Column(String, nullable=True)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class Stadium(Base):
    __tablename__ = "stadiums"

    id = Column(String, primary_key=True)
    name_en = Column(String, nullable=True)
    name_fa = Column(String, nullable=True)
    city = Column(String, nullable=True)
    country = Column(String, nullable=True)
    capacity = Column(Integer, nullable=True)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class Match(Base):
    __tablename__ = "matches"

    id = Column(String, primary_key=True)
    home_team_id = Column(String, nullable=True)
    away_team_id = Column(String, nullable=True)
    home_team_name = Column(String, nullable=True)
    away_team_name = Column(String, nullable=True)
    home_score = Column(Integer, nullable=True)
    away_score = Column(Integer, nullable=True)
    home_scorers = Column(Text, nullable=True)   # raw string from API
    away_scorers = Column(Text, nullable=True)   # raw string from API
    home_penalty_score = Column(Integer, nullable=True)
    away_penalty_score = Column(Integer, nullable=True)
    home_penalty_scorers = Column(Text, nullable=True)
    away_penalty_scorers = Column(Text, nullable=True)
    group_name = Column(String, nullable=True)
    matchday = Column(Integer, nullable=True)
    local_date = Column(String, nullable=True)
    stadium_id = Column(String, nullable=True)
    finished = Column(Boolean, default=False)
    time_elapsed = Column(String, nullable=True)
    match_type = Column(String, nullable=True)   # group, r32, qf, sf, final
    home_team_label = Column(String, nullable=True)
    away_team_label = Column(String, nullable=True)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class GroupStanding(Base):
    __tablename__ = "group_standings"

    id = Column(String, primary_key=True)   # "{group_name}_{team_id}"
    group_name = Column(String, nullable=False)
    team_id = Column(String, nullable=False)
    mp = Column(Integer, default=0)
    w = Column(Integer, default=0)
    d = Column(Integer, default=0)
    l = Column(Integer, default=0)
    pts = Column(Integer, default=0)
    gf = Column(Integer, default=0)
    ga = Column(Integer, default=0)
    gd = Column(Integer, default=0)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class Commentary(Base):
    __tablename__ = "commentaries"

    id = Column(Integer, primary_key=True, autoincrement=True)
    match_id = Column(String, nullable=False, index=True)
    author = Column(String, nullable=True, default="Anonymous")
    content = Column(Text, nullable=False)   # Tiptap JSON or HTML
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
