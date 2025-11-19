import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import CurrentUser, SessionDep, get_current_active_superuser
from app.crud import pendingspecimen as pending_crud
from app.schemas.pendingspecimen import (
    PendingSpecimenPublic,
    PendingSpecimenReview,
    PendingSpecimenUpdate
)
from app.enums import PendingStatus

secure_router = APIRouter(
    prefix="/pending-specimens",
    tags=["pending-specimens"],
    dependencies=[Depends(get_current_active_superuser)],
)

public_router = APIRouter(
    prefix="/pending-specimens",
    tags=["pending-specimens"],
)

@secure_router.get("/", response_model=list[PendingSpecimenPublic])
def list_pending_specimens(
    session: SessionDep,
    status: PendingStatus | None = None,
) -> Any:
    """
    List pending specimens, optionally filtered by status.
    If no status is provided, all pending specimens are returned.
    """
    pending = pending_crud.list_pending(session=session, status=status)
    return pending

@public_router.get("/specimen/{specimen_id}", response_model=list[PendingSpecimenPublic])
def list_approved_specimen_trail(
    session: SessionDep,
    specimen_id: uuid.UUID
) -> Any:
    """
    List all pending specimens.
    """
    approved_list = pending_crud.list_approved_specific_specimen(session=session, id=specimen_id)
    return approved_list


@secure_router.post("/{pending_id}/approve", response_model=PendingSpecimenPublic)
def approve_pending_specimen(
    pending_id: uuid.UUID,
    review: PendingSpecimenReview,
    session: SessionDep,
    current_user: CurrentUser,
) -> Any:
    """
    Approve a pending specimen and apply it to the specimen table.
    """
    pending = pending_crud.approve_pending_specimen(
        session=session,
        pending_id=pending_id,
        reviewer_id=current_user.id,
        comment=review.comment,
    )
    return pending


@secure_router.post("/{pending_id}/reject", response_model=PendingSpecimenPublic)
def reject_pending_specimen(
    pending_id: uuid.UUID,
    review: PendingSpecimenReview,
    session: SessionDep,
    current_user: CurrentUser,
) -> Any:
    """
    Reject a pending specimen without changing the specimen table.
    """
    pending = pending_crud.reject_pending_specimen(
        session=session,
        pending_id=pending_id,
        reviewer_id=current_user.id,
        comment=review.comment,
    )
    return pending

@secure_router.put("/{pending_id}", response_model=PendingSpecimenPublic)
def update_pending_specimen(
    pending_id: uuid.UUID,
    update_in: PendingSpecimenUpdate,
    session: SessionDep,
) -> Any:
    """
    Update the changed_data of an existing pending specimen
    before it is approved/rejected.
    """
    
    pending = pending_crud.update_pending_specimen(
        session=session,
        pending_id=pending_id,
        update_data=update_in.model_dump(exclude_unset=True),
    )
    return pending

@secure_router.delete("/{pending_id}", response_model=PendingSpecimenPublic)
def delete_pending_specimen(
    pending_id: uuid.UUID,
    session: SessionDep,
    current_user: CurrentUser,
) -> Any:
    """
    Delete a pending specimen (only allowed while status is PENDING).
    """
    pending = pending_crud.delete_pending_specimen(
        session=session,
        pending_id=pending_id,
        user_id=current_user.id,
    )
    return pending