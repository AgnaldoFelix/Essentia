// types/gamification.ts
export interface Medal {
  id: string;
  type: 'gold' | 'silver' | 'bronze';
  date: string;
  category: 'protein' | 'calories' | 'consistency';
  percentage: number;
}


export interface UserProfileGamification {
  id: string;
  name: string;
  nickname: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  weight: number;
  height: number;
  initialWeight: number;
  weightGoal: number;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'intense' | 'athlete';
  objective: 'gain_muscle' | 'lose_fat' | 'maintain';
  dailyProteinGoal: number;
  dailyCaloriesGoal: number;
  avatar: string;
  createdAt: Date;
  bmi: number;
  abdominalCircumference?: number;
}

export interface Avatar {
  id: string;
  name: string;
  svg: string;
  unlocked: boolean;
  requiredAchievement?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  nickname: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  weight: number;
  height: number;
  initialWeight: number;
  weightGoal: number;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'intense' | 'athlete';
  objective: 'gain_muscle' | 'lose_fat' | 'maintain';
  dailyProteinGoal: number;
  dailyCaloriesGoal: number;
  avatar: string;
  createdAt: Date;
  bmi: number;
  abdominalCircumference?: number;
}

export interface DailyProgress {
  date: string;
  proteinPercentage: number;
  caloriesPercentage: number;
  medal?: Medal;
  weight?: number;
  bestMeal?: string;
}