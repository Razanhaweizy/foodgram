from pydantic import BaseModel, EmailStr, Field, ConfigDict, HttpUrl
from typing import Optional, List
from datetime import datetime

class UserPrivate(BaseModel):
    '''For "me"'''
    model_config = ConfigDict(from_attributes=True)
    id: int
    username: str
    email: EmailStr
    created_at: datetime
    avatar_url: Optional[HttpUrl] = None
    bio: Optional[str] = None

class UserOut(BaseModel):
    '''Publicly used'''
    model_config = ConfigDict(from_attributes=True)
    id: int
    username: str
    created_at: datetime
    avatar_url: Optional[str] = None
    bio: Optional[str] = None

class UserUpdate(BaseModel):
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(None, min_length=8)
    #note, to change these fields the old username should b deleted from the database
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    
class UsersPage(BaseModel):
    items: List[UserOut]
    total: int
    limit: int
    offset: int

class UserPublicLite(BaseModel):
    '''To embed in comments/recipes'''
    model_config = ConfigDict(from_attributes=True)
    id: int
    username: str
    avatar_url: Optional[HttpUrl] = None