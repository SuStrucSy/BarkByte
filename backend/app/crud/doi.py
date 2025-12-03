import uuid
from typing import Any

from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, select, func
from pydantic import TypeAdapter
from pydantic.networks import AnyUrl

from app.models.doi import DOI
from app.schemas.doi import DOIsPublic

url_adapter = TypeAdapter(AnyUrl)

def normalize_link(link: str) -> str | None:
    # If there is no scheme, default to https so that examples like
    # "example.com" are still considered valid.
    if "://" not in link:
        link = f"https://{link}"

    try:
        url = url_adapter.validate_python(link)
    except Exception:
        return None

    # Normalize host, lowercase and strip a leading "www."
    host = (url.host or "").lower()
    if host.startswith("www."):
        host = host[4:]

    # Normalize path, drop a single trailing slash so that "/" and "" are the same.
    path = url.path or ""
    if path == "/":
        path = ""

    query = f"?{url.query}" if getattr(url, "query", None) else ""
    fragment = f"#{url.fragment}" if getattr(url, "fragment", None) else ""

    return f"{url.scheme}://{host}{path}{query}{fragment}"

def get_doi_by_link(*, session: Session, link: str) -> DOI | None:
    normalized = normalize_link(link)
    if normalized is None:
        return None

    statement = select(DOI).where(DOI.link == normalized)
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
    data = doi_in.model_dump()

    if "link" in data and data["link"] is not None:
        normalized = normalize_link(data["link"])
        if normalized is None:
            raise ValueError("Invalid DOI link URL")
        data["link"] = normalized

    doi = DOI(**data)
    session.add(doi)
    session.commit()
    session.refresh(doi)
    return doi

def update_doi(*, session: Session, doi_in: Any, doi: DOI) -> DOI:
    data = doi_in.model_dump()

    if "link" in data and data["link"] is not None:
        normalized = normalize_link(data["link"])
        if normalized is None:
            raise ValueError("Invalid DOI link URL")
        data["link"] = normalized

    for field, value in data.items():
        setattr(doi, field, value)

    session.add(doi)
    session.commit()
    session.refresh(doi)
    return doi

def delete_doi(*, session: Session, doi: DOI) -> None:
    session.delete(doi)
    try:
        session.commit()
    except IntegrityError:
        session.rollback()
        raise
