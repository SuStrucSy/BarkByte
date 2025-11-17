import uuid
from typing import Optional

from sqlmodel import Field, SQLModel

from app.core.bases import SpecimenBase
from app.models.failuremode import FailureMode
from app.models.fastenertype import FastenerType
from app.models.joinerytype import JoineryType
from app.models.loadingdirection import LoadingDirection
from app.models.subjoinerytype import SubJoineryType

# Properties to receive on item creation
class SpecimenCreate(SpecimenBase):
    doi: str = Field() # needs to have a validator to check if it is link and not a duplicate
    e_qualitative_failure_measure: list[uuid.UUID] = []
    fastener_type_ids: list[uuid.UUID] = []
    loading_direction_ids: list[uuid.UUID] = []
    joinery_type_id: uuid.UUID = Field(foreign_key="joinerytype.id")
    sub_joinery_type_id: uuid.UUID = Field(foreign_key="subjoinerytype.id")

# Properties to receive on item update
class SpecimenUpdate(SpecimenBase):
    e_qualitative_failure_measure: Optional[list[uuid.UUID]] = None
    fastener_type_ids: Optional[list[uuid.UUID]] = None
    loading_direction_ids: Optional[list[uuid.UUID]] = None
    joinery_type_id: uuid.UUID = Field(foreign_key="joinerytype.id")
    sub_joinery_type_id: uuid.UUID = Field(foreign_key="subjoinerytype.id")

# Properties to return via API, id is always required
class SpecimenPublic(SpecimenBase):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    doi: str = Field() # needs to have a validator to check if it is link and not a duplicate
    uploader_id: uuid.UUID = Field(foreign_key="user.id")
    is_approved: bool = Field(default=False)
    joinery_type: JoineryType = Field()
    sub_joinery_type: SubJoineryType = Field()
    e_qualitative_failure_measure: list[FailureMode] = Field(default_factory=list)
    fastener_types: list[FastenerType] = Field(default_factory=list)
    loading_directions: list[LoadingDirection] = Field(default_factory=list)

class SpecimensPublic(SQLModel):
    data: list[SpecimenPublic]
    count: int