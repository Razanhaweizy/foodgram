from typing import List, Optional
from datetime import date
from sqlalchemy import Column, Integer, String, ForeignKey, Table
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.ext.declarative import declarative_base
from backend.models.user import User
from backend.models.likes import Likes

Base = declarative_base()

saved_recipes_table = Table(
    "saved_recipes",
    Base.metadata,
    Column("user_id", ForeignKey("users.id"), primary_key=True),
    Column("recipe_id", ForeignKey("recipes.id"), primary_key=True),
)

class Recipe(Base):
    __tablename__ = "recipes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(String(500))
    ingredients: Mapped[str] = mapped_column(String(2000))
    steps: Mapped[str] = mapped_column(String(5000))
    created_by_id: Mapped[int] = mapped_column(ForeignKey("users.id"))

    image_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    creator: Mapped["User"] = relationship("User", backref="recipes")
    likes: Mapped[list["Likes"]] = relationship("Likes", back_populates="recipe")

    # Many-to-many: which users saved this recipe
    saved_by: Mapped[List["User"]] = relationship(
        "User",
        secondary=saved_recipes_table,
        back_populates="saved_recipes"
    )
