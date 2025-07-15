import uuid
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import func, select

from app.api.deps import CurrentUser, SessionDep
from app.models import Experiment, ExperimentCreate, ExperimentPublic, ExperimentsPublic, ExperimentUpdate, Message, Specimen

router = APIRouter(prefix="/experiments", tags=["experiments"])


@router.get("/", response_model=ExperimentsPublic)
def read_experiments(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve experiments.
    """

    if current_user.is_superuser:
        count_statement = select(func.count()).select_from(Experiment)
        count = session.exec(count_statement).one()
        statement = select(Experiment).offset(skip).limit(limit)
        experiments = session.exec(statement).all()
    else:
        count_statement = (
            select(func.count())
            .select_from(Experiment)
            # .where(Experiment.owner_id == current_user.id) # 1. We don't have owner_id, and 2. all experiment's should be public from what I understand.
        )
        count = session.exec(count_statement).one()
        statement = (
            select(Experiment)
            # .where(Experiment.owner_id == current_user.id) # 1. We don't have owner_id, and 2. all experiment's should be public from what I understand.
            .offset(skip)
            .limit(limit)
        )
        experiments = session.exec(statement).all()

    return ExperimentsPublic(data=experiments, count=count)


@router.get("/{id}", response_model=ExperimentPublic)
def read_experiment(session: SessionDep, current_user: CurrentUser, id: uuid.UUID) -> Any:
    """
    Get experiment by ID.
    """
    experiment = session.get(Experiment, id)
    if not experiment:
        raise HTTPException(status_code=404, detail="Experiment not found")
    if not current_user.is_superuser and (experiment.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    return experiment

@router.post("/", response_model=ExperimentPublic)
def create_experiment(
    *, session: SessionDep, current_user: CurrentUser, experiment_in: ExperimentCreate
) -> Any:
    """
    Create new experiment.
    """
    specimen = session.get(Specimen, experiment_in.specimen_id)
    # specimen = session.get(Experiment, experiment_in.specimen_id)
    if not specimen:
        raise HTTPException(status_code=404, detail="Specimen not found")
    
    experiment = Experiment.model_validate(
        experiment_in,
        update={"uploader_id": specimen.uploader_id}
    )
    session.add(experiment)
    session.commit()
    session.refresh(experiment)
    return experiment

@router.put("/{id}", response_model=ExperimentPublic)
def update_experiment(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: uuid.UUID,
    experiment_in: ExperimentUpdate,
) -> Any:
    """
    Update an experiment.
    """
    experiment = session.get(Experiment, id)
    if not experiment:
        raise HTTPException(status_code=404, detail="Experiment not found")
    if not current_user.is_superuser and (experiment.uploader_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    update_dict = experiment_in.model_dump(exclude_unset=True)
    experiment.sqlmodel_update(update_dict)
    session.add(experiment)
    session.commit()
    session.refresh(experiment)
    return experiment


@router.delete("/{id}")
def delete_experiment(
    session: SessionDep, current_user: CurrentUser, id: uuid.UUID
) -> Message:
    """
    Delete an experiment.
    """
    experiment = session.get(Experiment, id)
    if not experiment:
        raise HTTPException(status_code=404, detail="Experiment not found")
    if not current_user.is_superuser and (experiment.uploader_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    session.delete(experiment)
    session.commit()
    return Message(message="Experiment deleted successfully")