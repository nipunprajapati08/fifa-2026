"""Commentary router — Tiptap match notes."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models, schemas

router = APIRouter(prefix="/api/commentary", tags=["commentary"])


@router.get("/{match_id}")
def get_commentary(match_id: str, db: Session = Depends(get_db)):
    entries = db.query(models.Commentary).filter_by(match_id=match_id).order_by(
        models.Commentary.created_at.desc()
    ).all()
    return [
        {
            "id": c.id,
            "match_id": c.match_id,
            "author": c.author,
            "content": c.content,
            "created_at": c.created_at.isoformat(),
            "updated_at": c.updated_at.isoformat(),
        }
        for c in entries
    ]


@router.post("")
def create_commentary(payload: schemas.CommentaryCreate, db: Session = Depends(get_db)):
    entry = models.Commentary(
        match_id=payload.match_id,
        author=payload.author or "Anonymous",
        content=payload.content,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return {
        "id": entry.id,
        "match_id": entry.match_id,
        "author": entry.author,
        "content": entry.content,
        "created_at": entry.created_at.isoformat(),
        "updated_at": entry.updated_at.isoformat(),
    }


@router.put("/{commentary_id}")
def update_commentary(commentary_id: int, payload: schemas.CommentaryCreate, db: Session = Depends(get_db)):
    entry = db.query(models.Commentary).filter_by(id=commentary_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Commentary not found")
    entry.content = payload.content
    entry.author = payload.author or entry.author
    db.commit()
    db.refresh(entry)
    return {
        "id": entry.id,
        "match_id": entry.match_id,
        "author": entry.author,
        "content": entry.content,
        "created_at": entry.created_at.isoformat(),
        "updated_at": entry.updated_at.isoformat(),
    }


@router.delete("/{commentary_id}")
def delete_commentary(commentary_id: int, db: Session = Depends(get_db)):
    entry = db.query(models.Commentary).filter_by(id=commentary_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Commentary not found")
    db.delete(entry)
    db.commit()
    return {"status": "deleted"}
