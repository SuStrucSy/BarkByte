import logging
import uuid
from typing import Any

from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import func, select

from app.api.deps import CurrentUser, SessionDep, get_current_active_superuser
from app.models.models import SubJoineryType, SubJoineryTypes, SubJoineryTypeCreate, JoineryType
from app.crud import subjoinerytype as subjoinerytype_crud
from app.crud import joinerytype as joinerytype_crud

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
    return subjoinerytype_crud.get_subjoinery_types(session=session, skip=skip, limit=limit)

@router.post("/", dependencies=[Depends(get_current_active_superuser)], response_model=SubJoineryType)
def create_sjtype(
    session: SessionDep,
    current_user: CurrentUser, 
    sjtype_in: SubJoineryTypeCreate
) -> Any:
    """
    Create sub joinery type.
    """
    
    return subjoinerytype_crud.create_subjoinery_type(session=session, sjtype_in=sjtype_in)

@router.put("/{id}", dependencies=[Depends(get_current_active_superuser)], response_model=SubJoineryType)
def update_sjtype(
    session: SessionDep,
    current_user: CurrentUser,
    id: uuid.UUID, 
    sjtype_in: SubJoineryTypeCreate
) -> Any:
    """
    Update sub joinery type.
    """
    
    return subjoinerytype_crud.update_subjoinery_type(session=session, sjtype_in=sjtype_in, id=id)

@router.delete("/{id}", dependencies=[Depends(get_current_active_superuser)])
def delete_sjtype(
    session: SessionDep,
    current_user: CurrentUser, 
    id: uuid.UUID
) -> Any:
    """
    Delete sub joinery type ONLY if not in use.
    """

    return subjoinerytype_crud.delete_subjoinery_type(session=session, id=id)

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
    return joinerytype_crud.get_subjoinery_types(
        session=session, joinery_type_id=joinery_type_id, skip=skip, limit=limit
    )