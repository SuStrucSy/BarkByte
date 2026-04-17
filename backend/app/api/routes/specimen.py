import logging
import uuid
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlalchemy.exc import IntegrityError

from app.api.deps import CurrentUser, SessionDep
from app.crud import doi as doi_crud
from app.crud import pendingspecimen as pendingspecimen_crud
from app.crud import specimen as specimen_crud
from app.models.specimen import Specimen
from app.schemas.doi import DOICreate
from app.schemas.pendingspecimen import (
    PendingSpecimenCreate,
    PendingSpecimenPublic,
    PendingSpecimenUpdate,
)
from app.schemas.specimen import (
    SpecimenFilterOptionsPublic,
    SpecimenPublic,
    SpecimensPublic,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/specimens", tags=["specimens"])


@router.get("/", response_model=SpecimensPublic)
def read_specimens(
    session: SessionDep, skip: int = 0, limit: int = 100
) -> SpecimensPublic:
    """
    Retrieve specimens.
    """
    return specimen_crud.get_specimens(session=session, skip=skip, limit=limit)


@router.get("/filter-options", response_model=SpecimenFilterOptionsPublic)
def read_specimen_filter_options(session: SessionDep) -> SpecimenFilterOptionsPublic:
    """
    Retrieve predefined specimen filter options for facet controls.
    """
    return specimen_crud.get_specimen_filter_options(session=session)


@router.get("/{id}", response_model=SpecimenPublic)
def read_specimen(session: SessionDep, id: uuid.UUID) -> Any:
    """
    Get specimen by ID.
    """
    return specimen_crud.get_specimen_by_id(session=session, id=id)


@router.post("/", response_model=PendingSpecimenPublic)
def create_specimen(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    specimen_in: PendingSpecimenCreate,
) -> Any:
    """
    Submit a new specimen for review.
    """
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Not enough permissions")

    # Run domain validation now, at submission time
    try:
        specimen_crud.validate_specimen_create(session=session, specimen_in=specimen_in)
    except ValueError as e:
        # surface this immediately to the client
        raise HTTPException(status_code=400, detail=f"Specimen validation failed: {e}")

    pending = pendingspecimen_crud.create_pending_specimen(
        session=session,
        changed_by_user_id=current_user.id,
        changed_data=specimen_in.model_dump(
            exclude={"comment_by_author"}, exclude_unset=True
        ),
        specimen_id=None,
        comment_by_author=specimen_in.comment_by_author,
    )
    return pending


@router.put("/{id}", response_model=PendingSpecimenPublic)
def update_specimen(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: uuid.UUID,
    specimen_in: PendingSpecimenUpdate,
) -> Any:
    """
    Submit an update for an existing specimen.
    """
    specimen = session.get(Specimen, id)
    if not specimen:
        raise HTTPException(status_code=404, detail="Specimen not found")

    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Not enough permissions")

    changed_data = specimen_in.model_dump(
        exclude={"comment_by_author"},
        exclude_unset=True,
    )
    if not changed_data:
        raise HTTPException(status_code=400, detail="No specimen changes submitted")

    try:
        complete = specimen_crud._build_complete_specimen_for_update(
            session=session,
            specimen=specimen,
            patch=specimen_in,
        )
        data, failure_mode_ids, fastener_type_ids, _loading_direction_ids = (
            specimen_crud._split_specimen_payload(complete, for_update=False)
        )
        specimen_crud._validate_joinery_and_dowel(session, data)
        specimen_crud._validate_failure_modes_against_toggles(
            session=session,
            failure_mode_ids=failure_mode_ids,
            connector=data.get("connector"),
            dowel=data.get("dowel"),
        )
        specimen_crud._validate_fasteners_against_dowel(
            fastener_type_ids=fastener_type_ids,
            dowel=data.get("dowel"),
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Specimen validation failed: {e}")

    existing_pending = (
        pendingspecimen_crud.get_active_pending_specimen_for_user_and_specimen(
            session=session,
            user_id=current_user.id,
            specimen_id=id,
        )
    )

    if existing_pending is not None:
        pending = pendingspecimen_crud.merge_active_pending_specimen(
            session=session,
            pending_specimen=existing_pending,
            changed_data=changed_data,
            comment_by_author=specimen_in.comment_by_author,
        )
    else:
        pending = pendingspecimen_crud.create_pending_specimen(
            session=session,
            changed_by_user_id=current_user.id,
            changed_data=changed_data,
            specimen_id=id,
            comment_by_author=specimen_in.comment_by_author,
        )
    return pending


@router.delete("/{id}", response_model=Any)
def delete_specimen(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: uuid.UUID,
) -> Any:
    """
    Delete a specimen.
    """
    if not current_user.is_superuser:
        raise HTTPException(status_code=400, detail="Not enough permissions")

    specimen = specimen_crud.get_specimen_by_id(session=session, id=id)

    if specimen is None:
        raise HTTPException(status_code=404, detail="Specimen not found")

    try:
        specimen_crud.delete_specimen(session=session, specimen=specimen)
    except IntegrityError:
        raise HTTPException(
            status_code=409,
            detail="Cannot delete specimen: it is still referenced by one or more tables.",
        )

    return {"message": "Specimen deleted successfully."}
