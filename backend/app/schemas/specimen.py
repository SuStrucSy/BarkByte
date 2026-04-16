import uuid
from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel

from app.core.bases import SpecimenBase
from app.enums import AssemblyType, Practice, TestLoadingType, YieldPointMethod
from app.models.doi import DOI
from app.models.failuremode import FailureMode
from app.models.fastenertype import FastenerType
from app.models.joinerytype import JoineryType
from app.models.loadingdirection import LoadingDirection
from app.models.subjoinerytype import SubJoineryType


# Properties to receive on item creation
class SpecimenCreate(SpecimenBase):
    doi_id: uuid.UUID
    e_qualitative_failure_measure: list[uuid.UUID]
    fastener_type_ids: list[uuid.UUID]
    loading_direction_ids: list[uuid.UUID]
    joinery_type_id: uuid.UUID
    sub_joinery_type_id: uuid.UUID


# Properties to receive on item update
class SpecimenUpdate(SQLModel):
    # same fields as SpecimenBase, but all optional
    specimen_reference_id: str | None = None
    replicate_tests: int | None = None
    note: str | None = None
    dowel: bool | None = None
    connector: bool | None = None
    assembly_type: AssemblyType | None = None
    practice: Practice | None = None
    connection_description: str | None = None
    element_dimension: str | None = None
    fastener_numbers: int | None = None
    moisture_percentage: str | None = None
    wood_type: str | None = None
    wood_mechanical_properties: str | None = None
    connector_mechanical_properties: str | None = None
    fastener_mechanical_properties: str | None = None

    e_date: str | None = None
    e_test_loading_type: TestLoadingType | None = None
    e_yield_point_method: YieldPointMethod | None = None
    e_stiffness: float | None = None
    e_yield_displacement: float | None = None
    e_yield_force: float | None = None
    e_max_displacement: float | None = None
    e_max_force: float | None = None
    e_ultimate_displacement: float | None = None
    e_ultimate_force: float | None = None
    e_ductility: float | None = None
    e_qfm_description: str | None = None

    # relationship-id fields used in create
    e_qualitative_failure_measure: list[uuid.UUID] | None = None
    fastener_type_ids: list[uuid.UUID] | None = None
    loading_direction_ids: list[uuid.UUID] | None = None
    joinery_type_id: uuid.UUID | None = None
    sub_joinery_type_id: uuid.UUID | None = None


# Properties to return via API, id is always required
class SpecimenPublic(SpecimenBase):
    id: uuid.UUID
    uploader_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    doi: DOI
    joinery_type: JoineryType
    sub_joinery_type: SubJoineryType
    e_qualitative_failure_measure: list[FailureMode]
    fastener_types: list[FastenerType]
    loading_directions: list[LoadingDirection]


class SpecimensPublic(SQLModel):
    data: list[SpecimenPublic]
    count: int


class SpecimenFilterOptionsPublic(SQLModel):
    assembly_types: list[str]
    practices: list[str]
    joinery_types: list[str]
    sub_joinery_types: list[str]
    loading_types: list[str]
    failure_modes: list[str]
    uploader: list[str]
