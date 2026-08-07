import { useState } from 'react';
import { recipeApi, type Recommendation } from '../../../entities/recipe/api/recipeApi';

export function useRecipeDiscovery() {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [results, setResults] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const toggleIngredient = (name: string) =>
    setIngredients(current => current.includes(name) ? current.filter(item => item !== name) : [...current, name]);
  const addIngredient = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setIngredients(current => current.includes(trimmed) ? current : [...current, trimmed]);
  };
  const removeIngredient = (name: string) => setIngredients(current => current.filter(item => item !== name));
  const recommend = async (theme?: string) => {
    setLoading(true);
    try { const next = await recipeApi.recommend({ ingredients, theme, max_time: 60, servings: 2 }); setResults(next); return next; }
    finally { setLoading(false); }
  };
  return { ingredients, results, loading, toggleIngredient, addIngredient, removeIngredient, recommend };
}
