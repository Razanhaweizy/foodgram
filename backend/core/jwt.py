from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from backend.core.config import settings
from fastapi import HTTPException, status

def create_access_token(sub: str, expires_minutes: int | None = None) -> str:
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=expires_minutes or settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    payload = {"sub": sub, "exp": expire, "type": "access"}
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGO)

def create_refresh_token(sub: str, expires_days: int = 7) -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=expires_days)
    payload = {"sub": sub, "exp": expire, "type": "refresh"}
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGO)

def issue_tokens(user_id: int) -> dict:
    """
    Generate both access + refresh tokens for a given user_id.
    Returns a dict suitable for API responses.
    """
    return {
        "access_token": create_access_token(str(user_id)),
        "refresh_token": create_refresh_token(str(user_id)),
        "token_type": "bearer",
    }

def decode_token(token: str) -> dict:
    """
    Decode a JWT and return its payload.
    Raises HTTPException if the token is invalid or expired.
    """
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGO],
        )
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )