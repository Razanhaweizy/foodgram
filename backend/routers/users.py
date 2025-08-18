from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.user import User
from backend.schemas.users import UserOut, UserUpdate, UsersPage
from backend.core.security import hash_password   
from backend.routers.auth import get_current_user  

from typing import Optional, Literal
from datetime import datetime
from sqlalchemy import or_, func
from fastapi import Query

router = APIRouter(
    prefix="/users", 
    tags=["users"]
    )

def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if not getattr(current_user, "is_admin", False):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admins only")
    return current_user

@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)) -> User:
    return current_user

@router.patch("/me", response_model=UserOut) #delete old user?
def update_me(payload: UserUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):

    # Uniqueness checks (if changing email/username)
    if payload.username and payload.username != current_user.username: #if new user is diff from old user
        exists = db.query(User).filter(User.username == payload.username).first() #does new user alr exist
        if exists:
            raise HTTPException(status_code=400, detail="Username already taken")
        current_user.username = payload.username

    if payload.email and payload.email != current_user.email:
        exists = db.query(User).filter(User.email == payload.email).first()
        if exists:
            raise HTTPException(status_code=400, detail="Email already in use")
        current_user.email = payload.email

    if payload.password:
        current_user.hashed_password = hash_password(payload.password)

    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user

@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
def delete_me(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db.delete(current_user)
    db.commit()
    return None

@router.get("", response_model=UsersPage, summary="(admin) List users (paginated)")
def list_users(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),

    # Filters (all optional)
    q: Optional[str] = Query(None, description="Search username/email"),
    created_after: Optional[datetime] = Query(None),
    created_before: Optional[datetime] = Query(None),

    # Sorting & pagination
    sort_by: Literal["id", "username", "email", "created_at"] = "created_at",
    sort_dir: Literal["asc", "desc"] = "desc",
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    query = db.query(User)

    # text search (case-insensitive)
    if q:
        like = f"%{q}%"
        query = query.filter(or_(User.username.ilike(like), User.email.ilike(like)))

    if created_after:
        query = query.filter(User.created_at >= created_after)
    if created_before:
        query = query.filter(User.created_at <= created_before)

    # total BEFORE pagination
    total = query.with_entities(func.count(User.id)).scalar() or 0

    # sorting
    sort_col = getattr(User, sort_by)
    if sort_dir == "desc":
        sort_col = sort_col.desc()
    query = query.order_by(sort_col)

    # pagination
    users = query.offset(offset).limit(limit).all()
    items = [UserOut.model_validate(u, from_attributes=True) for u in users]  

    return UsersPage(
        items=items,
        total=total,
        limit=limit,
        offset=offset,
    )

@router.get("/{user_id}", response_model=UserOut, summary="(admin) Get a user by id")
def get_user_by_id(user_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user