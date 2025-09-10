import uuid
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import func, select

from app.api.deps import CurrentUser, SessionDep
from app.models import FastenerType, FastenerTypes, FastenerTypeCreate

import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/fastenertype", tags=["fastenertype"])

@router.get("/", response_model=FastenerTypes)
def get_fastener_types(
    session: SessionDep, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve fastener type.
    """
    count_statement = select(func.count()).select_from(FastenerType)
    count = session.exec(count_statement).one()
    statement = select(FastenerType).offset(skip).limit(limit)
    fastener_types = session.exec(statement).all()

    return FastenerTypes(data=fastener_types, count=count)

@router.post("/", response_model=FastenerType)
def create_fastener_type(
    session: SessionDep,
    current_user: CurrentUser, 
    fastener_type_in: FastenerTypeCreate
) -> Any:
    """
    Create fastener type.
    """
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=403, detail="Only super users are allowed to create fastener types"
        )
    
    # Check if label already exists
    existing = session.exec(
        select(FastenerType).where(FastenerType.label == fastener_type_in.label)
    ).first()

    if existing:
        raise HTTPException(
            status_code=400, detail=f"Fastener type with label '{fastener_type_in.label}' already exists"
        )

    data = fastener_type_in.dict()
    fastener_type = FastenerType(**data)
    session.add(fastener_type)
    session.commit()
    
    session.refresh(fastener_type)
    return fastener_type

@router.put("/{id}", response_model=FastenerType)
def update_fastener_type(
    session: SessionDep,
    current_user: CurrentUser,
    id: uuid.UUID, 
    fastener_type_in: FastenerTypeCreate
) -> Any:
    """
    Update fastener type.
    """
    fastener_type = session.get(FastenerType, id)
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=403, detail="Only super users are allowed to update fastener type"
        )
    if not fastener_type:
        raise HTTPException(status_code=404, detail="Fastener type not found")
    
    # Apply only provided fields
    data = fastener_type_in.model_dump(exclude_unset=True)

    fastener_type.sqlmodel_update(data)   # ← update existing row
    session.add(fastener_type)
    session.commit()
    session.refresh(fastener_type)
    return fastener_type

@router.delete("/{id}")
def delete_fastener_type(
    session: SessionDep,
    current_user: CurrentUser, 
    id: uuid.UUID
) -> Any:
    """
    Delete fastener type ONLY if not in use.
    """
    fastener_type = session.get(FastenerType, id)
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=403, detail="Only super users are allowed to delete fastener type"
        )
    if not fastener_type:
        raise HTTPException(status_code=404, detail="Fastener type not found")
    
    session.delete(fastener_type)
    session.commit()
    return {"message": "Fastener type deleted successfully"}
