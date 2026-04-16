"""add created_at and updated_at to specimen

Revision ID: 66e9549f6dc5
Revises: 65f3954a30b9
Create Date: 2026-04-16 19:22:27.097227

"""

from typing import Sequence, Union

import sqlalchemy as sa
import sqlmodel
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "66e9549f6dc5"
down_revision: Union[str, None] = "65f3954a30b9"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # add columns
    op.add_column(
        "specimen",
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
    )

    op.add_column(
        "specimen",
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
    )

    # 🔥 BACKFILL (important for existing rows)
    op.execute("""
        UPDATE specimen
        SET created_at = now(),
            updated_at = now()
        WHERE created_at IS NULL OR updated_at IS NULL
    """)

    # index for ordering (IMPORTANT for your pagination)
    op.create_index(
        "idx_specimen_created_at",
        "specimen",
        ["created_at"],
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index("idx_specimen_created_at", table_name="specimen")
    op.drop_column("specimen", "updated_at")
    op.drop_column("specimen", "created_at")
