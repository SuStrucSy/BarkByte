from sqlmodel import Session, create_engine, select

from app import crud
from app.core.config import settings
from app.models import User, UserCreate, FailureMode

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
  user = init_add_admin_user(session)
  init_failure_modes(session)

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

    # 🚨 wait, do I need to populate SpecimenFailureMode??

    failure_modes = session.exec(select(FailureMode)).all()
    if not failure_modes:
        failure_modes_data = [
            {"label": "Tension Parallel"},
            {"label": "Tension Perpendicular"},
            {"label": "Compression Parallel"},
            {"label": "Compression Perpendicular"},
            {"label": "Shear"},
            {"label": "Rolling Shear"},
            {"label": "Longitudinal Shear"},
            {"label": "Bending"},
            {"label": "Other (special case): Specify below"},
        ]
        for mode in failure_modes_data:
            failure_mode = FailureMode(**mode)
            session.add(failure_mode)
        session.commit()