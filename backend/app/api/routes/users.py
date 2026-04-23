import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from jwt.exceptions import ExpiredSignatureError

from app.api.deps import CurrentUser, SessionDep, get_current_active_superuser
from app.core.config import settings
from app.core.security import get_password_hash, verify_password
from app.crud import user as user_crud
from app.models.user import User
from app.schemas.user import (
    Message,
    NewAccount,
    UpdatePassword,
    UserCreate,
    UserPublic,
    UserRegister,
    UsersPublic,
    UserUpdate,
    UserUpdateMe,
)
from app.utils import (
    generate_email_verification_token,
    generate_new_account_email,
    generate_password_reset_token,
    generate_signup_email,
    send_email,
    verify_token,
)

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
        if user_crud.is_email_taken(
            session=session, email=user_in.email, exclude_user_id=current_user.id
        ):
            raise HTTPException(
                status_code=409, detail="User with this email already exists"
            )

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


@router.delete("/me", response_model=Message)
def delete_user_me(session: SessionDep, current_user: CurrentUser) -> Any:
    """
    Delete own user.
    """
    user_in = UserUpdateMe(is_active=False)
    user_crud.update_user(session=session, user_in=user_in, db_user=current_user)

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


@router.get(
    "/{user_id}",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=UserPublic,
)
def read_user_by_id(user_id: uuid.UUID, session: SessionDep) -> UserPublic:
    """
    Get a specific user by id.
    """
    db_user = user_crud.get_user(session=session, user_id=user_id)
    if not db_user:
        raise HTTPException(
            status_code=404,
            detail="The user with this id does not exist in the system",
        )
    return db_user


@router.post(
    "/", dependencies=[Depends(get_current_active_superuser)], response_model=UserPublic
)
def create_user(*, session: SessionDep, user_in: UserCreate) -> UserPublic:
    """
    Create new user.
    """
    if user_crud.is_email_taken(session=session, email=user_in.email):
        raise HTTPException(
            status_code=409,
            detail="User with this email already exists",
        )

    user = user_crud.create_user(session=session, user_create=user_in)
    if settings.emails_enabled and user_in.email:
        try:
            token = generate_password_reset_token(email=user.email)
            email_data = generate_new_account_email(
                email_to=user.email,
                username=user.email,
                token=token,
            )
            send_email(
                email_to=user.email,
                subject=email_data.subject,
                html_content=email_data.html_content,
            )
        except Exception as e:
            print(f"[ERROR] Failed to send create user email: {e}")
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
        if user_crud.is_email_taken(
            session=session,
            email=user_in.email,
            exclude_user_id=db_user.id,
        ):
            raise HTTPException(
                status_code=409,
                detail="User with this email already exists",
            )

    return user_crud.update_user(session=session, db_user=db_user, user_in=user_in)


@router.delete("/{user_id}", dependencies=[Depends(get_current_active_superuser)])
def delete_user(
    session: SessionDep, current_user: CurrentUser, user_id: uuid.UUID
) -> Message:
    """
    Delete a user.
    """

    user = user_crud.get_user(session=session, user_id=user_id)
    if not user:
        raise HTTPException(
            status_code=404,
            detail="The user with this id does not exist in the system",
        )

    if user == current_user:
        raise HTTPException(
            status_code=403,
            detail="Use the /users/me endpoint to delete your own account.",
        )

    if user.is_superuser:
        raise HTTPException(
            status_code=403,
            detail="You cannot delete another superuser. Superusers must delete their own account.",
        )

    has_pending_specimen_records = user_crud.has_pending_specimen_records(
        session=session, user_id=user.id
    )
    has_specimens = user_crud.has_specimens(session=session, user_id=user.id)

    if has_pending_specimen_records or has_specimens:
        user_crud.update_user(
            session=session,
            db_user=user,
            user_in=UserUpdate(is_active=False),
        )
        return Message(
            message="This user cannot be deleted because they have revision history or specimens associated with them. They have been deactivated instead."
        )
    else:
        user_crud.delete_user(session=session, user=user)
        return Message(message="User deleted successfully")


# ------------ Authentication related endpoints ------------


@router.post("/signup", response_model=Message)
def register_user(session: SessionDep, user_in: UserRegister) -> Any:
    """
    Create new user without the need to be logged in.
    """
    if user_crud.is_email_taken(session=session, email=user_in.email):
        raise HTTPException(
            status_code=409,
            detail="User with this email already exists",
        )

    user_create = UserCreate(
        email=user_in.email,
        password=user_in.password,
        full_name=user_in.full_name,
        is_active=False,
        is_superuser=False,
    )
    user_crud.create_user(session=session, user_create=user_create)

    if settings.emails_enabled and user_in.email:
        register_user_token = generate_email_verification_token(email=user_in.email)
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
        404: {"description": "The user with this email does not exist in the system."},
    },
)
def verify_email(session: SessionDep, body: NewAccount) -> Message:
    """
    verify email and reset password.
    """
    try:
        email = verify_token(body.token, "email_verification")
    except ExpiredSignatureError:
        raise HTTPException(
            status_code=410,
            detail="Verification link has expired. Please request a new one.",
        )
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


@router.post("/resend-verification", response_model=Message)
def resend_verification(session: SessionDep, email: str) -> Any:
    user = user_crud.get_user_by_email(session=session, email=email)

    # Intentionally vague to avoid email enumeration
    generic_response = Message(
        message="If this email is pending verification, a new link has been sent."
    )

    if not user or user.is_active:
        return generic_response

    if settings.emails_enabled:
        token = generate_email_verification_token(email=user.email)
        email_data = generate_signup_email(
            email_to=user.email, email=user.email, token=token
        )
        send_email(
            email_to=user.email,
            subject=email_data.subject,
            html_content=email_data.html_content,
        )

    return generic_response
