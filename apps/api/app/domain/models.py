from pydantic import BaseModel, Field


class Ingredient(BaseModel):
    name: str
    amount: str
    required: bool = True
    substitutes: list[str] = Field(default_factory=list)


class Recipe(BaseModel):
    id: str
    title: str
    emoji: str
    themes: list[str]
    servings: int
    difficulty: str
    cooking_time: int
    ingredients: list[Ingredient]
    preparation_steps: list[str]
    cooking_steps: list[str]
    safety_notes: list[str]
    match_rate: float | None = None
    missing: list[str] | None = None
    reason: str | None = None
