from datetime import datetime
import uuid
from typing import Any

from sqlmodel import SQLModel

from app.enums import PendingStatus
from app.schemas.specimen import SpecimenUpdate

class PendingSpecimenBase(SQLModel):
    specimen_id: uuid.UUID | None = None
    changed_by_user_id: uuid.UUID
    changed_data: dict[str, Any] # SpecimenUpdate or SpecimenCreate

class PendingSpecimenCreate(PendingSpecimenBase):
    """
    Used internally when we create pending entries from specimen routes.

    changed_by_user_id is filled from current_user, not from the client.
    """
    pass


class PendingSpecimenPublic(PendingSpecimenBase):
    id: uuid.UUID
    status: PendingStatus
    created_at: datetime
    reviewer_id: uuid.UUID | None = None
    comment_by_reviewer: str | None = None
    reviewed_at: datetime | None = None

class PendingSpecimensPublic(SQLModel):
    """
    Response model for listing multiple pending specimens.
    """
    pending_specimens: list[PendingSpecimenPublic]
    count: int

class PendingSpecimenReview(SQLModel):
    """
    Body for approve or reject actions.
    """
    comment: str


class PendingSpecimenUpdate(SpecimenUpdate):
    """
    Body for updating the pending specimen's changed_data.
    """
    pass