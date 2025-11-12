import uuid
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import func, select

from app.api.deps import CurrentUser, SessionDep
from app.models.models import JoineryType, JoineryTypes, JoineryTypeCreate

import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/joinerytype", tags=["joinerytype"])

@router.get("/", response_model=JoineryTypes)
def get_jtypes(
    session: SessionDep, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve joinery types.
    """
    count_statement = select(func.count()).select_from(JoineryType)
    count = session.exec(count_statement).one()
    statement = select(JoineryType).offset(skip).limit(limit)
    jtypes = session.exec(statement).all()

    return JoineryTypes(data=jtypes, count=count)

@router.post("/", response_model=JoineryType)
def create_jtype(
    session: SessionDep,
    current_user: CurrentUser, 
    jtype_in: JoineryTypeCreate
) -> Any:
    """
    Create joinery type.
    """
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=403, detail="Only super users are allowed to create joinery types"
        )
    
    # Check if label already exists
    existing = session.exec(
        select(JoineryType).where(JoineryType.label == jtype_in.label and JoineryType.has_dowel == jtype_in.has_dowel)
    ).first()

    if existing:
        raise HTTPException(
            status_code=400, detail=f"Joinery type with label '{jtype_in.label}' already exists"
        )

    data = jtype_in.dict()
    jtype = JoineryType(**data)
    session.add(jtype)
    session.commit()
    
    session.refresh(jtype)
    return jtype


@router.put("/{id}", response_model=JoineryType)
def update_jtype(
    session: SessionDep,
    current_user: CurrentUser,
    id: uuid.UUID, 
    jtype_in: JoineryTypeCreate
) -> Any:
    """
    Update joinery type.
    """
    jtype = session.get(JoineryType, id)
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=403, detail="Only super users are allowed to update joinery types"
        )
    if not jtype:
        raise HTTPException(status_code=404, detail="Joinery type not found")
    
    data = jtype_in.dict()
    jtype.sqlmodel_update(data)   # ← update existing row
    session.add(jtype)
    session.commit()
    session.refresh(jtype)
    
    return jtype


@router.delete("/{id}")
def delete_jtype(
    session: SessionDep,
    current_user: CurrentUser, 
    id: uuid.UUID
) -> Any:
    """
    Delete joinery type ONLY if not in use.
    """
    jtype = session.get(JoineryType, id)
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=403, detail="Only super users are allowed to delete joinery types"
        )
    if not jtype:
        raise HTTPException(status_code=404, detail="Joinery type not found")
    
    session.delete(jtype)
    session.commit()
    return {"message": "Joinery type deleted successfully"}
