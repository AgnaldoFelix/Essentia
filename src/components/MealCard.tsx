import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Meal } from '@/types/nutrition';
import { Clock, Flame, Beef, Edit2, Trash2 } from 'lucide-react';

interface MealCardProps {
  meal: Meal;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const MealCard = ({ meal, onEdit, onDelete }: MealCardProps) => {
  return (
    <Card 
      className="p-6 shadow-card hover:shadow-hover transition-all duration-300 border-border/50 hover:border-primary/30 bg-card group"
    >
      <div className="flex items-start gap-4">
        <div className="text-5xl">{meal.emoji}</div>
        
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">{meal.time}</span>
              </div>
              <h3 className="text-xl font-bold text-foreground mt-1">{meal.name}</h3>
            </div>
            
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                  className="hover:bg-primary/10 hover:text-primary"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  className="hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-1">
            {meal.foods.map((food) => (
              <div key={food.id} className="text-sm text-muted-foreground">
                • {food.name} - {food.amount}
              </div>
            ))}
          </div>

          <div className="flex gap-3 flex-wrap">
            <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
              <Beef className="h-3 w-3 mr-1" />
              {meal.protein}g proteína
            </Badge>
            <Badge variant="secondary" className="bg-accent/10 text-accent hover:bg-accent/20">
              <Flame className="h-3 w-3 mr-1" />
              {meal.calories} kcal
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground italic">
            👉 {meal.description}
          </p>
        </div>
      </div>
    </Card>
  );
};
