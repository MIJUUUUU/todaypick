from __future__ import annotations

from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class RecipeModel(Base):
    __tablename__ = "recipes"

    id: Mapped[str] = mapped_column(String(120), primary_key=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    emoji: Mapped[str] = mapped_column(String(16), nullable=False)
    thumbnail_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    image_credit: Mapped[str | None] = mapped_column(String(255), nullable=True)
    servings: Mapped[int] = mapped_column(Integer, nullable=False)
    difficulty: Mapped[str] = mapped_column(String(50), nullable=False)
    cooking_time: Mapped[int] = mapped_column(Integer, nullable=False)
    preparation_steps: Mapped[list[str]] = mapped_column(JSONB, nullable=False)
    cooking_steps: Mapped[list[str]] = mapped_column(JSONB, nullable=False)
    cooking_step_guides: Mapped[list[dict[str, object]]] = mapped_column(JSONB, nullable=False, default=list)
    safety_notes: Mapped[list[str]] = mapped_column(JSONB, nullable=False)

    ingredients: Mapped[list[RecipeIngredientModel]] = relationship(
        back_populates="recipe",
        cascade="all, delete-orphan",
    )
    themes: Mapped[list[RecipeThemeModel]] = relationship(
        back_populates="recipe",
        cascade="all, delete-orphan",
    )
    home_signal: Mapped[HomeRecipeSignalModel | None] = relationship(
        back_populates="recipe",
        cascade="all, delete-orphan",
    )
    click_events: Mapped[list[RecipeClickEventModel]] = relationship(
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


class HomeRecipeSignalModel(Base):
    __tablename__ = "home_recipe_signals"

    recipe_id: Mapped[str] = mapped_column(ForeignKey("recipes.id", ondelete="CASCADE"), primary_key=True)
    search_volume: Mapped[int] = mapped_column(Integer, nullable=False)
    pantry_fit: Mapped[int] = mapped_column(Integer, nullable=False)
    common_ingredient_rate: Mapped[int] = mapped_column(Integer, nullable=False)

    recipe: Mapped[RecipeModel] = relationship(back_populates="home_signal")


class RecipeSearchEventModel(Base):
    __tablename__ = "recipe_search_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    theme: Mapped[str | None] = mapped_column(String(120), nullable=True)
    ingredients: Mapped[list[str]] = mapped_column(JSONB, nullable=False, default=list)
    result_recipe_ids: Mapped[list[str]] = mapped_column(JSONB, nullable=False, default=list)
    selected_ingredient_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)


class RecipeClickEventModel(Base):
    __tablename__ = "recipe_click_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    recipe_id: Mapped[str] = mapped_column(ForeignKey("recipes.id", ondelete="CASCADE"), nullable=False)
    source: Mapped[str] = mapped_column(String(60), nullable=False)
    theme: Mapped[str | None] = mapped_column(String(120), nullable=True)
    ingredients: Mapped[list[str]] = mapped_column(JSONB, nullable=False, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)

    recipe: Mapped[RecipeModel] = relationship(back_populates="click_events")
