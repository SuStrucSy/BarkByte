import uuid
from typing import Any
from fastapi import HTTPException
from sqlmodel import Session, select, delete, func

from app.core.security import get_password_hash, verify_password
from app.models.models import User, UserCreate, UserUpdate, Specimen, SpecimenCreate, SpecimensPublic, SpecimenUpdate, FailureMode, SpecimenFailureMode, JoineryType, SubJoineryType, FastenerType, SpecimenFastenerType, LoadingDirection, SpecimenLoadingDirection, FastenerTypes, FastenerTypeCreate


def create_user(*, session: Session, user_create: UserCreate) -> User:
    db_obj = User.model_validate(
        user_create, update={"hashed_password": get_password_hash(user_create.password)}
    )
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj

def update_user(*, session: Session, db_user: User, user_in: UserUpdate) -> Any:
    user_data = user_in.model_dump(exclude_unset=True)
    extra_data = {}
    if "password" in user_data:
        password = user_data["password"]
        hashed_password = get_password_hash(password)
        extra_data["hashed_password"] = hashed_password
    db_user.sqlmodel_update(user_data, update=extra_data)
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user

def get_user_by_email(*, session: Session, email: str) -> User | None:
    statement = select(User).where(User.email == email)
    session_user = session.exec(statement).first()
    return session_user

def authenticate(*, session: Session, email: str, password: str) -> User | None:
    db_user = get_user_by_email(session=session, email=email)
    if not db_user:
        return None
    if not verify_password(password, db_user.hashed_password):
        return None
    return db_user


def get_specimen_by_id(*, session: Session, id: uuid.UUID) -> Specimen | None:
    specimen = session.get(Specimen, id)
    if not specimen:
        raise HTTPException(status_code=404, detail="Specimen not found")
    return specimen

def get_specimens(*, session: Session, skip: int = 0, limit: int = 100) -> SpecimensPublic:
    count_statement = select(func.count()).select_from(Specimen)
    count = session.exec(count_statement).one()
    statement = select(Specimen).offset(skip).limit(limit)
    specimens = session.exec(statement).all()
    return SpecimensPublic(data=specimens, count=count)

