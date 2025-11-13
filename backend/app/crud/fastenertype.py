import uuid
from typing import Any

from app.models.models import FastenerType, FastenerTypes, FastenerTypeCreate

from fastapi import HTTPException
from sqlmodel import Session, select, func

def get_fastener_types(*, session: Session, skip: int = 0, limit: int = 100) -> FastenerTypes:
    count_statement = select(func.count()).select_from(FastenerType)
    count = session.exec(count_statement).one()
    statement = select(FastenerType).offset(skip).limit(limit)
    fastener_types = session.exec(statement).all()

    return FastenerTypes(data=fastener_types, count=count)

def create_fastener_type(*, session: Session, fastener_type_in: FastenerTypeCreate) -> FastenerType:
    
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

def update_fastener_type(*, session: Session, fastener_type_in: FastenerTypeCreate, id: uuid.UUID) -> FastenerType:
    fastener_type = session.get(FastenerType, id)
    if not fastener_type:
        raise HTTPException(status_code=404, detail="Fastener type not found")
    
    # Apply only provided fields
    data = fastener_type_in.model_dump(exclude_unset=True)

    fastener_type.sqlmodel_update(data)   # update existing row
    session.add(fastener_type)
    session.commit()
    session.refresh(fastener_type)
    return fastener_type

def delete_fastener_type(*, session: Session, id: uuid.UUID) -> Any:
    fastener_type = session.get(FastenerType, id)
    if not fastener_type:
        raise HTTPException(status_code=404, detail="Fastener type not found")
    
    session.delete(fastener_type)
    session.commit()
    return {"message": "Fastener type deleted successfully"}