"""add joinery type

Revision ID: 4b0e92013309
Revises: 29cad80d2c42
Create Date: 2025-09-09 14:15:55.853795

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '4b0e92013309'
down_revision: Union[str, None] = '29cad80d2c42'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


old_enum = sa.Enum('HOLDOWN', 'SPLINEJOINT', name='joinerytype', create_type=False)

def upgrade() -> None:
    # 1) Make sure nothing depends on the old ENUM
    op.alter_column(
        'specimen',
        'joinery_type',
        type_=sa.String(length=255),
        existing_type=old_enum,
        existing_nullable=True,  # set to your real nullability
    )

    # 2) Drop the ENUM now that no columns use it
    op.execute('DROP TYPE IF EXISTS "joinerytype"')

    # 3) Create the new table with the same name as the old ENUM
    op.create_table(
        'joinerytype',
        sa.Column('id', sa.UUID(), primary_key=True, nullable=False),
        sa.Column('label', sa.String(length=255), nullable=False),
        sa.Column('has_dowel', sa.Boolean(), nullable=False),
        sa.UniqueConstraint('label'),
    )

def downgrade() -> None:
    # reverse order
    op.drop_table('joinerytype')

    # recreate the ENUM if you truly want full downgrade support
    op.execute("CREATE TYPE joinerytype AS ENUM ('HOLDOWN','SPLINEJOINT')")

    op.alter_column(
        'specimen',
        'joinery_type',
        type_=old_enum,
        existing_type=sa.String(length=255),
        existing_nullable=True,  # match your schema
    )