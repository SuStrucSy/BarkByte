import uuid

from sqlmodel import Field, SQLModel

# Many-to-many relationship table for Specimen and Loading Direction
# Each row represents a link between a Specimen and a Loading Direction
class SpecimenLoadingDirection(SQLModel, table=True):
    specimen_id: uuid.UUID = Field(foreign_key="specimen.id", primary_key=True)
    loading_direction_id: uuid.UUID = Field(foreign_key="loadingdirection.id", primary_key=True)