from app.enums import AssemblyType, Practice, TestLoadingType, YieldPointMethod

from pydantic import EmailStr
from sqlmodel import Field, SQLModel

# Shared properties
class UserBase(SQLModel):
  email: EmailStr = Field(unique=True, index=True, max_length=255)
  is_active: bool = False
  is_superuser: bool = False
  full_name: str | None = Field(default=None, max_length=255)

class SpecimenBase(SQLModel):
  reference_title: str = Field(min_length=1, max_length=255)
  author: str = Field(min_length=1, max_length=255)
  publication_year: int = Field(ge=1500, le=2500)
  specimen_reference_id: str = Field(min_length=1, max_length=255)

  replicate_tests: int = Field(..., ge=1)
  note: str | None = Field(default=None, max_length=1024)
  dowel: bool = Field()
  connector: bool = Field()
  assembly_type: AssemblyType = Field(min_length=1, max_length=255)
  practice: Practice = Field(min_length=1, max_length=255)
  connection_description: str = Field(min_length=0, max_length=255)
  element_dimension: str = Field(min_length=0, max_length=500)
  fastener_numbers: int = Field(default=0, ge=0)
  moisture_percentage: str = Field(min_length=1, max_length=255)
  wood_type: str | None = Field(min_length=1, max_length=255)
  wood_mechanical_properties: str | None = Field(min_length=1, max_length=500)
  connector_mechanical_properties: str | None = Field(min_length=1, max_length=500)
  fastener_mechanical_properties: str | None = Field(min_length=1, max_length=500)

  e_date: str | None = Field(default=None, min_length=1, max_length=255)
  e_test_loading_type: TestLoadingType | None = Field(default=None, min_length=1, max_length=255)
  e_yield_point_method: YieldPointMethod | None = Field(default=None, min_length=1, max_length=255)
  e_stiffness: float | None = Field(default=None, ge=0)
  e_yield_displacement: float | None = Field(default=None, ge=0)
  e_yield_force: float | None = Field(default=None, ge=0)
  e_max_displacement: float | None = Field(default=None, ge=0)
  e_max_force: float | None = Field(default=None, ge=0)
  e_ultimate_displacement: float | None = Field(default=None, ge=0)
  e_ultimate_force: float | None = Field(default=None, ge=0)
  e_ductility: float | None = Field(default=None, ge=0)
  e_measurement_unit: str | None = Field(default=None, min_length=1, max_length=255)
  e_qfm_description: str | None = Field(default=None, min_length=0, max_length=1024)