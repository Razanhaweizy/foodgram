from pydantic import BaseModel

class Settings(BaseModel):
    JWT_SECRET: str = "change-me"     
    JWT_ALGO: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

settings = Settings()
