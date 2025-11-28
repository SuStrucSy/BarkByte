from datetime import datetime, timezone, timedelta
import uuid
from typing import Any

from sqlmodel import Session, delete, select, func

from app.enums import PendingStatus
from app.models.pendingspecimen import PendingSpecimen
from app.schemas.specimen import SpecimenCreate, SpecimenUpdate
from app.schemas.pendingspecimen import PendingSpecimensPublic, PendingSpecimenUpdate
from app.crud import specimen as specimen_crud

import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s"
)

logging.info("Server started")

def _to_jsonable(value: Any) -> Any:
    """Recursively convert UUID and datetime etc. into JSON-serializable forms."""
    if isinstance(value, uuid.UUID):
        return str(value)
    if isinstance(value, datetime):
        return value.isoformat()
    if isinstance(value, list):
        return [_to_jsonable(v) for v in value]
    if isinstance(value, dict):
        return {k: _to_jsonable(v) for k, v in value.items()}
    return value

def get_pending_specimen_by_id(
    session: Session,
    *,
    pending_id: uuid.UUID,
) -> PendingSpecimen:
    pending = session.get(PendingSpecimen, pending_id)
    return pending

def cleanup_old_rejected_pending_specimens(
    session: Session,
    *,
    older_than_days: int = 30,
) -> int:
    """
    Delete REJECTED rows whose reviewed_at is older than N days.
    Returns number of rows deleted.
    """
    cutoff = datetime.now(timezone.utc) - timedelta(days=older_than_days)

    stmt = delete(PendingSpecimen).where(
        PendingSpecimen.status == PendingStatus.REJECTED,
        PendingSpecimen.reviewed_at != None,
        PendingSpecimen.reviewed_at < cutoff,
    )
    result = session.exec(stmt)
    session.commit()
    # result.rowcount works on most dialects, but may be None depending on settings
    return result.rowcount or 0

def create_pending_specimen(
    session: Session,
    *,
    changed_by_user_id: uuid.UUID,
    changed_data: dict[str, Any],
    specimen_id: uuid.UUID | None = None,
) -> PendingSpecimen:
    """
    Create one pending record.

    specimen_id = None  => brand new specimen candidate
    specimen_id != None => update of an existing specimen
    """
    json_safe_data = _to_jsonable(changed_data)

    pending = PendingSpecimen(
        specimen_id=specimen_id,
        changed_by_user_id=changed_by_user_id,
        changed_data=json_safe_data,
        status=PendingStatus.PENDING,
        created_at=datetime.now(timezone.utc),
    )

    session.add(pending)
    session.commit()
    session.refresh(pending)
    return pending


def update_pending_specimen(
    session: Session,
    *,
    pending_specimen: PendingSpecimen,
    update_in: PendingSpecimenUpdate,
) -> PendingSpecimen:
    data = update_in.model_dump(exclude_unset=True)

    # If nothing was provided, skip everything and just return the original
    if not data:
        return pending_specimen

    # strip fields you never want in the diff
    for key in ("id", "uploader_id"):
        data.pop(key, None)

    existing = pending_specimen.changed_data or {}
    pending_specimen.changed_data = {**existing, **data}

    session.add(pending_specimen)
    session.commit()
    session.refresh(pending_specimen)
    return pending_specimen

def delete_pending_specimen(
    session: Session,
    *,
    pending_specimen: PendingSpecimen
) -> PendingSpecimen:

    session.delete(pending_specimen)
    session.commit()

    return pending_specimen

def list_pending(session: Session, status: PendingStatus | None = None) -> PendingSpecimensPublic:
    stmt = select(PendingSpecimen)
    count_stmt = select(func.count()).select_from(PendingSpecimen)
    if status is not None:
        stmt = stmt.where(PendingSpecimen.status == status)
        count_stmt = count_stmt.where(PendingSpecimen.status == status)
    
    rows = session.exec(stmt).all()
    total = session.exec(count_stmt).one()
    return PendingSpecimensPublic(pending_specimens=rows, count=total)

def list_approved_specific_specimen(session: Session, id: uuid.UUID) -> PendingSpecimensPublic:
    rows = session.exec(
        select(PendingSpecimen)
            .where(
                PendingSpecimen.status == PendingStatus.APPROVED,
                PendingSpecimen.specimen_id == id,
            )
        ).all()
    total = len(rows)
    return PendingSpecimensPublic(pending_specimens=rows, count=total)

def approve_pending_specimen(
    session: Session,
    *,
    pending_specimen: PendingSpecimen,
    reviewer_id: uuid.UUID,
    comment: str | None = None,
) -> PendingSpecimen:
    """
    Atomic approval logic.

    Assumes:
    • pending_specimen exists
    • status is PENDING
    • if specimen_id is set, that specimen exists
    """
    data = pending_specimen.changed_data or {}

    if pending_specimen.specimen_id is None:
        # Brand new specimen
        create_obj = SpecimenCreate(**data)
        specimen = specimen_crud.create_specimen(
            session=session,
            specimen_in=create_obj,
            current_user_id=pending_specimen.changed_by_user_id,
        )
        pending_specimen.specimen_id = specimen.id
    else:
        # Update existing specimen
        update_obj = SpecimenUpdate(**data)
        specimen_crud.update_specimen(
            session=session,
            id=pending_specimen.specimen_id,
            specimen_in=update_obj,
        )

    pending_specimen.status = PendingStatus.APPROVED
    pending_specimen.reviewer_id = reviewer_id
    pending_specimen.reviewed_at = datetime.now(timezone.utc)
    if comment:
        pending_specimen.comment_by_reviewer = comment

    session.add(pending_specimen)
    session.commit()
    session.refresh(pending_specimen)
    return pending_specimen


def reject_pending_specimen(
    session: Session,
    *,
    pending_specimen: PendingSpecimen,
    reviewer_id: uuid.UUID,
    comment: str | None = None,
) -> PendingSpecimen:
    """
    Atomic reject logic. Assumes all checks were already done.
    """

    pending_specimen.status = PendingStatus.REJECTED
    pending_specimen.reviewer_id = reviewer_id
    pending_specimen.comment_by_reviewer = comment
    pending_specimen.reviewed_at = datetime.now(timezone.utc)

    session.add(pending_specimen)
    session.commit()
    session.refresh(pending_specimen)
    return pending_specimen