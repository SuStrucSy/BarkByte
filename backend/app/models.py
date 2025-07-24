import uuid

from pydantic import EmailStr, HttpUrl
from sqlmodel import Field, Relationship, SQLModel

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

# Shared properties
class SpecimenBase(SQLModel):
    reference_title: str = Field(min_length=1, max_length=255)
    author: str = Field(min_length=1, max_length=255)
    publication_year: int = Field(ge=1500, le=2500)
    specimen_reference_id: str = Field(min_length=1, max_length=255) # 🫤 figure out what this is

    replicate_tests: int = Field(..., ge=1)  # number of replicate tests
    note: str | None = Field(default=None, max_length=1024)  # additional notes
    
    # todo: need to address the enum types here
    assembly_type: str = Field(min_length=1, max_length=255)  # type of assembly
    joinery_type: str = Field(min_length=1, max_length=255)  # type of joinery
    fastener_type: str = Field(min_length=1, max_length=255)  # type of fastening
    loading_direction: str = Field(min_length=1, max_length=255)  # direction of loading
    practice: str = Field(min_length=1, max_length=255)  # practice type
    reinforcement: str | None = Field(min_length=1, max_length=255)  # reinforcement type
    connection_description: str = Field(min_length=1, max_length=255)  # description of connection

    element_dimension: str = Field(min_length=1, max_length=255)  # dimensions of the element
    fastener_numbers: int | None = Field(default=1, ge=1)  # number of fasteners used

    wood_type: str | None = Field(min_length=1, max_length=255)  # type of wood used
    wood_mechanical_properties: str | None = Field(min_length=1, max_length=255)  # mechanical properties of the wood
    connector_mechanical_properties: str | None = Field(min_length=1, max_length=255)  # mechanical properties of the connector
    fastener_mechanical_properties: str | None = Field(min_length=1, max_length=255)  # mechanical properties of the fastener
    reinforcement_mechanical_properties: str | None = Field(min_length=1, max_length=255)  # mechanical properties of the reinforcement

# Properties to receive on item creation
class SpecimenCreate(SpecimenBase):
    doi: str = Field() # needs to have a validator to check if it is link and not a duplicate
    experiments: list["ExperimentUpdate"] = Field(..., min_items=1)

# Properties to receive on item update
class SpecimenUpdate(SpecimenBase):
    pass
    
# Database model, database table inferred from class name
class Specimen(SpecimenBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    doi: str = Field() # needs to have a validator to check if it is link and not a duplicate
    uploader_id: uuid.UUID = Field(foreign_key="user.id")
    experiments: list["Experiment"] = Relationship(back_populates="specimen")
    is_approved: bool = Field(default=False)

# Properties to return via API, id is always required
class SpecimenPublic(SpecimenBase):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    doi: str = Field() # needs to have a validator to check if it is link and not a duplicate
    uploader_id: uuid.UUID = Field(foreign_key="user.id")
    is_approved: bool = Field(default=False)

class SpecimensPublic(SQLModel):
    data: list[SpecimenPublic]
    count: int

class ExperimentBase(SQLModel):
    name: str = Field(min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=1024)

class ExperimentCreate(ExperimentBase):
    specimen_id: uuid.UUID

class ExperimentUpdate(ExperimentBase):
    pass

class Experiment(ExperimentBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    specimen_id: uuid.UUID = Field(foreign_key="specimen.id", nullable=False)
    specimen: "Specimen" = Relationship(back_populates="experiments")
    uploader_id: uuid.UUID = Field(foreign_key="user.id")
    is_average_of_replicates: bool = Field(default=False, nullable=False)

class ExperimentPublic(ExperimentBase):
    id: uuid.UUID
    specimen_id: uuid.UUID = Field(foreign_key="specimen.id", nullable=False)
    uploader_id: uuid.UUID = Field(foreign_key="user.id")
    is_average_of_replicates: bool = Field(default=False, nullable=False)

class ExperimentsPublic(SQLModel):
    data: list[ExperimentPublic]
    count: int

# add date for experiments somewhere in there,
__all__ = ["User", "Specimen", "Experiment"]