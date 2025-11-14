import logging
import uuid
from typing import Any


from fastapi import APIRouter, HTTPException
from sqlmodel import func, select

from app.api.deps import CurrentUser, SessionDep
from app.models.models import JoineryType, JoineryTypes, JoineryTypeCreate
from app.crud import joinerytype as joinerytype_crud

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
    return joinerytype_crud.get_types(session=session, skip=skip, limit=limit)

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
    
    return joinerytype_crud.create_type(session=session, jtype_in=jtype_in)


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
    
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=403, detail="Only super users are allowed to update joinery types"
        )
    
    return joinerytype_crud.update_type(session=session, jtype_in=jtype_in, id=id)


@router.delete("/{id}")
def delete_jtype(
    session: SessionDep,
    current_user: CurrentUser, 
    id: uuid.UUID
) -> Any:
    """
    Delete joinery type ONLY if not in use.
    """
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=403, detail="Only super users are allowed to delete joinery types"
        )
    
    if joinerytype_crud.delete_type(session=session, id=id):
        return {"message": "Joinery type deleted successfully"}