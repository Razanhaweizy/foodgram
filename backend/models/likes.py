from sqlalchemy import Column, Integer, ForeignKey, Table
from sqlalchemy.orm import relationship, Mapped, mapped_column, declarative_base
from backend.models.user import User
from backend.models.recipes import Recipe

Base = declarative_base()

class Likes(Base):
    __tablename__ = "likes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    recipe_id: Mapped[int] = mapped_column(ForeignKey("recipes.id"))

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="likes")
    recipe: Mapped["Recipe"] = relationship("Recipe", back_populates="likes")
