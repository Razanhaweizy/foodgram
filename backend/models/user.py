from typing import List
from datetime import date
from sqlalchemy import Column, Integer, String, ForeignKey, Table
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.ext.declarative import declarative_base
from backend.models.recipes import Recipe
from backend.models.likes import Likes

Base = declarative_base()

# Association table for followers (self-referential many-to-many)
followers_table = Table(
    "followers",
    Base.metadata,
    Column("follower_id", ForeignKey("users.id"), primary_key=True),
    Column("followed_id", ForeignKey("users.id"), primary_key=True),
)

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(256), nullable=False)
    date_birth: Mapped[date] = mapped_column(nullable=True)

    #Relationships
    likes: Mapped[list["Likes"]] = relationship("Likes", back_populates="user")


    # Followers / Following (self-referential)
    followers: Mapped[List["User"]] = relationship(
        "User",
        secondary=followers_table,
        primaryjoin=id == followers_table.c.followed_id,
        secondaryjoin=id == followers_table.c.follower_id,
        back_populates="following"
    )

    following: Mapped[List["User"]] = relationship(
        "User",
        secondary=followers_table,
        primaryjoin=id == followers_table.c.follower_id,
        secondaryjoin=id == followers_table.c.followed_id,
        back_populates="followers"
    )

    # Saved recipes (many-to-many)
    saved_recipes: Mapped[List["Recipe"]] = relationship(
        "Recipe",
        secondary="saved_recipes",
        back_populates="saved_by"
    )
