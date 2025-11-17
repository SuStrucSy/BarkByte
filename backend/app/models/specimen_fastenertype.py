import uuid

from sqlmodel import Field, SQLModel

# Many-to-many relationship table for Specimen and FastenerType
# Each row represents a link between a Specimen and a FastenerType
class SpecimenFastenerType(SQLModel, table=True):
    specimen_id: uuid.UUID = Field(foreign_key="specimen.id", primary_key=True)
    fastener_type_id: uuid.UUID = Field(foreign_key="fastenertype.id", primary_key=True)