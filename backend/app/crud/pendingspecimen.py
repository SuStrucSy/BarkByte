from datetime import datetime, timezone, timedelta
import uuid
from typing import Any

from fastapi import HTTPException
from sqlmodel import Session, delete, select

from app.enums import PendingStatus
from app.models.pendingspecimen import PendingSpecimen
from app.schemas.specimen import SpecimenCreate, SpecimenUpdate
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
        PendingSpecimen.reviewed_at.is_not(None),
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
    pending_id: uuid.UUID,
    update_data: dict[str, Any],
) -> PendingSpecimen:
    pending = session.get(PendingSpecimen, pending_id)
    if not pending:
        raise HTTPException(404, "Pending specimen not found")

    if pending.status is not PendingStatus.PENDING:
        raise HTTPException(400, "Only pending records can be updated")

    if update_data:
        # strip fields you never want in the diff
        for key in ("id", "uploader_id", "is_approved"):
            update_data.pop(key, None)

        existing = pending.changed_data or {}
        pending.changed_data = {**existing, **update_data}

    session.add(pending)
    session.commit()
    session.refresh(pending)
    return pending

def delete_pending_specimen(
    session: Session,
    *,
    pending_id: uuid.UUID,
    user_id: uuid.UUID,
) -> PendingSpecimen:
    pending = session.get(PendingSpecimen, pending_id)
    if not pending:
        raise HTTPException(404, "Pending specimen not found")

    session.delete(pending)
    session.commit()

    return pending

def list_pending(session: Session, status: PendingStatus | None = None) -> list[PendingSpecimen]:
    stmt = select(PendingSpecimen)
    if status is not None:
        stmt = stmt.where(PendingSpecimen.status == status)
    return session.exec(stmt).all()

def list_approved_specific_specimen(session: Session, id: uuid.UUID) -> list[PendingSpecimen]:
    return session.exec(
        select(PendingSpecimen)
            .where(
                PendingSpecimen.status == PendingStatus.APPROVED,
                PendingSpecimen.specimen_id == id,
            )
        ).all()


def approve_pending_specimen(session: Session, pending_id: uuid.UUID,
                             reviewer_id: uuid.UUID, comment: str):
    pending = session.get(PendingSpecimen, pending_id)
    if not pending:
        raise HTTPException(404, "Pending specimen not found")

    if pending.status is not PendingStatus.PENDING:
        raise HTTPException(400, "Status is not Pending, can't approve.")

    data = pending.changed_data  # dict from JSONB

    if pending.specimen_id is None:
        # brand new specimen → validate as SpecimenCreate
        create_obj = SpecimenCreate(**data)
        specimen = specimen_crud.create_specimen(
            session=session,
            specimen_in=create_obj,
            current_user_id=pending.changed_by_user_id,
        )
        pending.specimen_id = specimen.id
    else:
        # update existing specimen → validate as SpecimenUpdate
        update_obj = SpecimenUpdate(**data)
        specimen = specimen_crud.update_specimen(
            session=session,
            id=pending.specimen_id,
            specimen_in=update_obj,
        )
        if not specimen:
            raise HTTPException(404, "Target specimen not found")

        for field, value in update_obj.model_dump(exclude_unset=True).items():
            setattr(specimen, field, value)

    pending.status = PendingStatus.APPROVED
    pending.reviewer_id = reviewer_id
    pending.reviewed_at = datetime.now(timezone.utc)
    if comment:
        pending.comment_by_reviewer = comment

    session.add(pending)
    session.commit()
    session.refresh(pending)
    return pending


def reject_pending_specimen(
    session: Session,
    *,
    pending_id: uuid.UUID,
    reviewer_id: uuid.UUID,
    comment: str | None = None,
) -> PendingSpecimen:
    pending = session.get(PendingSpecimen, pending_id)
    if not pending:
        raise HTTPException(status_code=404, detail="Pending specimen not found")

    if pending.status is not PendingStatus.PENDING:
        raise HTTPException(status_code=400, detail="Status is not pending, can't reject.")

    pending.status = PendingStatus.REJECTED
    pending.reviewer_id = reviewer_id
    pending.comment_by_reviewer = comment
    pending.reviewed_at = datetime.now(timezone.utc)

    session.add(pending)
    session.commit()
    session.refresh(pending)
    return pending