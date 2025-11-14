import logging
import uuid
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import func, select, Session

from app.api.deps import CurrentUser, SessionDep
from app.models.models import JoineryType, JoineryTypes, JoineryTypeCreate, Specimen

def get_types(*, session: Session, skip: int = 0, limit: int = 100) -> JoineryType:
    count_statement = select(func.count()).select_from(JoineryType)
    count = session.exec(count_statement).one()
    statement = select(JoineryType).offset(skip).limit(limit)
    jtypes = session.exec(statement).all()

    return JoineryTypes(data=jtypes, count=count)

def create_type(*, session: Session, jtype_in: JoineryTypeCreate) -> JoineryType:
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

def update_type(*, session: Session, jtype_in: JoineryTypeCreate, id: uuid.UUID) -> JoineryType:
    jtype = session.get(JoineryType, id)
    if not jtype:
        raise HTTPException(status_code=404, detail="Joinery type not found")
    
    data = jtype_in.dict()
    jtype.sqlmodel_update(data)   # ← update existing row
    session.add(jtype)
    session.commit()
    session.refresh(jtype)
    return jtype

def delete_type(*, session: Session, id: uuid.UUID) -> Any:
    
    jtype = session.get(JoineryType, id)
    if not jtype:
        raise HTTPException(status_code=404, detail="Joinery type not found")
    
    refs = session.exec(
        select(func.count())
        .select_from(Specimen)
        .where(Specimen.joinery_type_id == id)
    ).one()
    if refs and refs > 0:
        raise HTTPException(
            status_code=409,
            detail="Cannot delete: joinery type is used by one or more specimens."
        )
    
    session.delete(jtype)
    session.commit()
    return True