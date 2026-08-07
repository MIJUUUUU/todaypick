from app.data.ingredient_normalization import normalize_ingredient_name
from app.domain.models import Recipe
from app.repositories.recipe_repository import InMemoryRecipeRepository
from app.schemas.recipe import RecipeRecommendation, RecommendRecipesRequest


class RecipeService:
    def __init__(self, repository: InMemoryRecipeRepository) -> None:
        self._repository = repository

    def recommend(self, request: RecommendRecipesRequest) -> list[RecipeRecommendation]:
        normalized_ingredients = {
            normalize_ingredient_name(item).lower()
            for item in request.ingredients
            if normalize_ingredient_name(item)
        }
        recommendations: list[RecipeRecommendation] = []

        for recipe in self._repository.list():
            if request.theme and request.theme not in recipe.themes:
                continue
            if request.max_time is not None and recipe.cooking_time > request.max_time:
                continue
            if request.servings is not None and recipe.servings > request.servings + 2:
                continue

            required_names = [ingredient.name for ingredient in recipe.ingredients if ingredient.required]
            owned = [name for name in required_names if name.lower() in normalized_ingredients]
            missing = [name for name in required_names if name.lower() not in normalized_ingredients]
            total_count = max(len(required_names), 1)
            match_rate = round(len(owned) / total_count, 2)
            reason = self._build_reason(recipe, owned, missing, request)

            recommendations.append(
                RecipeRecommendation(
                    recipe=Recipe(
                        **recipe.model_dump(),
                        match_rate=match_rate,
                        missing=missing,
                        reason=reason,
                    ),
                    owned_count=len(owned),
                    total_count=total_count,
                    missing=missing,
                    match_rate=match_rate,
                    reason=reason,
                )
            )

        recommendations.sort(
            key=lambda item: (item.match_rate, -len(item.missing), -item.recipe.cooking_time),
            reverse=True,
        )
        return recommendations[:5]

    def get_detail(self, recipe_id: str) -> Recipe | None:
        return self._repository.get_by_id(recipe_id)

    def _build_reason(
        self,
        recipe: Recipe,
        owned: list[str],
        missing: list[str],
        request: RecommendRecipesRequest,
    ) -> str:
        if not missing:
            return f"{', '.join(owned[:3])} 재료가 이미 있고 바로 조리하기 좋은 레시피예요."
        if request.theme:
            return f"{request.theme} 테마에 맞고, {', '.join(missing[:2])}만 추가하면 만들 수 있어요."
        return f"{', '.join(owned[:2])} 재료를 활용할 수 있고 부족한 재료는 {len(missing)}개예요."
