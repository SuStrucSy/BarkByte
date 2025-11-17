import uuid

from sqlmodel import Field, Relationship

from app.models.specimen_failuremode import SpecimenFailureMode
from app.models.failuremode import FailureMode
from app.models.specimen_fastenertype import SpecimenFastenerType
from app.models.fastenertype import FastenerType
from app.models.specimen_loadingdirection import SpecimenLoadingDirection
from app.models.loadingdirection import LoadingDirection
from app.models.joinerytype import JoineryType
from app.models.subjoinerytype import SubJoineryType
from app.core.bases import SpecimenBase

# Database model, database table inferred from class name
class Specimen(SpecimenBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    doi: str = Field()
    uploader_id: uuid.UUID = Field(foreign_key="user.id")
    is_approved: bool = Field(default=False)
    e_qualitative_failure_measure: list[FailureMode] = Relationship(
        back_populates="specimens",
        link_model=SpecimenFailureMode,
    )    
    fastener_types: list[FastenerType] = Relationship(
        back_populates="specimens",
        link_model=SpecimenFastenerType,
    )
    loading_directions: list[LoadingDirection] = Relationship(
        back_populates="specimens",
        link_model=SpecimenLoadingDirection,
    )
    joinery_type_id: uuid.UUID = Field(foreign_key="joinerytype.id")
    sub_joinery_type_id: uuid.UUID = Field(foreign_key="subjoinerytype.id")
    
    joinery_type: JoineryType = Relationship(back_populates="specimens")
    sub_joinery_type: SubJoineryType = Relationship(back_populates="specimens")


