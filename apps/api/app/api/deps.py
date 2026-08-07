from app.repositories.recipe_repository import InMemoryRecipeRepository
from app.services.recipe_service import RecipeService


def get_recipe_service() -> RecipeService:
    return RecipeService(repository=InMemoryRecipeRepository())
