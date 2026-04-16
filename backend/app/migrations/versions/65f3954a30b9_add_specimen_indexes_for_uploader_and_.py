"""add specimen indexes for uploader and doi

Revision ID: 65f3954a30b9
Revises: a2563f8e2add
Create Date: 2026-04-16 19:07:00.216511

"""

from typing import Sequence, Union

import sqlalchemy as sa
import sqlmodel
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "65f3954a30b9"
down_revision: Union[str, None] = "a2563f8e2add"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_index(
        "idx_specimen_uploader_id",
        "specimen",
        ["uploader_id"],
    )

    op.create_index(
        "idx_specimen_doi_id",
        "specimen",
        ["doi_id"],
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index("idx_specimen_uploader_id", table_name="specimen")
    op.drop_index("idx_specimen_doi_id", table_name="specimen")
