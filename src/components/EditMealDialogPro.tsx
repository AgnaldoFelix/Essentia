import { useState } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
  Divider
} from '@nextui-org/react';
import { Meal, FoodItem } from '@/types/nutrition';
import { Plus, Trash2, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

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
    <Modal 
      isOpen={isOpen} 
      onOpenChange={onOpenChange}
      size="3xl"
      scrollBehavior="inside"
      classNames={{
        base: "bg-background",
        header: "border-b border-divider",
        footer: "border-t border-divider",
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <h2 className="text-2xl font-bold gradient-primary bg-clip-text text-transparent">
                Editar Refeição
              </h2>
              <p className="text-sm text-default-500 font-normal">
                Personalize os detalhes da sua refeição
              </p>
            </ModalHeader>
            
            <ModalBody className="py-6">
              <div className="space-y-6">
                {/* Nome e Emoji */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <Input
                      label="Nome da Refeição"
                      placeholder="Ex: Café da manhã"
                      value={editedMeal.name}
                      onValueChange={(value) => setEditedMeal({ ...editedMeal, name: value })}
                      variant="bordered"
                      labelPlacement="outside"
                    />
                  </div>
                  <div>
                    <Input
                      label="Emoji"
                      placeholder="🥗"
                      value={editedMeal.emoji}
                      onValueChange={(value) => setEditedMeal({ ...editedMeal, emoji: value })}
                      variant="bordered"
                      labelPlacement="outside"
                      maxLength={2}
                      classNames={{
                        input: "text-2xl"
                      }}
                    />
                  </div>
                </div>

                {/* Horário */}
                <Input
                  label="Horário"
                  type="time"
                  value={editedMeal.time}
                  onValueChange={(value) => setEditedMeal({ ...editedMeal, time: value })}
                  variant="bordered"
                  labelPlacement="outside"
                />

                {/* Macros */}
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Proteína (g)"
                    type="number"
                    value={editedMeal.protein.toString()}
                    onValueChange={(value) => setEditedMeal({ ...editedMeal, protein: Number(value) })}
                    variant="bordered"
                    labelPlacement="outside"
                    min="0"
                  />
                  <Input
                    label="Calorias (kcal)"
                    type="number"
                    value={editedMeal.calories.toString()}
                    onValueChange={(value) => setEditedMeal({ ...editedMeal, calories: Number(value) })}
                    variant="bordered"
                    labelPlacement="outside"
                    min="0"
                  />
                </div>

                {/* Descrição */}
                <Textarea
                  label="Descrição"
                  placeholder="Descreva o objetivo desta refeição..."
                  value={editedMeal.description}
                  onValueChange={(value) => setEditedMeal({ ...editedMeal, description: value })}
                  variant="bordered"
                  labelPlacement="outside"
                  minRows={3}
                />

                <Divider />

                {/* Alimentos */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Alimentos</h3>
                    <Button
                      color="primary"
                      variant="flat"
                      size="sm"
                      onPress={handleAddFood}
                      startContent={<Plus className="h-4 w-4" />}
                    >
                      Adicionar Alimento
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {editedMeal.foods.map((food) => (
                      <div key={food.id} className="flex gap-3 items-start p-4 rounded-lg border border-divider bg-default-50">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                          <Input
                            label="Nome do alimento"
                            placeholder="Ex: Frango grelhado"
                            value={food.name}
                            onValueChange={(value) => handleFoodChange(food.id, 'name', value)}
                            variant="bordered"
                            size="sm"
                            labelPlacement="outside"
                          />
                          <Input
                            label="Quantidade"
                            placeholder="Ex: 200g"
                            value={food.amount}
                            onValueChange={(value) => handleFoodChange(food.id, 'amount', value)}
                            variant="bordered"
                            size="sm"
                            labelPlacement="outside"
                          />
                        </div>
                        <Button
                          isIconOnly
                          color="danger"
                          variant="light"
                          size="sm"
                          onPress={() => handleRemoveFood(food.id)}
                          className="mt-6"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ModalBody>
            
            <ModalFooter>
              <Button variant="flat" onPress={onClose}>
                Cancelar
              </Button>
              <Button 
                color="primary"
                onPress={handleSave}
                startContent={<Save className="h-4 w-4" />}
                className="bg-gradient-primary"
              >
                Salvar Alterações
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
