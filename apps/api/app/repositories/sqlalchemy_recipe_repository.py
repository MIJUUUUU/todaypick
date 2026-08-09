from __future__ import annotations

from collections.abc import Sequence

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.data.ingredient_normalization import normalize_ingredient_name
from app.db.models import IngredientModel, RecipeIngredientModel, RecipeModel, RecipeThemeModel
from app.domain.models import Ingredient, Recipe


class SqlAlchemyRecipeRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def list(self) -> Sequence[Recipe]:
        stmt = (
            select(RecipeModel)
            .options(
                selectinload(RecipeModel.ingredients).selectinload(RecipeIngredientModel.ingredient),
                selectinload(RecipeModel.themes),
            )
        )
        rows = self._session.scalars(stmt).all()
        return [self._to_domain(recipe) for recipe in rows]

    def get_by_id(self, recipe_id: str) -> Recipe | None:
        stmt = (
            select(RecipeModel)
            .where(RecipeModel.id == recipe_id)
            .options(
                selectinload(RecipeModel.ingredients).selectinload(RecipeIngredientModel.ingredient),
                selectinload(RecipeModel.themes),
            )
        )
        row = self._session.scalars(stmt).first()
        return self._to_domain(row) if row else None

    def upsert_many(self, recipes: Sequence[Recipe]) -> None:
        for recipe in recipes:
            existing = self._session.get(RecipeModel, recipe.id)
            if existing is not None:
                continue

            recipe_row = RecipeModel(
                id=recipe.id,
                title=recipe.title,
                emoji=recipe.emoji,
                servings=recipe.servings,
                difficulty=recipe.difficulty,
                cooking_time=recipe.cooking_time,
                preparation_steps=recipe.preparation_steps,
                cooking_steps=recipe.cooking_steps,
                safety_notes=recipe.safety_notes,
            )
            self._session.add(recipe_row)
            self._session.flush()

            for theme in recipe.themes:
                self._session.add(RecipeThemeModel(recipe_id=recipe.id, theme=theme))

            for ingredient in recipe.ingredients:
                normalized_name = normalize_ingredient_name(ingredient.name).lower()
                ingredient_row = self._session.scalar(
                    select(IngredientModel).where(IngredientModel.normalized_name == normalized_name)
                )
                if ingredient_row is None:
                    ingredient_row = IngredientModel(
                        name=ingredient.name,
                        normalized_name=normalized_name,
                    )
                    self._session.add(ingredient_row)
                    self._session.flush()

                self._session.add(
                    RecipeIngredientModel(
                        recipe_id=recipe.id,
                        ingredient_id=ingredient_row.id,
                        amount=ingredient.amount,
                        required=ingredient.required,
                        substitutes=ingredient.substitutes or [],
                    )
                )

        self._session.commit()

    def _to_domain(self, recipe: RecipeModel) -> Recipe:
        return Recipe(
            id=recipe.id,
            title=recipe.title,
            emoji=recipe.emoji,
            themes=[theme.theme for theme in recipe.themes],
            servings=recipe.servings,
            difficulty=recipe.difficulty,
            cooking_time=recipe.cooking_time,
            ingredients=[
                Ingredient(
                    name=relation.ingredient.name,
                    amount=relation.amount,
                    required=relation.required,
                    substitutes=relation.substitutes,
                )
                for relation in recipe.ingredients
            ],
            preparation_steps=recipe.preparation_steps,
            cooking_steps=recipe.cooking_steps,
            safety_notes=recipe.safety_notes,
        )
