import uuid

from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import CurrentUser, SessionDep, get_current_active_superuser
from app.crud import pendingspecimen as pending_crud
from app.crud import specimen as specimen_crud
from app.enums import PendingStatus
from app.schemas.pendingspecimen import (
    PendingSpecimenPublic,
    PendingSpecimenReview,
    PendingSpecimensPublic,
    PendingSpecimenUpdate,
)

secure_router = APIRouter(
    prefix="/pending-specimens",
    tags=["pending-specimens"],
    dependencies=[Depends(get_current_active_superuser)],
)

public_router = APIRouter(
    prefix="/pending-specimens",
    tags=["pending-specimens"],
)


@public_router.get("/", response_model=PendingSpecimensPublic)
def list_pending_specimens(
    session: SessionDep,
    current_user: CurrentUser,
    status: PendingStatus | None = None,
) -> PendingSpecimensPublic:
    """
    List pending specimens, optionally filtered by status.
    If no status is provided, all pending specimens are returned.
    """

    if current_user.is_superuser:
        return pending_crud.list_pending(session=session, status=status)

    return pending_crud.list_pending_by_user(
        session=session,
        user_id=current_user.id,
        status=status,
    )


@public_router.get("/specimen/{specimen_id}", response_model=PendingSpecimensPublic)
def list_approved_specimen_trail(
    session: SessionDep, specimen_id: uuid.UUID
) -> PendingSpecimensPublic:
    """
    List all pending specimens.
    """
    approved_list = pending_crud.list_approved_specific_specimen(
        session=session, id=specimen_id
    )
    return approved_list


@secure_router.post("/{pending_id}/approve", response_model=PendingSpecimenPublic)
def approve_pending_specimen(
    pending_id: uuid.UUID,
    review: PendingSpecimenReview,
    session: SessionDep,
    current_user: CurrentUser,
) -> PendingSpecimenPublic:
    """
    Approve a pending specimen and apply it to the specimen table.
    """
    # Look up pending record
    pending = pending_crud.get_pending_specimen_by_id(
        session=session, pending_id=pending_id
    )
    if pending is None:
        raise HTTPException(status_code=404, detail="Pending specimen not found")

    # Only allow real pending records
    if pending.status is not PendingStatus.PENDING:
        raise HTTPException(
            status_code=400, detail="Only pending records can be approved"
        )

    # If this is an update, confirm the target specimen exists
    if pending.specimen_id is not None:
        specimen = specimen_crud.get_specimen_by_id(
            session=session, id=pending.specimen_id
        )
        if specimen is None:
            raise HTTPException(status_code=404, detail="Target specimen not found")

    # Perform atomic approval
    approved = pending_crud.approve_pending_specimen(
        session=session,
        pending_specimen=pending,
        reviewer_id=current_user.id,
        comment_by_reviewer=review.comment_by_reviewer,
    )
    return approved


@secure_router.post("/{pending_id}/reject", response_model=PendingSpecimenPublic)
def reject_pending_specimen_route(
    pending_id: uuid.UUID,
    review: PendingSpecimenReview,
    session: SessionDep,
    current_user: CurrentUser,
) -> PendingSpecimenPublic:
    """
    Reject a pending specimen without touching the specimen table.
    """
    # Lookup first
    pending_specimen = pending_crud.get_pending_specimen_by_id(
        session=session, pending_id=pending_id
    )
    if pending_specimen is None:
        raise HTTPException(status_code=404, detail="Pending specimen not found")

    # Only pending rows can be rejected
    if pending_specimen.status is not PendingStatus.PENDING:
        raise HTTPException(
            status_code=400, detail="Only pending entries can be rejected"
        )

    # Perform atomic reject
    rejected = pending_crud.reject_pending_specimen(
        session=session,
        pending_specimen=pending_specimen,
        reviewer_id=current_user.id,
        comment_by_reviewer=review.comment_by_reviewer,
    )
    return rejected


@secure_router.put("/{pending_id}", response_model=PendingSpecimenPublic)
def update_pending_specimen(
    pending_id: uuid.UUID,
    update_in: PendingSpecimenUpdate,
    session: SessionDep,
) -> PendingSpecimenPublic:
    """
    Update the changed_data of an existing pending specimen
    before it is approved/rejected.
    """
    pending_specimen = pending_crud.get_pending_specimen_by_id(
        session=session,
        pending_id=pending_id,
    )
    if not pending_specimen:
        raise HTTPException(404, "Pending specimen not found")
    if pending_specimen.status is not PendingStatus.PENDING:
        raise HTTPException(400, "Status is not Pending, can't update.")

    return pending_crud.update_pending_specimen(
        session=session,
        pending_specimen=pending_specimen,
        update_in=update_in,
    )


@secure_router.delete("/{pending_id}", response_model=PendingSpecimenPublic)
def delete_pending_specimen(
    pending_id: uuid.UUID,
    session: SessionDep,
    current_user: CurrentUser,
) -> PendingSpecimenPublic:
    """
    Delete a pending specimen (only allowed while status is PENDING).
    """
    pending_specimen = pending_crud.get_pending_specimen_by_id(
        session=session,
        pending_id=pending_id,
    )
    if not pending_specimen:
        raise HTTPException(404, "Pending specimen not found")
    if (
        pending_specimen.changed_by_user_id != current_user.id
        and not current_user.is_superuser
    ):
        raise HTTPException(403, "Not authorized to delete this pending specimen.")
    if pending_specimen.status is not PendingStatus.PENDING:
        raise HTTPException(400, "Status is not Pending, can't delete.")
    pending = pending_crud.delete_pending_specimen(
        session=session, pending_specimen=pending_specimen
    )
    return pending
