from app.data.external_recipes import EXTERNAL_FALLBACK_RECIPES
from app.domain.models import Recipe
from app.schemas.recipe import RecommendRecipesRequest


class ExternalRecipeProvider:
    """Fallback recipe source placeholder for future external API integration."""

    def search_recipes(self, request: RecommendRecipesRequest) -> list[Recipe]:
        matches: list[Recipe] = []
        normalized_theme = request.theme

        for recipe in EXTERNAL_FALLBACK_RECIPES:
            if normalized_theme and normalized_theme not in recipe.themes:
                continue
            if request.max_time is not None and recipe.cooking_time > request.max_time:
                continue
            matches.append(recipe)

        return matches
