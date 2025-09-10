from typing import Any

from fastapi import APIRouter
from sqlmodel import func, select

from app.api.deps import SessionDep
from app.models import LoadingDirection, LoadingDirections

import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/loadingdirection", tags=["loadingdirection"])

@router.get("/", response_model=LoadingDirections)
def get_loading_directions(
    session: SessionDep, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve loading direction.
    """
    count_statement = select(func.count()).select_from(LoadingDirection)
    count = session.exec(count_statement).one()
    statement = select(LoadingDirection).offset(skip).limit(limit)
    loading_directions = session.exec(statement).all()

    return LoadingDirections(data=loading_directions, count=count)

# this has not other routes since other than the 4 mentioned options, there are no other options to add or remove or update.