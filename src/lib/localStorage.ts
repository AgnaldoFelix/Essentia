import { MealLog, UserProfile, WeightEntry, ChatMessage } from '@/types/nutrition';

const STORAGE_KEYS = {
  MEAL_LOGS: 'nutrition_meal_logs',
  USER_PROFILE: 'nutrition_user_profile',
  WEIGHT_ENTRIES: 'nutrition_weight_entries',
  SELECTED_PLAN: 'nutrition_selected_plan',
  CHAT_HISTORY: 'nutrition_chat_history'
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

  // Selected Plan
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

  // Export all data
  exportData: () => {
    return {
      mealLogs: storage.getMealLogs(),
      userProfile: storage.getUserProfile(),
      weightEntries: storage.getWeightEntries(),
      selectedPlan: storage.getSelectedPlan(),
      chatHistory: storage.getChatHistory(),
      exportDate: new Date().toISOString()
    };
  },

  // Import data
  importData: (data: any) => {
    if (data.mealLogs) storage.saveMealLogs(data.mealLogs);
    if (data.userProfile) storage.saveUserProfile(data.userProfile);
    if (data.weightEntries) storage.saveWeightEntries(data.weightEntries);
    if (data.selectedPlan) storage.saveSelectedPlan(data.selectedPlan);
    if (data.chatHistory) storage.saveChatHistory(data.chatHistory);
  }
};
