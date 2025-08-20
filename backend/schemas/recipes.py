from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, List
from datetime import datetime

class RecipeCreate(BaseModel):
    title: str
    description: Optional[str]
    ingredients: list[str]
    steps: list[str]

class RecipeUpdate(BaseModel):
    title: Optional[str]
    description: Optional[str]
    ingredients: Optional[list[str]]
    steps: Optional[list[str]]

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

    class Config:
        from_attributes = True

class RecipesPage(BaseModel):
    items: list[RecipeOut]
    total: int
    limit: int
    offset: int




