from collections.abc import Sequence

from app.data.recipes import MOCK_RECIPES
from app.domain.models import Recipe


class InMemoryRecipeRepository:
    def __init__(self, recipes: Sequence[Recipe] | None = None) -> None:
        self._recipes = list(recipes or MOCK_RECIPES)

    def list(self) -> Sequence[Recipe]:
        return self._recipes

    def get_by_id(self, recipe_id: str) -> Recipe | None:
        for recipe in self._recipes:
            if recipe.id == recipe_id:
                return recipe
        return None

    def save_many(self, recipes: Sequence[Recipe]) -> None:
        known_ids = {recipe.id for recipe in self._recipes}
        for recipe in recipes:
            if recipe.id not in known_ids:
                self._recipes.append(recipe)
                known_ids.add(recipe.id)
