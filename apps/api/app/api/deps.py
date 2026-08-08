from app.providers.external_recipe_provider import ExternalRecipeProvider
from app.providers.openai_reason_provider import OpenAIReasonProvider
from app.repositories.recipe_repository import InMemoryRecipeRepository
from app.services.recipe_service import RecipeService


def get_recipe_service() -> RecipeService:
    return RecipeService(
        repository=InMemoryRecipeRepository(),
        external_provider=ExternalRecipeProvider(),
        ai_reason_provider=OpenAIReasonProvider(),
    )
