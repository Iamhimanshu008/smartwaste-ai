"""Merge two heads into single chain

Revision ID: merge_heads_001
Revises: 11a345a47b66, b7ef4513fca8
Create Date: 2026-06-04 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

revision = 'merge_heads_001'
down_revision = ('11a345a47b66', 'b7ef4513fca8')
branch_labels = None
depends_on = None

def upgrade():
    pass

def downgrade():
    pass
