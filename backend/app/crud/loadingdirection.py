import uuid
from typing import Any

from fastapi import HTTPException
from sqlmodel import func, select

from app.api.deps import SessionDep
from app.models.loadingdirection import LoadingDirection
from app.schemas.loadingdirection import LoadingDirection, LoadingDirections, LoadingDirectionCreate
from app.models.specimen_loadingdirection import SpecimenLoadingDirection

def get_loading_directions(
    session: SessionDep, skip: int = 0, limit: int = 100
) -> Any:
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
    
    # Check if label already exists
    existing = session.exec(
        select(LoadingDirection).where(LoadingDirection.label == loading_direction_in.label)
    ).first()

    if existing:
        raise HTTPException(
            status_code=400, detail=f"Loading direction with label '{loading_direction_in.label}' already exists"
        )

    data = loading_direction_in.dict()
    loading_direction = LoadingDirection(**data)
    session.add(loading_direction)
    session.commit()
    
    session.refresh(loading_direction)
    return loading_direction

def update_loading_direction(
    session: SessionDep,
    id: uuid.UUID, 
    loading_direction_in: LoadingDirectionCreate
) -> Any:
    """
    Update loading direction.
    """
    loading_direction = session.get(LoadingDirection, id)
    if not loading_direction:
        raise HTTPException(status_code=404, detail="Loading direction not found")
    
    # Apply only provided fields
    for key, value in loading_direction_in.dict(exclude_unset=True).items():
        setattr(loading_direction, key, value)
    
    session.add(loading_direction)
    session.commit()
    session.refresh(loading_direction)
    return loading_direction

def delete_loading_direction(
    session: SessionDep,
    id: uuid.UUID
) -> Any:
    """
    Delete loading direction ONLY if not in use.
    """
    loading_direction = session.get(LoadingDirection, id)
    if not loading_direction:
        raise HTTPException(status_code=404, detail="Loading direction not found")
    
    refs = session.exec(
        select(func.count())
        .select_from(SpecimenLoadingDirection)
        .where(SpecimenLoadingDirection.loading_direction_id == id)
    ).one()
    if refs and refs > 0:
        raise HTTPException(
            status_code=409,
            detail="Cannot delete: loading direction is used by one or more specimens."
        )

    session.delete(loading_direction)
    session.commit()
    return {"message": "Loading direction deleted successfully"}