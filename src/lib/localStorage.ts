import { MealLog, UserProfile, WeightEntry, ChatMessage, DailyPlan } from '@/types/nutrition';

const STORAGE_KEYS = {
  MEAL_LOGS: 'nutrition_meal_logs',
  USER_PROFILE: 'nutrition_user_profile',
  WEIGHT_ENTRIES: 'nutrition_weight_entries',
  SELECTED_PLAN: 'nutrition_selected_plan',
  CHAT_HISTORY: 'nutrition_chat_history',
  MEAL_PLANS: 'nutrition_meal_plans', // NOVA CHAVE
  SELECTED_PLAN_ID: 'nutrition_selected_plan_id' // NOVA CHAVE
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

  // User Profile
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

  // Selected Plan (para compatibilidade - manter por enquanto)
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

  // NOVAS FUNÇÕES PARA GERENCIAMENTO DE MODELOS

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

  // Selected Plan ID (nova versão)
  getSelectedPlanId: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.SELECTED_PLAN_ID);
  },

  saveSelectedPlanId: (planId: string): void => {
    localStorage.setItem(STORAGE_KEYS.SELECTED_PLAN_ID, planId);
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
      weightEntries: storage.getWeightEntries(),
      selectedPlan: storage.getSelectedPlan(),
      selectedPlanId: storage.getSelectedPlanId(),
      mealPlans: storage.getMealPlans(),
      chatHistory: storage.getChatHistory(),
      exportDate: new Date().toISOString(),
      version: '2.0' // Nova versão com suporte a múltiplos planos
    };
  },

  // Import data (atualizado)
  importData: (data: any) => {
    if (data.mealLogs) storage.saveMealLogs(data.mealLogs);
    if (data.userProfile) storage.saveUserProfile(data.userProfile);
    if (data.weightEntries) storage.saveWeightEntries(data.weightEntries);
    if (data.selectedPlan) storage.saveSelectedPlan(data.selectedPlan);
    if (data.chatHistory) storage.saveChatHistory(data.chatHistory);
    
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
          meals: [] // Você pode adicionar as refeições padrão aqui
        },
        {
          id: 'plan-18h',
          name: 'Modelo até 18h', 
          totalProtein: 228,
          totalCalories: 2720,
          meals: [] // Você pode adicionar as refeições padrão aqui
        }
      ];
      storage.saveMealPlans(defaultPlans);
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
    
    // Se já temos planos, não precisa migrar
    if (existingMealPlans && existingMealPlans.length > 0) {
      return;
    }
    
    // Criar planos padrão baseados no plano selecionado atual
    const defaultPlans = [
      {
        id: 'plan-15h',
        name: 'Modelo até 15h',
        totalProtein: 228,
        totalCalories: 2720,
        meals: [] // Adicione as refeições do seu array mealPlans aqui
      },
      {
        id: 'plan-18h',
        name: 'Modelo até 18h',
        totalProtein: 228, 
        totalCalories: 2720,
        meals: [] // Adicione as refeições do seu array mealPlans aqui
      }
    ];
    
    storage.saveMealPlans(defaultPlans);
    
    // Se o plano selecionado existir nos padrões, usar ele
    const selectedPlanExists = defaultPlans.some(plan => plan.id === existingSelectedPlan);
    if (selectedPlanExists) {
      storage.saveSelectedPlanId(existingSelectedPlan);
    } else {
      storage.saveSelectedPlanId('plan-15h');
    }
  }
};