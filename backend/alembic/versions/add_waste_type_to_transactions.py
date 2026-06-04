"""Add waste_type enum to transactions

Revision ID: add_waste_type_001
Revises: merge_heads_001
Create Date: 2026-06-04 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

revision = 'add_waste_type_001'
down_revision = 'merge_heads_001'
branch_labels = None
depends_on = None


def upgrade():
    # Create the enum type first (idempotent)
    waste_type_enum = sa.Enum(
        'plastic', 'organic', 'paper', 'other',
        name='wastetype'
    )
    waste_type_enum.create(op.get_bind(), checkfirst=True)

    # Add column only if it doesn't already exist
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing_cols = [c['name'] for c in inspector.get_columns('transactions')]
    if 'waste_type' not in existing_cols:
        op.add_column(
            'transactions',
            sa.Column(
                'waste_type',
                sa.Enum('plastic', 'organic', 'paper', 'other', name='wastetype'),
                nullable=True,
                server_default='plastic',
            )
        )
    else:
        # Column exists as String — alter to enum type
        op.execute(
            "ALTER TABLE transactions "
            "ALTER COLUMN waste_type TYPE wastetype "
            "USING waste_type::wastetype"
        )


def downgrade():
    op.drop_column('transactions', 'waste_type')
