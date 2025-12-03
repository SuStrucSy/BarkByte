import logging
import uuid
from typing import Any

from sqlalchemy.exc import IntegrityError
from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import CurrentUser, SessionDep, get_current_active_superuser
from app.schemas.doi import DOIPublic, DOICreate, DOIsPublic, DOIDetailPublic
from app.crud import doi as doi_crud
from app.crud import specimen as specimen_crud

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/doi", tags=["doi"])

@router.get("/", response_model=DOIsPublic)
def get_dois(
    session: SessionDep, skip: int = 0, limit: int = 100
) -> DOIsPublic:
    """
    Retrieve a list of dois.
    """
    return doi_crud.get_dois(session=session, skip=skip, limit=limit)

@router.get("/{id}", response_model=DOIDetailPublic)
def get_doi_by_id(
    session: SessionDep,
    id: uuid.UUID,
) -> DOIDetailPublic:
    """
    Retrieve a specific doi, including its specimens.
    """
    doi = doi_crud.get_doi_by_id(session=session, id=id)
    if doi is None:
        raise HTTPException(status_code=404, detail="DOI not found")

    specimens = specimen_crud.get_specimens_for_doi(session=session, doi_id=id)
    # specimens should already be a SpecimensPublic

    return DOIDetailPublic(
        id=doi.id,
        link=doi.link,
        ref_title=doi.ref_title,
        authors=doi.authors,
        pub_year=doi.pub_year,
        specimens=specimens,
    )

@router.post("/", dependencies=[Depends(get_current_active_superuser)], response_model=DOIPublic)
def create_doi(session: SessionDep, current_user: CurrentUser, doi_in: DOICreate) -> DOIPublic:
    """
    Create DOI.
    """
    # Duplicate check (uses normalization internally)
    if doi_crud.get_doi_by_link(session=session, link=doi_in.link):
        raise HTTPException(status_code=400,detail=f"DOI '{doi_in.link}' already exists.")

    try:
        return doi_crud.create_doi(session=session, doi_in=doi_in)
    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )

@router.post("/{id}", dependencies=[Depends(get_current_active_superuser)], response_model=DOIPublic)
def update_doi(
    session: SessionDep,
    current_user: CurrentUser,
    id: uuid.UUID, 
    doi_in: DOICreate
) -> DOIPublic:
    """
    Create doi.
    """
    doi = doi_crud.get_doi_by_id(session=session, id=id)
    
    if not doi:
        raise HTTPException(status_code=404, detail="DOI not found")

    try:
        return doi_crud.update_doi(session=session, doi_in=doi_in, doi=doi)
    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )

@router.delete("/{id}", dependencies=[Depends(get_current_active_superuser)])
def delete_doi(
    session: SessionDep,
    current_user: CurrentUser, 
    id: uuid.UUID
) -> Any:
    """
    Delete joinery type ONLY if not in use.
    """
    doi = doi_crud.get_doi_by_id(session=session, id=id)
    
    if not doi:
        raise HTTPException(status_code=404, detail="DOI not found")

    try:
        doi_crud.delete_doi(session=session, doi=doi)
    except IntegrityError:
        raise HTTPException(
            status_code=409,
            detail="Cannot delete DOI: it is still referenced by one or more specimens."
        )

    return {"message": "DOI deleted successfully."}