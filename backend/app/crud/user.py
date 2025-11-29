import uuid
from typing import Any, Optional

from sqlmodel import func, select, Session
from sqlalchemy.exc import IntegrityError

from app.core.security import get_password_hash, verify_password
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate, UsersPublic

def authenticate(*, session: Session, email: str, password: str) -> User | None:
    db_user = get_user_by_email(session=session, email=email)
    if not db_user:
        return None
    if not verify_password(password, db_user.hashed_password):
        return None
    return db_user

def get_user(*, session: Session, user_id: uuid.UUID) -> User | None:
    return session.get(User, user_id)

def get_all_users(*, session: Session, skip: int = 0, limit: int = 100) -> UsersPublic:
    count_statement = select(func.count()).select_from(User)
    count = session.exec(count_statement).one()

    statement = select(User).offset(skip).limit(limit)
    users = session.exec(statement).all()

    return UsersPublic(data=users, count=count)

def get_user_by_email(*, session: Session, email: str) -> User | None:
    statement = select(User).where(User.email == email)
    return session.exec(statement).first()
    
def is_email_taken(
    *,
    session: Session,
    email: str,
    exclude_user_id: Optional[uuid.UUID] = None,
) -> bool:
    """Pure helper, returns True if email is in use by someone else."""
    existing = get_user_by_email(session=session, email=email)
    return bool(existing and existing.id != exclude_user_id)

def create_user(*, session: Session, user_create: UserCreate) -> User:
    user = User.model_validate(
        user_create,
        update={"hashed_password": get_password_hash(user_create.password)},
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

def update_user(*, session: Session, db_user: User, user_in: UserUpdate) -> User:
    update_data = user_in.model_dump(exclude_unset=True)

    extra_data: dict[str, Any] = {}
    if "password" in update_data:
        password = update_data["password"]
        hashed_password = get_password_hash(password)
        extra_data["hashed_password"] = hashed_password

    db_user.sqlmodel_update(update_data, update=extra_data)
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user

def delete_user(*, session: Session, user: User) -> None:
    session.delete(user)
    try:
        session.commit()
    except IntegrityError:
        session.rollback()
        raise ValueError("User cannot be deleted because they still own one or more specimens.")