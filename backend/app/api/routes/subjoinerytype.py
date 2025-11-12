import uuid
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import func, select

from app.api.deps import CurrentUser, SessionDep
from app.models.models import SubJoineryType, SubJoineryTypes, SubJoineryTypeCreate, JoineryType

import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/subjoinerytype", tags=["subjoinerytype"])

@router.get("/", response_model=SubJoineryTypes)
def get_sjtypes(
    session: SessionDep, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve sub joinery types.
    """
    count_statement = select(func.count()).select_from(SubJoineryType)
    count = session.exec(count_statement).one()
    statement = select(SubJoineryType).offset(skip).limit(limit)
    sjtypes = session.exec(statement).all()

    return SubJoineryTypes(data=sjtypes, count=count)

@router.post("/", response_model=SubJoineryType)
def create_sjtype(
    session: SessionDep,
    current_user: CurrentUser, 
    sjtype_in: SubJoineryTypeCreate
) -> Any:
    """
    Create sub joinery type.
    """
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=403, detail="Only super users are allowed to create sub joinery types"
        )
    
    # Check if label already exists
    existing = session.exec(
        select(SubJoineryType).where(SubJoineryType.label == sjtype_in.label, SubJoineryType.joinery_type_id == sjtype_in.joinery_type_id)
    ).first()

    if existing:
        raise HTTPException(
            status_code=400, detail=f"Joinery type with label '{sjtype_in.label}' already exists"
        )

    data = sjtype_in.dict()
    sjtype = SubJoineryType(**data)
    session.add(sjtype)
    session.commit()
    
    session.refresh(sjtype)
    return sjtype

@router.put("/{id}", response_model=SubJoineryType)
def update_sjtype(
    session: SessionDep,
    current_user: CurrentUser,
    id: uuid.UUID, 
    sjtype_in: SubJoineryTypeCreate
) -> Any:
    """
    Update sub joinery type.
    """
    sjtype = session.get(SubJoineryType, id)
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=403, detail="Only super users are allowed to update sub joinery types"
        )
    if not sjtype:
        raise HTTPException(status_code=404, detail="Sub joinery type not found")
    
    # Apply only provided fields
    data = sjtype_in.model_dump(exclude_unset=True)
    
    # FK can change, validate it exists
    jt_id = data.get("joinery_type_id")
    if jt_id is not None and session.get(JoineryType, jt_id) is None:
        raise HTTPException(400, "joinery_type_id is invalid")

    sjtype.sqlmodel_update(data)   # ← update existing row
    session.add(sjtype)
    session.commit()
    session.refresh(sjtype)
    
    return sjtype

@router.delete("/{id}")
def delete_sjtype(
    session: SessionDep,
    current_user: CurrentUser, 
    id: uuid.UUID
) -> Any:
    """
    Delete sub joinery type ONLY if not in use.
    """
    sjtype = session.get(SubJoineryType, id)
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=403, detail="Only super users are allowed to delete sub joinery types"
        )
    if not sjtype:
        raise HTTPException(status_code=404, detail="Sub joinery type not found")
    
    session.delete(sjtype)
    session.commit()
    return {"message": "Sub joinery type deleted successfully"}

@router.get("/{joinery_type_id}/", response_model=SubJoineryTypes)
def get_sjtypes_for_jtype(
    session: SessionDep, 
    joinery_type_id: uuid.UUID,
    skip: int = 0, 
    limit: int = 100
) -> Any:
    """
    Retrieve sub joinery types for a specific joinery type.
    """
    count_statement = select(func.count()).select_from(SubJoineryType).where(SubJoineryType.joinery_type_id == joinery_type_id)
    count = session.exec(count_statement).one()
    statement = select(SubJoineryType).where(SubJoineryType.joinery_type_id == joinery_type_id).offset(skip).limit(limit)
    sjtypes = session.exec(statement).all()

    return SubJoineryTypes(data=sjtypes, count=count)