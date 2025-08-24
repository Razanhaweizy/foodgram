from sqlalchemy.orm import Session, selectinload, joinedload
from sqlalchemy import or_, func
from fastapi import FastAPI, HTTPException, Depends, status
from backend.models.recipes import Recipe
from typing import Optional, Literal
from datetime import datetime
from backend.models.tags import Tag

from backend.schemas.recipes import RecipeOut

def create_recipe(db: Session, author_id: int, input_title: str, input_description: Optional[str], input_ingredients: list[str], input_steps: list[str], tag_ids: list[int] = []):
    new_recipe = Recipe(created_by_id = author_id, title = input_title, description = input_description, ingredients = input_ingredients, steps = input_steps)
    
    if tag_ids:
        tags = db.query(Tag).filter(Tag.id.in_(tag_ids)).all()
        if len(tags) != len(set(tag_ids)):
            raise HTTPException(status_code=404, detail="One or more tags not found")
        new_recipe.tags = tags

    db.add(new_recipe)
    db.commit()
    db.refresh(new_recipe)

    return new_recipe

def get_recipe_by_id(db: Session, id: int):
    recipe = (
        db.query(Recipe)
        .options(joinedload(Recipe.creator))  
        .get(id)
    )
    if not recipe:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recipe not found")
    
    likes_count = len(recipe.likes)
    saves_count = len(recipe.saves)

    return recipe, likes_count, saves_count

def list_recipes(
        db: Session,
        q: Optional[str] = None,
        created_after: Optional[datetime] = None,
        created_before: Optional[datetime] = None,
        sort_by: Literal["id", "title", "created_at"] = "created_at",
        sort_dir: Literal["asc", "desc"] = "desc",
        limit: int = 20,
        offset: int=0,
        author_id: Optional[int] = None,
        ):
       
    query = (db.query(Recipe).options(
        selectinload(Recipe.likes),
        selectinload(Recipe.saves),
        joinedload(Recipe.creator)
    ))


    if q:
        like = f"%{q}%"
        query = query.filter(or_(Recipe.title.ilike(like), Recipe.description.ilike(like)))

    if created_after:
        query = query.filter(Recipe.created_at >= created_after)
    if created_before:
        query = query.filter(Recipe.created_at <= created_before)
    if author_id is not None:
        query = query.filter(Recipe.created_by_id == author_id)

    total = query.with_entities(func.count(Recipe.id)).scalar() or 0

    sort_col = getattr(Recipe, sort_by)
    if sort_dir == "desc":
        sort_col = sort_col.desc()
    query = query.order_by(sort_col)

    recipes = query.offset(offset).limit(limit).all()

    return recipes, total

def update_recipe(db: Session, id: int, data: dict):
    recipe = db.query(Recipe).filter(Recipe.id == id).first()
    if not recipe:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recipe not found")
    
    tag_ids = data.pop("tag_ids", None)
    if tag_ids is not None:
        tags = db.query(Tag).filter(Tag.id.in_(tag_ids)).all()
        if len(tags) != len(set(tag_ids)):
            raise HTTPException(status_code=404, detail="One or more tags not found")
        recipe.tags = tags
    
    for field, value in data.items():
        if hasattr(recipe, field) and value is not None:
            setattr(recipe, field, value)

    db.add(recipe)
    db.commit()
    db.refresh(recipe)

    return recipe
    
def delete_recipe(db: Session, id: int):
    recipe = db.query(Recipe).filter(Recipe.id == id).first()

    if not recipe:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recipe not found")
    
    db.delete(recipe)
    db.commit()

    return recipe