def create_specimen(*, session: Session, specimen_in: SpecimenCreate, current_user_id: uuid.UUID) -> Any:
    # Placeholder function for creating a specimen
    
    data = specimen_in.dict(exclude={"e_qualitative_failure_measure", "fastener_type_ids", "loading_direction_ids"})
    failure_mode_ids = specimen_in.e_qualitative_failure_measure or []
    fastener_type_ids = specimen_in.fastener_type_ids or []
    loading_direction_ids = specimen_in.loading_direction_ids or []

    # Validate dowel vs joinery_type.has_dowel
    given_joinerytype_id = data.get("joinery_type_id")
    if given_joinerytype_id is None:
        raise HTTPException(status_code=400, detail="joinery_type id is required")

    joinerytype_obj = session.exec(select(JoineryType).where(JoineryType.id == given_joinerytype_id)).one_or_none()
    if joinerytype_obj is None:
        raise HTTPException(status_code=400, detail="joinery_type id not found")


    # If sub_joinery_type is provided, validate it exists and belongs to the given joinery_type
    sjtype_id = data.get("sub_joinery_type_id")
    if sjtype_id is not None:
        sjtype_obj = session.exec(
            select(SubJoineryType).where(SubJoineryType.id == sjtype_id)
        ).one_or_none()
        if sjtype_obj is None:
            raise HTTPException(status_code=400, detail="sub_joinery_type id not found")
        if sjtype_obj.joinery_type_id != given_joinerytype_id:
            raise HTTPException(
                status_code=400,
                detail="Mismatch: selected sub_joinery_type does not belong to the selected joinery_type",
            )

    # Make sure the right joinery type is used if dowel is provided
    if bool(data.get("dowel")) != bool(joinerytype_obj.has_dowel):
        if data.get("dowel"):
            detail_msg = "Mismatch: This specimen is marked as having a dowel, but the selected joinery type does not allow dowels."
        else:
            detail_msg = "Mismatch: This specimen is marked as not having a dowel, but the selected joinery type requires dowels."
        raise HTTPException(status_code=400, detail=detail_msg)

    # Validate fastener_type_ids (if any)
    if data.get("dowel") and not fastener_type_ids:
        raise HTTPException(status_code=400, detail="At least one fastener type is required when dowel is true.")
    if not data.get("dowel") and fastener_type_ids:
        raise HTTPException(status_code=400, detail="Remove fastener types when dowel is false.")
    
    # Let's comment out the safe ways for now and just create the specimen directly
    # Create specimen object
    specimen = Specimen.model_validate(
        {**data, "uploader_id": current_user_id}
    )
    specimen = Specimen(**data, uploader_id=current_user_id)

    session.add(specimen)
    session.flush()

    # Attach failure modes (if any)
    if failure_mode_ids:
        modes = session.exec(
            select(FailureMode).where(FailureMode.id.in_(failure_mode_ids))
        ).all()

        if len(modes) != len(set(failure_mode_ids)):
            raise HTTPException(status_code=400, detail="One or more failure mode IDs are invalid")

        for m in modes:
            # robustly normalize enum or string to an UPPER string
            mtype = getattr(m.type, "value", m.type)
            mtype = str(mtype).upper()

            if mtype == "CONNECTOR" and not data.get("connector"):
                raise HTTPException(
                    status_code=400,
                    detail=f"'{m.label}' requires a connector, but connector=False on this specimen."
                )
            if mtype == "DOWEL" and not data.get("dowel"):
                raise HTTPException(
                    status_code=400,
                    detail=f"'{m.label}' requires a dowel, but dowel=False on this specimen."
                )

        for mode in modes:
            session.add(
                SpecimenFailureMode(specimen_id=specimen.id, failure_mode_id=mode.id)
            )
    
    # Attach fastener types (if any)
    if fastener_type_ids:
        fastener_type_objs = session.exec(
            select(FastenerType).where(FastenerType.id.in_(fastener_type_ids))
        ).all()
        
        if len(fastener_type_objs) != len(set(fastener_type_ids)):
            raise HTTPException(status_code=400, detail="One or more fastener type IDs are invalid")
        
        for fastener_type_obj in fastener_type_objs:
            session.add(SpecimenFastenerType(specimen_id=specimen.id, fastener_type_id=fastener_type_obj.id))
    

    # Attach loading directions
    if loading_direction_ids:
        ldirs = session.exec(
            select(LoadingDirection).where(LoadingDirection.id.in_(loading_direction_ids))
        ).all()
        if len(ldirs) != len(set(loading_direction_ids)):
            raise HTTPException(status_code=400, detail="One or more loading direction IDs are invalid")
        for ld in ldirs:
            session.add(SpecimenLoadingDirection(specimen_id=specimen.id, loading_direction_id=ld.id))
    

    session.commit()
    session.refresh(specimen)
    return specimen

