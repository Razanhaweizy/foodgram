from sqlalchemy.orm import Session
from sqlalchemy import or_
from fastapi import FastAPI, HTTPException, Depends, status
from backend.models.user import User
from backend.core.security import hash_password, verify_password

def create_user(db: Session, name: str, uemail: str, upassword: str) -> User:

    #check that username and email are unique
    user_exists = db.query(User).filter(User.username == name).first()
    email_exists = db.query(User).filter(User.email == uemail).first()

    if user_exists:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already exists")
    
    if email_exists:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already exists")
    
    #hash password first
    hashed_pw = hash_password(upassword)
    
    #create the new user
    new_user = User(username = name, email = uemail, hashed_password = hashed_pw)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user

def get_user_by_login(db: Session, login: str) -> User | None:
    '''
    Returns a user by being given either a username or email
    '''
    user = db.query(User).filter(or_(User.username == login, User.email == login)).first()
    return user

def authenticate_user(db: Session, login: str, password: str) -> User | None:
    '''
    Returns true if user is authenticated successfully
    '''
    user = get_user_by_login(db, login)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user





