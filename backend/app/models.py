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
    ref_title: str = Field(min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=255)
    uploader_id: uuid.UUID = Field(foreign_key="user.id") # TODO: check it again, wrote this in a hurry, mandetory. ALSO need to make sure if the user is deleted, the specimen is NOT deleted.

# Properties to receive on item creation
class SpecimenCreate(SpecimenBase):
    # doi: HttpUrl = Field()
    doi: str = Field()
    publication_year: int = Field(ge=1500, le=2500)
    author: str = Field(min_length=1, max_length=255)
    specimen_refrence: str = Field(min_length=1, max_length=255)
    
# Properties to receive on item update
class SpecimenUpdate(SpecimenBase):
    pass
    
# Database model, database table inferred from class name
class Specimen(SpecimenBase, table=True):
    spec_id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    doi: str = Field()
    publication_year: int = Field(ge=1500, le=2500)
    author: str = Field(min_length=1, max_length=255)
    specimen_refrence: str = Field(min_length=1, max_length=255)
    is_approved: bool = Field(default=False)

# Properties to return via API, id is always required
class SpecimenPublic(SpecimenBase):
    spec_id: uuid.UUID
    # doi: HttpUrl = Field()
    doi: str = Field()
    publication_year: int = Field(ge=1500, le=2500)
    author: str = Field(min_length=1, max_length=255)
    specimen_refrence: str = Field(min_length=1, max_length=255)
    is_approved: bool = Field(default=False)

class SpecimensPublic(SQLModel):
    data: list[SpecimenPublic]
    count: int

__all__ = ["User", "Specimen"]