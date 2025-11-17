import logging
import uuid
from typing import Any

from fastapi import APIRouter, Depends

from app.api.deps import CurrentUser, SessionDep, get_current_active_superuser
from app.schemas.fastenertype import FastenerType, FastenerTypeCreate, FastenerTypes
from app.crud import fastenertype as fastener_type_crud

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
    return fastener_type_crud.get_fastener_types(session=session, skip=skip, limit=limit)
    
@router.post("/", dependencies=[Depends(get_current_active_superuser)], response_model=FastenerType)
def create_fastener_type(
    session: SessionDep,
    current_user: CurrentUser, 
    fastener_type_in: FastenerTypeCreate
) -> Any:
    """
    Create fastener type.
    """
    
    return fastener_type_crud.create_fastener_type(session=session, fastener_type_in=fastener_type_in)

@router.put("/{id}", dependencies=[Depends(get_current_active_superuser)], response_model=FastenerType)
def update_fastener_type(
    session: SessionDep,
    current_user: CurrentUser,
    id: uuid.UUID, 
    fastener_type_in: FastenerTypeCreate
) -> Any:
    """
    Update fastener type.
    """
    return fastener_type_crud.update_fastener_type(session=session, fastener_type_in=fastener_type_in, id=id)

@router.delete("/{id}", dependencies=[Depends(get_current_active_superuser)])
def delete_fastener_type(
    session: SessionDep,
    current_user: CurrentUser, 
    id: uuid.UUID
) -> Any:
    """
    Delete fastener type ONLY if not in use.
    """
    return fastener_type_crud.delete_fastener_type(session=session, id=id)
