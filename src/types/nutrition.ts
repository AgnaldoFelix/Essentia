// Tipos do domínio nutricional

export type MacroKey = 'calories' | 'protein' | 'fat' | 'carbs';

export interface Food {
  name: string;
  amount: string;   // ex.: "200 g"
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export interface Meal {
  id: string;
  user_id: string;
  data: string;     // YYYY-MM-DD
  horario: string;  // HH:MM
  nome: string;
  emoji: string;
  alimentos: Food[];
  calorias: number;
  proteinas: number;
  gorduras: number;
  carboidratos: number;
  imagem_url?: string | null;
  ai_confianca?: number | null;
  created_at?: string;
}

export interface DailyRecord {
  id?: string;
  user_id: string;
  data: string;
  calorias: number;
  proteinas: number;
  gorduras: number;
  carboidratos: number;
  updated_at?: string;
}

export interface Goals {
  meta_calorias: number;
  meta_proteinas: number;
  meta_gorduras: number;
  meta_carboidratos: number;
}

export interface AIAnalysisResult {
  alimentos: Food[];
  total: {
    calorias: number;
    proteinas: number;
    gorduras: number;
    carboidratos: number;
  };
  emoji: string;
  nome_sugerido: string;
  confianca: number; // 0-1
  observacao?: string;
}
