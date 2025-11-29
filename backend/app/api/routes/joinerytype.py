import logging
import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError

from app.api.deps import CurrentUser, SessionDep, get_current_active_superuser
from app.models.joinerytype import JoineryType
from app.schemas.joinerytype import JoineryTypes, JoineryTypeCreate
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

@router.post("/", dependencies=[Depends(get_current_active_superuser)], response_model=JoineryType)
def create_jtype(
    session: SessionDep,
    current_user: CurrentUser, 
    jtype_in: JoineryTypeCreate
) -> Any:
    """
    Create joinery type.
    """
    # Check if label already exists
    if joinerytype_crud.get_type_by_label(session=session, label=jtype_in.label):
        raise HTTPException(
            status_code=400, detail=f"Joinery type with label '{jtype_in.label}' already exists"
        )

    return joinerytype_crud.create_type(session=session, jtype_in=jtype_in)


@router.put("/{id}", dependencies=[Depends(get_current_active_superuser)], response_model=JoineryType)
def update_jtype(
    session: SessionDep,
    current_user: CurrentUser,
    id: uuid.UUID, 
    jtype_in: JoineryTypeCreate
) -> Any:
    """
    Update joinery type.
    """
    joinery_type = joinerytype_crud.get_type_by_id(session=session, id=id)
    
    if not joinery_type:
        raise HTTPException(status_code=404, detail="Joinery type not found")
    
    return joinerytype_crud.update_type(session=session, jtype_in=jtype_in, joinery_type=joinery_type)


@router.delete("/{id}", dependencies=[Depends(get_current_active_superuser)])
def delete_jtype(
    session: SessionDep,
    current_user: CurrentUser, 
    id: uuid.UUID
) -> Any:
    """
    Delete joinery type ONLY if not in use.
    """
    joinery_type = joinerytype_crud.get_type_by_id(session=session, id=id)

    if not joinery_type:
        raise HTTPException(status_code=404, detail="Joinery type not found")
    
    try:
        joinerytype_crud.delete_type(session=session, joinery_type=joinery_type)
    except IntegrityError:
        raise HTTPException(
            status_code=409,
            detail="Cannot delete joinery type: it is still referenced by one or more specimens."
        )
    
    return {"message": "Joinery type deleted successfully."}