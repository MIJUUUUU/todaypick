import { apiFetch } from '../../../shared/api/client';
import type { Recipe } from '../model/types';

export type RecommendRequest = { ingredients: string[]; theme?: string; max_time?: number; servings?: number };
export type Recommendation = { recipe: Recipe; owned_count: number; total_count: number; missing: string[]; match_rate: number; reason: string };
export type HomeRecipeCard = {
  recipe: Recipe;
  popularity_score: number;
  search_volume: number;
  pantry_fit: number;
  common_ingredient_rate: number;
  highlight: string;
};
export type RecipeSearchEventRequest = { ingredients: string[]; theme?: string; result_recipe_ids: string[] };
export type RecipeClickEventRequest = { recipe_id: string; source: string; theme?: string; ingredients?: string[] };

export const recipeApi = {
  home: (limit = 6) => apiFetch<HomeRecipeCard[]>(`/recipes/home?limit=${limit}`),
  rebuildHome: () => apiFetch<HomeRecipeCard[]>('/recipes/home/rebuild', { method: 'POST' }),
  trackSearch: (request: RecipeSearchEventRequest) => apiFetch<void>('/recipes/events/search', { method: 'POST', body: JSON.stringify(request) }),
  trackClick: (request: RecipeClickEventRequest) => apiFetch<void>('/recipes/events/click', { method: 'POST', body: JSON.stringify(request) }),
  recommend: (request: RecommendRequest) => apiFetch<Recommendation[]>('/recipes/recommend', { method: 'POST', body: JSON.stringify(request) }),
  detail: (id: string) => apiFetch<Recipe>(`/recipes/${id}`),
};
