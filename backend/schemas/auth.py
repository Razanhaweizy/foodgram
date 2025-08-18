from pydantic import BaseModel, EmailStr, StringConstraints
from typing import Annotated

class UserCreate(BaseModel):
    username: Annotated[str, StringConstraints(min_length=3, max_length=50)]
    email: EmailStr
    password: Annotated[str, StringConstraints(min_length=6)]
class UserPublic(BaseModel):
    id: int
    username: str
    email: EmailStr

    class Config:
        from_attributes = True  # SQLAlchemy -> Pydantic

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class TokenRefreshRequest(BaseModel):
    refresh_token: str
