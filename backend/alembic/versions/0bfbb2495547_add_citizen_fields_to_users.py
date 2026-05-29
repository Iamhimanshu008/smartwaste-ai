"""add_citizen_fields_to_users

Revision ID: 0bfbb2495547
Revises: a86297312417
Create Date: 2026-05-29 11:10:30.384859

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '0bfbb2495547'
down_revision: Union[str, Sequence[str], None] = 'a86297312417'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # 1. ADD COLUMNS & UNIQUE CONSTRAINTS FIRST (Taki Foreign Key inhe reference kar sake)
    op.add_column('users', sa.Column('house_id', sa.String(length=20), nullable=True))
    op.add_column('users', sa.Column('ward_no', sa.Integer(), nullable=True))
    op.add_column('users', sa.Column('wallet_balance_points', sa.Float(), nullable=True))
    op.add_column('users', sa.Column('qr_hash', sa.String(length=255), nullable=True))
    op.add_column('users', sa.Column('is_citizen', sa.Boolean(), nullable=True))
    op.create_index(op.f('ix_users_house_id'), 'users', ['house_id'], unique=True)
    
    # Explicit unique constraints for PostgreSQL Foreign Keys
    op.create_unique_constraint('uq_users_house_id', 'users', ['house_id'])
    op.create_unique_constraint('uq_users_qr_hash', 'users', ['qr_hash'])

    op.add_column('zones', sa.Column('ward_no', sa.Integer(), nullable=True))
    op.add_column('zones', sa.Column('panchayat_name', sa.String(length=200), nullable=True))
    op.add_column('zones', sa.Column('total_citizens', sa.Integer(), nullable=True))
    op.create_unique_constraint('uq_zones_ward_no', 'zones', ['ward_no'])

    # 2. CREATE TABLES AFTER DEPENDENCIES EXIST
    op.create_table('daily_routes',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('collector_id', sa.Integer(), nullable=False),
        sa.Column('ward_no', sa.Integer(), nullable=False),
        sa.Column('route_date', sa.Date(), nullable=False),
        sa.Column('total_houses', sa.Integer(), nullable=True),
        sa.Column('completed_houses', sa.Integer(), nullable=True),
        sa.Column('is_synced', sa.Boolean(), nullable=True),
        sa.Column('synced_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['collector_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_daily_routes_collector_id'), 'daily_routes', ['collector_id'], unique=False)
    op.create_index(op.f('ix_daily_routes_id'), 'daily_routes', ['id'], unique=False)

    op.create_table('redemptions',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('citizen_house_id', sa.String(length=20), nullable=False),
        sa.Column('merchant_id', sa.Integer(), nullable=False),
        sa.Column('points_deducted', sa.Float(), nullable=False),
        sa.Column('inr_value', sa.Float(), nullable=False),
        sa.Column('description', sa.String(length=500), nullable=True),
        sa.Column('redeemed_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['citizen_house_id'], ['users.house_id'], ),
        sa.ForeignKeyConstraint(['merchant_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_redemptions_citizen_house_id'), 'redemptions', ['citizen_house_id'], unique=False)
    op.create_index(op.f('ix_redemptions_merchant_id'), 'redemptions', ['merchant_id'], unique=False)

    op.create_table('transactions',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('house_id', sa.String(length=20), nullable=False),
        sa.Column('collector_id', sa.Integer(), nullable=False),
        sa.Column('ward_no', sa.Integer(), nullable=False),
        sa.Column('weight_grams', sa.Integer(), nullable=False),
        sa.Column('points_awarded', sa.Float(), nullable=False),
        sa.Column('is_manual_override', sa.Boolean(), nullable=True),
        sa.Column('is_ble_verified', sa.Boolean(), nullable=True),
        sa.Column('status', sa.Enum('pending_sync', 'synced', 'audit_required', 'approved', 'rejected', name='transactionstatus'), nullable=True),
        sa.Column('waste_type', sa.String(length=50), nullable=True),
        sa.Column('notes', sa.String(length=500), nullable=True),
        sa.Column('collected_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('synced_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['collector_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['house_id'], ['users.house_id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_transactions_collector_id'), 'transactions', ['collector_id'], unique=False)
    op.create_index(op.f('ix_transactions_house_id'), 'transactions', ['house_id'], unique=False)

    op.drop_table('seed_metadata')


def downgrade() -> None:
    """Downgrade schema."""
    # 1. DROP TABLES FIRST (Dependencies pehle hatani padengi)
    op.drop_index(op.f('ix_transactions_house_id'), table_name='transactions')
    op.drop_index(op.f('ix_transactions_collector_id'), table_name='transactions')
    op.drop_table('transactions')

    op.drop_index(op.f('ix_redemptions_merchant_id'), table_name='redemptions')
    op.drop_index(op.f('ix_redemptions_citizen_house_id'), table_name='redemptions')
    op.drop_table('redemptions')

    op.drop_index(op.f('ix_daily_routes_id'), table_name='daily_routes')
    op.drop_index(op.f('ix_daily_routes_collector_id'), table_name='daily_routes')
    op.drop_table('daily_routes')

    op.create_table('seed_metadata',
        sa.Column('key', sa.VARCHAR(length=100), autoincrement=False, nullable=False),
        sa.Column('seeded_at', postgresql.TIMESTAMP(), server_default=sa.text('now()'), autoincrement=False, nullable=True),
        sa.PrimaryKeyConstraint('key', name='seed_metadata_pkey')
    )

    # 2. DROP COLUMNS & CONSTRAINTS AFTER
    op.drop_constraint('uq_zones_ward_no', 'zones', type_='unique')
    op.drop_column('zones', 'total_citizens')
    op.drop_column('zones', 'panchayat_name')
    op.drop_column('zones', 'ward_no')

    op.drop_constraint('uq_users_house_id', 'users', type_='unique')
    op.drop_constraint('uq_users_qr_hash', 'users', type_='unique')
    op.drop_index(op.f('ix_users_house_id'), table_name='users')
    op.drop_column('users', 'is_citizen')
    op.drop_column('users', 'qr_hash')
    op.drop_column('users', 'wallet_balance_points')
    op.drop_column('users', 'ward_no')
    op.drop_column('users', 'house_id')