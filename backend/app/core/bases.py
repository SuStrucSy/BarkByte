import sqlalchemy as sa
from pydantic import EmailStr
from sqlmodel import Field, SQLModel

from app.enums import AssemblyType, Practice, TestLoadingType, YieldPointMethod


# Shared properties
class UserBase(SQLModel):
    email: EmailStr
    is_active: bool
    is_superuser: bool
    full_name: str | None = None


class SpecimenBase(SQLModel):
    specimen_reference_id: str
    replicate_tests: int
    note: str | None = None
    dowel: bool
    connector: bool
    assembly_type: AssemblyType
    practice: Practice
    connection_description: str | None = None
    element_dimension: str = Field(max_length=1000)
    fastener_numbers: int
    moisture_percentage: str | None = None
    wood_type: str | None = None
    wood_mechanical_properties: str | None = None
    connector_mechanical_properties: str | None = None
    fastener_mechanical_properties: str | None = None

    e_date: str | None = None
    e_test_loading_type: TestLoadingType
    e_yield_point_method: YieldPointMethod
    e_stiffness: float
    e_yield_displacement: float
    e_yield_force: float
    e_max_displacement: float
    e_max_force: float
    e_ultimate_displacement: float
    e_ultimate_force: float
    e_ductility: float
    e_qfm_description: str | None = None
