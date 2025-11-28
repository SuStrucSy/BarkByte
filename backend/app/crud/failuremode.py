import uuid
from typing import Any

from sqlmodel import Session, select, func

from app.models.specimen_failuremode import SpecimenFailureMode
from app.models.failuremode import FailureMode
from app.schemas.failuremode import FailureModes, FailureModeCreate
from app.enums import FailureModeType

def get_modes(*, session: Session, skip: int = 0, limit: int = 100, dowel: bool, connector: bool) -> FailureModes:
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

def create_mode(*, session: Session, mode_in: FailureModeCreate) -> FailureMode:
    data = mode_in.dict()
    mode = FailureMode(**data)
    session.add(mode)
    session.commit()
    session.refresh(mode)
    return mode

def update_mode(*, session: Session, mode_in: FailureModeCreate, failure_mode: FailureMode) -> FailureMode:
    # Apply only provided fields
    data = mode_in.model_dump(exclude_unset=True)
    failure_mode.sqlmodel_update(data)   # update existing row
    session.add(failure_mode)
    session.commit()
    session.refresh(failure_mode)
    return failure_mode

def delete_mode(*, session: Session, failure_mode: FailureMode) -> Any:
    session.delete(failure_mode)
    session.commit()
    return {"message": "Failure mode deleted successfully"}