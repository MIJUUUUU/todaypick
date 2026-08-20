"""add recipe image url fields

Revision ID: 20260809_0004
Revises: 20260809_0003
Create Date: 2026-08-09 00:30:00
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa


revision = "20260809_0004"
down_revision = "20260809_0003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("recipes", sa.Column("thumbnail_url", sa.String(length=500), nullable=True))
    op.add_column("recipes", sa.Column("image_url", sa.String(length=500), nullable=True))
    op.add_column("recipes", sa.Column("image_credit", sa.String(length=255), nullable=True))


def downgrade() -> None:
    op.drop_column("recipes", "image_credit")
    op.drop_column("recipes", "image_url")
    op.drop_column("recipes", "thumbnail_url")
activate