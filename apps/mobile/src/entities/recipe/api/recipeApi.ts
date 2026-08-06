import { apiFetch } from '../../../shared/api/client';
import type { Recipe } from '../model/types';

export type RecommendRequest = { ingredients: string[]; theme?: string; max_time?: number; servings?: number };
export type Recommendation = { recipe: Recipe; owned_count: number; total_count: number; missing: string[]; match_rate: number; reason: string };

export const recipeApi = {
  recommend: (request: RecommendRequest) => apiFetch<Recommendation[]>('/recipes/recommend', { method: 'POST', body: JSON.stringify(request) }),
  detail: (id: string) => apiFetch<Recipe>(`/recipes/${id}`),
};
