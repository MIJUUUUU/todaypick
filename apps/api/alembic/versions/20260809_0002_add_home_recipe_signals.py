"""add home recipe signals

Revision ID: 20260809_0002
Revises: 20260809_0001
Create Date: 2026-08-09 00:10:00
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa


revision = "20260809_0002"
down_revision = "20260809_0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "home_recipe_signals",
        sa.Column("recipe_id", sa.String(length=120), nullable=False),
        sa.Column("search_volume", sa.Integer(), nullable=False),
        sa.Column("pantry_fit", sa.Integer(), nullable=False),
        sa.Column("common_ingredient_rate", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["recipe_id"], ["recipes.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("recipe_id"),
    )


def downgrade() -> None:
    op.drop_table("home_recipe_signals")
