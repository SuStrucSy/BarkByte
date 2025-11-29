import uuid

from sqlmodel import func, select, Session
from sqlalchemy.exc import IntegrityError

from app.models.subjoinerytype import SubJoineryType
from app.schemas.subjoinerytype import SubJoineryTypes, SubJoineryTypeCreate

def normalize_label(label: str) -> str:
    return label.strip().lower()

def get_subjoinery_type_by_id(*, session: Session, id: uuid.UUID) -> SubJoineryType | None:
    """
    Retrieve a sub-joinery type by its ID.
    """
    sjtype = session.get(SubJoineryType, id)
    return sjtype

def get_subjoinery_type_by_label(*, session: Session, label: str) -> SubJoineryType | None:
    """
    Retrieve a sub-joinery type by its label.
    """
    statement = select(SubJoineryType).where(SubJoineryType.label == label)
    sjtype = session.exec(statement).first()
    return sjtype

def get_subjoinery_types(*, session: Session, skip: int = 0, limit: int = 100,) -> SubJoineryTypes:
    """
    Retrieve sub-joinery types with pagination.
    """
    count_statement = select(func.count()).select_from(SubJoineryType)
    count = session.exec(count_statement).one()
    statement = select(SubJoineryType).offset(skip).limit(limit)
    sjtypes = session.exec(statement).all()

    return SubJoineryTypes(data=sjtypes, count=count)

def get_subjoinery_type_by_label_and_joinery_type(
    *, session: Session, label: str, joinery_type_id: uuid.UUID
) -> SubJoineryType | None:
    return session.exec(
        select(SubJoineryType)
        .where(SubJoineryType.label == label)
        .where(SubJoineryType.joinery_type_id == joinery_type_id)
    ).first()

def create_subjoinery_type(*, session: Session, sjtype_in: SubJoineryTypeCreate) -> SubJoineryType:
    data = sjtype_in.model_dump()
    data["label"] = normalize_label(data["label"])
    sjtype = SubJoineryType(**data)
    session.add(sjtype)
    session.commit()
    
    session.refresh(sjtype)
    return sjtype

def update_subjoinery_type(
    *, session: Session, sjtype_in: SubJoineryTypeCreate, sub_joinery_type: SubJoineryType
) -> SubJoineryType:
    data = sjtype_in.model_dump(exclude_unset=True)

    # Normalize label only if the user provided it
    if "label" in data:
        data["label"] = normalize_label(data["label"])

    sub_joinery_type.sqlmodel_update(data)
    session.add(sub_joinery_type)
    session.commit()
    session.refresh(sub_joinery_type)
    return sub_joinery_type

def delete_subjoinery_type(
    *, session: Session, sub_joinery_type: SubJoineryType
) -> None:
    session.delete(sub_joinery_type)
    try:
        session.commit()
    except IntegrityError:
        session.rollback()
        raise