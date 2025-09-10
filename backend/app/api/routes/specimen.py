import uuid
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import func, select, delete

from app.api.deps import CurrentUser, SessionDep
from app.models import Specimen, SpecimenCreate, SpecimenPublic, SpecimensPublic, SpecimenUpdate, Message, FailureMode, SpecimenFailureMode, JoineryType, SubJoineryType

import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/specimens", tags=["specimens"])

@router.get("/", response_model=SpecimensPublic)
def read_specimens(
    session: SessionDep, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve specimens.
    """
    count_statement = select(func.count()).select_from(Specimen)
    count = session.exec(count_statement).one()
    statement = select(Specimen).offset(skip).limit(limit)
    specimens = session.exec(statement).all()

    return SpecimensPublic(data=specimens, count=count)

@router.get("/{id}", response_model=SpecimenPublic)
def read_specimen(session: SessionDep, id: uuid.UUID) -> Any:
    """
    Get specimen by ID.
    """
    specimen = session.get(Specimen, id)
    if not specimen:
        raise HTTPException(status_code=404, detail="Specimen not found")
    return specimen

@router.post("/", response_model=SpecimenPublic)
def create_specimen(
    *, session: SessionDep, current_user: CurrentUser, specimen_in: SpecimenCreate
) -> Any:
    """
    Create new specimen.
    """
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Not enough permissions")
    
    # Split out the failure mode IDs (not part of Specimen table directly)
    data = specimen_in.dict(exclude={"e_qualitative_failure_measure"})
    failure_mode_ids = specimen_in.e_qualitative_failure_measure or []

    # Validate dowel vs joinery_type.has_dowel
    given_joinerytype_id = data.get("joinery_type_id")
    if given_joinerytype_id is None:
        raise HTTPException(status_code=400, detail="joinery_type id is required")

    joinerytype_obj = session.exec(select(JoineryType).where(JoineryType.id == given_joinerytype_id)).one_or_none()
    if joinerytype_obj is None:
        raise HTTPException(status_code=400, detail="joinery_type id not found")

    # If sub_joinery_type is provided, validate it exists and belongs to the given joinery_type
    sjtype_id = data.get("sub_joinery_type_id")
    if sjtype_id is not None:
        sjtype_obj = session.exec(
            select(SubJoineryType).where(SubJoineryType.id == sjtype_id)
        ).one_or_none()
        if sjtype_obj is None:
            raise HTTPException(status_code=400, detail="sub_joinery_type id not found")
        if sjtype_obj.joinery_type_id != given_joinerytype_id:
            raise HTTPException(
                status_code=400,
                detail="Mismatch: selected sub_joinery_type does not belong to the selected joinery_type",
            )

    # Make sure the right joinery type is used if dowel is provided
    if bool(data.get("dowel")) != bool(joinerytype_obj.has_dowel):
        if data.get("dowel"):
            detail_msg = "Mismatch: This specimen is marked as having a dowel, but the selected joinery type does not allow dowels."
        else:
            detail_msg = "Mismatch: This specimen is marked as not having a dowel, but the selected joinery type requires dowels."
        raise HTTPException(status_code=400, detail=detail_msg)

    # Create specimen object
    specimen = Specimen(
        **data,
        uploader_id=current_user.id
    )

    # Add specimen to session so it has an ID
    session.add(specimen)
    session.flush()

    # Attach failure modes (if any)
    if failure_mode_ids:
        modes = session.exec(
            select(FailureMode).where(FailureMode.id.in_(failure_mode_ids))
        ).all()

        if len(modes) != len(set(failure_mode_ids)):
            raise HTTPException(status_code=400, detail="One or more failure mode IDs are invalid")

        for mode in modes:
            session.add(
                SpecimenFailureMode(specimen_id=specimen.id, failure_mode_id=mode.id)
            )

    session.commit()

    session.refresh(specimen)
    return specimen

@router.put("/{id}", response_model=SpecimenPublic)
def update_specimen(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: uuid.UUID,
    specimen_in: SpecimenUpdate,
) -> Any:
    """
    Update a specimen.
    """
    specimen = session.get(Specimen, id)
    if not specimen:
        raise HTTPException(status_code=404, detail="Specimen not found")

    if not current_user.is_superuser and (specimen.uploader_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")

    # Separate normal fields from failure modes
    update_dict = specimen_in.model_dump(exclude={"e_qualitative_failure_measure"}, exclude_unset=True)
    failure_mode_ids = specimen_in.e_qualitative_failure_measure

    # If any of dowel, joinery_type_id, sub_joinery_type_id are changing, validate the relationships
    if ("sub_joinery_type_id" in update_dict) or ("joinery_type_id" in update_dict) or ("dowel" in update_dict):
        
        # Determine proposed values (use current if not provided)
        proposed_dowel = update_dict.get("dowel", specimen.dowel)
        proposed_joinerytype_id = update_dict.get("joinery_type_id", specimen.joinery_type_id)
        proposed_sub_id = update_dict.get("sub_joinery_type_id", getattr(specimen, "sub_joinery_type_id", None))

        # Validate joinery_type exists (if we have/keep an id)
        if proposed_joinerytype_id is None:
            raise HTTPException(status_code=400, detail="joinery_type id is required")
        joinerytype_obj = session.get(JoineryType, proposed_joinerytype_id)
        if joinerytype_obj is None:
            raise HTTPException(status_code=400, detail="joinery_type id not found")
        
        # If a sub-joinery is set/proposed, ensure it exists and belongs to the joinery_type
        if proposed_sub_id is not None:
            proposed_sub_obj = session.get(SubJoineryType, proposed_sub_id)
            if proposed_sub_obj is None:
                raise HTTPException(status_code=400, detail="sub_joinery_type id not found")
            if proposed_sub_obj.joinery_type_id != proposed_joinerytype_id:
                raise HTTPException(
                    status_code=400,
                    detail="Mismatch: selected sub_joinery_type does not belong to the selected joinery_type",
                )

        # Enforce dowel rule vs joinery_type.has_dowel
        if bool(proposed_dowel) != bool(joinerytype_obj.has_dowel):
            if proposed_dowel:
                detail_msg = "This specimen is marked as having a dowel, but the selected joinery type does not allow dowels."
            else:
                detail_msg = "This specimen is marked as not having a dowel, but the selected joinery type requires dowels."
            raise HTTPException(status_code=400, detail=detail_msg)

    # Update standard fields
    specimen.sqlmodel_update(update_dict)
    session.add(specimen)

    # Attach failure modes (if any)
    if failure_mode_ids is None:
        return specimen  # No change to failure modes
    elif failure_mode_ids == []:
        updated_modes = []
    else:
        updated_modes = session.exec(
            select(FailureMode).where(FailureMode.id.in_(failure_mode_ids))
        ).all()

        if len(updated_modes) != len(set(failure_mode_ids)):
            raise HTTPException(status_code=400, detail="One or more failure mode IDs are invalid") 
        

    # Get current linked IDs 
    current_ids = {
        row.failure_mode_id
        for row in session.exec(
            select(SpecimenFailureMode).where(SpecimenFailureMode.specimen_id == specimen.id)
        ).all()
    }

    # Compute diffs
    new_ids = {mode.id for mode in updated_modes}
    to_add = new_ids - current_ids
    to_remove = current_ids - new_ids

    # Remove stale links
    if to_remove:
        session.exec(
            delete(SpecimenFailureMode)
            .where(SpecimenFailureMode.specimen_id == specimen.id)
            .where(SpecimenFailureMode.failure_mode_id.in_(to_remove))
        )

    # Add missing links
    for mid in to_add:
        session.add(SpecimenFailureMode(specimen_id=specimen.id, failure_mode_id=mid))
            

    session.commit()
    session.refresh(specimen)
    return specimen

@router.delete("/{id}")
def delete_specimen(
    session: SessionDep, current_user: CurrentUser, id: uuid.UUID
) -> Message:
    """
    Delete an specimen.
    """
    specimen = session.get(Specimen, id)
    if not current_user.is_superuser and (specimen.uploader_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    if not specimen:
        raise HTTPException(status_code=404, detail="Specimen not found")
    session.delete(specimen)
    session.commit()
    return Message(message="Specimen deleted successfully")