"""FastAPI main application entry point."""

import asyncio
import logging
import os
from contextlib import asynccontextmanager

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from database import engine, Base
from routers import matches, groups, teams, stats, commentary
from services.sync import run_full_sync

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s — %(message)s")
logger = logging.getLogger(__name__)

SYNC_INTERVAL = int(os.getenv("SYNC_INTERVAL_SECONDS", "60"))

scheduler = AsyncIOScheduler()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables ensured.")

    # Initial sync
    await run_full_sync()

    # Schedule periodic sync
    scheduler.add_job(run_full_sync, "interval", seconds=SYNC_INTERVAL, id="sync_job")
    scheduler.start()
    logger.info(f"Scheduler started — syncing every {SYNC_INTERVAL}s")

    yield

    scheduler.shutdown()
    logger.info("Scheduler stopped.")


app = FastAPI(
    title="FIFA World Cup 2026 API",
    description="Track matches, standings, teams and stats for the 2026 World Cup",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(matches.router)
app.include_router(groups.router)
app.include_router(teams.router)
app.include_router(stats.router)
app.include_router(commentary.router)


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "FIFA 2026 API"}


@app.get("/")
def root():
    return {"message": "FIFA World Cup 2026 API — visit /docs for Swagger UI"}
