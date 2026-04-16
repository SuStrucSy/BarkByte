import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, func
from sqlmodel import Field, Relationship

from app.core.bases import SpecimenBase
from app.models.failuremode import FailureMode
from app.models.fastenertype import FastenerType
from app.models.joinerytype import JoineryType
from app.models.loadingdirection import LoadingDirection
from app.models.specimen_failuremode import SpecimenFailureMode
from app.models.specimen_fastenertype import SpecimenFastenerType
from app.models.specimen_loadingdirection import SpecimenLoadingDirection
from app.models.subjoinerytype import SubJoineryType


# Database model, database table inferred from class name
class Specimen(SpecimenBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime = Field(
        sa_column=Column(
            DateTime(timezone=True), server_default=func.now(), nullable=False
        )
    )

    updated_at: datetime = Field(
        sa_column=Column(
            DateTime(timezone=True),
            server_default=func.now(),
            onupdate=func.now(),
            nullable=False,
        )
    )
    doi_id: uuid.UUID = Field(foreign_key="doi.id")
    uploader_id: uuid.UUID = Field(foreign_key="user.id")
    e_qualitative_failure_measure: list[FailureMode] = Relationship(
        back_populates="specimens",
        link_model=SpecimenFailureMode,
    )
    fastener_types: list[FastenerType] = Relationship(
        back_populates="specimens",
        link_model=SpecimenFastenerType,
    )
    loading_directions: list[LoadingDirection] = Relationship(
        back_populates="specimens",
        link_model=SpecimenLoadingDirection,
    )
    joinery_type_id: uuid.UUID = Field(foreign_key="joinerytype.id")
    sub_joinery_type_id: uuid.UUID = Field(foreign_key="subjoinerytype.id")

    joinery_type: JoineryType = Relationship(back_populates="specimens")
    sub_joinery_type: SubJoineryType = Relationship(back_populates="specimens")
    doi: "DOI" = Relationship(back_populates="specimens")
