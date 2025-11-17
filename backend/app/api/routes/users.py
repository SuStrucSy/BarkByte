import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import func, select

from app.crud import user as user_crud
from app.api.deps import (
    CurrentUser,
    SessionDep,
    get_current_active_superuser,
)
from app.core.config import settings
from app.core.security import get_password_hash, verify_password
from app.models.models import (
    Message,
    UpdatePassword,
    User,
    UserCreate,
    UserPublic,
    UserRegister,
    UsersPublic,
    UserUpdate,
    UserUpdateMe,
    NewAccount
)
from app.utils import verify_password_reset_token, generate_new_account_email, generate_password_reset_token, send_email, generate_signup_email

router = APIRouter(prefix="/users", tags=["users"])

# ------------ Current user endpoints ------------

@router.get("/me", response_model=UserPublic)
def read_user_me(current_user: CurrentUser) -> Any:
    """
    Get current user.
    """
    return current_user

@router.patch("/me", response_model=UserPublic)
def update_user_me(
    *, session: SessionDep, user_in: UserUpdateMe, current_user: CurrentUser
) -> User:
    """
    Update own user.
    """
    if user_in.email:
        user_crud.ensure_email_available(session, user_in.email, exclude_user_id=current_user.id)
    
    return user_crud.update_user(session=session, db_user=current_user, user_in=user_in)

@router.patch("/me/password", response_model=Message)
def update_password_me(
    *, session: SessionDep, body: UpdatePassword, current_user: CurrentUser
) -> Any:
    """
    Update own password.
    """
    if not verify_password(body.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect password")
    if body.current_password == body.new_password:
        raise HTTPException(
            status_code=400, detail="New password cannot be the same as the current one"
        )
    hashed_password = get_password_hash(body.new_password)
    current_user.hashed_password = hashed_password
    session.add(current_user)
    session.commit()
    return Message(message="Password updated successfully")

@router.delete("/me", dependencies=[Depends(get_current_active_superuser)], response_model=Message)
def delete_user_me(session: SessionDep, current_user: CurrentUser) -> Any:
    """
    Delete own user.
    """

    session.delete(current_user)
    session.commit()
    return Message(message="User deleted successfully")

# ------------ General Users endpoints ------------

@router.get(
    "/",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=UsersPublic,
)
def read_users(session: SessionDep, skip: int = 0, limit: int = 100) -> UserPublic:
    """
    Retrieve users.
    """

    return user_crud.get_all_users(session=session, skip=skip, limit=limit)

@router.get("/{user_id}", response_model=UserPublic)
def read_user_by_id(user_id: uuid.UUID, session: SessionDep) -> UserPublic:
    """
    Get a specific user by id.
    """

    return user_crud.get_user(session=session, user_id=user_id)

@router.post("/", dependencies=[Depends(get_current_active_superuser)], response_model=UserPublic)
def create_user(*, session: SessionDep, user_in: UserCreate) -> UserPublic:
    """
    Create new user.
    """
    user_crud.ensure_email_available(session, user_in.email)
    user = user_crud.create_user(session=session, user_create=user_in)
    if settings.emails_enabled and user_in.email:
        email_data = generate_new_account_email(
            email_to=user_in.email, username=user_in.email, password=user_in.password
        )
        send_email(
            email_to=user_in.email,
            subject=email_data.subject,
            html_content=email_data.html_content,
        )
    return user

@router.patch(
    "/{user_id}",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=UserPublic,
)
def update_user(
    *,
    session: SessionDep,
    user_id: uuid.UUID,
    user_in: UserUpdate,
) -> Any:
    """
    Update a user.
    """
    db_user = user_crud.get_user(session=session, user_id=user_id)
    if not db_user:
        raise HTTPException(
            status_code=404,
            detail="The user with this id does not exist in the system",
        )
    if user_in.email:
        user_crud.ensure_email_available(session, user_in.email, exclude_user_id=db_user.id)

    return user_crud.update_user(session=session, db_user=db_user, user_in=user_in)

@router.delete("/{user_id}", dependencies=[Depends(get_current_active_superuser)])
def delete_user(
    session: SessionDep, current_user: CurrentUser, user_id: uuid.UUID
) -> Message:
    """
    Delete a user.
    """
    user = user_crud.get_user(session=session, user_id=user_id)
    if user == current_user:
        raise HTTPException(
            status_code=403, detail="Super users are not allowed to delete themselves"
        )
    
    return user_crud.delete_user(session=session, user_id=user_id)

# ------------ Authentication related endpoints ------------

@router.post("/signup", response_model=Message)
def register_user(session: SessionDep, user_in: UserRegister) -> Any:
    """
    Create new user without the need to be logged in.
    """
    user_crud.ensure_email_available(session, user_in.email)

    user_create = UserCreate.model_validate(user_in)
    user_crud.create_user(session=session, user_create=user_create)
    
    if settings.emails_enabled and user_in.email:
        register_user_token = generate_password_reset_token(email=user_in.email) # TODO: have to change the name
        email_data = generate_signup_email(
            email_to=user_in.email, email=user_in.email, token=register_user_token
        )
        send_email(
            email_to=user_in.email,
            subject=email_data.subject,
            html_content=email_data.html_content,
        )

    return Message(message="Please check your email to validate your account.")

@router.post(
    "/verify-email/",
    responses={
        400: {"description": "Invalid token or inactive user"},
        404: {"description": "The user with this email does not exist in the system."}
    }
)
def verify_email(session: SessionDep, body: NewAccount) -> Message:
    """
    verify email and reset password.
    """
    email = verify_password_reset_token(token=body.token)
    if not email:
        raise HTTPException(status_code=400, detail="Invalid token")
    user = user_crud.get_user_by_email(session=session, email=email)
    if not user:
        raise HTTPException(
            status_code=404,
            detail="The user with this email does not exist in the system.",
        )
    elif user.is_active:
        raise HTTPException(status_code=400, detail="This account is already active.")
    
    user.is_active = True
    session.add(user)
    session.commit()
    return Message(message="User account activated successfully.")

