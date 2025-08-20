from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.user import User
from backend.routers.auth import get_current_user
from backend.schemas.recipes import RecipeOut, RecipesPage
from backend.schemas.saves import SaveStatus  
from backend.crud.saves import (
    add_save as crud_add_save,
    remove_save as crud_remove_save,
    is_saved as crud_is_saved,
    list_saved_recipes_for_user as crud_list_saved_recipes_for_user,
)

router = APIRouter(prefix="/recipes", tags=["saves"])

@router.post("/{recipe_id}/save", response_model=SaveStatus, status_code=status.HTTP_201_CREATED)
def save_recipe(
    recipe_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    crud_add_save(db, current_user.id, recipe_id)
    return SaveStatus(recipe_id=recipe_id, saved=True)

@router.delete("/{recipe_id}/save", response_model=SaveStatus, status_code=status.HTTP_200_OK)
def unsave_recipe(
    recipe_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    crud_remove_save(db, current_user.id, recipe_id)
    return SaveStatus(recipe_id=recipe_id, saved=False)

@router.get("/me/saves", response_model=RecipesPage)
def list_my_saved_recipes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    recipes, total = crud_list_saved_recipes_for_user(db, current_user.id, limit, offset)
    items = [RecipeOut.model_validate(r, from_attributes=True) for r in recipes]
    return RecipesPage(items=items, total=total, limit=limit, offset=offset)

@router.get("/{recipe_id}/saves/me")
def am_i_saving(recipe_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return {"recipe_id": recipe_id, "saved": crud_is_saved(db, current_user.id, recipe_id)}
