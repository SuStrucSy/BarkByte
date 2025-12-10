from sqlmodel import SQLModel, Field
import uuid
from app.schemas.specimen import SpecimensPublic

class DOICreate(SQLModel):
    link: str
    ref_title: str
    authors: str
    pub_year: int

class DOIPublic(DOICreate):
    """What you return via API."""
    id: uuid.UUID

class DOIDetailPublic(DOIPublic):
    specimens: SpecimensPublic

class DOIsPublic(SQLModel):
    data: list[DOIPublic]
    count: int