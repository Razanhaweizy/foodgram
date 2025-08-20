from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.user import User
from backend.routers.auth import get_current_user
from backend.crud.likes import (
    add_like as crud_add_like,
    remove_like as crud_remove_like,
    is_liked as crud_is_liked,
    count_likes as crud_count_likes,
)
from backend.schemas.likes import LikeOut, LikeStatus, LikesCount

router = APIRouter(prefix="/recipes", tags=["likes"])

@router.post("/{recipe_id}/like", response_model=LikeStatus, status_code=status.HTTP_201_CREATED)
def like_recipe(
    recipe_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    crud_add_like(db, current_user.id, recipe_id)
    return LikeStatus(
        recipe_id=recipe_id,
        liked=True,
        likes_count=crud_count_likes(db, recipe_id),
    )

@router.delete("/{recipe_id}/like", response_model=LikeStatus, status_code=status.HTTP_200_OK)
def unlike_recipe(
    recipe_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    crud_remove_like(db, current_user.id, recipe_id)
    return LikeStatus(
        recipe_id=recipe_id,
        liked=False,
        likes_count=crud_count_likes(db, recipe_id),
    )

@router.get("/{recipe_id}/likes/count", response_model=LikesCount)
def get_likes_count(recipe_id: int, db: Session = Depends(get_db)):
    count = crud_count_likes(db, recipe_id)
    return LikesCount(recipe_id=recipe_id, count=count)

# helper (auth): is the current user liking this recipe?
@router.get("/{recipe_id}/likes/me", response_model=LikeStatus, status_code=status.HTTP_200_OK)
def am_i_liking(
    recipe_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    liked = crud_is_liked(db, current_user.id, recipe_id)
    return LikeStatus(
        recipe_id=recipe_id,
        liked=liked,
        likes_count=crud_count_likes(db, recipe_id),
    )