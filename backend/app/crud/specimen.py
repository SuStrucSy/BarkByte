from typing import Any
import uuid

from sqlmodel import Session, select, delete, func, SQLModel

from app.models.specimen import Specimen
from app.schemas.specimen import SpecimenCreate, SpecimensPublic, SpecimenUpdate
from app.models.failuremode import FailureMode
from app.models.specimen_failuremode import SpecimenFailureMode
from app.models.joinerytype import JoineryType
from app.models.subjoinerytype import SubJoineryType
from app.models.fastenertype import FastenerType
from app.models.specimen_fastenertype import SpecimenFastenerType
from app.models.loadingdirection import LoadingDirection
from app.models.specimen_loadingdirection import SpecimenLoadingDirection


def get_specimen_by_id(*, session: Session, id: uuid.UUID) -> Specimen | None:
    """Return specimen or None."""
    return session.get(Specimen, id)

def get_specimens(*, session: Session, skip: int = 0, limit: int = 100) -> SpecimensPublic:
    count_statement = select(func.count()).select_from(Specimen)
    count = session.exec(count_statement).one()
    statement = select(Specimen).offset(skip).limit(limit)
    specimens = session.exec(statement).all()
    return SpecimensPublic(data=specimens, count=count)

def get_specimens_for_doi(*, session: Session, doi_id: uuid.UUID) -> SpecimensPublic:
    """
    Get all specimens associated with a given DOI.
    """
    count_statement = select(func.count()).select_from(Specimen).where(Specimen.doi_id == doi_id)
    count = session.exec(count_statement).one()
    statement = select(Specimen).where(Specimen.doi_id == doi_id)
    specimens = session.exec(statement).all()
    return SpecimensPublic(data=specimens, count=count)

def _split_specimen_payload(specimen_in: SQLModel, for_update: bool) -> tuple[dict[str, Any], list[uuid.UUID] | None, list[uuid.UUID] | None, list[uuid.UUID] | None]:
    data = specimen_in.model_dump(
        exclude={"e_qualitative_failure_measure", "fastener_type_ids", "loading_direction_ids"},
        exclude_unset=for_update
    )
    if for_update:
        # keep tri-state semantics
        fm_ids = specimen_in.e_qualitative_failure_measure
        ft_ids = specimen_in.fastener_type_ids
        ld_ids = specimen_in.loading_direction_ids
    else:
        # create: collapse None → [] because create schemas already enforce required fields
        fm_ids = specimen_in.e_qualitative_failure_measure or []
        ft_ids = specimen_in.fastener_type_ids or []
        ld_ids = specimen_in.loading_direction_ids or []
    return data, fm_ids, ft_ids, ld_ids

def _validate_joinery_and_dowel(session: Session, data: dict) -> None:
    given_joinerytype_id = data.get("joinery_type_id")
    if given_joinerytype_id is None:
        raise ValueError("joinery_type id is required")

    joinerytype_obj = session.get(JoineryType, given_joinerytype_id)
    if joinerytype_obj is None:
        raise ValueError("joinery_type id not found")

    sjtype_id = data.get("sub_joinery_type_id")
    if sjtype_id is not None:
        sjtype_obj = session.get(SubJoineryType, sjtype_id)
        if sjtype_obj is None:
            raise ValueError("sub_joinery_type id not found")
        if sjtype_obj.joinery_type_id != given_joinerytype_id:
            raise ValueError(
                "Mismatch, selected sub_joinery_type does not belong to the selected joinery_type"
            )

    dowel = data.get("dowel")
    if bool(dowel) != bool(joinerytype_obj.has_dowel):
        if dowel:
            msg = "Specimen is marked as having a dowel but the selected joinery type does not allow dowels"
        else:
            msg = "Specimen is marked as not having a dowel but the selected joinery type requires dowels"
        raise ValueError(msg)

def _validate_failure_modes_against_toggles(session: Session, failure_mode_ids: list[uuid.UUID] | None, connector: bool | None = None, dowel: bool | None = None) -> None:
    if not failure_mode_ids:
        return

    modes = session.exec(
        select(FailureMode).where(FailureMode.id.in_(failure_mode_ids))
    ).all()

    if len(modes) != len(set(failure_mode_ids)):
        raise ValueError("One or more failure mode IDs are invalid")

    for m in modes:
        mtype = getattr(m.type, "value", m.type)
        mtype = str(mtype).upper()
        if mtype == "CONNECTOR" and connector is False:
            raise ValueError(f"'{m.label}' requires a connector but connector is false on this specimen")
        if mtype == "DOWEL" and dowel is False:
            raise ValueError(f"'{m.label}' requires a dowel but dowel is false on this specimen")

