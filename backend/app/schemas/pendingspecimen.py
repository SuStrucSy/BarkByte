from datetime import datetime
import uuid
from typing import Any

from sqlmodel import SQLModel

from app.enums import PendingStatus
from app.schemas.specimen import SpecimenCreate, SpecimenUpdate

class PendingSpecimenBase(SQLModel):
    comment_by_author: str | None = None


class PendingSpecimenCreate(SpecimenCreate, PendingSpecimenBase):
    """
    Body for submitting a brand new specimen for review.
    """
    pass


class PendingSpecimenUpdate(SpecimenUpdate, PendingSpecimenBase):
    """
    Body for submitting or editing specimen changes under review.
    """
    pass


class PendingSpecimenPublic(PendingSpecimenBase):
    specimen_id: uuid.UUID | None = None
    changed_by_user_id: uuid.UUID
    changed_data: dict[str, Any]  # PendingSpecimenCreate or PendingSpecimenUpdate
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
    comment_by_reviewer: str
