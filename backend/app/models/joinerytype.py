import uuid

from sqlmodel import Field, Relationship, SQLModel

class JoineryType(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    label: str = Field(min_length=1, max_length=255)
    has_dowel: bool = Field()
    specimens: list["Specimen"] = Relationship(back_populates="joinery_type")
    sub_joinery_types: list["SubJoineryType"] = Relationship(back_populates="joinery_type")