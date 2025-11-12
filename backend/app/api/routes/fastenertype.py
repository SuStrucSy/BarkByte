import uuid
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import func, select

from app.api.deps import CurrentUser, SessionDep
from app.models import FastenerType, FastenerTypes, FastenerTypeCreate

from app.crud import crud

import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/fastenertype", tags=["fastenertype"])

@router.get("/", response_model=FastenerTypes)
def get_fastener_types(
    session: SessionDep, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve all fastener types.
    """
    return crud.get_fastener_types(session=session, skip=skip, limit=limit)
    
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
    
    return crud.create_fastener_type(session=session, fastener_type_in=fastener_type_in)

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
    
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=403, detail="Only super users are allowed to update fastener type"
        )
    
    return crud.update_fastener_type(session=session, fastener_type_in=fastener_type_in, id=id)

@router.delete("/{id}")
def delete_fastener_type(
    session: SessionDep,
    current_user: CurrentUser, 
    id: uuid.UUID
) -> Any:
    """
    Delete fastener type ONLY if not in use.
    """
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=403, detail="Only super users are allowed to delete fastener type"
        )

    return crud.delete_fastener_type(session=session, id=id)
