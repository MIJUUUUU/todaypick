from app.core.config import settings
from app.db.session import get_db_session
from app.providers.external_recipe_provider import ExternalRecipeProvider
from app.providers.openai_reason_provider import OpenAIReasonProvider
from app.repositories.recipe_repository import InMemoryRecipeRepository
from app.repositories.sqlalchemy_recipe_repository import SqlAlchemyRecipeRepository
from app.services.recipe_service import RecipeService


def get_recipe_service():
    if settings.database_url:
        for session in get_db_session():
            repository = SqlAlchemyRecipeRepository(session)
            yield RecipeService(
                repository=repository,
                external_provider=ExternalRecipeProvider(),
                ai_reason_provider=OpenAIReasonProvider(),
            )
        return

    repository = InMemoryRecipeRepository()
    yield RecipeService(
        repository=repository,
        external_provider=ExternalRecipeProvider(),
        ai_reason_provider=OpenAIReasonProvider(),
    )
