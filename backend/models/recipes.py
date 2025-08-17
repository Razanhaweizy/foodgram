from __future__ import annotations
from typing import List, Optional
from datetime import datetime
from sqlalchemy import String, Text, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import JSONB

from .user import User
from .likes import Like
from .saved_recipe import SavedRecipe

from .types import JSONAuto
from .base import Base

class Recipe(Base):
    __tablename__ = "recipes"

    id: Mapped[int] = mapped_column(primary_key=True, index=True) #id of each recipe 
    title: Mapped[str] = mapped_column(String(200), index=True, nullable=False) #name of recipe
    description: Mapped[Optional[str]] = mapped_column(Text) #description of what recipe is

    #for portability (SQLite/MySQL), swap JSONB -> Text and store JSON strings.

    ingredients: Mapped[List[str]] = mapped_column(JSONAuto, default=list, nullable=False) 
    steps: Mapped[List[str]] = mapped_column(JSONAuto, default=list, nullable=False)

    created_by_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False) #which user made recipe
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False) #date created

    # Relationships
    creator: Mapped["User"] = relationship(back_populates="recipes") #user who made it

    #likes this recipe recieved
    likes: Mapped[List["Like"]] = relationship(
        back_populates="recipe",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    #whos saved this recipe
    saves: Mapped[List["SavedRecipe"]] = relationship(
        back_populates="recipe",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    # Many-to-many (view-only convenience)
    liked_by_users: Mapped[List["User"]] = relationship(
        "User",
        secondary="likes",
        primaryjoin="Recipe.id==Like.recipe_id",
        secondaryjoin="User.id==Like.user_id",
        viewonly=True,
    )
    saved_by_users: Mapped[List["User"]] = relationship(
        "User",
        secondary="saved_recipes",
        primaryjoin="Recipe.id==SavedRecipe.recipe_id",
        secondaryjoin="User.id==SavedRecipe.user_id",
        viewonly=True,
    )

    def __repr__(self) -> str:
        return f"<Recipe id={self.id} title={self.title!r}>"