def _validate_fasteners_against_dowel(fastener_type_ids: list[uuid.UUID] | None, dowel: bool | None) -> None:
    if dowel and not fastener_type_ids:
        raise ValueError("At least one fastener type is required when dowel is true")
    if not dowel and fastener_type_ids:
        raise ValueError("Remove fastener types when dowel is false")

def _sync_specimen_failure_modes(session: Session, specimen_id: uuid.UUID, failure_mode_ids: list[uuid.UUID] | None) -> None:
    # normalize
    failure_mode_ids = failure_mode_ids or []

    # Validate if there are any   
    fmodes: list[FailureMode] = []
    if failure_mode_ids:
        fmodes = session.exec(
            select(FailureMode).where(FailureMode.id.in_(failure_mode_ids))
        ).all()
        if len(fmodes) != len(set(failure_mode_ids)):
            raise ValueError("One or more failure mode IDs are invalid")
        
    # clear existing links
    session.exec(delete(SpecimenFailureMode).where(SpecimenFailureMode.specimen_id == specimen_id))
    
    # insert new links
    for mode_id in failure_mode_ids:
        session.add(SpecimenFailureMode(specimen_id=specimen_id, failure_mode_id=mode_id))

def _sync_specimen_fastener_types(
    session: Session,
    specimen_id: uuid.UUID,
    fastener_type_ids: list[uuid.UUID] | None,
) -> None:
    # normalize
    fastener_type_ids = fastener_type_ids or []
    
    # Validate if there are any
    ftypes: list[FastenerType] = []
    if fastener_type_ids:
        ftypes = session.exec(
            select(FastenerType).where(FastenerType.id.in_(fastener_type_ids))
        ).all()
        if len(ftypes) != len(set(fastener_type_ids)):
            raise ValueError("One or more fastener type IDs are invalid")

    # clear existing links
    session.exec(delete(SpecimenFastenerType).where(SpecimenFastenerType.specimen_id == specimen_id))

    # insert new links
    for ft_id in fastener_type_ids:
        session.add(SpecimenFastenerType(specimen_id=specimen_id, fastener_type_id=ft_id))

def _sync_specimen_loading_directions(session: Session, specimen_id: uuid.UUID, loading_direction_ids: list[uuid.UUID] | None,) -> None:
    # normalize
    ids = loading_direction_ids or []
    
    # Validate if there are any
    ldirs: list[LoadingDirection] = []
    if loading_direction_ids:
        ldirs = session.exec(
            select(LoadingDirection).where(LoadingDirection.id.in_(loading_direction_ids))
        ).all()
        if len(ldirs) != len(set(ids)):
            raise ValueError("One or more loading direction IDs are invalid")

    # clear existing links
    session.exec(delete(SpecimenLoadingDirection).where(SpecimenLoadingDirection.specimen_id == specimen_id))

    # insert new links
    for ld in ldirs:
        session.add(SpecimenLoadingDirection(specimen_id=specimen_id, loading_direction_id=ld.id))

def get_current_fastener_type_ids(session: Session, specimen_id: uuid.UUID) -> list[uuid.UUID]:
    return [
        row.fastener_type_id
        for row in session.exec(
            select(SpecimenFastenerType).where(
                SpecimenFastenerType.specimen_id == specimen_id
            )
        ).all()
    ]

def get_current_loading_direction_ids(session: Session, specimen_id: uuid.UUID) -> list[uuid.UUID]:
    return [
        row.loading_direction_id
        for row in session.exec(
            select(SpecimenLoadingDirection).where(
                SpecimenLoadingDirection.specimen_id == specimen_id
            )
        ).all()
    ]

def get_current_failure_mode_ids(session: Session, specimen_id: uuid.UUID) -> list[uuid.UUID]:
    return [
        row.failure_mode_id
        for row in session.exec(
            select(SpecimenFailureMode).where(
                SpecimenFailureMode.specimen_id == specimen_id
            )
        ).all()
    ]

