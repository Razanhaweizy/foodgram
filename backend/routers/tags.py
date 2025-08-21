from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.schemas.tags import TagCreate, TagUpdate, TagOut
from backend.crud.tags import list_tags, get_tag_by_id, create_tag, update_tag, delete_tag
from backend.models.user import User
from backend.routers.auth import get_current_user

router = APIRouter(prefix="/tags", tags=["tags"])

def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_admin:
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Admins only")
    return current_user

@router.get("", response_model=list[TagOut])
def list_tags_route(db: Session = Depends(get_db)):
    return list_tags(db)

@router.get("/{tag_id}", response_model=TagOut)
def get_tag_route(tag_id: int, db: Session = Depends(get_db)):
    return get_tag_by_id(db, tag_id)

@router.post("", response_model=TagOut, status_code=status.HTTP_201_CREATED)
def create_tag_route(payload: TagCreate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return create_tag(db, payload.name)

@router.patch("/{tag_id}", response_model=TagOut)
def update_tag_route(tag_id: int, payload: TagUpdate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return update_tag(db, tag_id, payload.name)

@router.delete("/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_tag_route(tag_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    delete_tag(db, tag_id)
    return None
