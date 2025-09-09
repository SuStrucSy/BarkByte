import uuid
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import func, select

from app.api.deps import CurrentUser, SessionDep
from app.models import FailureMode, FailureModes, FailureModeCreate

import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/failuremode", tags=["failuremode"])

@router.get("/", response_model=FailureModes)
def get_modes(
    session: SessionDep, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve failure modes.
    """
    count_statement = select(func.count()).select_from(FailureMode)
    count = session.exec(count_statement).one()
    statement = select(FailureMode).offset(skip).limit(limit)
    modes = session.exec(statement).all()

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
