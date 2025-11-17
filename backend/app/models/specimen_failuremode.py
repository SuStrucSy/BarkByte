import uuid

from sqlmodel import Field, SQLModel

# Many-to-many relationship table for Specimen and Failure
# Each row represents a link between a Specimen and a FailureMode
class SpecimenFailureMode(SQLModel, table=True):
    specimen_id: uuid.UUID = Field(foreign_key="specimen.id", primary_key=True)
    failure_mode_id: uuid.UUID = Field(foreign_key="failuremode.id", primary_key=True)