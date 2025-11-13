import logging
import uuid
from typing import Any

from app.api.deps import CurrentUser, SessionDep
from app.models.models import FailureMode, FailureModes, FailureModeCreate
from app.crud import failuremode as failuremode_crud

from fastapi import APIRouter, HTTPException
from sqlmodel import select

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/failuremode", tags=["failuremode"])

@router.get("/", response_model=FailureModes)
def get_modes(
    session: SessionDep,
    dowel: bool,
    connector: bool,
    skip: int = 0,
    limit: int = 100,
) -> FailureModes:
    """
    Retrieve failure modes.

    Filters:
      - ?dowel=true       -> include FailureMode.type == DOWEL
      - ?connector=true   -> include FailureMode.type == CONNECTOR
      - both true         -> include either type
      - none provided     -> return only WOOD and OTHER
    """

    return failuremode_crud.get_modes(session=session, dowel=dowel, connector=connector)

@router.post("/", response_model=FailureMode)
def create_mode(
    session: SessionDep,
    current_user: CurrentUser, 
    mode_in: FailureModeCreate
) -> Any:
    """
    Create failure mode.
    """
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=403, detail="Only super users are allowed to create failure modes"
        )
    
    return failuremode_crud.create_mode(session=session, mode_in=mode_in)
    
    

@router.put("/{id}", response_model=FailureMode)
def update_mode(
    session: SessionDep,
    current_user: CurrentUser,
    id: uuid.UUID, 
    mode_in: FailureModeCreate
) -> Any:
    """
    Update failure mode.
    """
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=403, detail="Only super users are allowed to update failure modes"
        )
    return failuremode_crud.update_mode(session=session, mode_in=mode_in, id=id)

@router.delete("/{id}")
def delete_mode(
    session: SessionDep,
    current_user: CurrentUser, 
    id: uuid.UUID
) -> Any:
    """
    Delete failure mode ONLY if not in use.
    """
    
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=403, detail="Only super users are allowed to delete failure modes"
        )
    
    return failuremode_crud.delete_mode(session=session, id=id)