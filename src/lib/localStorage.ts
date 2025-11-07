// lib/localStorage.ts
import { MealLog, UserProfile, WeightEntry, ChatMessage, DailyPlan } from '@/types/nutrition';
import { UserProfile as GamificationUserProfile, Medal } from '@/types/gamification';

const STORAGE_KEYS = {
  MEAL_LOGS: 'nutrition_meal_logs',
  USER_PROFILE: 'nutrition_user_profile',
  WEIGHT_ENTRIES: 'nutrition_weight_entries',
  SELECTED_PLAN: 'nutrition_selected_plan',
  CHAT_HISTORY: 'nutrition_chat_history',
  MEAL_PLANS: 'nutrition_meal_plans',
  SELECTED_PLAN_ID: 'nutrition_selected_plan_id',
  // NOVAS CHAVES PARA GAMIFICAÇÃO
  GAMIFICATION_PROFILE: 'nutrition_gamification_profile',
  MEDALS: 'nutrition_medals',
  AVATAR: 'nutrition_avatar'
};

export const storage = {
  // Meal Logs
  getMealLogs: (): MealLog[] => {
    const data = localStorage.getItem(STORAGE_KEYS.MEAL_LOGS);
    return data ? JSON.parse(data) : [];
  },
  
  saveMealLogs: (logs: MealLog[]): void => {
    localStorage.setItem(STORAGE_KEYS.MEAL_LOGS, JSON.stringify(logs));
  },

  // User Profile (nutrição)
  getUserProfile: (): UserProfile => {
    const data = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    return data ? JSON.parse(data) : {
      dailyProteinGoal: 228,
      dailyCaloriesGoal: 2720,
      weight: 0,
      weightGoal: 0
    };
  },
  
  saveUserProfile: (profile: UserProfile): void => {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  },

  // Weight Entries
  getWeightEntries: (): WeightEntry[] => {
    const data = localStorage.getItem(STORAGE_KEYS.WEIGHT_ENTRIES);
    return data ? JSON.parse(data) : [];
  },
  
  saveWeightEntries: (entries: WeightEntry[]): void => {
    localStorage.setItem(STORAGE_KEYS.WEIGHT_ENTRIES, JSON.stringify(entries));
  },

  // Selected Plan (para compatibilidade)
  getSelectedPlan: (): string => {
    return localStorage.getItem(STORAGE_KEYS.SELECTED_PLAN) || 'plan-15h';
  },
  
  saveSelectedPlan: (planId: string): void => {
    localStorage.setItem(STORAGE_KEYS.SELECTED_PLAN, planId);
  },

  // Chat History
  getChatHistory: (): ChatMessage[] => {
    const data = localStorage.getItem(STORAGE_KEYS.CHAT_HISTORY);
    return data ? JSON.parse(data) : [];
  },
  
  saveChatHistory: (messages: ChatMessage[]): void => {
    localStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(messages));
  },

  // Meal Plans (modelos)
  getMealPlans: (): DailyPlan[] | null => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MEAL_PLANS);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  saveMealPlans: (plans: DailyPlan[]): void => {
    localStorage.setItem(STORAGE_KEYS.MEAL_PLANS, JSON.stringify(plans));
  },

  // Selected Plan ID
  getSelectedPlanId: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.SELECTED_PLAN_ID);
  },

  saveSelectedPlanId: (planId: string): void => {
    localStorage.setItem(STORAGE_KEYS.SELECTED_PLAN_ID, planId);
  },

  // NOVAS FUNÇÕES PARA GAMIFICAÇÃO

  // Perfil de Gamificação
  getGamificationProfile: (): GamificationUserProfile => {
    const data = localStorage.getItem(STORAGE_KEYS.GAMIFICATION_PROFILE);
    if (data) {
      return JSON.parse(data);
    }
    
    // Perfil padrão
    const defaultProfile: GamificationUserProfile = {
      id: '1',
      name: 'Usuário',
      nickname: 'user',
      age: 25,
      gender: 'other',
      weight: 70,
      height: 170,
      initialWeight: 70,
      weightGoal: 75,
      activityLevel: 'moderate',
      objective: 'maintain',
      dailyProteinGoal: 150,
      dailyCaloriesGoal: 2000,
      avatar: '',
      createdAt: new Date(),
      bmi: 24.2
    };
    
    storage.saveGamificationProfile(defaultProfile);
    return defaultProfile;
  },

  saveGamificationProfile: (profile: GamificationUserProfile): void => {
    localStorage.setItem(STORAGE_KEYS.GAMIFICATION_PROFILE, JSON.stringify(profile));
  },

  // Medalhas
  getMedals: (): Medal[] => {
    const data = localStorage.getItem(STORAGE_KEYS.MEDALS);
    return data ? JSON.parse(data) : [];
  },

  saveMedals: (medals: Medal[]): void => {
    localStorage.setItem(STORAGE_KEYS.MEDALS, JSON.stringify(medals));
  },

  // Avatar separado (para compatibilidade)
  getAvatar: (): string => {
    return localStorage.getItem(STORAGE_KEYS.AVATAR) || '';
  },

  saveAvatar: (avatarSvg: string): void => {
    localStorage.setItem(STORAGE_KEYS.AVATAR, avatarSvg);
  },

  // Clear specific data
  clearMealPlans: (): void => {
    localStorage.removeItem(STORAGE_KEYS.MEAL_PLANS);
    localStorage.removeItem(STORAGE_KEYS.SELECTED_PLAN_ID);
  },

  // Export all data (atualizado)
  exportData: () => {
    return {
      mealLogs: storage.getMealLogs(),
      userProfile: storage.getUserProfile(),
      gamificationProfile: storage.getGamificationProfile(),
      weightEntries: storage.getWeightEntries(),
      selectedPlan: storage.getSelectedPlan(),
      selectedPlanId: storage.getSelectedPlanId(),
      mealPlans: storage.getMealPlans(),
      chatHistory: storage.getChatHistory(),
      medals: storage.getMedals(),
      avatar: storage.getAvatar(),
      exportDate: new Date().toISOString(),
      version: '3.0' // Nova versão com gamificação
    };
  },

  // Import data (atualizado)
  importData: (data: any) => {
    if (data.mealLogs) storage.saveMealLogs(data.mealLogs);
    if (data.userProfile) storage.saveUserProfile(data.userProfile);
    if (data.gamificationProfile) storage.saveGamificationProfile(data.gamificationProfile);
    if (data.weightEntries) storage.saveWeightEntries(data.weightEntries);
    if (data.selectedPlan) storage.saveSelectedPlan(data.selectedPlan);
    if (data.chatHistory) storage.saveChatHistory(data.chatHistory);
    if (data.medals) storage.saveMedals(data.medals);
    if (data.avatar) storage.saveAvatar(data.avatar);
    
    // Novos campos para múltiplos planos
    if (data.mealPlans) storage.saveMealPlans(data.mealPlans);
    if (data.selectedPlanId) storage.saveSelectedPlanId(data.selectedPlanId);
    
    // Migração de dados antigos para novos
    if (!data.mealPlans && data.selectedPlan) {
      const defaultPlans = [
        {
          id: 'plan-15h',
          name: 'Modelo até 15h',
          totalProtein: 228,
          totalCalories: 2720,
          meals: []
        },
        {
          id: 'plan-18h',
          name: 'Modelo até 18h', 
          totalProtein: 228,
          totalCalories: 2720,
          meals: []
        }
      ];
      storage.saveMealPlans(defaultPlans as any);
      storage.saveSelectedPlanId(data.selectedPlan);
    }
  },

  // Clear all data
  clearAll: (): void => {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  },

  // Migração de dados antigos para novo sistema
  migrateToMultiPlan: (): void => {
    const existingSelectedPlan = storage.getSelectedPlan();
    const existingMealPlans = storage.getMealPlans();
    
    if (existingMealPlans && existingMealPlans.length > 0) {
      return;
    }
    
    const defaultPlans = [
      {
        id: 'plan-15h',
        name: 'Modelo até 15h',
        totalProtein: 228,
        totalCalories: 2720,
        meals: []
      },
      {
        id: 'plan-18h',
        name: 'Modelo até 18h',
        totalProtein: 228, 
        totalCalories: 2720,
        meals: []
      }
    ];
    
    storage.saveMealPlans(defaultPlans as any);
    
    const selectedPlanExists = defaultPlans.some(plan => plan.id === existingSelectedPlan);
    if (selectedPlanExists) {
      storage.saveSelectedPlanId(existingSelectedPlan);
    } else {
      storage.saveSelectedPlanId('plan-15h');
    }
  },

  // Migração para sistema de gamificação
  migrateToGamification: (): void => {
    const existingGamificationProfile = localStorage.getItem(STORAGE_KEYS.GAMIFICATION_PROFILE);
    
    if (!existingGamificationProfile) {
      const nutritionProfile = storage.getUserProfile();
      const gamificationProfile: GamificationUserProfile = {
        id: '1',
        name: 'Usuário',
        nickname: 'user',
        age: 25,
        gender: 'other',
        weight: nutritionProfile.weight || 70,
        height: 170,
        initialWeight: nutritionProfile.weight || 70,
        weightGoal: nutritionProfile.weightGoal || 75,
        activityLevel: 'moderate',
        objective: 'maintain',
        dailyProteinGoal: nutritionProfile.dailyProteinGoal || 150,
        dailyCaloriesGoal: nutritionProfile.dailyCaloriesGoal || 2000,
        avatar: '',
        createdAt: new Date(),
        bmi: 24.2
      };
      
      storage.saveGamificationProfile(gamificationProfile);
    }
  }
};

// Executar migrações ao carregar
if (typeof window !== 'undefined') {
  storage.migrateToMultiPlan();
  storage.migrateToGamification();
}