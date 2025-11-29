import uuid
from typing import Any

from sqlmodel import func, select, Session
from sqlalchemy.exc import IntegrityError

from app.models.joinerytype import JoineryType
from app.schemas.joinerytype import JoineryTypes, JoineryTypeCreate
from app.models.joinerytype import JoineryType
from app.schemas.joinerytype import JoineryType, JoineryTypes, JoineryTypeCreate
from app.models.specimen import Specimen
from app.schemas.subjoinerytype import SubJoineryType, SubJoineryTypes

def normalize_label(label: str) -> str:
    return label.strip().lower()

def get_types(*, session: Session, skip: int = 0, limit: int = 100) -> JoineryType:
    count_statement = select(func.count()).select_from(JoineryType)
    count = session.exec(count_statement).one()
    statement = select(JoineryType).offset(skip).limit(limit)
    jtypes = session.exec(statement).all()

    return JoineryTypes(data=jtypes, count=count)

def get_type_by_label(*, session: Session, label: str) -> JoineryType:
    label = normalize_label(label)
    statement = select(JoineryType).where(JoineryType.label == label)
    joinry_type = session.exec(statement).first()
    return joinry_type

def get_type_by_id(*, session: Session, id: uuid.UUID) -> JoineryType:
    joinry_type = session.get(JoineryType, id)
    return joinry_type

def get_subjoinery_types(*, session: Session, joinery_type_id: uuid.UUID, skip: int = 0, limit: int = 100,) -> SubJoineryTypes:
    """
    Retrieve sub-joinery types for a specific joinery type with pagination.
    """
    count_statement = select(func.count()).select_from(SubJoineryType).where(SubJoineryType.joinery_type_id == joinery_type_id)
    count = session.exec(count_statement).one()
    statement = select(SubJoineryType).where(SubJoineryType.joinery_type_id == joinery_type_id).offset(skip).limit(limit)
    sjtypes = session.exec(statement).all()

    return SubJoineryTypes(data=sjtypes, count=count)

def create_type(*, session: Session, jtype_in: JoineryTypeCreate) -> JoineryType:
    normalized_label = normalize_label(jtype_in.label)

    data = jtype_in.model_dump()
    data["label"] = normalized_label

    jtype = JoineryType(**data)
    session.add(jtype)
    session.commit()
    session.refresh(jtype)
    return jtype

def update_type(*, session: Session, jtype_in: JoineryTypeCreate, joinery_type: JoineryType) -> JoineryType:

    data = jtype_in.model_dump(exclude_unset=True)
    if "label" in data:
        data["label"] = normalize_label(data["label"])
    
    joinery_type.sqlmodel_update(data)
    session.add(joinery_type)
    session.commit()
    session.refresh(joinery_type)
    return joinery_type

def delete_type(*, session: Session, joinery_type: JoineryType) -> None:
    session.delete(joinery_type)
    try:
        session.commit()
    except IntegrityError:
        session.rollback()
        raise