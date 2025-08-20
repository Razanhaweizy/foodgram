from sqlalchemy.orm import Session
from sqlalchemy import func, and_, exists
from fastapi import HTTPException, status

from backend.models.saved_recipe import SavedRecipe
from backend.models.user import User
from backend.models.recipes import Recipe

def _ensure_user_exists(db: Session, user_id: int) -> None:
    if not db.get(User, user_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

def _ensure_recipe_exists(db: Session, recipe_id: int) -> None:
    if not db.get(Recipe, recipe_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recipe not found")

def add_save(db: Session, user_id: int, recipe_id: int):
    _ensure_user_exists(db, user_id)
    _ensure_recipe_exists(db, recipe_id)

    existing = (db.query(SavedRecipe).filter(SavedRecipe.user_id == user_id, SavedRecipe.recipe_id == recipe_id).first())
    if existing:
        return existing
    
    saved_recipe = SavedRecipe(user_id = user_id, recipe_id = recipe_id)
    db.add(saved_recipe)
    db.commit()
    db.refresh(saved_recipe)

    return saved_recipe

def remove_save(db: Session, user_id: int, recipe_id: int):
    _ensure_user_exists(db, user_id)
    _ensure_recipe_exists(db, recipe_id)

    saved = (db.query(SavedRecipe).filter(SavedRecipe.user_id == user_id, SavedRecipe.recipe_id == recipe_id).first())
    if not saved:
        return False
    
    db.delete(saved)
    db.commit()
    return True


def list_saved_recipes_for_user(db: Session, user_id: int, limit: int = 20, offset: int = 0):
    _ensure_user_exists(db, user_id)

    total = (db.query(func.count(SavedRecipe.id)).filter(SavedRecipe.user_id == user_id).scalar() or 0)
    q = (db.query(Recipe).join(SavedRecipe, SavedRecipe.recipe_id == Recipe.id).filter(SavedRecipe.user_id == user_id).order_by(SavedRecipe.id.desc()).offset(offset).limit(limit))

    recipes = q.all()
    return recipes, total


def is_saved(db: Session, user_id: int, recipe_id: int):
    return db.query(exists().where(and_(SavedRecipe.user_id == user_id, SavedRecipe.recipe_id == recipe_id))).scalar()
