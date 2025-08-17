from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

from backend.schemas.auth import UserCreate, UserPublic, Token
from backend.core.security import hash_password, verify_password
from backend.core.jwt import create_access_token
from backend.core.config import settings
from backend.database import get_db   # your SessionLocal dependency
from backend.models.user import User

from typing import Any

from backend.core.jwt import create_access_token, create_refresh_token
from backend.schemas.auth import TokenPair, TokenRefreshRequest

router = APIRouter(
    prefix="/auth", 
    tags=["auth"]
    )

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

@router.post("/register", response_model=UserPublic, status_code=201)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter((User.username == payload.username) | (User.email == payload.email)).first():
        raise HTTPException(status_code=400, detail="Username or email already registered")
    user = User(
        username=payload.username,
        email=payload.email,
        hashed_password=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.post("/login", response_model=TokenPair)
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(
        (User.username == form.username) | (User.email == form.username)
    ).first()
    if not user or not verify_password(form.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    access_token = create_access_token(sub=str(user.id))
    refresh_token = create_refresh_token(sub=str(user.id))
    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}

@router.post("/refresh", response_model=TokenPair)
def refresh_tokens(payload: TokenRefreshRequest, db: Session = Depends(get_db)):
    try:
        decoded: dict[str, Any] = jwt.decode(
            payload.refresh_token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGO],
        )
    except JWTError:
        # invalid, expired, or tampered token
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    # Ensure correct token type
    if decoded.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid token type")

    sub_val = decoded.get("sub")
    if sub_val is None:
        raise HTTPException(status_code=401, detail="Token missing subject")

    # Accept str or int and normalize to int
    if isinstance(sub_val, int):
        user_id = sub_val
    elif isinstance(sub_val, str) and sub_val.isdigit():
        user_id = int(sub_val)
    else:
        # If you always encode as str(user.id), this else should never happen
        raise HTTPException(status_code=401, detail="Invalid subject in token")

    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return {
        "access_token": create_access_token(sub=str(user.id)),
        "refresh_token": create_refresh_token(sub=str(user.id)),
        "token_type": "bearer",
    }

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    creds_exc = HTTPException(status_code=401, detail="Could not validate credentials", headers={"WWW-Authenticate": "Bearer"})
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGO])
        user_id = int(payload.get("sub") or 0)
    except Exception:
        raise creds_exc
    user = db.get(User, user_id)
    if not user:
        raise creds_exc
    return user

@router.get("/me", response_model=UserPublic)
def me(current: User = Depends(get_current_user)):
    return current
