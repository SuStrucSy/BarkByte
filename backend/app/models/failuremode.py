import uuid

from sqlmodel import Field, Relationship, SQLModel

from app.enums import FailureModeType
from app.models.specimen_failuremode import SpecimenFailureMode

# One row per failure mode option (Tension Parallel/Perpendicular, Compression Parallel/Perpendicular, Rolling Shear, etc.)
class FailureMode(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    label: str = Field(unique=True, min_length=1, max_length=255)
    type: FailureModeType = Field()

    specimens: list["Specimen"] = Relationship(
        back_populates="e_qualitative_failure_measure",
        link_model=SpecimenFailureMode,
    )