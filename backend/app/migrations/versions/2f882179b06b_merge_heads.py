"""merge heads

Revision ID: 2f882179b06b
Revises: 2c1937cc9803, 66e9549f6dc5
Create Date: 2026-04-16 19:59:02.805909

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = '2f882179b06b'
down_revision: Union[str, None] = ('2c1937cc9803', '66e9549f6dc5')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
