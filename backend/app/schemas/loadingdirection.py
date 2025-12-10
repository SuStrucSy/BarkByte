from sqlmodel import Field, SQLModel

from app.models.loadingdirection import LoadingDirection

class LoadingDirectionCreate(SQLModel):
    label: str = Field(min_length=1, max_length=255)

class LoadingDirections(SQLModel):
    data: list[LoadingDirection]
    count: int