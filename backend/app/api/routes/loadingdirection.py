import uuid
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import func, select

from app.api.deps import SessionDep, CurrentUser
from app.models.models import LoadingDirection, LoadingDirections, LoadingDirectionCreate

import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/loadingdirection", tags=["loadingdirection"])

@router.get("/", response_model=LoadingDirections)
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

@router.post("/", response_model=LoadingDirection)
def create_loading_direction(
    session: SessionDep,
    current_user: CurrentUser, 
    loading_direction_in: LoadingDirectionCreate
) -> Any:
    """
    Create loading direction.
    """
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=403, detail="Only super users are allowed to create loading directions"
        )
    
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

@router.put("/{id}", response_model=LoadingDirection)
def update_loading_direction(
    session: SessionDep,
    current_user: CurrentUser,
    id: uuid.UUID, 
    loading_direction_in: LoadingDirectionCreate
) -> Any:
    """
    Update loading direction.
    """
    loading_direction = session.get(LoadingDirection, id)
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=403, detail="Only super users are allowed to update loading direction"
        )
    if not loading_direction:
        raise HTTPException(status_code=404, detail="Loading direction not found")
    
    # Apply only provided fields
    data = loading_direction_in.model_dump(exclude_unset=True)

    loading_direction.sqlmodel_update(data)   # ← update existing row
    session.add(loading_direction)
    session.commit()
    session.refresh(loading_direction)
    return loading_direction

# TODO: add the delete
@router.delete("/{id}")
def delete_loading_direction(
    session: SessionDep,
    current_user: CurrentUser, 
    id: uuid.UUID
) -> Any:
    """
    Delete loading direction ONLY if not in use.
    """
    loading_direction = session.get(LoadingDirection, id)
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=403, detail="Only super users are allowed to delete loading direction"
        )
    if not loading_direction:
        raise HTTPException(status_code=404, detail="Loading direction not found")
    
    session.delete(loading_direction)
    session.commit()
    return {"message": "Loading direction deleted successfully"}