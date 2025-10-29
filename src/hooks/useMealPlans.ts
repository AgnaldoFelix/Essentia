import { useState, useEffect } from 'react';
import { DailyPlan, Meal } from '@/types/nutrition';
import { mealPlans as defaultMealPlans } from '@/data/mealPlans';

const CUSTOM_PLANS_KEY = 'nutrition_custom_plans';

export const useMealPlans = () => {
  const [plans, setPlans] = useState<DailyPlan[]>(defaultMealPlans);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('plan-15h');

  // Load custom plans from localStorage on mount
  useEffect(() => {
    const savedPlans = localStorage.getItem(CUSTOM_PLANS_KEY);
    if (savedPlans) {
      try {
        const customPlans = JSON.parse(savedPlans);
        setPlans(customPlans);
      } catch (error) {
        console.error('Error loading custom plans:', error);
      }
    }

    const savedPlanId = localStorage.getItem('nutrition_selected_plan');
    if (savedPlanId) {
      setSelectedPlanId(savedPlanId);
    }
  }, []);

  // Save plans to localStorage whenever they change
  const savePlans = (newPlans: DailyPlan[]) => {
    setPlans(newPlans);
    localStorage.setItem(CUSTOM_PLANS_KEY, JSON.stringify(newPlans));
  };

  const updateMeal = (planId: string, mealId: string, updatedMeal: Meal) => {
    const newPlans = plans.map(plan => {
      if (plan.id === planId) {
        const updatedMeals = plan.meals.map(meal => 
          meal.id === mealId ? updatedMeal : meal
        );
        
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
    savePlans(defaultMealPlans);
    localStorage.removeItem('nutrition_selected_plan');
    setSelectedPlanId('plan-15h');
  };

  const selectPlan = (planId: string) => {
    setSelectedPlanId(planId);
    localStorage.setItem('nutrition_selected_plan', planId);
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
    resetToDefault
  };
};
