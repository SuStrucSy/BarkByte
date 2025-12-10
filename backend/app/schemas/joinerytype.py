from sqlmodel import Field, SQLModel

from app.models.joinerytype import JoineryType

class JoineryTypeCreate(SQLModel):
    label: str = Field(min_length=1, max_length=255)
    has_dowel: bool = Field()

class JoineryTypes(SQLModel):
    data: list[JoineryType]
    count: int