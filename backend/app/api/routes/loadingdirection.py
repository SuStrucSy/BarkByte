import logging
import uuid
from typing import Any

from fastapi import APIRouter, Depends

from app.api.deps import SessionDep, CurrentUser, get_current_active_superuser
from app.models.loadingdirection import LoadingDirection
from app.schemas.loadingdirection import LoadingDirections, LoadingDirectionCreate
from app.crud import loadingdirection as loadingdirection_crud

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
    return loadingdirection_crud.get_loading_directions(session=session, skip=skip, limit=limit)

@router.post("/", dependencies=[Depends(get_current_active_superuser)], response_model=LoadingDirection)
def create_loading_direction(
    session: SessionDep,
    current_user: CurrentUser, 
    loading_direction_in: LoadingDirectionCreate
) -> Any:
    """
    Create loading direction.
    """
    
    return loadingdirection_crud.create_loading_direction(session=session, loading_direction_in=loading_direction_in)

@router.put("/{id}", dependencies=[Depends(get_current_active_superuser)], response_model=LoadingDirection)
def update_loading_direction(
    session: SessionDep,
    current_user: CurrentUser,
    id: uuid.UUID, 
    loading_direction_in: LoadingDirectionCreate
) -> Any:
    """
    Update loading direction.
    """

    return loadingdirection_crud.update_loading_direction(session=session, id=id, loading_direction_in=loading_direction_in)

@router.delete("/{id}", dependencies=[Depends(get_current_active_superuser)])
def delete_loading_direction(
    session: SessionDep,
    current_user: CurrentUser, 
    id: uuid.UUID
) -> Any:
    """
    Delete loading direction ONLY if not in use.
    """

    return loadingdirection_crud.delete_loading_direction(session=session, id=id)