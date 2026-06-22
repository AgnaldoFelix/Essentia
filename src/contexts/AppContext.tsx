import { createContext, useContext, useEffect, useMemo, useState, useCallback, ReactNode } from 'react';
import type { DailyRecord, Goals, Meal } from '@/types/nutrition';
import { getDailyRecord, getGoals, getWeekRecords, listMealsByDate, saveGoals } from '@/lib/db';

interface AppState {
  // data
  currentDate: Date;
  setCurrentDate: (d: Date) => void;
  meals: Meal[];
  daily: DailyRecord;
  week: DailyRecord[];
  goals: Goals;
  loading: boolean;
  // theme
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  // actions
  refresh: () => Promise<void>;
  updateGoals: (g: Goals) => Promise<void>;
}

const Ctx = createContext<AppState | null>(null);

const THEME_KEY = 'meu-diario-theme';

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [meals, setMeals] = useState<Meal[]>([]);
  const [daily, setDaily] = useState<DailyRecord>({
    user_id: '', data: '', calorias: 0, proteinas: 0, gorduras: 0, carboidratos: 0,
  });
  const [week, setWeek] = useState<DailyRecord[]>([]);
  const [goals, setGoals] = useState<Goals>({
    meta_calorias: 2200, meta_proteinas: 150, meta_gorduras: 70, meta_carboidratos: 250,
  });
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    const saved = localStorage.getItem(THEME_KEY) as 'light' | 'dark' | null;
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [m, d, w, g] = await Promise.all([
        listMealsByDate(currentDate),
        getDailyRecord(currentDate),
        getWeekRecords(currentDate),
        getGoals(),
      ]);
      setMeals(m);
      setDaily(d);
      setWeek(w);
      setGoals(g);
    } catch (e) {
      console.error('[AppContext] refresh failed', e);
    } finally {
      setLoading(false);
    }
  }, [currentDate]);

  useEffect(() => { refresh(); }, [refresh]);

  const updateGoals = useCallback(async (g: Goals) => {
    await saveGoals(g);
    setGoals(g);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'));
  }, []);

  const value = useMemo<AppState>(
    () => ({ currentDate, setCurrentDate, meals, daily, week, goals, loading, theme, toggleTheme, refresh, updateGoals }),
    [currentDate, meals, daily, week, goals, loading, theme, toggleTheme, refresh, updateGoals],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
