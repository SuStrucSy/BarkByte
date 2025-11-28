import uuid
from typing import Any

from sqlmodel import Session, select, func

from app.models.doi import DOI
from app.schemas.doi import DOIsPublic
# from app.schemas.fastenertype import FastenerTypes, FastenerTypeCreate

# need to decide what determines it, link or id? link is more user friendly but id is more standard for APIs. 🚨

def get_doi_by_link(*, session: Session, link: str) -> DOI | None:
    statement = select(DOI).where(DOI.link == link)
    return session.exec(statement).first()

def get_doi_by_id(*, session: Session, id: uuid.UUID) -> DOI | None:
    statement = select(DOI).where(DOI.id == id)
    return session.exec(statement).first()

def get_dois(*, session: Session, skip: int = 0, limit: int = 100) -> DOIsPublic:
    count_statement = select(func.count()).select_from(DOI)
    count = session.exec(count_statement).one()
    statement = select(DOI).offset(skip).limit(limit)
    dois = session.exec(statement).all()
    return DOIsPublic(data=dois, count=count)

def create_doi(*, session: Session, doi_in: Any) -> DOI:
    doi = DOI(**doi_in.model_dump())
    session.add(doi)
    session.commit()
    session.refresh(doi)
    return doi

def update_doi(*, session: Session, doi_in: Any, doi: DOI) -> DOI:
    for field, value in doi_in.model_dump().items():
        setattr(doi, field, value)

    session.add(doi)
    session.commit()
    session.refresh(doi)
    return doi

def delete_doi(*, session: Session, doi: DOI) -> None:
    # what if there are specimens linked to this DOI? cascade is off by default, but we double check if its possible.

    session.delete(doi)
    session.commit()