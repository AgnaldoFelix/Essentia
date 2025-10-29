import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Meal, FoodItem } from '@/types/nutrition';
import { Plus, Trash2, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface EditMealDialogProps {
  meal: Meal;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (meal: Meal) => void;
}

export const EditMealDialog = ({ meal, open, onOpenChange, onSave }: EditMealDialogProps) => {
  const [editedMeal, setEditedMeal] = useState<Meal>(meal);

  const handleAddFood = () => {
    const newFood: FoodItem = {
      id: `food-${Date.now()}`,
      name: 'Novo alimento',
      amount: '100g'
    };
    setEditedMeal({
      ...editedMeal,
      foods: [...editedMeal.foods, newFood]
    });
  };

  const handleRemoveFood = (foodId: string) => {
    setEditedMeal({
      ...editedMeal,
      foods: editedMeal.foods.filter(f => f.id !== foodId)
    });
  };

  const handleFoodChange = (foodId: string, field: 'name' | 'amount', value: string) => {
    setEditedMeal({
      ...editedMeal,
      foods: editedMeal.foods.map(f => 
        f.id === foodId ? { ...f, [field]: value } : f
      )
    });
  };

  const handleSave = () => {
    if (!editedMeal.name.trim()) {
      toast({
        title: "Erro",
        description: "O nome da refeição é obrigatório",
        variant: "destructive"
      });
      return;
    }

    if (editedMeal.foods.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione pelo menos um alimento",
        variant: "destructive"
      });
      return;
    }

    onSave(editedMeal);
    toast({
      title: "Sucesso",
      description: "Refeição atualizada com sucesso!",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl gradient-primary bg-clip-text text-transparent">
            Editar Refeição
          </DialogTitle>
          <DialogDescription>
            Personalize os detalhes da sua refeição
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Nome e Emoji */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="name">Nome da Refeição</Label>
              <Input
                id="name"
                value={editedMeal.name}
                onChange={(e) => setEditedMeal({ ...editedMeal, name: e.target.value })}
                placeholder="Ex: Café da manhã"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="emoji">Emoji</Label>
              <Input
                id="emoji"
                value={editedMeal.emoji}
                onChange={(e) => setEditedMeal({ ...editedMeal, emoji: e.target.value })}
                placeholder="🥗"
                className="mt-1 text-2xl"
                maxLength={2}
              />
            </div>
          </div>

          {/* Horário */}
          <div>
            <Label htmlFor="time">Horário</Label>
            <Input
              id="time"
              type="time"
              value={editedMeal.time}
              onChange={(e) => setEditedMeal({ ...editedMeal, time: e.target.value })}
              className="mt-1"
            />
          </div>

          {/* Macros */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="protein">Proteína (g)</Label>
              <Input
                id="protein"
                type="number"
                value={editedMeal.protein}
                onChange={(e) => setEditedMeal({ ...editedMeal, protein: Number(e.target.value) })}
                className="mt-1"
                min="0"
              />
            </div>
            <div>
              <Label htmlFor="calories">Calorias (kcal)</Label>
              <Input
                id="calories"
                type="number"
                value={editedMeal.calories}
                onChange={(e) => setEditedMeal({ ...editedMeal, calories: Number(e.target.value) })}
                className="mt-1"
                min="0"
              />
            </div>
          </div>

          {/* Descrição */}
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={editedMeal.description}
              onChange={(e) => setEditedMeal({ ...editedMeal, description: e.target.value })}
              placeholder="Descreva o objetivo desta refeição..."
              className="mt-1 min-h-[80px]"
            />
          </div>

          {/* Alimentos */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label>Alimentos</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddFood}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Adicionar Alimento
              </Button>
            </div>

            <div className="space-y-3">
              {editedMeal.foods.map((food, index) => (
                <div key={food.id} className="flex gap-2 items-start p-4 rounded-lg border border-border/50 bg-muted/30">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor={`food-name-${food.id}`} className="text-xs">
                        Nome do alimento
                      </Label>
                      <Input
                        id={`food-name-${food.id}`}
                        value={food.name}
                        onChange={(e) => handleFoodChange(food.id, 'name', e.target.value)}
                        placeholder="Ex: Frango grelhado"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`food-amount-${food.id}`} className="text-xs">
                        Quantidade
                      </Label>
                      <Input
                        id={`food-amount-${food.id}`}
                        value={food.amount}
                        onChange={(e) => handleFoodChange(food.id, 'amount', e.target.value)}
                        placeholder="Ex: 200g"
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveFood(food.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 mt-6"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} className="bg-gradient-primary gap-2">
            <Save className="h-4 w-4" />
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
