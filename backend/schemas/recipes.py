from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
from .tags import TagOut

class RecipeCreate(BaseModel):
    title: str
    description: Optional[str]
    ingredients: list[str]
    steps: list[str]
    tag_ids: list[int] = []

class RecipeUpdate(BaseModel):
    title: Optional[str]
    description: Optional[str]
    ingredients: Optional[list[str]]
    steps: Optional[list[str]]
    tag_ids: Optional[list[int]] = None

class RecipeOut(BaseModel):
    id: int
    title: str
    description: Optional[str]
    ingredients: list[str]
    steps: list[str]
    created_by_id: int
    created_at: datetime

    likes_count: int
    saves_count: int

    tags: list[TagOut] = []

    class Config:
        from_attributes = True

class RecipesPage(BaseModel):
    items: list[RecipeOut]
    total: int
    limit: int
    offset: int




