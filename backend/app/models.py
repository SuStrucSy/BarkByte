import uuid

from typing import Optional
from pydantic import EmailStr, HttpUrl
from sqlmodel import Field, Relationship, SQLModel
from app.enums import AssemblyType, FastenerType, LoadingDirection, Practice, Reinforcement, TestLoadingType, YieldPointMethod


# Shared properties
class UserBase(SQLModel):
  email: EmailStr = Field(unique=True, index=True, max_length=255)
  is_active: bool = False
  is_superuser: bool = False
  full_name: str | None = Field(default=None, max_length=255)

# Properties to receive via API on creation
class UserCreate(UserBase):
  password: str = Field(min_length=8, max_length=64)

class UserRegister(SQLModel):
  email: EmailStr = Field(max_length=255)
  password: str = Field(min_length=8, max_length=64)
  full_name: str | None = Field(default=None, max_length=255)

# Properties to receive via API on update, all are optional
class UserUpdate(UserBase):
    email: EmailStr | None = Field(default=None, max_length=255)  # type: ignore
    password: str | None = Field(default=None, min_length=8, max_length=64)

class UserUpdateMe(SQLModel):
    full_name: str | None = Field(default=None, max_length=255)
    email: EmailStr | None = Field(default=None, max_length=255)

class UpdatePassword(SQLModel):
    current_password: str = Field(min_length=8, max_length=64)
    new_password: str = Field(min_length=8, max_length=64)

# Database model, database table inferred from class name
class User(UserBase, table=True):
  id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
  hashed_password: str

# Properties to return via API, id is always required
class UserPublic(UserBase):
    id: uuid.UUID

class UsersPublic(SQLModel):
    data: list[UserPublic]
    count: int

# Generic message
class Message(SQLModel):
    message: str

# JSON payload containing access token
class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"

# Contents of JWT token
class TokenPayload(SQLModel):
    sub: str | None = None

class NewPassword(SQLModel):
    token: str
    new_password: str = Field(min_length=8, max_length=64)

class NewAccount(SQLModel):
    token: str

# Many-to-many relationship table for Specimen and Failure
# Each row represents a link between a Specimen and a FailureMode
class SpecimenFailureMode(SQLModel, table=True):
    specimen_id: uuid.UUID = Field(foreign_key="specimen.id", primary_key=True)
    failure_mode_id: uuid.UUID = Field(foreign_key="failuremode.id", primary_key=True)

