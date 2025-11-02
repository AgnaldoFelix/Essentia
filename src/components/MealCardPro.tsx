import { Card, CardBody, CardFooter, Chip, Button } from '@nextui-org/react';
import { Meal } from '@/types/nutrition';
import { Clock, Flame, Beef, Edit2, Trash2 } from 'lucide-react';

interface MealCardProProps {
  meal: Meal;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const MealCardPro = ({ meal, onEdit, onDelete }: MealCardProProps) => {
  return (
    <Card 
      className="border-none bg-gradient-to-br from-card to-card/50 hover:shadow-lg transition-all duration-300 group"
      shadow="sm"
    >
      <CardBody className="p-6">
        <div className="flex items-start gap-4">
          <div className="text-5xl shrink-0">{meal.emoji}</div>
          
          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-default-400" />
                  <span className="text-sm font-medium text-default-500">{meal.time}</span>
                </div>
                <h3 className="text-xl font-bold text-foreground">{meal.name}</h3>
              </div>
              
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {onEdit && (
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onPress={onEdit}
                    className="text-primary hover:bg-primary/10"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onPress={onDelete}
                    className="text-danger hover:bg-danger/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-1">
              {meal.foods.map((food) => (
                <div key={food.id} className="text-sm text-default-600">
                  • {food.name} - {food.amount}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardBody>
      
      <CardFooter className="flex-col items-start gap-3 px-6 pb-6 pt-0">
        <div className="flex gap-2 flex-wrap">
          <Chip 
            startContent={<Beef className="h-3 w-3" />}
            variant="flat"
            color="primary"
            size="sm"
          >
            {meal.protein}g proteína
          </Chip>
          <Chip 
            startContent={<Flame className="h-3 w-3" />}
            variant="flat"
            color="warning"
            size="sm"
          >
            {meal.calories} kcal
          </Chip>
        </div>

        <p className="text-sm text-default-500 italic">
          👉 {meal.description}
        </p>
      </CardFooter>
    </Card>
  );
};
