import logging

from sqlmodel import Session, create_engine, select

from app.crud import user as user_crud
from app.crud import doi as doi_crud
from app.crud import specimen as specimen_crud
from app.core.config import settings
from app.models.user import User
from app.models.failuremode import FailureMode
from app.models.specimen_failuremode import SpecimenFailureMode
from app.models.joinerytype import JoineryType
from app.models.subjoinerytype import SubJoineryType
from app.models.fastenertype import FastenerType
from app.models.loadingdirection import LoadingDirection

from app.schemas.user import UserCreate
from app.schemas.specimen import SpecimenCreate
from app.schemas.doi import DOICreate

# configure once at startup
logging.basicConfig(
    level=logging.INFO,  # minimum level to display
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
    admin_user = init_add_admin_user(session)
    init_failure_modes(session)
    init_joinery_types(session)
    init_subjoinery_types(session)
    init_fasteners(session)
    init_loading_directions(session)
def init_example_specimen(session: Session, admin_user: User) -> None:
    # This function is called to create an example specimen
    # It should be called only once, when the database is initialized
    doi_in = DOICreate(
        link="https://doi.org/10.1234/exampledoi",
        ref_title="Example DOI Reference Title",
        authors="Doe, J.; Smith, A.",
        pub_year=2024,
    )

    doi = doi_crud.create_doi(session=session, doi_in=doi_in)

    failure_mode_in = []
    failure_mode_in.append(
        session.exec(
            select(FailureMode).where(FailureMode.label == "Wood: Tension Parallel")
        )
        .first()
        .id
    )
    failure_mode_in.append(
        session.exec(
            select(FailureMode).where(FailureMode.label == "Dowel: Plastic Yield")
        )
        .first()
        .id
    )

    fastener_type_in = []
    fastener_type_in.append(
        session.exec(select(FastenerType).where(FastenerType.label == "Nail"))
        .first()
        .id
    )

    loading_direction_in = []
    loading_direction_in.append(
        session.exec(
            select(LoadingDirection).where(LoadingDirection.label == "In-Plane Tension")
        )
        .first()
        .id
    )
    loading_direction_in.append(
        session.exec(
            select(LoadingDirection).where(
                LoadingDirection.label == "Out-of-Plane Tension"
            )
        )
        .first()
        .id
    )

    joinery_type_in = (
        session.exec(select(JoineryType).where(JoineryType.label == "Angle Bracket"))
        .first()
        .id
    )

    sub_joinery_type_in = (
        session.exec(
            select(SubJoineryType).where(
                SubJoineryType.label == "AB:Proprietary Angle Bracket"
            )
        )
        .first()
        .id
    )

    specimen_in = SpecimenCreate(
        specimen_reference_id="EX123",
        replicate_tests=3,
        note="This is an example specimen.",
        assembly_type="Wall-Wall",
        practice="Conventional",
        connection_description="Example connection description.",
        element_dimension="50x100 mm",
        fastener_numbers=10,
        moisture_percentage="12%",
        wood_type="Pine",
        wood_mechanical_properties="Standard properties",
        connector_mechanical_properties="Standard properties",
        fastener_mechanical_properties="Standard properties",
        e_date="2024-01-01",
        e_test_loading_type="Cyclic",
        e_yield_point_method="CEN 1/6",
        e_stiffness=1500.0,
        e_yield_displacement=5.0,
        e_yield_force=2000.0,
        e_max_displacement=10.0,
        e_max_force=3000.0,
        e_ultimate_displacement=15.0,
        e_ultimate_force=3500.0,
        e_ductility=3.0,
        e_measurement_unit="mm",
        e_qfm_description="Qualitative failure measure description.",
        dowel=True,
        connector=True,
        doi_id=doi.id,
        e_qualitative_failure_measure=failure_mode_in,
        fastener_type_ids=fastener_type_in,
        loading_direction_ids=loading_direction_in,
        joinery_type_id=joinery_type_in,
        sub_joinery_type_id=sub_joinery_type_in,
    )

    specimen_in_2 = SpecimenCreate(
        specimen_reference_id="EX124",
        replicate_tests=3,
        note="This is another example specimen.",
        assembly_type="Wall-Wall",
        practice="Conventional",
        connection_description="Example connection description.",
        element_dimension="50x100 mm",
        fastener_numbers=10,
        moisture_percentage="12%",
        wood_type="Pine",
        wood_mechanical_properties="Standard properties",
        connector_mechanical_properties="Standard properties",
        fastener_mechanical_properties="Standard properties",
        e_date="2024-01-01",
        e_test_loading_type="Cyclic",
        e_yield_point_method="CEN 1/6",
        e_stiffness=1500.0,
        e_yield_displacement=5.0,
        e_yield_force=2000.0,
        e_max_displacement=10.0,
        e_max_force=3000.0,
        e_ultimate_displacement=15.0,
        e_ultimate_force=3500.0,
        e_ductility=3.0,
        e_measurement_unit="mm",
        e_qfm_description="Qualitative failure measure description.",
        dowel=True,
        connector=True,
        doi_id=doi.id,
        e_qualitative_failure_measure=failure_mode_in,
        fastener_type_ids=fastener_type_in,
        loading_direction_ids=loading_direction_in,
        joinery_type_id=joinery_type_in,
        sub_joinery_type_id=sub_joinery_type_in,
    )

    specimen_crud.create_specimen(session=session, specimen_in=specimen_in, current_user_id=admin_user.id)
    specimen_crud.create_specimen(session=session, specimen_in=specimen_in_2, current_user_id=admin_user.id)

def init_add_admin_user(session: Session) -> User | None:
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
        return user_crud.create_user(session=session, user_create=user_in)


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
            {"label": "Wood: Other Shear", "type": "WOOD"},
            {"label": "Wood: Longitudinal Shear", "type": "WOOD"},
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
                    session.add(
                        SubJoineryType(
                            joinery_type_id=joinery_type.id,
                            label=sub_joinery_type_label,
                        )
                    )

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
            {"label": "Adhesive"},
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
            {"label": "Out-of-Plane Tension"},
        ]
        for loading_direction_data in loading_directions_data:
            loading_direction = LoadingDirection(**loading_direction_data)
            session.add(loading_direction)
        session.commit()
