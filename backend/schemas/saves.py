from pydantic import BaseModel

class SaveStatus(BaseModel):
    recipe_id: int
    saved: bool
