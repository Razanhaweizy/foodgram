from sqlalchemy import Column, Integer, ForeignKey, Table, UniqueConstraint, DateTime, func
from sqlalchemy.orm import relationship, Mapped, mapped_column, declarative_base
from backend.models.user import User
from backend.models.recipes import Recipe
from datetime import datetime

Base = declarative_base()

class SavedRecipe(Base):
    __tablename__ = "saved_recipes"
    __table_args__ = (
        UniqueConstraint("user_id", "recipe_id", name="uq_saved_user_recipe"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    recipe_id: Mapped[int] = mapped_column(ForeignKey("recipes.id", ondelete="CASCADE"), index=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="saved_recipes")
    recipe: Mapped["Recipe"] = relationship("Recipe", back_populates="saves")