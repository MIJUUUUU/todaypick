from pydantic import BaseModel


class HomeRecipeSignal(BaseModel):
    recipe_id: str
    search_volume: int
    pantry_fit: int
    common_ingredient_rate: int


HOME_RECIPE_SIGNALS: list[HomeRecipeSignal] = [
    HomeRecipeSignal(recipe_id="kimchi-pork-stirfry", search_volume=96, pantry_fit=84, common_ingredient_rate=78),
    HomeRecipeSignal(recipe_id="gamja-egg-stirfry", search_volume=92, pantry_fit=88, common_ingredient_rate=91),
    HomeRecipeSignal(recipe_id="kimchi-jeon", search_volume=87, pantry_fit=82, common_ingredient_rate=76),
    HomeRecipeSignal(recipe_id="tofu-ramen-hotpot", search_volume=81, pantry_fit=85, common_ingredient_rate=80),
    HomeRecipeSignal(recipe_id="bacon-garlic-pasta", search_volume=76, pantry_fit=72, common_ingredient_rate=69),
    HomeRecipeSignal(recipe_id="tofu-cabbage-salad-bowl", search_volume=73, pantry_fit=70, common_ingredient_rate=74),
]
