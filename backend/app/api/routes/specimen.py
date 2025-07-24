import uuid
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import func, select

from app.api.deps import CurrentUser, SessionDep
from app.models import Specimen, SpecimenCreate, SpecimenPublic, SpecimensPublic, SpecimenUpdate, Message, Experiment

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
    Create new specimen and its associated experiments.
    """
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Not enough permissions")

    replicate_count = specimen_in.replicate_tests
    experiment_count = len(specimen_in.experiments)

    # Decide: are these individual tests, or an average?
    if experiment_count == 1 and replicate_count > 1:
        is_average = True
    elif experiment_count == replicate_count:
        is_average = False
    else:
        raise HTTPException(
            status_code=400,
            detail="Mismatch between replicate_tests and number of experiments."
        )

    # Create specimen object
    specimen = Specimen(
        **specimen_in.dict(exclude={"experiments"}),
        uploader_id=current_user.id
    )

    # Add specimen to session so it has an ID
    session.add(specimen)
    session.commit()
    session.refresh(specimen)

    # Create and attach experiments, overriding specimen_id and uploader_id
    for exp in specimen_in.experiments:
        experiment = Experiment.model_validate({
            **exp.dict(),
            "specimen_id": specimen.id,
            "uploader_id": current_user.id,
            "is_average_of_replicates": is_average
        })
        session.add(experiment)

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
    if not current_user.is_superuser and (specimen.uploader_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    if not specimen:
        raise HTTPException(status_code=404, detail="Specimen not found")
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
    if not current_user.is_superuser and (specimen.uploader_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    if not specimen:
        raise HTTPException(status_code=404, detail="Specimen not found")
    session.delete(specimen)
    session.commit()
    return Message(message="Specimen deleted successfully")