def update_specimen(*, session: Session, specimen_in: SpecimenUpdate, id: uuid.UUID) -> Any:
    """
    Update a specimen.
    """
    specimen = session.get(Specimen, id)
    if not specimen:
        raise HTTPException(status_code=404, detail="Specimen not found")

    # Separate normal fields from failure modes
    update_dict = specimen_in.model_dump(exclude={"e_qualitative_failure_measure", "fastener_type_ids"}, exclude_unset=True)
    failure_mode_ids = specimen_in.e_qualitative_failure_measure
    fastener_type_ids_in = specimen_in.fastener_type_ids
    loading_direction_ids_in = specimen_in.loading_direction_ids


    # Current links
    current_fastener_type_ids = {
        row.fastener_type_id
        for row in session.exec(
            select(SpecimenFastenerType).where(SpecimenFastenerType.specimen_id == specimen.id)
        ).all()
    }
    if fastener_type_ids_in is not None:
        proposed_ft_ids = set(fastener_type_ids_in)
    else:
        proposed_ft_ids = current_fastener_type_ids

    # If any of dowel/joinery/sub-joinery/fasteners change, validate
    if (
        ("sub_joinery_type_id" in update_dict)
        or ("joinery_type_id" in update_dict)
        or ("dowel" in update_dict)
        or (fastener_type_ids_in is not None)
    ):        
        # Determine proposed values (use current if not provided)
        proposed_dowel = update_dict.get("dowel", specimen.dowel)
        proposed_joinerytype_id = update_dict.get("joinery_type_id", specimen.joinery_type_id)
        proposed_sub_id = update_dict.get("sub_joinery_type_id", getattr(specimen, "sub_joinery_type_id", None))

        # Validate joinery_type exists (if we have/keep an id)
        if proposed_joinerytype_id is None:
            raise HTTPException(status_code=400, detail="joinery_type id is required")
        joinerytype_obj = session.get(JoineryType, proposed_joinerytype_id)
        if joinerytype_obj is None:
            raise HTTPException(status_code=400, detail="joinery_type id not found")
        
        # If a sub-joinery is set/proposed, ensure it exists and belongs to the joinery_type
        if proposed_sub_id is not None:
            proposed_sub_obj = session.get(SubJoineryType, proposed_sub_id)
            if proposed_sub_obj is None:
                raise HTTPException(status_code=400, detail="sub_joinery_type id not found")
            if proposed_sub_obj.joinery_type_id != proposed_joinerytype_id:
                raise HTTPException(
                    status_code=400,
                    detail="Mismatch: selected sub_joinery_type does not belong to the selected joinery_type",
                )

        # Enforce dowel rule vs joinery_type.has_dowel
        if bool(proposed_dowel) != bool(joinerytype_obj.has_dowel):
            if proposed_dowel:
                detail_msg = "This specimen is marked as having a dowel, but the selected joinery type does not allow dowels."
            else:
                detail_msg = "This specimen is marked as not having a dowel, but the selected joinery type requires dowels."
            raise HTTPException(status_code=400, detail=detail_msg)

        # Enforce dowel vs fastener types
        if proposed_dowel and not proposed_ft_ids:
            raise HTTPException(status_code=400, detail="At least one fastener type is required when dowel is true.")
        if (not proposed_dowel) and proposed_ft_ids:
            raise HTTPException(status_code=400, detail="Remove fastener types when dowel is false.")

        # If only dowel/connector toggles changed (no new failure_mode_ids provided),
        # validate current failure modes still compatible with the proposed toggles.
        if failure_mode_ids is None and ("dowel" in update_dict or "connector" in update_dict):
            proposed_connector = update_dict.get("connector", getattr(specimen, "connector", False))
            # Load current failure modes
            current_modes = session.exec(
                select(FailureMode).join(SpecimenFailureMode).where(SpecimenFailureMode.specimen_id == specimen.id)
            ).all()
            for m in current_modes:
                mtype = getattr(m.type, "value", m.type)
                mtype = str(mtype).upper()
                if mtype == "CONNECTOR" and not proposed_connector:
                    raise HTTPException(
                        status_code=400,
                        detail=f"'{m.label}' requires a connector, but connector=False under proposed update."
                    )
                if mtype == "DOWEL" and not proposed_dowel:
                    raise HTTPException(
                        status_code=400,
                        detail=f"'{m.label}' requires a dowel, but dowel=False under proposed update."
                    )

    # Update standard fields
    specimen.sqlmodel_update(update_dict)
    session.add(specimen)

    # Attach failure modes (if any)
    if failure_mode_ids is not None:
        updated_modes = []
        if failure_mode_ids:
            updated_modes = session.exec(
                select(FailureMode).where(FailureMode.id.in_(failure_mode_ids))
            ).all()
            if len(updated_modes) != len(set(failure_mode_ids)):
                raise HTTPException(status_code=400, detail="One or more failure mode IDs are invalid")

        # Validate updated failure modes vs the *proposed* toggles (fall back to current on missing)
        proposed_dowel = update_dict.get("dowel", specimen.dowel)
        proposed_connector = update_dict.get("connector", getattr(specimen, "connector", False))

        for m in updated_modes:
            mtype = getattr(m.type, "value", m.type)
            mtype = str(mtype).upper()
            if mtype == "CONNECTOR" and not proposed_connector:
                raise HTTPException(
                    status_code=400,
                    detail=f"'{m.label}' requires a connector, but connector=False under proposed update."
                )
            if mtype == "DOWEL" and not proposed_dowel:
                raise HTTPException(
                    status_code=400,
                    detail=f"'{m.label}' requires a dowel, but dowel=False under proposed update."
                )

        current_ids = {
            row.failure_mode_id
            for row in session.exec(
                select(SpecimenFailureMode).where(SpecimenFailureMode.specimen_id == specimen.id)
            ).all()
        }
        new_ids = {m.id for m in updated_modes}
        to_add = new_ids - current_ids
        to_remove = current_ids - new_ids

        if to_remove:
            session.exec(
                delete(SpecimenFailureMode)
                .where(SpecimenFailureMode.specimen_id == specimen.id)
                .where(SpecimenFailureMode.failure_mode_id.in_(to_remove))
            )
        for mid in to_add:
            session.add(SpecimenFailureMode(specimen_id=specimen.id, failure_mode_id=mid))
    
    # Attach fastener types (if any)
    if fastener_type_ids_in is not None:
        # Validate existence
        fastener_type_objs = []
        if fastener_type_ids_in:
            fastener_type_objs = session.exec(
                select(FastenerType).where(FastenerType.id.in_(fastener_type_ids_in))
            ).all()
            if len(fastener_type_objs) != len(set(fastener_type_ids_in)):
                raise HTTPException(status_code=400, detail="One or more fastener type IDs are invalid")

        new_fastener_type_ids = set(fastener_type_obj.id for fastener_type_obj in fastener_type_objs)
        to_add_fastener_types = new_fastener_type_ids - current_fastener_type_ids
        to_remove_fastener_types = current_fastener_type_ids - new_fastener_type_ids

        if to_remove_fastener_types:
            session.exec(
                delete(SpecimenFastenerType)
                .where(SpecimenFastenerType.specimen_id == specimen.id)
                .where(SpecimenFastenerType.fastener_type_id.in_(to_remove_fastener_types))
            )
        for fid in to_add_fastener_types:
            session.add(SpecimenFastenerType(specimen_id=specimen.id, fastener_type_id=fid))    

    # Attach loading directions (if any)
    if loading_direction_ids_in is not None:
        # Validate existence
        ldir_objs = []
        if loading_direction_ids_in:
            ldir_objs = session.exec(
                select(LoadingDirection).where(LoadingDirection.id.in_(loading_direction_ids_in))
            ).all()

            if len(ldir_objs) != len(set(loading_direction_ids_in)):
                raise HTTPException(status_code=400, detail="One or more loading direction IDs are invalid")

        current_ld_ids = {
            row.loading_direction_id
            for row in session.exec(
                select(SpecimenLoadingDirection).where(SpecimenLoadingDirection.specimen_id == specimen.id)
            ).all()
        }
        new_ld_ids = {ld.id for ld in ldir_objs}
        to_add = new_ld_ids - current_ld_ids
        to_remove = current_ld_ids - new_ld_ids

        if to_remove:
            session.exec(
                delete(SpecimenLoadingDirection)
                .where(SpecimenLoadingDirection.specimen_id == specimen.id)
                .where(SpecimenLoadingDirection.loading_direction_id.in_(to_remove))
            )
        for lid in to_add:
            session.add(SpecimenLoadingDirection(specimen_id=specimen.id, loading_direction_id=lid))

    session.commit()
    session.refresh(specimen)
    return specimen

