from sqlmodel import Session, create_engine, select

from app.crud import crud
from app.core.config import settings
from app.models import User, UserCreate, FailureMode, JoineryType, SubJoineryType, FastenerType, LoadingDirection, SpecimenCreate

import csv
import os
import uuid

import logging

# configure once at startup
logging.basicConfig(
    level=logging.INFO,                          # minimum level to display
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

engine = create_engine(str(settings.SQLALCHEMY_DATABASE_URI))


# make sure all SQLModel models are imported (app.models) before initializing DB
# otherwise, SQLModel might fail to initialize relationships properly
# for more details: https://github.com/fastapi/full-stack-fastapi-template/issues/28

def init_db(session: Session) -> None:
    # Tables should be created with Alembic migrations
    # But if you don't want to use migrations, create
    # the tables un-commenting the next lines
    # from sqlmodel import SQLModel

    # This works because the models are already imported and registered from app.models
    # SQLModel.metadata.create_all(engine)
    init_add_admin_user(session)
    init_failure_modes(session)
    init_joinery_types(session)
    init_subjoinery_types(session)
    init_fasteners(session)
    init_loading_directions(session)

def init_add_admin_user(session: Session) -> None:
    # This function is called to create the admin user
    # It should be called only once, when the database is initialized
    user = session.exec(
        select(User).where(User.email == settings.FIRST_SUPERUSER)
    ).first()
    if not user:
        user_in = UserCreate(
            email=settings.FIRST_SUPERUSER,
            password=settings.FIRST_SUPERUSER_PASSWORD,
            is_superuser=True,
            is_active=True,
        )
        return crud.create_user(session=session, user_create=user_in)

def init_failure_modes(session: Session) -> None:
    # This function is called to create the failure modes
    # It should be called only once, when the database is initialized

    failure_modes = session.exec(select(FailureMode)).all()
    if not failure_modes:
        failure_modes_data = [
            {"label": "Wood: Tension Parallel", "type": "WOOD"},
            {"label": "Wood: Tension Perpendicular", "type": "WOOD"},
            {"label": "Wood: Compression Parallel", "type": "WOOD"},
            {"label": "Wood: Compression Perpendicular", "type": "WOOD"},
            {"label": "Wood: Shear", "type": "WOOD"},
            {"label": "Wood: Rolling Shear", "type": "WOOD"},
            {"label": "Dowel: Plastic Yield", "type": "DOWEL"},
            {"label": "Dowel: Failure", "type": "DOWEL"},
            {"label": "Dowel: Pullout", "type": "DOWEL"},
            {"label": "Connector: Local Buckling or Bending", "type": "CONNECTOR"},
            {"label": "Connector: Shear", "type": "CONNECTOR"},
            {"label": "Connector: Yield", "type": "CONNECTOR"},
            {"label": "Connector: Failure", "type": "CONNECTOR"},
            {"label": "Connector: Fuse Yield", "type": "CONNECTOR"},
            {"label": "Bending", "type": "OTHER"},
        ]
        for mode in failure_modes_data:
            failure_mode = FailureMode(**mode)
            session.add(failure_mode)
        session.commit()

def init_joinery_types(session: Session) -> None:
    # This function is called to create the joinery types
    # It should be called only once, when the database is initialized    

    joinery_types = session.exec(select(JoineryType)).all()
    if not joinery_types:
        joinery_types_data = [
            {"label": "Angle Bracket", "has_dowel": True},
            {"label": "Butt Joint", "has_dowel": True},
            {"label": "Half-lap Joint", "has_dowel": True},
            {"label": "Hold-down", "has_dowel": True},
            {"label": "Plate", "has_dowel": True},
            {"label": "Spline Joint", "has_dowel": True},
            {"label": "Slot Joint", "has_dowel": False},
            {"label": "Through Tenon", "has_dowel": False},
        ]
        for mode in joinery_types_data:
            joinery_type = JoineryType(**mode)
            session.add(joinery_type)
        session.commit()

def init_subjoinery_types(session: Session) -> None:
    # This function is called to create the sub-joinery types
    # It should be called only once, when the database is initialized    

    subjoinery_types = session.exec(select(SubJoineryType)).all()
    if not subjoinery_types:
        sub_map = {
            "Slot Joint": [
                "SL:Metal Slot",
                "SL:Wood Slot",
            ],
            "Through Tenon": [
                "TT:Inclined",
                "TT:Straight",
            ],
            "Spline Joint": [
                "SP:Single-sided Spline",
                "SP:Double-sided Spline",
            ],
            "Half-lap Joint": [
                "HL:Standard Half-lap",
                "HL:Tongue & Groove (T&G)",
            ],
            "Angle Bracket": [
                "AB:Proprietary Angle Bracket",
                "AB:Perforated Angle Bracket",
                "AB:Elastomeric Angle Bracket",
            ],
            "Hold-down": [
                "HD:Proprietary Hold-down",
                "HD:Elastomeric Hold-down",
                "HD:Perforated Hold-down",
                "HD:Other",
            ],
            "Plate": [
                "PL:Knife Plate",
                "PL:Perforated Knife Plate",
                "PL:Double Surface plate",
                "PL:Other",
                "PL:Perforated Double-side Plate",
                "PL:Double-side Plate",
            ],
            "Butt Joint": [
                "BJ:Standard Butt Joint",
            ],
        }
        
        for joinery_type_label, sub_joinery_type_labels in sub_map.items():
            joinery_type = session.exec(
                select(JoineryType).where(JoineryType.label == joinery_type_label)
            ).one_or_none()

            if not joinery_type:
                raise RuntimeError(
                    f"JoineryType '{joinery_type_label}' not found. "
                    "Ensure init_joinery_types(session) ran first."
                )

            for sub_joinery_type_label in sub_joinery_type_labels:
                # Idempotent insert: skip if it already exists for this parent
                exists = session.exec(
                    select(SubJoineryType).where(
                        SubJoineryType.joinery_type_id == joinery_type.id,
                        SubJoineryType.label == sub_joinery_type_label,
                    )
                ).one_or_none()
                if not exists:
                    session.add(SubJoineryType(joinery_type_id=joinery_type.id, label=sub_joinery_type_label))

        session.commit()

def init_fasteners(session: Session) -> None:
    # This function is called to create the fastener types
    # It should be called only once, when the database is initialized

    fastener_types = session.exec(select(FastenerType)).all()
    if not fastener_types:
        fastener_types_data = [
            {"label": "Nail"},
            {"label": "Screw"},
            {"label": "Bolt"},
            {"label": "STS(Self Tap Screw)"},
            {"label": "Other"}
        ]
        for fastener_type_data in fastener_types_data:
            fastener_type = FastenerType(**fastener_type_data)
            session.add(fastener_type)
        session.commit()

def init_loading_directions(session: Session) -> None:
    # This function is called to create the loading directions
    # It should be called only once, when the database is initialized

    loading_directions = session.exec(select(LoadingDirection)).all()
    if not loading_directions:
        loading_directions_data = [
            {"label": "In-Plane Shear"},
            {"label": "Out-of-Plane Shear"},
            {"label": "In-Plane Tension"},
            {"label": "Out-of-Plane Tension"}
        ]
        for loading_direction_data in loading_directions_data:
            loading_direction = LoadingDirection(**loading_direction_data)
            session.add(loading_direction)
        session.commit()
