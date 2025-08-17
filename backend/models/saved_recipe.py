from __future__ import annotations
from datetime import datetime
from sqlalchemy import UniqueConstraint, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .user import User
from .recipes import Recipe

from .base import Base

class SavedRecipe(Base):
    __tablename__ = "saved_recipes"
    __table_args__ = (
        UniqueConstraint("user_id", "recipe_id", name="uq_saved_user_recipe"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    recipe_id: Mapped[int] = mapped_column(ForeignKey("recipes.id", ondelete="CASCADE"), index=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    user: Mapped["User"] = relationship(back_populates="saves")
    recipe: Mapped["Recipe"] = relationship(back_populates="saves")

    def __repr__(self) -> str:
        return f"<SavedRecipe user_id={self.user_id} recipe_id={self.recipe_id}>"
