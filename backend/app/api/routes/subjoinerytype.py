import logging
import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError

from app.api.deps import CurrentUser, SessionDep, get_current_active_superuser
from app.schemas.subjoinerytype import SubJoineryType, SubJoineryTypes, SubJoineryTypeCreate
from app.models.subjoinerytype import SubJoineryType
from app.models.joinerytype import JoineryType
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

    # Check if the parent joinery type exists
    jt = joinerytype_crud.get_type_by_id(session=session, id=sjtype_in.joinery_type_id)
    if jt is None:
        raise HTTPException(status_code=404, detail="Joinery type not found")

    # Check if a sub-joinery type with same label already exists under this joinery_type
    sjt = subjoinerytype_crud.get_subjoinery_type_by_label_and_joinery_type(
        session=session,
        label=sjtype_in.label,
        joinery_type_id=sjtype_in.joinery_type_id
    )

    if sjt:
        raise HTTPException(
            status_code=400,
            detail=f"Sub-joinery type '{sjtype_in.label}' already exists under this joinery type",
        )

    # Safe to create
    return subjoinerytype_crud.create_subjoinery_type(
        session=session,
        sjtype_in=sjtype_in
    )

@router.put("/{id}", dependencies=[Depends(get_current_active_superuser)], response_model=SubJoineryType)
def update_sjtype(
    session: SessionDep,
    current_user: CurrentUser,
    id: uuid.UUID,
    sjtype_in: SubJoineryTypeCreate,
) -> Any:
    """
    Update sub joinery type.
    """

    # Ensure the row you're updating exists
    sub_joinery_type = subjoinerytype_crud.get_subjoinery_type_by_id(
        session=session, 
        id=id
    )
    if sub_joinery_type is None:
        raise HTTPException(404, "Sub joinery type not found")

    proposed_label = sjtype_in.label
    proposed_jt_id = sjtype_in.joinery_type_id

    # Check for duplicate pair
    existing = subjoinerytype_crud.get_subjoinery_type_by_label_and_joinery_type(
        session=session,
        label=proposed_label,
        joinery_type_id=proposed_jt_id,
    )

    if existing and existing.id != id:
        raise HTTPException(
            400,
            f"Some other Sub joinery type '{proposed_label}' already exists for that joinery type",
        )

    # Validate FK
    if joinerytype_crud.get_type_by_id(session=session, id=proposed_jt_id) is None:
        raise HTTPException(400, "joinery_type_id is invalid")

    # Perform update
    return subjoinerytype_crud.update_subjoinery_type(
        session=session, 
        sjtype_in=sjtype_in, 
        sub_joinery_type=sub_joinery_type
    )

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

@router.delete("/{id}", dependencies=[Depends(get_current_active_superuser)])
def delete_sjtype(
    session: SessionDep,
    current_user: CurrentUser,
    id: uuid.UUID,
) -> Any:
    """
    Delete sub joinery type ONLY if not in use.
    """
    # Ensure it exists
    sub_joinery_type = subjoinerytype_crud.get_subjoinery_type_by_id(
        session=session,
        id=id,
    )

    if sub_joinery_type is None:
        raise HTTPException(status_code=404, detail="Sub joinery type not found")

    # Perform delete
    try:
        subjoinerytype_crud.delete_subjoinery_type(
            session=session,
            sub_joinery_type=sub_joinery_type,
        )
    except IntegrityError:
        raise HTTPException(
            status_code=409,
            detail="Cannot delete sub joinery type: it is still referenced by one or more specimens."
        )

    return {"message": "Sub joinery type deleted successfully"}