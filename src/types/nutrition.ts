export interface Meal {
  id: string;
  time: string;
  name: string;
  emoji: string;
  foods: FoodItem[];
  protein: number;
  calories: number;
  description: string;
}

export interface FoodItem {
  id: string;
  name: string;
  amount: string;
}

export interface DailyPlan {
  id: string;
  name: string;
  meals: Meal[];
  totalProtein: number;
  totalCalories: number;
}

export interface MealLog {
  id: string;
  date: string;
  mealId: string;
  completed: boolean;
  notes?: string;
}

export interface UserProfile {
  dailyProteinGoal: number;
  dailyCaloriesGoal: number;
  weight: number;
  weightGoal: number;
}

export interface WeightEntry {
  id: string;
  date: string;
  weight: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}
