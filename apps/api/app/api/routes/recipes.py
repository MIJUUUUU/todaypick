from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_recipe_service
from app.domain.models import Recipe
from app.schemas.recipe import RecipeRecommendation, RecommendRecipesRequest
from app.services.recipe_service import RecipeService


router = APIRouter()


@router.post("/recommend", response_model=list[RecipeRecommendation])
def recommend_recipes(
    request: RecommendRecipesRequest,
    service: RecipeService = Depends(get_recipe_service),
) -> list[RecipeRecommendation]:
    return service.recommend(request)


@router.get("/{recipe_id}", response_model=Recipe)
def get_recipe(
    recipe_id: str,
    service: RecipeService = Depends(get_recipe_service),
) -> Recipe:
    recipe = service.get_detail(recipe_id)
    if recipe is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recipe not found",
        )
    return recipe
