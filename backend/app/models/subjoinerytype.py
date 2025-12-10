import uuid

from sqlmodel import Field, Relationship, SQLModel

from app.models.joinerytype import JoineryType

class SubJoineryType(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    joinery_type_id: uuid.UUID = Field(foreign_key="joinerytype.id")
    label: str = Field(min_length=1, max_length=255)

    specimens: list["Specimen"] = Relationship(back_populates="sub_joinery_type")
    joinery_type: JoineryType = Relationship(back_populates="sub_joinery_types")
