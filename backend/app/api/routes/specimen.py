import uuid
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import func, select

from app.api.deps import CurrentUser, SessionDep
from app.models import Specimen, SpecimenCreate, SpecimenPublic, SpecimensPublic, SpecimenUpdate, Message

router = APIRouter(prefix="/specimens", tags=["specimens"])


@router.get("/", response_model=SpecimensPublic)
def read_specimens(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve specimens.
    """

    if current_user.is_superuser:
        count_statement = select(func.count()).select_from(Specimen)
        count = session.exec(count_statement).one()
        statement = select(Specimen).offset(skip).limit(limit)
        specimens = session.exec(statement).all()
    else:
        count_statement = (
            select(func.count())
            .select_from(Specimen)
            # .where(Specimen.owner_id == current_user.id) # 1. We don't have owner_id, and 2. all specimen's should be public from what I understand.
        )
        count = session.exec(count_statement).one()
        statement = (
            select(Specimen)
            # .where(Specimen.owner_id == current_user.id) # 1. We don't have owner_id, and 2. all specimen's should be public from what I understand.
            .offset(skip)
            .limit(limit)
        )
        specimens = session.exec(statement).all()

    return SpecimensPublic(data=specimens, count=count)


@router.get("/{id}", response_model=SpecimenPublic)
def read_specimen(session: SessionDep, current_user: CurrentUser, id: uuid.UUID) -> Any:
    """
    Get specimen by ID.
    """
    specimen = session.get(Specimen, id)
    if not specimen:
        raise HTTPException(status_code=404, detail="Specimen not found")
    if not current_user.is_superuser and (specimen.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    return specimen

@router.post("/", response_model=SpecimenPublic)
def create_specimen(
    *, session: SessionDep, specimen_in: SpecimenCreate
) -> Any:
    """
    Create new specimen.
    """
    specimen = Specimen.model_validate(
        specimen_in.model_dump()
    )
    session.add(specimen)
    session.commit()
    session.refresh(specimen)
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
    Update an specimen.
    """
    specimen = session.get(Specimen, id)
    if not specimen:
        raise HTTPException(status_code=404, detail="Specimen not found")
    if not current_user.is_superuser and (specimen.uploader_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    update_dict = specimen_in.model_dump(exclude_unset=True)
    specimen.sqlmodel_update(update_dict)
    session.add(specimen)
    session.commit()
    session.refresh(specimen)
    return specimen


@router.delete("/{id}")
def delete_specimen(
    session: SessionDep, current_user: CurrentUser, id: uuid.UUID
) -> Message:
    """
    Delete an specimen.
    """
    specimen = session.get(Specimen, id)
    if not specimen:
        raise HTTPException(status_code=404, detail="Specimen not found")
    if not current_user.is_superuser and (specimen.uploader_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    session.delete(specimen)
    session.commit()
    return Message(message="Specimen deleted successfully")