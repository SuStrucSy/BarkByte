"""merge heads

Revision ID: 00bb2bddcf1e
Revises: 1c0ad5fbc2a1, 8c113cfd9d3e
Create Date: 2025-12-18 17:26:20.146690

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = '00bb2bddcf1e'
down_revision: Union[str, None] = ('1c0ad5fbc2a1', '8c113cfd9d3e')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
