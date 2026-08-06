import { useState } from 'react';
import type { Recipe } from '../../../entities/recipe/model/types';

export function useCookingSession(recipe: Recipe) {
  const [step, setStep] = useState(0);
  return { step, currentStep: recipe.cooking_steps[step], next: () => setStep(value => Math.min(value + 1, recipe.cooking_steps.length - 1)), previous: () => setStep(value => Math.max(value - 1, 0)), isLast: step === recipe.cooking_steps.length - 1 };
}
