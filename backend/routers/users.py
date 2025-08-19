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

from backend.crud.users import (
    get_user_by_id as crud_get_user_by_id,
    update_user as crud_update_user,
    delete_user as crud_delete_user,
    list_users as crud_list_users
)

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
    

@router.get("/{user_id}", response_model=UserOut, summary="(admin) Get a user by id")
def get_user_by_id(user_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return crud_get_user_by_id(db, user_id)

@router.patch(
    "/{user_id}",
    response_model=UserOut,
    summary="(admin) Update a user by id"
)
def admin_update_user(
    user_id: int,
    payload: UserUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),  # enforce admin
):
    data = payload.model_dump(exclude_unset=True)
    return crud_update_user(db, user_id, data)


@router.delete(
    "/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="(admin) Delete a user by id"
)
def admin_delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),  # enforce admin
):
    crud_delete_user(db, user_id)
    return None