from pydantic import BaseModel
from datetime import datetime

class LikeBase(BaseModel):
    recipe_id: int
    user_id: int

class LikeOut(LikeBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class LikeStatus(BaseModel):
    recipe_id: int
    liked: bool
    likes_count: int

class LikesCount(BaseModel):
    recipe_id: int
    count: int
