from sqlmodel import Field, SQLModel

from app.enums import FailureModeType
from app.models.failuremode import FailureMode

class FailureModeCreate(SQLModel):
    label: str = Field(min_length=1, max_length=255)
    type: FailureModeType = Field()

class FailureModes(SQLModel):
    data: list[FailureMode]
    count: int