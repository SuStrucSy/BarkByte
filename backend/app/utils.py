import logging
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any
from uuid import UUID

import emails
import jwt
from jinja2 import Template
from jwt.exceptions import ExpiredSignatureError, InvalidTokenError

from app.core import security
from app.core.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class EmailData:
    html_content: str
    subject: str


def generate_token(email: str, token_type: str) -> str:
    delta = timedelta(hours=settings.EMAIL_RESET_TOKEN_EXPIRE_HOURS)
    now = datetime.now(timezone.utc)
    expires = now + delta
    exp = expires.timestamp()

    return jwt.encode(
        {
            "sub": email,
            "type": token_type,  # 👈 key difference
            "nbf": now,
            "exp": exp,
        },
        settings.SECRET_KEY,
        algorithm=security.ALGORITHM,
    )


def generate_password_reset_token(email: str) -> str:
    return generate_token(email=email, token_type="password_reset")


def generate_email_verification_token(email: str) -> str:
    return generate_token(email=email, token_type="email_verification")


def generate_email_change_token(
    *, user_id: UUID, old_email: str, new_email: str
) -> str:
    delta = timedelta(hours=settings.EMAIL_RESET_TOKEN_EXPIRE_HOURS)
    now = datetime.now(timezone.utc)
    expires = now + delta

    return jwt.encode(
        {
            "sub": str(user_id),
            "type": "email_change",
            "old_email": old_email,
            "new_email": new_email,
            "nbf": now,
            "exp": expires.timestamp(),
        },
        settings.SECRET_KEY,
        algorithm=security.ALGORITHM,
    )


def verify_token(token: str, expected_type: str) -> str | None:
    try:
        decoded = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[security.ALGORITHM],
        )

        if decoded.get("type") != expected_type:
            return None

        return str(decoded["sub"])
    except ExpiredSignatureError:
        raise  # let callers handle this case explicitly
    except InvalidTokenError:
        return None


def verify_email_change_token(token: str) -> dict[str, str] | None:
    try:
        decoded = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[security.ALGORITHM],
        )

        if decoded.get("type") != "email_change":
            return None

        return {
            "user_id": str(decoded["sub"]),
            "old_email": str(decoded["old_email"]),
            "new_email": str(decoded["new_email"]),
        }
    except ExpiredSignatureError:
        raise
    except (InvalidTokenError, KeyError):
        return None


def generate_reset_password_email(email: str, username: str, token: str) -> EmailData:
    project_name = settings.PROJECT_NAME
    subject = f"{project_name} - Password recovery for user {username}"
    link = f"{settings.FRONTEND_HOST}/reset-password?token={token}"
    html_content = render_email_template(
        template_name="reset_password.html",
        context={
            "project_name": settings.PROJECT_NAME,
            "username": username,
            "email": email,
            "valid_hours": settings.EMAIL_RESET_TOKEN_EXPIRE_HOURS,
            "link": link,
            "button_text": "Reset Password",
            "logo_url": f"{settings.FRONTEND_HOST}/logo.png",
        },
    )
    return EmailData(html_content=html_content, subject=subject)


def generate_signup_email(email_to: str, email: str, token: str) -> EmailData:
    project_name = settings.PROJECT_NAME
    subject = f"{project_name} - Welcome {email}!"
    link = f"{settings.FRONTEND_HOST}/verify-email?token={token}&email={email_to}"
    print(f"{settings.FRONTEND_HOST}/logo.png")
    html_content = render_email_template(
        template_name="verify_email.html",  # TODO: need verify-email.html to be updated also!
        context={
            "project_name": settings.PROJECT_NAME,
            "username": email,
            "email": email_to,
            "valid_hours": settings.EMAIL_RESET_TOKEN_EXPIRE_HOURS,
            "link": link,
            "button_text": "Verify Email",
            "message": (
                f"Thanks for signing up for {project_name}. "
                "Please verify your email to activate your account."
            ),
            "logo_url": f"{settings.FRONTEND_HOST}/logo.png",
        },
    )
    return EmailData(html_content=html_content, subject=subject)


def generate_email_change_email(
    *, email_to: str, current_email: str, token: str, requested_by_admin: bool
) -> EmailData:
    project_name = settings.PROJECT_NAME
    subject = f"{project_name} - Verify your new email address"
    link = f"{settings.FRONTEND_HOST}/settings?emailChangeToken={token}"
    requester = "An administrator" if requested_by_admin else "You"
    html_content = render_email_template(
        template_name="verify_email.html",
        context={
            "project_name": settings.PROJECT_NAME,
            "username": current_email,
            "email": email_to,
            "valid_hours": settings.EMAIL_RESET_TOKEN_EXPIRE_HOURS,
            "link": link,
            "button_text": "Verify Email Change",
            "logo_url": f"{settings.FRONTEND_HOST}/logo.png",
            "message": (
                f"{requester} requested to change the account email from "
                f"{current_email} to {email_to}."
            ),
        },
    )
    return EmailData(html_content=html_content, subject=subject)


def render_email_template(*, template_name: str, context: dict[str, Any]) -> str:
    template_str = (
        Path(__file__).parent / "email-templates" / "build" / template_name
    ).read_text(encoding="utf-8")
    html_content = Template(template_str).render(**context)
    return html_content


def send_email(
    *,
    email_to: str,
    subject: str = "",
    html_content: str = "",
) -> None:
    assert settings.emails_enabled, "no provided configuration for email variables"
    message = emails.Message(
        subject=subject,
        html=html_content,
        mail_from=(settings.EMAILS_FROM_NAME, settings.EMAILS_FROM_EMAIL),
    )
    smtp_options = {"host": settings.SMTP_HOST, "port": settings.SMTP_PORT}
    if settings.SMTP_TLS:
        smtp_options["tls"] = True
    elif settings.SMTP_SSL:
        smtp_options["ssl"] = True
    if settings.SMTP_USER:
        smtp_options["user"] = settings.SMTP_USER
    if settings.SMTP_PASSWORD:
        smtp_options["password"] = settings.SMTP_PASSWORD
    response = message.send(to=email_to, smtp=smtp_options)
    logger.info(f"send email result: {response}")


def generate_new_account_email(email_to: str, username: str, token: str) -> EmailData:
    project_name = settings.PROJECT_NAME
    subject = f"{project_name} - New account for user {username}"
    link = f"{settings.FRONTEND_HOST}/set-password?token={token}&email={email_to}"
    html_content = render_email_template(
        template_name="new_account.html",
        context={
            "project_name": settings.PROJECT_NAME,
            "username": username,
            "email": email_to,
            "valid_hours": settings.EMAIL_RESET_TOKEN_EXPIRE_HOURS,
            "link": link,
            "logo_url": f"{settings.FRONTEND_HOST}/logo.png",
        },
    )
    return EmailData(html_content=html_content, subject=subject)
