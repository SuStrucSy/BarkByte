import uuid
from typing import Optional

from sqlmodel import Field, SQLModel

from app.enums import AssemblyType, Practice, TestLoadingType, YieldPointMethod
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
class SpecimenUpdate(SQLModel):
    # same fields as SpecimenBase, but all optional
    reference_title: str | None = None
    author: str | None = None
    publication_year: int | None = Field(default=None, ge=1500, le=2500)
    specimen_reference_id: str | None = None

    replicate_tests: int | None = Field(default=None, ge=1)
    note: str | None = Field(default=None, max_length=1024)
    dowel: bool | None = None
    connector: bool | None = None
    assembly_type: AssemblyType | None = None
    practice: Practice | None = None
    connection_description: str | None = Field(default=None, max_length=255)
    element_dimension: str | None = Field(default=None, max_length=500)
    fastener_numbers: int | None = Field(default=None, ge=0)
    moisture_percentage: str | None = Field(default=None, max_length=255)
    wood_type: str | None = Field(default=None, max_length=255)
    wood_mechanical_properties: str | None = Field(default=None, max_length=500)
    connector_mechanical_properties: str | None = Field(default=None, max_length=500)
    fastener_mechanical_properties: str | None = Field(default=None, max_length=500)

    e_date: str | None = Field(default=None, max_length=255)
    e_test_loading_type: TestLoadingType | None = None
    e_yield_point_method: YieldPointMethod | None = None
    e_stiffness: float | None = Field(default=None, ge=0)
    e_yield_displacement: float | None = Field(default=None, ge=0)
    e_yield_force: float | None = Field(default=None, ge=0)
    e_max_displacement: float | None = Field(default=None, ge=0)
    e_max_force: float | None = Field(default=None, ge=0)
    e_ultimate_displacement: float | None = Field(default=None, ge=0)
    e_ultimate_force: float | None = Field(default=None, ge=0)
    e_ductility: float | None = Field(default=None, ge=0)
    e_measurement_unit: str | None = Field(default=None, max_length=255)
    e_qfm_description: str | None = Field(default=None, max_length=1024)

    # relationship-id fields used in create
    e_qualitative_failure_measure: list[uuid.UUID] | None = None
    fastener_type_ids: list[uuid.UUID] | None = None
    loading_direction_ids: list[uuid.UUID] | None = None
    joinery_type_id: uuid.UUID | None = None
    sub_joinery_type_id: uuid.UUID | None = None

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