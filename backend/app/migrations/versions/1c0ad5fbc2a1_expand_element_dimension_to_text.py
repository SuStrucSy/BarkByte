"""expand element_dimension to text

Revision ID: 1c0ad5fbc2a1
Revises: 5f161af60c30
Create Date: 2025-12-18 00:00:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "1c0ad5fbc2a1"
down_revision: Union[str, None] = "5f161af60c30"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.alter_column(
        "specimen",
        "element_dimension",
        existing_type=sa.VARCHAR(length=500),
        type_=sa.Text(),
        existing_nullable=False,
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.alter_column(
        "specimen",
        "element_dimension",
        existing_type=sa.Text(),
        type_=sa.VARCHAR(length=500),
        existing_nullable=False,
    )

