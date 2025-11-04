import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Meal, FoodItem } from '@/types/nutrition';
import { Plus, Trash2, Save, Smile } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

interface EmojiData {
  id: string;
  name: string;
  native: string;
  unified: string;
  keywords: string[];
  shortcodes: string;
}

interface EditMealDialogProProps {
  meal: Meal;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (meal: Meal) => void;
}

export const EditMealDialogPro = ({ meal, isOpen, onOpenChange, onSave }: EditMealDialogProProps) => {
  const [editedMeal, setEditedMeal] = useState<Meal>(meal);

  const handleAddFood = () => {
    const newFood: FoodItem = {
      id: `food-${Date.now()}`,
      name: 'Novo alimento',
      amount: '100',
      protein: 0,
      calories: 0
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

  const handleFoodChange = (foodId: string, field: keyof FoodItem, value: string | number) => {
    setEditedMeal({
      ...editedMeal,
      foods: editedMeal.foods.map(f => 
        f.id === foodId ? { ...f, [field]: value } : f
      )
    });

    // Recalcular os totais de proteína e calorias
    const totalProtein = editedMeal.foods.reduce((sum, food) => 
      sum + (food.id === foodId && field === 'protein' ? Number(value) : (food.protein || 0)), 0
    );
    const totalCalories = editedMeal.foods.reduce((sum, food) => 
      sum + (food.id === foodId && field === 'calories' ? Number(value) : (food.calories || 0)), 0
    );

    setEditedMeal(prev => ({
      ...prev,
      protein: totalProtein,
      calories: totalCalories
    }));
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
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
            Editar Refeição
          </DialogTitle>
          <DialogDescription>
            Personalize os detalhes da sua refeição
          </DialogDescription>
        </DialogHeader>
            
        <div className="py-6 space-y-6">
          {/* Nome e Emoji */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-2 block">
                Nome da Refeição
              </label>
              <Input
                placeholder="Ex: Café da manhã"
                value={editedMeal.name}
                onChange={(e) => setEditedMeal({ ...editedMeal, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Emoji
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full h-10 flex justify-between items-center text-2xl"
                  >
                    <span>{editedMeal.emoji || '🥗'}</span>
                    <Smile className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Picker
                    data={data}
                    onEmojiSelect={(emoji: EmojiData) => {
                      setEditedMeal({ ...editedMeal, emoji: emoji.native });
                    }}
                    locale="pt"
                    previewPosition="none"
                    skinTonePosition="none"
                    searchPosition="none"
                    theme="light"
                    set="native"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Horário */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Horário
            </label>
            <Input
              type="time"
              value={editedMeal.time}
              onChange={(e) => setEditedMeal({ ...editedMeal, time: e.target.value })}
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Descrição
            </label>
            <Textarea
              placeholder="Descreva o objetivo desta refeição..."
              value={editedMeal.description}
              onChange={(e) => setEditedMeal({ ...editedMeal, description: e.target.value })}
              rows={3}
            />
          </div>

          <Separator />

          {/* Alimentos */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Alimentos</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddFood}
                className="gap-1"
              >
                <Plus className="h-4 w-4" /> Adicionar Alimento
              </Button>
            </div>

            <div className="space-y-4">
              {editedMeal.foods.map((food) => (
                <div key={food.id} className="p-4 rounded-lg border bg-muted/50">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Nome do alimento
                      </label>
                      <Input
                        placeholder="Ex: Frango grelhado"
                        value={food.name}
                        onChange={(e) => handleFoodChange(food.id, 'name', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Quantidade (g)
                      </label>
                      <Input
                        type="number"
                        placeholder="Ex: 200"
                        value={food.amount}
                        onChange={(e) => handleFoodChange(food.id, 'amount', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Proteína (g)
                      </label>
                      <Input
                        type="number"
                        placeholder="Ex: 30"
                        value={food.protein?.toString() || '0'}
                        onChange={(e) => handleFoodChange(food.id, 'protein', Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Calorias (kcal)
                      </label>
                      <Input
                        type="number"
                        placeholder="Ex: 165"
                        value={food.calories?.toString() || '0'}
                        onChange={(e) => handleFoodChange(food.id, 'calories', Number(e.target.value))}
                      />
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFood(food.id)}
                    className="mt-2 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Totais */}
            <div className="mt-4 p-4 rounded-lg border bg-muted">
              <h4 className="font-medium mb-2">Totais da Refeição:</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Proteína Total:</span>
                  <span className="ml-2 font-medium">{editedMeal.protein}g</span>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Calorias Totais:</span>
                  <span className="ml-2 font-medium">{editedMeal.calories} kcal</span>
                </div>
              </div>
            </div>
          </div>
        </div>
            
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSave}
            className="gap-1"
          >
            <Save className="h-4 w-4" /> Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
