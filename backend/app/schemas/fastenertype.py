from sqlmodel import Field, SQLModel

from app.models.fastenertype import FastenerType

class FastenerTypeCreate(SQLModel):
    label: str = Field(min_length=1, max_length=255)

class FastenerTypes(SQLModel):
    data: list[FastenerType]
    count: int