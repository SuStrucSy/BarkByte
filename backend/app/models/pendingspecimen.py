from datetime import datetime, timezone
import uuid

from sqlalchemy import Column
from sqlalchemy.dialects.postgresql import JSONB
from sqlmodel import Field, SQLModel

from app.enums import PendingStatus


class PendingSpecimen(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

    # Null means brand new specimen, not yet in specimen table
    specimen_id: uuid.UUID | None = Field(
        default=None,
        foreign_key="specimen.id",
        index=True,
    )

    # User who submitted the change
    changed_by_user_id: uuid.UUID = Field(foreign_key="user.id")

    # Stores the payload shaped like SpecimenCreate or SpecimenUpdate
    changed_data: dict = Field(sa_column=Column(JSONB))

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
    )

    status: PendingStatus = Field(default=PendingStatus.PENDING)

    # Reviewer info, only set once reviewed
    reviewer_id: uuid.UUID | None = Field(
        default=None,
        foreign_key="user.id",
    )
    comment_by_reviewer: str | None = Field(
        default=None,
        max_length=500,
    )
    reviewed_at: datetime | None = None