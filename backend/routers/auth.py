from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from sqlalchemy import or_

from backend.database import get_db
from backend.models.user import User
from backend.schemas.auth import UserCreate, UserPublic, TokenPair, TokenRefreshRequest
from backend.core.security import hash_password, verify_password
from backend.core.jwt import create_access_token, create_refresh_token, issue_tokens
from backend.core.config import settings


router = APIRouter(prefix="/auth", tags=["auth"])

# For Swagger’s “Authorize” button
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

@router.post("/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    email = payload.email.strip().lower()

    exists = (
        db.query(User)
        .filter(or_(User.username == payload.username, User.email == email))
        .first()
    )
    if exists:
        raise HTTPException(status_code=400, detail="Username or email already registered")

    user = User(
        username=payload.username,
        email=email,
        hashed_password=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=TokenPair)
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # Allow username OR email in the "username" field
    identifier = form.username.strip()
    user = (
        db.query(User)
        .filter(or_(User.username == identifier, User.email == identifier.lower()))
        .first()
    )
    if not user or not verify_password(form.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials"
        )

    return issue_tokens(user.id)


@router.post("/refresh", response_model=TokenPair)
def refresh_tokens(payload: TokenRefreshRequest, db: Session = Depends(get_db)):
    try:
        decoded: dict[str, Any] = jwt.decode(
            payload.refresh_token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGO],
        )
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    if decoded.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid token type")

    sub_val = decoded.get("sub")
    if sub_val is None:
        raise HTTPException(status_code=401, detail="Token missing subject")

    if isinstance(sub_val, int):
        user_id = sub_val
    elif isinstance(sub_val, str) and sub_val.isdigit():
        user_id = int(sub_val)
    else:
        raise HTTPException(status_code=401, detail="Invalid subject in token")

    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return issue_tokens(user.id)


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    creds_exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGO])
        if payload.get("type") != "access":
            raise creds_exc
        sub = payload.get("sub")
        user_id = int(sub) if sub and str(sub).isdigit() else 0
    except Exception:
        raise creds_exc

    user = db.get(User, user_id)
    if not user:
        raise creds_exc
    return user


@router.get("/me", response_model=UserPublic)
def me(current: User = Depends(get_current_user)):
    return current

@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(_: User = Depends(get_current_user)):
    """
    Stateless logout.
    In JWT systems without token storage/blacklist, logout just means:
    - client deletes tokens
    - server acknowledges
    """
    return None