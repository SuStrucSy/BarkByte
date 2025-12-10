import uuid

from sqlmodel import Field, Relationship, SQLModel

from app.models.specimen_loadingdirection import SpecimenLoadingDirection

class LoadingDirection(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    label: str = Field(min_length=1, max_length=255)

    specimens: list["Specimen"] = Relationship(
        back_populates="loading_directions",
        link_model=SpecimenLoadingDirection,
    )