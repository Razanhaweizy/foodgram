from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from fastapi import FastAPI, HTTPException, Depends, status
from backend.models.user import User
from backend.core.security import hash_password
from sqlalchemy.exc import IntegrityError
from typing import Optional, Literal
from datetime import datetime

def get_user_by_id(db: Session, id: int):
    user = db.get(User, id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user

def get_user_by_email(db: Session, email: str):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user

def get_user_by_username(db: Session, username: str):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user

def list_users(
        db: Session, 
        q: Optional[str] = None, 
        created_after: Optional[datetime] = None, 
        created_before: Optional[datetime] = None, 
        sort_by: Literal["id", "username", "email", "created_at"] = "created_at",
        sort_dir: Literal["asc", "desc"] = "desc",
        limit: int = 20,
        offset: int=0
    ):
    """
    Returns (items, total) for paginated user listing with optional filters.
    """
    query = db.query(User)

    if q:
        like = f"{q}%"
        query = query.filter(or_(User.username.ilike(like), User.email.ilike(like)))

    if created_after:
        query = query.filter(User.created_at >= created_after)
    if created_before:
        query = query.filter(User.created_at <= created_before)

    total = query.with_entities(func.count(User.id)).scalar() or 0

    sort_col = getattr(User, sort_by)
    if sort_dir == "desc":
        sort_col = sort_col.desc()
    query = query.order_by(sort_col)

    users = query.offset(offset).limit(limit).all()

    return users, total

def update_user(db: Session, user_id: int, data: dict):
    user = db.get(User, id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    new_username = data.get("username")
    new_email = data.get("email")
    new_password = data.get("password")

    if new_username is not None and new_username != user.username:
        exists = (db.query(User).filter(User.username == new_username, User.id != user_id).first())
        if exists:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username already taken")
        user.username = new_username

    if new_email is not None:
        email_norm = new_email.strip().lower()
        if email_norm != user.email:
            exists = (db.query(User).filter(User.email == email_norm, User.id != user_id).first())
            if exists:
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already in use")
            user.email = email_norm

    if new_password:
        user.hashed_password = hash_password(new_password)

    try:
        db.add(user)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Unique constraint failed for username or email")
    
    db.refresh(user)
    return user

def delete_user(db: Session, id: int):
    user = db.get(User, id)

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    db.delete(user)
    db.commit()

    return None