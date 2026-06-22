import type { MacroKey } from '@/types/nutrition';

export const macroLabels: Record<MacroKey, string> = {
  calories: 'Calorias',
  protein: 'Proteínas',
  fat: 'Gorduras',
  carbs: 'Carboidratos',
};

export const macroUnits: Record<MacroKey, string> = {
  calories: 'kcal',
  protein: 'g',
  fat: 'g',
  carbs: 'g',
};

export const macroColorVar: Record<MacroKey, string> = {
  calories: '--calories',
  protein: '--protein',
  fat: '--fat',
  carbs: '--carbs',
};

export const macroEmojis: Record<MacroKey, string> = {
  calories: '🔥',
  protein: '💪',
  fat: '🥑',
  carbs: '🌾',
};

export const fmtNumber = (n: number, digits = 0) =>
  new Intl.NumberFormat('pt-BR', { maximumFractionDigits: digits }).format(n);

export const pct = (current: number, goal: number) => {
  if (!goal || goal <= 0) return 0;
  return Math.min(100, Math.max(0, (current / goal) * 100));
};
