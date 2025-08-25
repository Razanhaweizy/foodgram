# backend/routers/users.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional, Literal

from backend.database import get_db
from backend.models.user import User
from backend.core.security import hash_password
from backend.routers.auth import get_current_user

from datetime import datetime

from backend.crud.users import (
    get_user_by_id as crud_get_user_by_id,
    update_user as crud_update_user,
    delete_user as crud_delete_user,
    list_users as crud_list_users,
)

# Schemas: use private for /me, and public for everything else
from backend.schemas.users import (
    UserPrivate,
    UserOut,
    UserUpdate,
    UsersPage,
)

router = APIRouter(prefix="/users", tags=["users"])


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if not getattr(current_user, "is_admin", False):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admins only")
    return current_user


# Me (authenticated user)

@router.get("/me", response_model=UserPrivate)
def get_me(current_user: User = Depends(get_current_user)) -> User:
    """Return the authenticated user's full profile (includes email)."""
    return current_user


@router.patch("/me", response_model=UserPrivate)
def update_me(
    payload: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Update the authenticated user's profile.
    Supports username, email, password, bio, avatar_url (all optional).
    Performs uniqueness checks for username/email when changed.
    """
    # Username uniqueness
    if payload.username and payload.username != current_user.username:
        exists = db.query(User).filter(User.username == payload.username).first()
        if exists:
            raise HTTPException(status_code=400, detail="Username already taken")
        current_user.username = payload.username

    # Email uniqueness
    if payload.email and payload.email != current_user.email:
        email_norm = payload.email.strip().lower()
        exists = db.query(User).filter(User.email == email_norm).first()
        if exists:
            raise HTTPException(status_code=400, detail="Email already in use")
        current_user.email = email_norm

    # Password
    if payload.password:
        current_user.hashed_password = hash_password(payload.password)

    # Profile fields
    if payload.bio is not None:
        current_user.bio = payload.bio
    if payload.avatar_url is not None:
        current_user.avatar_url = payload.avatar_url

    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
def delete_me(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete the authenticated user's account."""
    db.delete(current_user)
    db.commit()
    return None


# Public profile

@router.get("/{user_id}/public", response_model=UserOut, summary="Public user profile")
def get_user_by_id_public(user_id: int, db: Session = Depends(get_db)):
    user = crud_get_user_by_id(db, user_id)
    return user


# Admin

@router.get("", response_model=UsersPage, summary="(admin) List users (paginated)")
def list_users_route(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
    q: Optional[str] = Query(None, description="Search username/email"),
    created_after: Optional[datetime] = Query(None),
    created_before: Optional[datetime] = Query(None),
    sort_by: Literal["id", "username", "email", "created_at"] = "created_at",
    sort_dir: Literal["asc", "desc"] = "desc",
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    users, total = crud_list_users(
        db=db,
        q=q,
        created_after=created_after,
        created_before=created_before,
        sort_by=sort_by,
        sort_dir=sort_dir,
        limit=limit,
        offset=offset,
    )
    return UsersPage(
        items=[UserOut.model_validate(u, from_attributes=True) for u in users],
        total=total,
        limit=limit,
        offset=offset,
    )


@router.patch(
    "/{user_id}",
    response_model=UserOut,
    summary="(admin) Update a user by id",
)
def admin_update_user(
    user_id: int,
    payload: UserUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    data = payload.model_dump(exclude_unset=True)
    return crud_update_user(db, user_id=user_id, data=data)


@router.delete(
    "/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="(admin) Delete a user by id",
)
def admin_delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    crud_delete_user(db, user_id)
    return None
