"""add recipe event tables

Revision ID: 20260809_0003
Revises: 20260809_0002
Create Date: 2026-08-09 00:20:00
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "20260809_0003"
down_revision = "20260809_0002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "recipe_search_events",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("theme", sa.String(length=120), nullable=True),
        sa.Column("ingredients", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("result_recipe_ids", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("selected_ingredient_count", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "recipe_click_events",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("recipe_id", sa.String(length=120), nullable=False),
        sa.Column("source", sa.String(length=60), nullable=False),
        sa.Column("theme", sa.String(length=120), nullable=True),
        sa.Column("ingredients", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["recipe_id"], ["recipes.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_recipe_click_events_recipe_id", "recipe_click_events", ["recipe_id"], unique=False)
    op.create_index("ix_recipe_click_events_source", "recipe_click_events", ["source"], unique=False)
    op.create_index("ix_recipe_search_events_created_at", "recipe_search_events", ["created_at"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_recipe_search_events_created_at", table_name="recipe_search_events")
    op.drop_index("ix_recipe_click_events_source", table_name="recipe_click_events")
    op.drop_index("ix_recipe_click_events_recipe_id", table_name="recipe_click_events")
    op.drop_table("recipe_click_events")
    op.drop_table("recipe_search_events")
