import uuid

from sqlmodel import Field, SQLModel

from app.models.subjoinerytype import SubJoineryType

class SubJoineryTypeCreate(SQLModel):
    joinery_type_id: uuid.UUID = Field(foreign_key="joinerytype.id")
    label: str = Field(min_length=1, max_length=255)

class SubJoineryTypes(SQLModel):
    data: list[SubJoineryType]
    count: int