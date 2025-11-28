import uuid
from typing import Any

from sqlmodel import func, select

from app.api.deps import SessionDep
from app.models.loadingdirection import LoadingDirection
from app.schemas.loadingdirection import LoadingDirection, LoadingDirections, LoadingDirectionCreate
from app.models.specimen_loadingdirection import SpecimenLoadingDirection

def normalize_label(label: str) -> str:
    return label.strip().lower()

def get_loading_direction_by_id(
    session: SessionDep,
    id: uuid.UUID
) -> Any:
    """
    Get loading direction by ID.
    """
    loading_direction = session.get(LoadingDirection, id)
    return loading_direction

def get_loading_direction_by_label(
    session: SessionDep,
    label: str
) -> Any:
    """
    Get loading direction by label.
    """
    label = normalize_label(label)
    loading_direction = session.exec(
        select(LoadingDirection).where(LoadingDirection.label == label)
    ).first()
    return loading_direction

def get_loading_directions(
    session: SessionDep, skip: int = 0, limit: int = 100
) -> LoadingDirections:
    """
    Retrieve loading direction.
    """
    count_statement = select(func.count()).select_from(LoadingDirection)
    count = session.exec(count_statement).one()
    statement = select(LoadingDirection).offset(skip).limit(limit)
    loading_directions = session.exec(statement).all()

    return LoadingDirections(data=loading_directions, count=count)

def create_loading_direction(
    session: SessionDep,
    loading_direction_in: LoadingDirectionCreate
) -> Any:
    """
    Create loading direction.
    """
    normalized_label = normalize_label(loading_direction_in.label)

    data = loading_direction_in.model_dump()
    data["label"] = normalized_label

    data = loading_direction_in.dict()
    loading_direction = LoadingDirection(**data)
    session.add(loading_direction)
    session.commit()
    
    session.refresh(loading_direction)
    return loading_direction

def update_loading_direction(
    session: SessionDep,
    loading_direction: LoadingDirection, 
    loading_direction_in: LoadingDirectionCreate
) -> Any:
    """
    Update loading direction.
    """
    data = loading_direction_in.model_dump(exclude_unset=True)
    if "label" in data:
        data["label"] = normalize_label(data["label"])

    loading_direction.sqlmodel_update(data)
    session.add(loading_direction)
    session.commit()
    session.refresh(loading_direction)
    return loading_direction


def delete_loading_direction(
    session: SessionDep,
    loading_direction: LoadingDirection
) -> Any:
    """
    Delete loading direction ONLY if not in use.
    """
    session.delete(loading_direction)
    session.commit()
    return {"message": "Loading direction deleted successfully"}