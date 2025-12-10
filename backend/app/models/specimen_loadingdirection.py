import uuid

from sqlmodel import Field, SQLModel
from sqlalchemy import ForeignKeyConstraint

# Many-to-many relationship table for Specimen and Loading Direction
# Each row represents a link between a Specimen and a Loading Direction
class SpecimenLoadingDirection(SQLModel, table=True):
    specimen_id: uuid.UUID = Field(primary_key=True)
    loading_direction_id: uuid.UUID = Field(primary_key=True)

    __table_args__ = (
        # When a specimen is deleted, delete link rows
        ForeignKeyConstraint(["specimen_id"], ["specimen.id"], ondelete="CASCADE"),
        # LoadingDirection side stays restrictive
        ForeignKeyConstraint(["loading_direction_id"], ["loadingdirection.id"]),
    )
