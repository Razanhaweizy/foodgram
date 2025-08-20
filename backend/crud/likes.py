from sqlalchemy.orm import Session
from sqlalchemy import or_, func, and_, exists
from fastapi import FastAPI, HTTPException, Depends, status
from backend.models.likes import Like
from backend.models.recipes import Recipe
from backend.core.security import hash_password, verify_password
from sqlalchemy.exc import IntegrityError
from typing import Optional, Literal
from datetime import datetime

def _ensure_recipe_exists(db: Session, recipe_id: int) -> None:
    if not db.get(Recipe, recipe_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recipe not found")

def add_like(db: Session, user_id: int, recipe_id: int):
    """Idempotent: if the like already exists, return it; otherwise create it."""
    _ensure_recipe_exists(db, recipe_id)

    existing = db.query(Like).filter(Like.user_id == user_id, Like.recipe_id == recipe_id).first()
    if existing:
        return existing
    
    like = Like(user_id = user_id, recipe_id = recipe_id)

    db.add(like)
    db.commit()
    db.refresh(like)

    return like

def remove_like(db: Session, user_id: int, recipe_id: int):
    """Idempotent: if no like exists, treat as success and return False; else delete and return True."""
    _ensure_recipe_exists(db, recipe_id)

    like = db.query(Like).filter(Like.user_id == user_id, Like.recipe_id == recipe_id).first()
    if not like:
        return False
    
    db.delete(like)
    db.commit()

    return True

def is_liked(db: Session, user_id: int, recipe_id: int):
    return db.query(exists().where(and_(Like.user_id == user_id, Like.recipe_id == recipe_id))).scalar()

def count_likes(db: Session, recipe_id: int):
    _ensure_recipe_exists(db, recipe_id)
    return db.query(func.count(Like.id)).filter(Like.recipe_id == recipe_id).scalar() or 0
   