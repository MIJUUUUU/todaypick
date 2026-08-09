from fastapi import APIRouter, Depends, HTTPException, Response, status

from app.api.deps import get_recipe_service
from app.domain.models import Recipe
from app.schemas.recipe import HomeRecipeCard, RecipeClickEventRequest, RecipeRecommendation, RecipeSearchEventRequest, RecommendRecipesRequest
from app.services.recipe_service import RecipeService


router = APIRouter()


@router.get("/home", response_model=list[HomeRecipeCard])
def get_home_recipes(
    limit: int = 6,
    service: RecipeService = Depends(get_recipe_service),
) -> list[HomeRecipeCard]:
    return service.get_home_recipes(limit=limit)


@router.post("/home/rebuild", response_model=list[HomeRecipeCard])
def rebuild_home_recipes(
    service: RecipeService = Depends(get_recipe_service),
) -> list[HomeRecipeCard]:
    return service.rebuild_home_signals()


@router.post("/events/search", status_code=status.HTTP_204_NO_CONTENT)
def track_search_event(
    request: RecipeSearchEventRequest,
    service: RecipeService = Depends(get_recipe_service),
) -> Response:
    service.track_search_event(request)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/events/click", status_code=status.HTTP_204_NO_CONTENT)
def track_click_event(
    request: RecipeClickEventRequest,
    service: RecipeService = Depends(get_recipe_service),
) -> Response:
    service.track_recipe_click(request)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


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
