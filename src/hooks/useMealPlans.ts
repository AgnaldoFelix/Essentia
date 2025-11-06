import { useState, useEffect } from 'react';
import { DailyPlan, Meal } from '@/types/nutrition';
import { mealPlans as defaultMealPlans } from '@/data/mealPlans';

const CUSTOM_PLANS_KEY = 'nutrition_custom_plans';

export const useMealPlans = () => {
  const [plans, setPlans] = useState<DailyPlan[]>(defaultMealPlans);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('plan-15h');

  // Função para salvar planos no localStorage
  const savePlans = (newPlans: DailyPlan[]) => {
    setPlans(newPlans);
    localStorage.setItem(CUSTOM_PLANS_KEY, JSON.stringify(newPlans));
  };

  // Load custom plans from localStorage on mount
  useEffect(() => {
    const savedPlans = localStorage.getItem(CUSTOM_PLANS_KEY);
    if (savedPlans) {
      try {
        const customPlans: DailyPlan[] = JSON.parse(savedPlans);
        // Verificar se cada plano tem as metas, se não, adicionar valores padrão
        const plansWithGoals = customPlans.map(plan => ({
          ...plan,
          proteinGoal: plan.proteinGoal || 150,
          caloriesGoal: plan.caloriesGoal || 2000
        }));
        setPlans(plansWithGoals);
      } catch (error) {
        console.error('Error loading custom plans:', error);
      }
    } else {
      // Se não há planos salvos, usar os planos padrão, garantindo que tenham metas
      const defaultPlansWithGoals = defaultMealPlans.map(plan => ({
        ...plan,
        proteinGoal: plan.proteinGoal || 150,
        caloriesGoal: plan.caloriesGoal || 2000
      }));
      setPlans(defaultPlansWithGoals);
    }

    const savedPlanId = localStorage.getItem('nutrition_selected_plan');
    if (savedPlanId) {
      setSelectedPlanId(savedPlanId);
    }
  }, []);

  const updateMeal = (planId: string, mealId: string, updatedMeal: Meal) => {
    const newPlans = plans.map(plan => {
      if (plan.id === planId) {
        const mealExists = plan.meals.some(meal => meal.id === mealId);
        
        let updatedMeals;
        if (mealExists) {
          // Atualizar refeição existente
          updatedMeals = plan.meals.map(meal => 
            meal.id === mealId ? updatedMeal : meal
          );
        } else {
          // Adicionar nova refeição
          updatedMeals = [...plan.meals, updatedMeal];
        }
        
        // Recalculate totals
        const totalProtein = updatedMeals.reduce((sum, meal) => sum + meal.protein, 0);
        const totalCalories = updatedMeals.reduce((sum, meal) => sum + meal.calories, 0);

        return {
          ...plan,
          meals: updatedMeals,
          totalProtein,
          totalCalories
        };
      }
      return plan;
    });

    savePlans(newPlans);
  };

  const addMeal = (planId: string, newMeal: Meal) => {
    const newPlans = plans.map(plan => {
      if (plan.id === planId) {
        const updatedMeals = [...plan.meals, newMeal];
        
        // Recalculate totals
        const totalProtein = updatedMeals.reduce((sum, meal) => sum + meal.protein, 0);
        const totalCalories = updatedMeals.reduce((sum, meal) => sum + meal.calories, 0);

        return {
          ...plan,
          meals: updatedMeals,
          totalProtein,
          totalCalories
        };
      }
      return plan;
    });

    savePlans(newPlans);
  };

  const deleteMeal = (planId: string, mealId: string) => {
    const newPlans = plans.map(plan => {
      if (plan.id === planId) {
        const updatedMeals = plan.meals.filter(meal => meal.id !== mealId);
        
        // Recalculate totals
        const totalProtein = updatedMeals.reduce((sum, meal) => sum + meal.protein, 0);
        const totalCalories = updatedMeals.reduce((sum, meal) => sum + meal.calories, 0);

        return {
          ...plan,
          meals: updatedMeals,
          totalProtein,
          totalCalories
        };
      }
      return plan;
    });

    savePlans(newPlans);
  };

  const resetToDefault = () => {
    // Manter a estrutura das refeições mas limpar os valores
    const resetPlans = plans.map(plan => ({
      ...plan,
      meals: plan.meals.map(meal => ({
        ...meal,
        foods: [], // Limpar alimentos
        protein: 0, // Resetar proteína
        calories: 0, // Resetar calorias
        description: 'Adicione uma descrição para esta refeição', // Resetar descrição
      })),
      totalProtein: 0,
      totalCalories: 0,
    }));

    savePlans(resetPlans);
  };

  const selectPlan = (planId: string) => {
    setSelectedPlanId(planId);
    localStorage.setItem('nutrition_selected_plan', planId);
  };

  // NOVAS FUNÇÕES PARA GERENCIAR MODELOS
  const createNewPlan = (name: string, basePlan?: DailyPlan) => {
    let newPlan: DailyPlan;
    
    if (basePlan) {
      // Duplicar um plano existente com todas as refeições e metas
      newPlan = {
        ...basePlan,
        id: `plan-${Date.now()}`,
        name,
        // Manter todas as refeições do plano base
        meals: basePlan.meals.map(meal => ({
          ...meal,
          id: `meal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` // Novo ID único para cada refeição
        })),
        // Manter as metas do plano base
        proteinGoal: basePlan.proteinGoal || 150,
        caloriesGoal: basePlan.caloriesGoal || 2000
      };
    } else {
      // Criar plano vazio com algumas refeições padrão e metas padrão
      newPlan = {
        id: `plan-${Date.now()}`,
        name,
        totalProtein: 0,
        totalCalories: 0,
        proteinGoal: 150, // Meta padrão de proteína
        caloriesGoal: 2000, // Meta padrão de calorias
        meals: [
          {
            id: `meal-${Date.now()}-breakfast`,
            time: '08:00',
            name: 'Café da Manhã',
            emoji: '☕',
            protein: 0,
            calories: 0,
            description: 'Adicione alimentos para o café da manhã',
            foods: []
          },
          {
            id: `meal-${Date.now()}-lunch`,
            time: '12:00',
            name: 'Almoço',
            emoji: '🍽️',
            protein: 0,
            calories: 0,
            description: 'Adicione alimentos para o almoço',
            foods: []
          },
          {
            id: `meal-${Date.now()}-dinner`,
            time: '19:00',
            name: 'Jantar',
            emoji: '🌙',
            protein: 0,
            calories: 0,
            description: 'Adicione alimentos para o jantar',
            foods: []
          }
        ]
      };
      
      // Calcular totais iniciais
      newPlan.totalProtein = newPlan.meals.reduce((sum, meal) => sum + meal.protein, 0);
      newPlan.totalCalories = newPlan.meals.reduce((sum, meal) => sum + meal.calories, 0);
    }

    const newPlans = [...plans, newPlan];
    savePlans(newPlans);
    return newPlan.id;
  };

  const updatePlan = (planId: string, updates: Partial<DailyPlan>) => {
    console.log('🔄 Atualizando plano:', planId, updates); // Debug
    const newPlans = plans.map((plan) => 
      plan.id === planId ? { ...plan, ...updates } : plan
    );
    savePlans(newPlans);
  };

  const deletePlan = (planId: string) => {
    if (plans.length <= 1) {
      throw new Error("Não é possível excluir o último plano");
    }

    const newPlans = plans.filter((plan) => plan.id !== planId);

    // Se o plano selecionado foi excluído, selecionar o primeiro disponível
    if (selectedPlanId === planId && newPlans.length > 0) {
      setSelectedPlanId(newPlans[0].id);
      localStorage.setItem('nutrition_selected_plan', newPlans[0].id);
    }

    savePlans(newPlans);
  };

  const duplicatePlan = (planId: string, newName: string) => {
    const originalPlan = plans.find((plan) => plan.id === planId);
    if (!originalPlan) return;

    const newPlan: DailyPlan = {
      ...originalPlan,
      id: `plan-${Date.now()}`,
      name: newName,
      // Garantir que as refeições tenham novos IDs únicos
      meals: originalPlan.meals.map(meal => ({
        ...meal,
        id: `meal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }))
    };

    const newPlans = [...plans, newPlan];
    savePlans(newPlans);
    return newPlan.id;
  };

  const selectedPlan = plans.find(p => p.id === selectedPlanId) || plans[0];

  return {
    plans,
    selectedPlan,
    selectedPlanId,
    updateMeal,
    addMeal,
    deleteMeal,
    selectPlan,
    resetToDefault,
    createNewPlan,
    updatePlan,
    deletePlan,
    duplicatePlan
  };
};