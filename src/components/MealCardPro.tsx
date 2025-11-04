import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Meal } from '@/types/nutrition';
import { Clock, Flame, Beef, Edit2, Trash2 } from 'lucide-react';

interface MealCardProProps {
  meal: Meal;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const MealCardPro = ({ meal, onEdit, onDelete }: MealCardProProps) => {
  return (
    <Card className="border bg-gradient-to-br from-card to-card/50 hover:shadow-lg transition-all duration-300 group">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="text-5xl shrink-0">{meal.emoji}</div>
          
          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">{meal.time}</span>
                </div>
                <h3 className="text-xl font-bold">{meal.name}</h3>
              </div>
              
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {onEdit && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={onEdit}
                    className="h-8 w-8 p-0"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={onDelete}
                    className="h-8 w-8 p-0 text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-1">
              {meal.foods.map((food) => (
                <div key={food.id} className="text-sm text-muted-foreground">
                  • {food.name} - {food.amount}g ({food.protein}g proteína, {food.calories} kcal)
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex-col items-start gap-3 px-6 pb-6 pt-0">
        <div className="flex gap-2 flex-wrap">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Beef className="h-3 w-3" />
            {meal.protein}g proteína
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Flame className="h-3 w-3" />
            {meal.calories} kcal
          </Badge>
        </div>

        <p className="text-sm text-muted-foreground italic">
          👉 {meal.description}
        </p>
      </CardFooter>
    </Card>
  );
};
