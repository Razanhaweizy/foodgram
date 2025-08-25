from typing import List, TYPE_CHECKING, Optional
from sqlalchemy import Integer, String, DateTime, Text
from sqlalchemy.orm import relationship, Mapped, mapped_column
from datetime import datetime
from sqlalchemy.sql import func

if TYPE_CHECKING:
    from .recipes import Recipe
    from .likes import Like
    from .saved_recipe import SavedRecipe

from .base import Base

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True) #id of each user entered
    username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False) #username entered by user
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False) #email entered by user
    hashed_password: Mapped[str] = mapped_column(String(256), nullable=False) 
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False) #what day/time account was created
    is_admin: Mapped[bool] = mapped_column(default=False)

    #profile
    bio: Mapped[Optional[str]] = mapped_column(Text, default=None, nullable=True) #bio description that shows up on user's profile
    avatar_url: Mapped[Optional[str]] = mapped_column(String(512), default=None, nullable=True) #user profile photo

    #date_birth: Mapped[date] = mapped_column(nullable=True)

    #Relationships

    # One-to-many
    recipes: Mapped[List["Recipe"]] = relationship(back_populates="creator", cascade="all, delete-orphan") #recipes posted by this user
    likes: Mapped[List["Like"]] = relationship(back_populates="user", cascade="all, delete-orphan") #recipes this user liked
    saves: Mapped[List["SavedRecipe"]] = relationship(back_populates="user", cascade="all, delete-orphan") #recipes this user saved

    # Many-to-many (view-only convenience)
    liked_recipes: Mapped[List["Recipe"]] = relationship(
        "Recipe",
        secondary="likes",
        primaryjoin="User.id==Like.user_id",
        secondaryjoin="Recipe.id==Like.recipe_id",
        viewonly=True,
    )

    saved_recipes: Mapped[List["Recipe"]] = relationship(
        "Recipe",
        secondary="saved_recipes",
        primaryjoin="User.id==SavedRecipe.user_id",
        secondaryjoin="Recipe.id==SavedRecipe.recipe_id",
        viewonly=True,
    )

    def __repr__(self) -> str:
        return f"<User id={self.id} username={self.username!r}>"