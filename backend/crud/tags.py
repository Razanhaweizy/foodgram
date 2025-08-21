from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
from backend.models.tags import Tag

def list_tags(db: Session):
    return db.query(Tag).order_by(Tag.name.asc()).all()

def get_tag_by_id(db: Session, tag_id: int) -> Tag:
    tag = db.get(Tag, tag_id)
    if not tag:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tag not found")
    return tag

def create_tag(db: Session, name: str) -> Tag:
    tag = Tag(name=name.strip())
    db.add(tag)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Tag name already exists")
    db.refresh(tag)
    return tag

def update_tag(db: Session, tag_id: int, name: str | None) -> Tag:
    tag = get_tag_by_id(db, tag_id)
    if name:
        tag.name = name.strip()
        try:
            db.commit()
        except IntegrityError:
            db.rollback()
            raise HTTPException(status_code=400, detail="Tag name already exists")
        db.refresh(tag)
    return tag

def delete_tag(db: Session, tag_id: int) -> None:
    tag = get_tag_by_id(db, tag_id)
    db.delete(tag)
    db.commit()