def create_specimen(
    *, session: Session, specimen_in: SpecimenCreate, current_user_id: uuid.UUID
) -> Specimen:
    """
    Create a specimen, raise ValueError on invalid domain state.
    """

    data, failure_mode_ids, fastener_type_ids, loading_direction_ids = (
        _split_specimen_payload(specimen_in, for_update=False)
    )

    _validate_joinery_and_dowel(session, data)
    _validate_failure_modes_against_toggles(session, failure_mode_ids, connector=data.get("connector"), dowel=data.get("dowel"))
    _validate_fasteners_against_dowel(fastener_type_ids=fastener_type_ids, dowel=data.get("dowel"))

    # Create specimen object
    specimen = Specimen(**data, uploader_id=current_user_id)
    session.add(specimen)
    session.flush()

    _sync_specimen_failure_modes(session, specimen.id, failure_mode_ids)
    _sync_specimen_fastener_types(session, specimen.id, fastener_type_ids)
    _sync_specimen_loading_directions(session, specimen.id, loading_direction_ids)

    session.commit()
    session.refresh(specimen)
    return specimen
 
def _build_complete_specimen_for_update(session: Session, specimen: Specimen, patch: SpecimenUpdate) -> SpecimenCreate:
    """
    Take the existing specimen row and a SpecimenUpdate patch,
    return a SpecimenCreate-like object with the full proposed state.
    """

    # Start from current scalar fields that SpecimenCreate knows about
    base_data = specimen.model_dump(exclude={"e_qualitative_failure_measure", "fastener_type_ids", "loading_direction_ids"})

    # Overlay the patch scalars (exclude the relationship lists here)
    patch_data = patch.model_dump(
        exclude={"e_qualitative_failure_measure", "fastener_type_ids", "loading_direction_ids"},
        exclude_unset=True,
    )
    base_data.update(patch_data)

    # Failure modes
    base_data["e_qualitative_failure_measure"] = (
        get_current_failure_mode_ids(session, specimen.id)
        if patch.e_qualitative_failure_measure is None
        else patch.e_qualitative_failure_measure
    )

    # Fastener types
    base_data["fastener_type_ids"] = (
        get_current_fastener_type_ids(session, specimen.id)
        if patch.fastener_type_ids is None
        else patch.fastener_type_ids
    )

    # Loading directions
    base_data["loading_direction_ids"] = (
        get_current_loading_direction_ids(session, specimen.id)
        if patch.loading_direction_ids is None
        else patch.loading_direction_ids
    )

    # Let Pydantic validate everything as a SpecimenCreate
    return SpecimenCreate.model_validate(base_data)

def update_specimen(
    *, session: Session, specimen_in: SpecimenUpdate, id: uuid.UUID
) -> Specimen:
    """
    Update a specimen, raise ValueError on invalid domain state or if not found.
    """
    specimen = get_specimen_by_id(session=session, id=id)
    if specimen is None:
        raise ValueError("Specimen not found")

    # Build a full proposed state that looks like a SpecimenCreate
    complete = _build_complete_specimen_for_update(session=session, specimen=specimen, patch=specimen_in)

    # Now reuse the same splitting as create
    data, failure_mode_ids, fastener_type_ids, loading_direction_ids = (
        _split_specimen_payload(complete, for_update=False)
    )

    # Validation, same pattern as create
    _validate_joinery_and_dowel(session, data)
    _validate_failure_modes_against_toggles(session=session, failure_mode_ids=failure_mode_ids, connector=data.get("connector"), dowel=data.get("dowel"))
    _validate_fasteners_against_dowel(fastener_type_ids=fastener_type_ids, dowel=data.get("dowel"))

    # Apply scalar updates to the existing row
    specimen.sqlmodel_update(data)
    session.add(specimen)
    session.flush()

    # Sync link tables to the proposed full state
    _sync_specimen_failure_modes(session, specimen.id, failure_mode_ids)
    _sync_specimen_fastener_types(session, specimen.id, fastener_type_ids)
    _sync_specimen_loading_directions(session, specimen.id, loading_direction_ids)

    session.commit()
    session.refresh(specimen)
    return specimen

def delete_specimen(*, session: Session, id: uuid.UUID) -> Any:
    specimen = session.get(Specimen, id)
    session.delete(specimen)
    session.commit()
    return {"message": "specimen deleted successfully"}
