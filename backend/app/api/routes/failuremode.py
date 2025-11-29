import logging
import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select
from sqlalchemy.exc import IntegrityError

from app.api.deps import CurrentUser, SessionDep, get_current_active_superuser
from app.models.failuremode import FailureMode
from app.schemas.failuremode import  FailureModes, FailureModeCreate
from app.crud import failuremode as failuremode_crud

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

@router.post("/", dependencies=[Depends(get_current_active_superuser)], response_model=FailureMode)
def create_mode(
    session: SessionDep,
    current_user: CurrentUser, 
    mode_in: FailureModeCreate
) -> Any:
    """
    Create failure mode.
    """
    # Check if label already exists
    failure_mode = session.exec(
        select(FailureMode).where(FailureMode.label == mode_in.label)
    ).first()

    if failure_mode:
        raise HTTPException(
            status_code=400, detail=f"Failure mode with label '{mode_in.label}' already exists"
        )

    return failuremode_crud.create_mode(session=session, mode_in=mode_in)
    
    

@router.put("/{id}", dependencies=[Depends(get_current_active_superuser)], response_model=FailureMode)
def update_mode(
    session: SessionDep,
    current_user: CurrentUser,
    id: uuid.UUID, 
    mode_in: FailureModeCreate
) -> Any:
    """
    Update failure mode.
    """
    failure_mode = session.get(FailureMode, id)
    
    if not failure_mode:
        raise HTTPException(status_code=404, detail="Failure mode not found")

    return failuremode_crud.update_mode(session=session, mode_in=mode_in, failure_mode=failure_mode)

@router.delete("/{id}", dependencies=[Depends(get_current_active_superuser)])
def delete_mode(
    session: SessionDep,
    current_user: CurrentUser, 
    id: uuid.UUID
) -> Any:
    """
    Delete failure mode ONLY if not in use.
    """
    failure_mode = failuremode_crud.get_mode_by_id(session=session, id=id)
    
    if not failure_mode:
        raise HTTPException(status_code=404, detail="Failure mode not found")
    
    if failuremode_crud.is_failure_mode_in_use(session=session, id=id):
        raise HTTPException(
            status_code=409,
            detail="Cannot delete failure mode: it is used by one or more specimens.",
        )
    
    failuremode_crud.delete_mode(session=session, failure_mode=failure_mode)

    return {"message": "Failure mode deleted successfully"}