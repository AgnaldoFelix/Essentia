// hooks/useGamification.ts
import { useState, useEffect } from 'react';
import { Medal, UserProfile, DailyProgress } from '@/types/gamification';

export const useGamification = () => {
  const [medals, setMedals] = useState<Medal[]>([]);
  const [profile, setProfile] = useState<UserProfile>({
    id: '1',
    name: 'Usuário',
    nickname: 'user',
    age: 30,
    gender: 'other',
    weight: 70,
    height: 170,
    initialWeight: 70,
    weightGoal: 75,
    activityLevel: 'moderate',
    objective: 'gain_muscle',
    dailyProteinGoal: 150,
    dailyCaloriesGoal: 2000,
    avatar: '',
    createdAt: new Date(),
    bmi: 24.2
  });

  const [dailyProgress, setDailyProgress] = useState<DailyProgress[]>([]);

  // Carregar dados do localStorage
  useEffect(() => {
    const savedMedals = localStorage.getItem('essentia-medals');
    const savedProfile = localStorage.getItem('essentia-profile');
    const savedProgress = localStorage.getItem('essentia-progress');

    if (savedMedals) setMedals(JSON.parse(savedMedals));
    if (savedProfile) setProfile(JSON.parse(savedProfile));
    if (savedProgress) setDailyProgress(JSON.parse(savedProgress));
  }, []);

  // Salvar dados no localStorage
  useEffect(() => {
    localStorage.setItem('essentia-medals', JSON.stringify(medals));
  }, [medals]);

  useEffect(() => {
    localStorage.setItem('essentia-profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('essentia-progress', JSON.stringify(dailyProgress));
  }, [dailyProgress]);

  const addMedal = (medal: Omit<Medal, 'id'>) => {
    const newMedal: Medal = {
      ...medal,
      id: `medal-${Date.now()}`
    };
    setMedals(prev => [newMedal, ...prev]);
    return newMedal;
  };

  const updateProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
  };

  const addDailyProgress = (progress: DailyProgress) => {
    setDailyProgress(prev => {
      const existing = prev.find(p => p.date === progress.date);
      if (existing) {
        return prev.map(p => p.date === progress.date ? progress : p);
      }
      return [...prev, progress];
    });
  };

  return {
    medals,
    profile,
    dailyProgress,
    addMedal,
    updateProfile,
    addDailyProgress
  };
};