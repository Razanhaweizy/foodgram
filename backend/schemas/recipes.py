from pydantic import BaseModel, Field, ConfigDict, AliasChoices
from typing import Optional, List
from datetime import datetime
from .tags import TagOut
from .users import UserOut

class RecipeCreate(BaseModel):
    title: str
    description: Optional[str] = None
    ingredients: list[str]
    steps: list[str]
    tag_ids: list[int] = []

class RecipeUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    ingredients: Optional[list[str]] = None
    steps: Optional[list[str]] = None
    tag_ids: Optional[list[int]] = None

class RecipeOut(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    ingredients: List[str]
    steps: List[str]

    created_by_id: int

    created_by: Optional[UserOut] = Field(
        default=None,
        validation_alias=AliasChoices("created_by", "creator"),
        serialization_alias="created_by",
    )

    created_at: datetime

    likes_count: int = 0
    saves_count: int = 0

    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,  
    )

class RecipesPage(BaseModel):
    items: list[RecipeOut]
    total: int
    limit: int
    offset: int




