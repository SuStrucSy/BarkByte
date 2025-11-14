import uuid
from typing import Any

from fastapi import HTTPException
from sqlmodel import func, select, Session

from app.models.models import SubJoineryType, SubJoineryTypes, SubJoineryTypeCreate, JoineryType, Specimen

def get_subjoinery_types(*, session: Session, skip: int = 0, limit: int = 100,) -> SubJoineryTypes:
    """
    Retrieve sub-joinery types with pagination.
    """
    count_statement = select(func.count()).select_from(SubJoineryType)
    count = session.exec(count_statement).one()
    statement = select(SubJoineryType).offset(skip).limit(limit)
    sjtypes = session.exec(statement).all()

    return SubJoineryTypes(data=sjtypes, count=count)

def create_subjoinery_type(*, session: Session, sjtype_in: SubJoineryTypeCreate) -> SubJoineryType:
    # Check if label already exists
    existing = session.exec(
        select(SubJoineryType).where(SubJoineryType.label == sjtype_in.label, SubJoineryType.joinery_type_id == sjtype_in.joinery_type_id)
    ).first()

    if existing:
        raise HTTPException(
            status_code=400, detail=f"Sub-joinery type with label '{sjtype_in.label}' already exists for the given joinery type"
        )

    data = sjtype_in.dict()
    sjtype = SubJoineryType(**data)
    session.add(sjtype)
    session.commit()
    
    session.refresh(sjtype)
    return sjtype

def update_subjoinery_type(*, session: Session, sjtype_in: SubJoineryTypeCreate, id: uuid.UUID) -> SubJoineryType:
    sjtype = session.get(SubJoineryType, id)
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

def delete_subjoinery_type(*, session: Session, id: uuid.UUID) -> Any:
    sjtype = session.get(SubJoineryType, id)

    if not sjtype:
        raise HTTPException(status_code=404, detail="Sub joinery type not found")

    # Check for references in SpecimenFailureMode
    refs = session.exec(
        select(func.count())
        .select_from(Specimen)
        .where(Specimen.sub_joinery_type_id == id)
    ).one()
    if refs and refs > 0:
        raise HTTPException(
            status_code=409,
            detail="Cannot delete: sub joinery type is used by one or more specimens."
        )

    session.delete(sjtype)
    session.commit()
    return {"message": "Sub joinery type deleted successfully"}