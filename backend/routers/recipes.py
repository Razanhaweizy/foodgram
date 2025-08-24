from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional, Literal, List
from pydantic import BaseModel, ConfigDict
from datetime import datetime

from backend.database import get_db
from backend.models.user import User
from backend.schemas.recipes import RecipeCreate, RecipeOut, RecipeUpdate, RecipesPage
from backend.crud.recipes import (
    create_recipe as crud_create_recipe,
    get_recipe_by_id as crud_get_recipe_by_id,
    list_recipes as crud_list_recipes,
    update_recipe as crud_update_recipe,
    delete_recipe as crud_delete_recipe,
)
from backend.routers.auth import get_current_user

router = APIRouter(prefix="/recipes", tags=["recipes"])

@router.post("", response_model=RecipeOut, status_code=status.HTTP_201_CREATED)
def create_recipe(
    payload: RecipeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    recipe = crud_create_recipe(
        db,
        author_id=current_user.id,
        input_title=payload.title,
        input_description=payload.description,
        input_ingredients=payload.ingredients,
        input_steps=payload.steps,
    )
    _ = recipe.creator  

    base = RecipeOut.model_validate(recipe, from_attributes=True)
    return base.model_copy(update={"likes_count": 0, "saves_count": 0})

@router.get("/{recipe_id}", response_model=RecipeOut)
def get_recipe(recipe_id: int, db: Session = Depends(get_db)):
    recipe, likes_count, saves_count = crud_get_recipe_by_id(db, recipe_id)
    out = RecipeOut.model_validate(recipe, from_attributes=True)
    # attach counts
    out.likes_count = likes_count
    out.saves_count = saves_count
    return out

class RecipesPageOut(BaseModel):
    items: List[RecipeOut]
    total: int
    limit: int
    offset: int
    model_config = ConfigDict(from_attributes=True)

@router.get("", response_model=RecipesPageOut)
def list_recipes_route(
    db: Session = Depends(get_db),
    q: Optional[str] = Query(None),
    created_after: Optional[datetime] = Query(None),
    created_before: Optional[datetime] = Query(None),
    sort_by: Literal["id", "title", "created_at"] = "created_at",
    sort_dir: Literal["asc", "desc"] = "desc",
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    author_id: Optional[int] = Query(None),
):
    recipes, total = crud_list_recipes(
        db=db,
        q=q,
        created_after=created_after,
        created_before=created_before,
        sort_by=sort_by,
        sort_dir=sort_dir,
        limit=limit,
        offset=offset,
        author_id=author_id,
    )

    items: List[RecipeOut] = []
    for r in recipes:
        out = RecipeOut.model_validate(r, from_attributes=True)
        # counts from preloaded relationships
        out.likes_count = len(r.likes)
        out.saves_count = len(r.saves)
        items.append(out)

    return RecipesPageOut(items=items, total=total, limit=limit, offset=offset)

@router.patch("/{recipe_id}", response_model=RecipeOut)
def update_recipe_route(
    recipe_id: int,
    payload: RecipeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    recipe, _, _ = crud_get_recipe_by_id(db, recipe_id)  # unpack tuple
    if recipe.created_by_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not allowed to edit this recipe")

    data = payload.model_dump(exclude_unset=True)
    updated = crud_update_recipe(db, recipe_id, data)

    # return with fresh counts
    refreshed, likes_count, saves_count = crud_get_recipe_by_id(db, recipe_id)
    base = RecipeOut.model_validate(refreshed, from_attributes=True)
    return base.model_copy(update={"likes_count": likes_count, "saves_count": saves_count})

@router.delete("/{recipe_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_recipe_route(
    recipe_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    recipe, _, _ = crud_get_recipe_by_id(db, recipe_id)  # unpack tuple
    if recipe.created_by_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not allowed to delete this recipe")

    crud_delete_recipe(db, recipe_id)
    return None
