import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Meal } from '@/types/nutrition';
import { Clock, Flame, Beef, Edit2, Trash2 } from 'lucide-react';
import { useMemo } from 'react'; // 👈 Importação do useMemo

interface MealCardProps {
  meal: Meal;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const MealCard = ({ meal, onEdit, onDelete }: MealCardProps) => {
  // 1. Memorizando a lista de alimentos formatada
  const formattedFoodsList = useMemo(() => {
    return meal.foods.map((food) => (
      <div key={food.id} className="text-sm text-muted-foreground">
        • {food.name} - {food.amount}
      </div>
    ));
  }, [meal.foods]); // 👈 Só recalcula quando meal.foods mudar

  // 2. Memorizando os badges para evitar recriação em cada render
  const proteinBadge = useMemo(() => (
    <Badge variant="secondary" className="bg-[var(--ds-success-50)] text-[var(--ds-success-700)]">
      <Beef className="h-3 w-3 mr-1" />
      {meal.protein}g proteína
    </Badge>
  ), [meal.protein]); // 👈 Só recalcula quando meal.protein mudar

  const caloriesBadge = useMemo(() => (
    <Badge variant="secondary" className="bg-[var(--ds-warning-50)] text-[var(--ds-warning-700)]">
      <Flame className="h-3 w-3 mr-1" />
      {meal.calories} kcal
    </Badge>
  ), [meal.calories]); // 👈 Só recalcula quando meal.calories mudar

  // 3. Memorizando o array de badges para evitar nova referência a cada render
  const badges = useMemo(() => [proteinBadge, caloriesBadge], [proteinBadge, caloriesBadge]);

  // 4. Memorizando os botões de ação
  const actionButtons = useMemo(() => {
    const buttons = [];
    
    if (onEdit) {
      buttons.push(
        <Button
          key="edit"
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="hover:bg-[var(--ds-default-50)] hover:text-[var(--ds-neutral-800)]"
        >
          <Edit2 className="h-4 w-4" />
        </Button>
      );
    }
    
    if (onDelete) {
      buttons.push(
        <Button
          key="delete"
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="hover:bg-[var(--ds-danger-50)] hover:text-[var(--ds-danger-700)]"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      );
    }
    
    return buttons;
  }, [onEdit, onDelete]); // 👈 Só recalcula quando onEdit ou onDelete mudarem

  // 5. Memorizando o wrapper dos botões de ação
  const actionButtonsWrapper = useMemo(() => {
    if (actionButtons.length === 0) return null;
    
    return (
      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {actionButtons}
      </div>
    );
  }, [actionButtons]);

  return (
    <Card 
      className="p-6 transition-all duration-300 border-[color:var(--ds-default-100)] hover:border-[color:var(--ds-success-200)] group"
    >
      <div className="flex items-start gap-4">
        <div className="text-5xl">{meal.emoji}</div>
        
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" style={{ color: 'var(--ds-neutral-500)' }} />
                <span className="text-sm font-medium" style={{ color: 'var(--ds-neutral-600)' }}>
                  {meal.time}
                </span>
              </div>
              <h3 className="text-xl font-bold mt-1" style={{ color: 'var(--ds-neutral-900)' }}>
                {meal.name}
              </h3>
            </div>
            
            {actionButtonsWrapper}
          </div>

          <div className="space-y-1">
            {formattedFoodsList} {/* 👈 Usando o valor memorizado */}
          </div>

          <div className="flex gap-3 flex-wrap">
            {badges} {/* 👈 Usando o array de badges memorizado */}
          </div>

          <p className="text-sm text-muted-foreground italic">
            👉 {meal.description}
          </p>
        </div>
      </div>
    </Card>
  );
};