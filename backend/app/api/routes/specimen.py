import logging
from typing import Any
import uuid

from fastapi import APIRouter, HTTPException

from app.api.deps import CurrentUser, SessionDep
from app.models.specimen import Specimen
from app.schemas.specimen import SpecimenCreate, SpecimenPublic, SpecimensPublic, SpecimenUpdate
from app.schemas.doi import DOICreate
from app.schemas.pendingspecimen import PendingSpecimenPublic
from app.crud import specimen as specimen_crud
from app.crud import pendingspecimen as pendingspecimen_crud
from app.crud import doi as doi_crud

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

@router.get("/{id}", response_model=SpecimenPublic)
def read_specimen(session: SessionDep, id: uuid.UUID) -> Any:
    """
    Get specimen by ID.
    """
    return specimen_crud.get_specimen_by_id(session=session, id=id)

@router.post("/", response_model=PendingSpecimenPublic)
def create_specimen(
    *, session: SessionDep, current_user: CurrentUser, specimen_in: SpecimenCreate
) -> Any:
    """
    Submit a new specimen for review.
    """
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Not enough permissions")

    # do data validation here...
    
    pending = pendingspecimen_crud.create_pending_specimen(
        session=session,
        changed_by_user_id=current_user.id,
        changed_data=specimen_in.model_dump(exclude_unset=True),
        specimen_id=None,
    )
    return pending


@router.put("/{id}", response_model=PendingSpecimenPublic)
def update_specimen(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: uuid.UUID,
    specimen_in: SpecimenUpdate,
) -> Any:
    """
    Submit an update for an existing specimen.
    """
    specimen = session.get(Specimen, id)
    if not specimen:
        raise HTTPException(status_code=404, detail="Specimen not found")

    if not current_user.is_superuser and (specimen.uploader_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")

    pending = pendingspecimen_crud.create_pending_specimen(
        session=session,
        changed_by_user_id=current_user.id,
        changed_data=specimen_in.model_dump(exclude_unset=True),
        specimen_id=id,
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

    return specimen_crud.delete_specimen(session=session, id=id)