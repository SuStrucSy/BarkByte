import uuid
from typing import Any, Optional

from sqlmodel import func, select, Session
from fastapi import APIRouter, Depends, HTTPException

from app.core.security import get_password_hash, verify_password
from app.models.models import User, UserCreate, UserUpdate, UsersPublic

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
    session_user = session.exec(statement).first()
    return session_user

def ensure_email_available(
    session: Session,
    email: str,
    exclude_user_id: Optional[uuid.UUID] = None,
) -> None:
    """Raise HTTPException if email is already used by another user."""
    existing = get_user_by_email(session=session, email=email)
    if existing and existing.id != exclude_user_id:
        raise HTTPException(status_code=409, detail="User with this email already exists")

def create_user(*, session: Session, user_create: UserCreate) -> User:
    ensure_email_available(session, user_create.email)
    user = User.model_validate(
        user_create, update={"hashed_password": get_password_hash(user_create.password)}
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

def update_user(*, session: Session, db_user: User, user_in: UserUpdate) -> User:
    if user_in.email:
        ensure_email_available(session, user_in.email, exclude_user_id=db_user.id)
    
    update_data = user_in.model_dump(exclude_unset=True)
    
    extra_data = {}
    if "password" in update_data:
        password = update_data["password"]
        hashed_password = get_password_hash(password)
        extra_data["hashed_password"] = hashed_password
    
    db_user.sqlmodel_update(update_data, update=extra_data)
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user


def delete_user(*, session: Session, user_id: uuid.UUID) -> Any:
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    session.delete(user)
    session.commit()
    return {"message": "User deleted successfully"}
