from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserPublic(BaseModel):
    id: int
    username: str
    email: EmailStr

    class Config:
        from_attributes = True  # SQLAlchemy -> Pydantic

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
