import uuid

from sqlmodel import Field

from app.core.bases import UserBase

# Database model, database table inferred from class name
class User(UserBase, table=True):
  id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
  hashed_password: str

