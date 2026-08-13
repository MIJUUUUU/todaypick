from __future__ import annotations

from collections.abc import Sequence

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.data.home_rankings import HOME_RECIPE_SIGNALS, HomeRecipeSignal
from app.data.ingredient_normalization import normalize_ingredient_name
from app.db.models import HomeRecipeSignalModel, IngredientModel, RecipeClickEventModel, RecipeIngredientModel, RecipeModel, RecipeSearchEventModel, RecipeThemeModel
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
                thumbnail_url=recipe.thumbnail_url,
                image_url=recipe.image_url,
                image_credit=recipe.image_credit,
                servings=recipe.servings,
                difficulty=recipe.difficulty,
                cooking_time=recipe.cooking_time,
                preparation_steps=recipe.preparation_steps,
                cooking_steps=recipe.cooking_steps,
                cooking_step_guides=[guide.model_dump() for guide in recipe.cooking_step_guides],
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

    def list_home_signals(self) -> Sequence[HomeRecipeSignal]:
        stmt = select(HomeRecipeSignalModel)
        rows = self._session.scalars(stmt).all()
        return [
            HomeRecipeSignal(
                recipe_id=row.recipe_id,
                search_volume=row.search_volume,
                pantry_fit=row.pantry_fit,
                common_ingredient_rate=row.common_ingredient_rate,
            )
            for row in rows
        ]

    def upsert_home_signals(self, signals: Sequence[HomeRecipeSignal]) -> None:
        for signal in signals:
            existing = self._session.get(HomeRecipeSignalModel, signal.recipe_id)
            if existing is None:
                self._session.add(
                    HomeRecipeSignalModel(
                        recipe_id=signal.recipe_id,
                        search_volume=signal.search_volume,
                        pantry_fit=signal.pantry_fit,
                        common_ingredient_rate=signal.common_ingredient_rate,
                    )
                )
                continue

            existing.search_volume = signal.search_volume
            existing.pantry_fit = signal.pantry_fit
            existing.common_ingredient_rate = signal.common_ingredient_rate

        self._session.commit()

    def log_search_event(
        self,
        ingredients: Sequence[str],
        result_recipe_ids: Sequence[str],
        theme: str | None = None,
    ) -> None:
        self._session.add(
            RecipeSearchEventModel(
                theme=theme,
                ingredients=list(ingredients),
                result_recipe_ids=list(result_recipe_ids),
                selected_ingredient_count=len(ingredients),
            )
        )
        self._session.commit()

    def log_recipe_click(
        self,
        recipe_id: str,
        source: str,
        theme: str | None = None,
        ingredients: Sequence[str] | None = None,
    ) -> None:
        self._session.add(
            RecipeClickEventModel(
                recipe_id=recipe_id,
                source=source,
                theme=theme,
                ingredients=list(ingredients or []),
            )
        )
        self._session.commit()

    def recompute_home_signals(self) -> Sequence[HomeRecipeSignal]:
        default_map = {signal.recipe_id: signal for signal in HOME_RECIPE_SIGNALS}
        recipe_ids = [recipe.id for recipe in self.list()]
        search_rows = self._session.scalars(select(RecipeSearchEventModel)).all()
        click_rows = self._session.scalars(select(RecipeClickEventModel)).all()
        total_searches = len(search_rows)

        impressions: dict[str, int] = {recipe_id: 0 for recipe_id in recipe_ids}
        ingredient_counts: dict[str, list[int]] = {recipe_id: [] for recipe_id in recipe_ids}
        clicks: dict[str, int] = {recipe_id: 0 for recipe_id in recipe_ids}

        for row in search_rows:
            for recipe_id in row.result_recipe_ids:
                if recipe_id not in impressions:
                    impressions[recipe_id] = 0
                    ingredient_counts[recipe_id] = []
                    clicks[recipe_id] = 0
                impressions[recipe_id] += 1
                ingredient_counts[recipe_id].append(row.selected_ingredient_count)

        for row in click_rows:
            if row.recipe_id not in clicks:
                impressions[row.recipe_id] = 0
                ingredient_counts[row.recipe_id] = []
                clicks[row.recipe_id] = 0
            clicks[row.recipe_id] += 1

        if total_searches == 0 and not click_rows:
            self.upsert_home_signals(HOME_RECIPE_SIGNALS)
            return HOME_RECIPE_SIGNALS

        next_signals: list[HomeRecipeSignal] = []
        for recipe_id in {*(default_map.keys()), *impressions.keys(), *clicks.keys()}:
            default = default_map.get(
                recipe_id,
                HomeRecipeSignal(recipe_id=recipe_id, search_volume=40, pantry_fit=40, common_ingredient_rate=40),
            )
            recipe_impressions = impressions.get(recipe_id, 0)
            recipe_clicks = clicks.get(recipe_id, 0)
            avg_ingredients = (
                sum(ingredient_counts.get(recipe_id, [])) / len(ingredient_counts[recipe_id])
                if ingredient_counts.get(recipe_id)
                else default.pantry_fit / 14
            )
            search_volume = min(100, int(default.search_volume * 0.35 + recipe_impressions * 14 + recipe_clicks * 20))
            pantry_fit = min(100, int(avg_ingredients * 14))
            common_ingredient_rate = (
                min(100, int(recipe_impressions / total_searches * 100))
                if total_searches
                else default.common_ingredient_rate
            )
            next_signals.append(
                HomeRecipeSignal(
                    recipe_id=recipe_id,
                    search_volume=search_volume,
                    pantry_fit=pantry_fit,
                    common_ingredient_rate=common_ingredient_rate,
                )
            )

        self.upsert_home_signals(next_signals)
        return next_signals

    def _to_domain(self, recipe: RecipeModel) -> Recipe:
        return Recipe(
            id=recipe.id,
            title=recipe.title,
            emoji=recipe.emoji,
            thumbnail_url=recipe.thumbnail_url,
            image_url=recipe.image_url,
            image_credit=recipe.image_credit,
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
            cooking_step_guides=recipe.cooking_step_guides or [],
            safety_notes=recipe.safety_notes,
        )