def delete_specimen(*, session: Session, id: uuid.UUID) -> Any:
    specimen = session.get(Specimen, id)
    if not specimen:
        raise HTTPException(status_code=404, detail="Specimen not found")

    session.delete(specimen)
    session.commit()

    return {"message": "Failure mode deleted successfully"}


def get_fastener_types(*, session: Session, skip: int = 0, limit: int = 100) -> FastenerTypes:
    count_statement = select(func.count()).select_from(FastenerType)
    count = session.exec(count_statement).one()
    statement = select(FastenerType).offset(skip).limit(limit)
    fastener_types = session.exec(statement).all()

    return FastenerTypes(data=fastener_types, count=count)

def create_fastener_type(*, session: Session, fastener_type_in: FastenerTypeCreate) -> FastenerType:
    
    # Check if label already exists
    existing = session.exec(
        select(FastenerType).where(FastenerType.label == fastener_type_in.label)
    ).first()

    if existing:
        raise HTTPException(
            status_code=400, detail=f"Fastener type with label '{fastener_type_in.label}' already exists"
        )

    data = fastener_type_in.dict()
    fastener_type = FastenerType(**data)
    session.add(fastener_type)
    session.commit()
    
    session.refresh(fastener_type)
    return fastener_type

def update_fastener_type(*, session: Session, fastener_type_in: FastenerTypeCreate, id: uuid.UUID) -> Any:
    fastener_type = session.get(FastenerType, id)
    if not fastener_type:
        raise HTTPException(status_code=404, detail="Fastener type not found")
    
    # Apply only provided fields
    data = fastener_type_in.model_dump(exclude_unset=True)

    fastener_type.sqlmodel_update(data)   # update existing row
    session.add(fastener_type)
    session.commit()
    session.refresh(fastener_type)
    return fastener_type

def delete_fastener_type(*, session: Session, id: uuid.UUID) -> Any:
    fastener_type = session.get(FastenerType, id)
    if not fastener_type:
        raise HTTPException(status_code=404, detail="Fastener type not found")
    
    session.delete(fastener_type)
    session.commit()
    return {"message": "Fastener type deleted successfully"}