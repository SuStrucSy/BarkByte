import uuid
from typing import Any, List, Optional

from fastapi import APIRouter, HTTPException
from sqlmodel import func, select, and_

from app.api.deps import CurrentUser, SessionDep
from app.models import FailureMode, FailureModes, FailureModeCreate
from app.enums import FailureModeType

import logging
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
) -> Any:
    """
    Retrieve failure modes.

    Filters:
      - ?dowel=true       -> include FailureMode.type == DOWEL
      - ?connector=true   -> include FailureMode.type == CONNECTOR
      - both true         -> include either type
      - none provided     -> return only WOOD and OTHER
    """

    # Always include WOOD and OTHER
    allowed_types = [FailureModeType.WOOD, FailureModeType.OTHER]

    # Add extras depending on query flags
    if dowel:
        allowed_types.append(FailureModeType.DOWEL)
    if connector:
        allowed_types.append(FailureModeType.CONNECTOR)

    # Build one filter and reuse
    filters = FailureMode.type.in_(allowed_types)

    count = session.exec(select(func.count()).where(filters)).one()
    modes = session.exec(
        select(FailureMode).where(filters).offset(skip).limit(limit)
    ).all()

    return FailureModes(data=modes, count=count)

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
    
    # Check if label already exists
    existing = session.exec(
        select(FailureMode).where(FailureMode.label == mode_in.label)
    ).first()

    if existing:
        raise HTTPException(
            status_code=400, detail=f"Failure mode with label '{mode_in.label}' already exists"
        )

    data = mode_in.dict()
    mode = FailureMode(**data)
    session.add(mode)
    session.commit()
    
    session.refresh(mode)
    return mode


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
    mode = session.get(FailureMode, id)
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=403, detail="Only super users are allowed to update failure modes"
        )
    if not mode:
        raise HTTPException(status_code=404, detail="Failure mode not found")
    
    mode.label = mode_in.label
    session.add(mode)
    session.commit()
    session.refresh(mode)
    return mode


@router.delete("/{id}")
def delete_mode(
    session: SessionDep,
    current_user: CurrentUser, 
    id: uuid.UUID
) -> Any:
    """
    Delete failure mode ONLY if not in use.
    """
    mode = session.get(FailureMode, id)
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=403, detail="Only super users are allowed to delete failure modes"
        )
    if not mode:
        raise HTTPException(status_code=404, detail="Failure mode not found")
    
    session.delete(mode)
    session.commit()
    return {"message": "Failure mode deleted successfully"}
