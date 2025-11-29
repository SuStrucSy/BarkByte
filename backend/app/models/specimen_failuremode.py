import uuid

from sqlmodel import Field, SQLModel
from sqlalchemy import ForeignKeyConstraint

# Many-to-many relationship table for Specimen and Failure
# Each row represents a link between a Specimen and a FailureMode
class SpecimenFailureMode(SQLModel, table=True):
    specimen_id: uuid.UUID = Field(primary_key=True)
    failure_mode_id: uuid.UUID = Field(primary_key=True)

    __table_args__ = (
        # When a specimen is deleted, delete link rows
        ForeignKeyConstraint(["specimen_id"], ["specimen.id"], ondelete="CASCADE"),
        # FailureMode side stays restrictive (no cascade)
        ForeignKeyConstraint(["failure_mode_id"], ["failuremode.id"]),
    )