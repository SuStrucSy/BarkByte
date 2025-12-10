import uuid

from sqlmodel import Field, SQLModel
from sqlalchemy import ForeignKeyConstraint

# Many-to-many relationship table for Specimen and FastenerType
# Each row represents a link between a Specimen and a FastenerType
class SpecimenFastenerType(SQLModel, table=True):
    specimen_id: uuid.UUID = Field(primary_key=True)
    fastener_type_id: uuid.UUID = Field(primary_key=True)

    __table_args__ = (
        # When a specimen is deleted, delete link rows
        ForeignKeyConstraint(["specimen_id"], ["specimen.id"], ondelete="CASCADE"),
        # FastenerType side stays restrictive
        ForeignKeyConstraint(["fastener_type_id"], ["fastenertype.id"]),
    )