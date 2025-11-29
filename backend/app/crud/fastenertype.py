import uuid
from typing import Any

from sqlmodel import Session, select, func

from app.models.specimen_fastenertype import SpecimenFastenerType
from app.models.fastenertype import FastenerType
from app.schemas.fastenertype import FastenerTypes, FastenerTypeCreate

def normalize_label(label: str) -> str:
    return label.strip().lower()

def is_fastener_type_in_use(*, session: Session, id: uuid.UUID) -> bool:
    refs = session.exec(
        select(func.count())
        .select_from(SpecimenFastenerType)
        .where(SpecimenFastenerType.fastener_type_id == id)
    ).one()
    return refs > 0

def get_fastener_types(*, session: Session, skip: int = 0, limit: int = 100) -> FastenerTypes:
    count_statement = select(func.count()).select_from(FastenerType)
    count = session.exec(count_statement).one()
    statement = select(FastenerType).offset(skip).limit(limit)
    fastener_types = session.exec(statement).all()
    return FastenerTypes(data=fastener_types, count=count)

def get_fastener_type_by_label(*, session: Session, label: str) -> FastenerType | None:
    label = normalize_label(label)
    statement = select(FastenerType).where(FastenerType.label == label)
    fastener_type = session.exec(statement).first()
    return fastener_type

def get_fastener_type_by_id(*, session: Session, id: uuid.UUID) -> FastenerType | None:
    fastener_type = session.get(FastenerType, id)
    return fastener_type

def create_fastener_type(
    *, session: Session, fastener_type_in: FastenerTypeCreate
) -> FastenerType:

    # Normalize the label BEFORE building the model
    normalized_label = normalize_label(fastener_type_in.label)

    data = fastener_type_in.model_dump()
    data["label"] = normalized_label

    fastener_type = FastenerType(**data)
    session.add(fastener_type)
    session.commit()
    session.refresh(fastener_type)
    return fastener_type

def update_fastener_type(
    *, session: Session, fastener_type_in: FastenerTypeCreate, fastener_type: FastenerType
) -> FastenerType:

    data = fastener_type_in.model_dump(exclude_unset=True)

    if "label" in data:
        data["label"] = normalize_label(data["label"])

    fastener_type.sqlmodel_update(data)
    session.add(fastener_type)
    session.commit()
    session.refresh(fastener_type)
    return fastener_type

def delete_fastener_type(*, session: Session, fastener_type: FastenerType) -> Any:
    session.delete(fastener_type)
    session.commit()
