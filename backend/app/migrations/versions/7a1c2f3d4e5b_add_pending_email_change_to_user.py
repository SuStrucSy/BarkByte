"""add pending email change to user

Revision ID: 7a1c2f3d4e5b
Revises: 2f882179b06b
Create Date: 2026-07-16 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = "7a1c2f3d4e5b"
down_revision: Union[str, None] = "2f882179b06b"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        "user",
        sa.Column(
            "pending_email",
            sqlmodel.sql.sqltypes.AutoString(length=255),
            nullable=True,
        ),
    )
    op.add_column(
        "user",
        sa.Column("pending_email_requested_at", sa.DateTime(), nullable=True),
    )
    op.create_index(
        op.f("ix_user_pending_email"),
        "user",
        ["pending_email"],
        unique=True,
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f("ix_user_pending_email"), table_name="user")
    op.drop_column("user", "pending_email_requested_at")
    op.drop_column("user", "pending_email")
