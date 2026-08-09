from pydantic import BaseModel, Field

from app.domain.models import Recipe


class RecommendRecipesRequest(BaseModel):
    ingredients: list[str] = Field(default_factory=list)
    theme: str | None = None
    max_time: int | None = None
    servings: int | None = None


class RecipeRecommendation(BaseModel):
    recipe: Recipe
    owned_count: int
    total_count: int
    missing: list[str]
    match_rate: float
    reason: str


class HomeRecipeCard(BaseModel):
    recipe: Recipe
    popularity_score: float
    search_volume: int
    pantry_fit: int
    common_ingredient_rate: int
    highlight: str


class RecipeSearchEventRequest(BaseModel):
    ingredients: list[str] = Field(default_factory=list)
    theme: str | None = None
    result_recipe_ids: list[str] = Field(default_factory=list)


class RecipeClickEventRequest(BaseModel):
    recipe_id: str
    source: str
    theme: str | None = None
    ingredients: list[str] = Field(default_factory=list)
