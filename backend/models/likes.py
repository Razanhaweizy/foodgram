from __future__ import annotations
from datetime import datetime
from sqlalchemy import UniqueConstraint, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .user import User
from .recipes import Recipe

from .base import Base

class Like(Base):
    __tablename__ = "likes"
    __table_args__ = (
        UniqueConstraint("user_id", "recipe_id", name="uq_like_user_recipe"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False) #user who gave like
    recipe_id: Mapped[int] = mapped_column(ForeignKey("recipes.id", ondelete="CASCADE"), index=True, nullable=False) #recipe liked
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False) #time liked

    user: Mapped["User"] = relationship(back_populates="likes") 
    recipe: Mapped["Recipe"] = relationship(back_populates="likes")

    def __repr__(self) -> str:
        return f"<Like user_id={self.user_id} recipe_id={self.recipe_id}>"