# One row per failure mode option (Tension Parallel/Perpendicular, Compression Parallel/Perpendicular, Rolling Shear, etc.)
class FailureMode(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    label: str = Field(unique=True, min_length=1, max_length=255)

    specimens: list["Specimen"] = Relationship(
        back_populates="e_qualitative_failure_measure",
        link_model=SpecimenFailureMode,
    )

class FailureModeCreate(SQLModel):
    label: str = Field(min_length=1, max_length=255)

class FailureModes(SQLModel):
    data: list[FailureMode]
    count: int

class JoineryType(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    label: str = Field(min_length=1, max_length=255)
    has_dowel: bool = Field()

class JoineryTypeCreate(SQLModel):
    label: str = Field(min_length=1, max_length=255)
    has_dowel: bool = Field()

class JoineryTypes(SQLModel):
    data: list[JoineryType]
    count: int

# Shared properties
class SpecimenBase(SQLModel):
    reference_title: str = Field(min_length=1, max_length=255)
    author: str = Field(min_length=1, max_length=255)
    publication_year: int = Field(ge=1500, le=2500)
    specimen_reference_id: str = Field(min_length=1, max_length=255) # 🫤 figure out what this is

    replicate_tests: int = Field(..., ge=1)  # number of replicate tests
    note: str | None = Field(default=None, max_length=1024)  # additional notes
    
    # todo: need to address the enum types here
    dowel: bool = Field()  # whether the specimen uses dowels
    assembly_type: AssemblyType = Field(min_length=1, max_length=255)  # type of assembly

    joinery_type: str = Field(min_length=1, max_length=255)  # type of joinery id

    fastener_type: FastenerType = Field(min_length=1, max_length=255)  # type of fastening
    loading_direction: LoadingDirection = Field(min_length=1, max_length=255)  # direction of loading
    practice: Practice = Field(min_length=1, max_length=255)  # practice type
    reinforcement: Reinforcement | None = Field(min_length=1, max_length=255)  # reinforcement type
    connection_description: str = Field(min_length=1, max_length=255)  # description of connection

    element_dimension: str = Field(min_length=1, max_length=255)  # dimensions of the element
    fastener_numbers: int = Field(default=1, ge=1)  # number of fasteners used

    wood_type: str | None = Field(min_length=1, max_length=255)  # type of wood used
    wood_mechanical_properties: str | None = Field(min_length=1, max_length=255)  # mechanical properties of the wood
    connector_mechanical_properties: str | None = Field(min_length=1, max_length=255)  # mechanical properties of the connector
    fastener_mechanical_properties: str | None = Field(min_length=1, max_length=255)  # mechanical properties of the fastener
    
    # NOT in the screenshots? But it is in the documentation
    reinforcement_mechanical_properties: str | None = Field(min_length=1, max_length=255)  # mechanical properties of the reinforcement

    # Experiment attributes
    e_date: str | None = Field(default=None, min_length=1, max_length=255)  # date of the experiment

    e_test_loading_type: TestLoadingType | None = Field(default=None, min_length=1, max_length=255)  # type of loading test
    e_yield_point_method: YieldPointMethod | None = Field(default=None, min_length=1, max_length=255)  # method used to determine yield point

    e_stiffness: float | None = Field(default=None, ge=0)  # stiffness of the specimen
    e_yield_displacement: float | None = Field(default=None, ge=0)  # yield displacement of the specimen
    e_yield_force: float | None = Field(default=None, ge=0)  # yield force of the specimen
    e_max_displacement: float | None = Field(default=None, ge=0)  # maximum displacement of the specimen
    e_max_force: float | None = Field(default=None, ge=0)  # maximum
    e_ultimate_displacement: float | None = Field(default=None, ge=0)  # ultimate displacement of the specimen
    e_ultimate_force: float | None = Field(default=None, ge=0)  # ultimate
    e_ductility: float | None = Field(default=None, ge=0)  # ductility of the specimen
    e_measurement_unit: str | None = Field(default=None, min_length=1, max_length=255)  # unit of measurement used in the experiment

    # Qualitative failure measure I think is a drop down list of failure modes
    e_qfm_description: str | None = Field(default=None, min_length=1, max_length=1024)  # description of the qualitative failure measure

# Properties to receive on item creation
class SpecimenCreate(SpecimenBase):
    doi: str = Field() # needs to have a validator to check if it is link and not a duplicate
    e_qualitative_failure_measure: list[uuid.UUID] = []

# Properties to receive on item update
class SpecimenUpdate(SpecimenBase):
    e_qualitative_failure_measure: Optional[list[uuid.UUID]] = None

# Database model, database table inferred from class name
class Specimen(SpecimenBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    doi: str = Field(unique=True)
    uploader_id: uuid.UUID = Field(foreign_key="user.id")
    is_approved: bool = Field(default=False)

    e_qualitative_failure_measure: list[FailureMode] = Relationship(
        back_populates="specimens",
        link_model=SpecimenFailureMode,
    )

# Properties to return via API, id is always required
class SpecimenPublic(SpecimenBase):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    doi: str = Field() # needs to have a validator to check if it is link and not a duplicate
    uploader_id: uuid.UUID = Field(foreign_key="user.id")
    is_approved: bool = Field(default=False)
    e_qualitative_failure_measure: list[FailureMode] = Field(default_factory=list)

class SpecimensPublic(SQLModel):
    data: list[SpecimenPublic]
    count: int

__all__ = ["User", "Specimen", "FailureMode", "SpecimenFailureMode"]