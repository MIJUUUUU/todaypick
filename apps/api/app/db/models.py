from __future__ import annotations

from sqlalchemy import Boolean, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class RecipeModel(Base):
    __tablename__ = "recipes"

    id: Mapped[str] = mapped_column(String(120), primary_key=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    emoji: Mapped[str] = mapped_column(String(16), nullable=False)
    servings: Mapped[int] = mapped_column(Integer, nullable=False)
    difficulty: Mapped[str] = mapped_column(String(50), nullable=False)
    cooking_time: Mapped[int] = mapped_column(Integer, nullable=False)
    preparation_steps: Mapped[list[str]] = mapped_column(JSONB, nullable=False)
    cooking_steps: Mapped[list[str]] = mapped_column(JSONB, nullable=False)
    safety_notes: Mapped[list[str]] = mapped_column(JSONB, nullable=False)

    ingredients: Mapped[list[RecipeIngredientModel]] = relationship(
        back_populates="recipe",
        cascade="all, delete-orphan",
    )
    themes: Mapped[list[RecipeThemeModel]] = relationship(
        back_populates="recipe",
        cascade="all, delete-orphan",
    )


class IngredientModel(Base):
    __tablename__ = "ingredients"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False, unique=True)
    normalized_name: Mapped[str] = mapped_column(String(120), nullable=False, unique=True)

    recipes: Mapped[list[RecipeIngredientModel]] = relationship(back_populates="ingredient")


class RecipeIngredientModel(Base):
    __tablename__ = "recipe_ingredients"
    __table_args__ = (
        UniqueConstraint("recipe_id", "ingredient_id", name="uq_recipe_ingredient"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    recipe_id: Mapped[str] = mapped_column(ForeignKey("recipes.id", ondelete="CASCADE"), nullable=False)
    ingredient_id: Mapped[int] = mapped_column(ForeignKey("ingredients.id", ondelete="CASCADE"), nullable=False)
    amount: Mapped[str] = mapped_column(String(120), nullable=False)
    required: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    substitutes: Mapped[list[str]] = mapped_column(JSONB, nullable=False, default=list)

    recipe: Mapped[RecipeModel] = relationship(back_populates="ingredients")
    ingredient: Mapped[IngredientModel] = relationship(back_populates="recipes")


class RecipeThemeModel(Base):
    __tablename__ = "recipe_themes"
    __table_args__ = (
        UniqueConstraint("recipe_id", "theme", name="uq_recipe_theme"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    recipe_id: Mapped[str] = mapped_column(ForeignKey("recipes.id", ondelete="CASCADE"), nullable=False)
    theme: Mapped[str] = mapped_column(String(120), nullable=False)

    recipe: Mapped[RecipeModel] = relationship(back_populates="themes")
