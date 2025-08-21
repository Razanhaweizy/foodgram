from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text

from backend.database import get_db

router = APIRouter(prefix="/health", tags=["health"])

@router.get("")
def health_check(db: Session = Depends(get_db)):
    # trivial DB ping
    try:
        db.execute(text("SELECT 1"))
        db_ok = True
    except Exception:
        db_ok = False

    return {
        "status": "ok",
        "db": db_ok,
    }
