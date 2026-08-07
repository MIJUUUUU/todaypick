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
