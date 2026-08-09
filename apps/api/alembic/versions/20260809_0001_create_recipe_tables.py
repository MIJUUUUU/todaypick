"""create recipe tables

Revision ID: 20260809_0001
Revises:
Create Date: 2026-08-09 00:00:00
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "20260809_0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "recipes",
        sa.Column("id", sa.String(length=120), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("emoji", sa.String(length=16), nullable=False),
        sa.Column("servings", sa.Integer(), nullable=False),
        sa.Column("difficulty", sa.String(length=50), nullable=False),
        sa.Column("cooking_time", sa.Integer(), nullable=False),
        sa.Column("preparation_steps", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("cooking_steps", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("safety_notes", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "ingredients",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("normalized_name", sa.String(length=120), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
        sa.UniqueConstraint("normalized_name"),
    )
    op.create_table(
        "recipe_ingredients",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("recipe_id", sa.String(length=120), nullable=False),
        sa.Column("ingredient_id", sa.Integer(), nullable=False),
        sa.Column("amount", sa.String(length=120), nullable=False),
        sa.Column("required", sa.Boolean(), nullable=False),
        sa.Column("substitutes", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.ForeignKeyConstraint(["ingredient_id"], ["ingredients.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["recipe_id"], ["recipes.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("recipe_id", "ingredient_id", name="uq_recipe_ingredient"),
    )
    op.create_table(
        "recipe_themes",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("recipe_id", sa.String(length=120), nullable=False),
        sa.Column("theme", sa.String(length=120), nullable=False),
        sa.ForeignKeyConstraint(["recipe_id"], ["recipes.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("recipe_id", "theme", name="uq_recipe_theme"),
    )
    op.create_index("ix_ingredients_normalized_name", "ingredients", ["normalized_name"], unique=False)
    op.create_index("ix_recipe_ingredients_recipe_id", "recipe_ingredients", ["recipe_id"], unique=False)
    op.create_index("ix_recipe_ingredients_ingredient_id", "recipe_ingredients", ["ingredient_id"], unique=False)
    op.create_index("ix_recipe_themes_recipe_id", "recipe_themes", ["recipe_id"], unique=False)
    op.create_index("ix_recipe_themes_theme", "recipe_themes", ["theme"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_recipe_themes_theme", table_name="recipe_themes")
    op.drop_index("ix_recipe_themes_recipe_id", table_name="recipe_themes")
    op.drop_table("recipe_themes")
    op.drop_index("ix_recipe_ingredients_ingredient_id", table_name="recipe_ingredients")
    op.drop_index("ix_recipe_ingredients_recipe_id", table_name="recipe_ingredients")
    op.drop_table("recipe_ingredients")
    op.drop_index("ix_ingredients_normalized_name", table_name="ingredients")
    op.drop_table("ingredients")
    op.drop_table("recipes")
