import uuid
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import func, select

from app.api.deps import CurrentUser, SessionDep
from app.models import Specimen, SpecimenCreate, SpecimenPublic, SpecimensPublic, SpecimenUpdate

from app import crud

import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/specimens", tags=["specimens"])

@router.get("/", response_model=SpecimensPublic)
def read_specimens(
    session: SessionDep, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve specimens.
    """
    count_statement = select(func.count()).select_from(Specimen)
    count = session.exec(count_statement).one()
    statement = select(Specimen).offset(skip).limit(limit)
    specimens = session.exec(statement).all()

    return SpecimensPublic(data=specimens, count=count)

@router.get("/{id}", response_model=SpecimenPublic)
def read_specimen(session: SessionDep, id: uuid.UUID) -> Any:
    """
    Get specimen by ID.
    """
    specimen = session.get(Specimen, id)
    if not specimen:
        raise HTTPException(status_code=404, detail="Specimen not found")
    return specimen

@router.post("/", response_model=SpecimenPublic)
def create_specimen(
    *, session: SessionDep, current_user: CurrentUser, specimen_in: SpecimenCreate
) -> Any:
    """
    Create new specimen.
    """
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Not enough permissions")
    
    specimen = crud.create_specimen(session=session, specimen_in=specimen_in, current_user_id=current_user.id)

    return specimen

@router.put("/{id}", response_model=SpecimenPublic)
def update_specimen(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: uuid.UUID,
    specimen_in: SpecimenUpdate,
) -> Any:
    """
    Update a specimen.
    """
    specimen = session.get(Specimen, id)
    if not specimen:
        raise HTTPException(status_code=404, detail="Specimen not found")

    if not current_user.is_superuser and (specimen.uploader_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")

    specimen = crud.update_specimen(session=session, specimen_in=specimen_in, id=id)
    
    return specimen