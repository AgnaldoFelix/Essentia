import { useState, useCallback, useMemo, useEffect } from 'react';
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
import { Plus, Trash2, Save, Smile, Sparkles, Bot } from 'lucide-react';
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

interface NutritionalData {
  protein: number;
  calories: number;
}

// Usar o mesmo endpoint do chat
const NUTRITION_API = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, "")}/avaliar`
  : "/avaliar";

export const EditMealDialogPro = ({ meal, isOpen, onOpenChange, onSave }: EditMealDialogProProps) => {
  const [editedMeal, setEditedMeal] = useState<Meal>(meal);
  const [autoCompleteLoading, setAutoCompleteLoading] = useState<string | null>(null);
  const [newFoodId, setNewFoodId] = useState<string | null>(null);

  // Reset editedMeal when meal prop changes
  useEffect(() => {
    setEditedMeal(meal);
    setNewFoodId(null);
  }, [meal]);

  // Função para calcular os totais baseado nos alimentos
  const calculateTotals = useCallback((foods: FoodItem[]) => {
    const totalProtein = foods.reduce((sum, food) => sum + (Number(food.protein) || 0), 0);
    const totalCalories = foods.reduce((sum, food) => sum + (Number(food.calories) || 0), 0);
    
    return {
      protein: Math.round(totalProtein * 10) / 10,
      calories: Math.round(totalCalories)
    };
  }, []);

  // Memoizar os totais
  const totals = useMemo(() => calculateTotals(editedMeal.foods), [editedMeal.foods, calculateTotals]);

  const fetchNutritionalData = useCallback(async (foodName: string, amount: string, unit: string): Promise<NutritionalData> => {
    if (!foodName.trim() || foodName === 'Novo alimento') {
      throw new Error('Digite o nome do alimento primeiro');
    }

    let query = foodName;
    
    if (unit === 'g' || unit === 'ml') {
      // Para gramas ou ml, usa a quantidade numérica
      if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        throw new Error(`Digite uma quantidade válida em ${unit}`);
      }
      const numericAmount = parseFloat(amount);
      query = `${foodName} ${numericAmount}${unit}`;
    } else if (unit === 'unit') {
      // Para unidades, verifica se já começa com número
      const startsWithNumber = /^\d+\s/.test(foodName.trim());
      if (!startsWithNumber) {
        if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
          throw new Error('Digite uma quantidade válida em unidades');
        }
        const numericAmount = parseFloat(amount);
        query = `${numericAmount} ${foodName}`;
      } else {
        // Se já começa com número, usa o foodName como está
        query = foodName;
      }
    }

    try {
      const response = await fetch(NUTRITION_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          chat_history: [],
          intent: "calculate_nutrition"
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro do servidor: ${response.status}`);
      }

      const data = await response.json();
      const reply = data.reply || data;
      
      console.log('Resposta da IA (cálculo):', reply);
      
      let nutritionData: NutritionalData;
      try {
        nutritionData = JSON.parse(reply);
      } catch {
        throw new Error('Resposta da IA não está no formato JSON esperado');
      }

      if (typeof nutritionData.protein !== 'number' || typeof nutritionData.calories !== 'number') {
        throw new Error('Dados nutricionais incompletos na resposta');
      }

      return {
        protein: Math.round(nutritionData.protein * 10) / 10,
        calories: Math.round(nutritionData.calories)
      };
    } catch (error) {
      console.error('Erro ao buscar dados nutricionais:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erro de conexão com o servidor');
    }
  }, []);

  // Função para auto-completar um alimento
  const handleAutoComplete = useCallback(async (foodId: string, foodName: string, amount: string, unit: string) => {
    setAutoCompleteLoading(foodId);

    try {
      const nutritionData = await fetchNutritionalData(foodName, amount, unit);
      
      setEditedMeal(prev => {
        const updatedFoods = prev.foods.map(food => 
          food.id === foodId 
            ? {
                ...food,
                protein: nutritionData.protein,
                calories: nutritionData.calories
              }
            : food
        );

        return {
          ...prev,
          foods: updatedFoods
        };
      });

      toast({
        title: "Dados calculados! 🎉",
        description: `Proteína: ${nutritionData.protein}g | Calorias: ${nutritionData.calories}kcal`,
      });
    } catch (error) {
      console.error('Erro no auto-complete:', error);
      toast({
        title: "Erro na consulta",
        description: error instanceof Error ? error.message : "Não foi possível calcular os valores nutricionais",
        variant: "destructive"
      });
    } finally {
      setAutoCompleteLoading(null);
    }
  }, [fetchNutritionalData, toast]);

  const handleAddFood = useCallback(() => {
    const newFoodId = `food-${Date.now()}`;
    const newFood: FoodItem = {
      id: newFoodId,
      name: '',
      amount: '',
      unit: 'g',
      protein: 0,
      calories: 0
    };

    setEditedMeal(prev => ({
      ...prev,
      foods: [newFood, ...prev.foods] // Adiciona no TOPO da lista
    }));
    
    setNewFoodId(newFoodId);
    
    // Foca no input do novo alimento após um pequeno delay
    setTimeout(() => {
      const input = document.getElementById(`food-name-${newFoodId}`);
      if (input) {
        input.focus();
      }
    }, 100);
  }, []);

  const handleRemoveFood = useCallback((foodId: string) => {
    setEditedMeal(prev => ({
      ...prev,
      foods: prev.foods.filter(f => f.id !== foodId)
    }));
    if (foodId === newFoodId) {
      setNewFoodId(null);
    }
  }, [newFoodId]);

  const handleFoodChange = useCallback((foodId: string, field: keyof FoodItem, value: string | number) => {
    setEditedMeal(prev => ({
      ...prev,
      foods: prev.foods.map(f => 
        f.id === foodId ? { 
          ...f, 
          [field]: field === 'name' || field === 'amount' || field === 'unit' ? value : Number(value)
        } : f
      )
    }));
  }, []);

  const handleSave = useCallback(() => {
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

    // Atualizar totais antes de salvar
    const mealWithTotals = {
      ...editedMeal,
      protein: totals.protein,
      calories: totals.calories
    };

    onSave(mealWithTotals);
    toast({
      title: "Sucesso",
      description: "Refeição atualizada com sucesso!",
    });
    onOpenChange(false);
  }, [editedMeal, totals, onSave, onOpenChange, toast]);

  // Separar alimentos em: novos (vazios) e preenchidos
  const [emptyFoods, filledFoods] = useMemo(() => {
    const empty = editedMeal.foods.filter(food => !food.name.trim() || food.name === '');
    const filled = editedMeal.foods.filter(food => food.name.trim() && food.name !== '');
    return [empty, filled];
  }, [editedMeal.foods]);

  // Ordenar: novos vazios primeiro, depois preenchidos
  const sortedFoods = useMemo(() => {
    return [...emptyFoods, ...filledFoods];
  }, [emptyFoods, filledFoods]);

  // Calcular se há algum alimento vazio
  const hasEmptyFood = useMemo(() => emptyFoods.length > 0, [emptyFoods]);

  // Handler para emoji
  const handleEmojiSelect = useCallback((emoji: EmojiData) => {
    setEditedMeal(prev => ({ ...prev, emoji: emoji.native }));
  }, []);

  // Handler para mudança de nome da refeição
  const handleMealNameChange = useCallback((value: string) => {
    setEditedMeal(prev => ({ ...prev, name: value }));
  }, []);

  // Handler para mudança de horário
  const handleTimeChange = useCallback((value: string) => {
    setEditedMeal(prev => ({ ...prev, time: value }));
  }, []);

  // Handler para mudança de descrição
  const handleDescriptionChange = useCallback((value: string) => {
    setEditedMeal(prev => ({ ...prev, description: value }));
  }, []);

  // Atualizar totais quando foods mudam
  useEffect(() => {
    setEditedMeal(prev => ({
      ...prev,
      protein: totals.protein,
      calories: totals.calories
    }));
  }, [totals]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-900 dark:to-blue-900/20 border-0 shadow-2xl">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-[#1387ED] to-[#13EDC5] bg-clip-text text-transparent flex items-center gap-3">
            <div className="p-2 rounded-full bg-gradient-to-br from-[#1387ED] to-[#13EDC5] shadow-lg">
              <Bot className="h-5 w-5 text-white" />
            </div>
            Editar Refeição com IA
          </DialogTitle>
          <DialogDescription className="text-base text-slate-600 dark:text-slate-300">
            Adicione alimentos e use a IA para calcular automaticamente proteínas e calorias
          </DialogDescription>
        </DialogHeader>
            
        <div className="py-6 space-y-6">
          {/* Nome e Emoji */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="text-sm font-semibold mb-3 block text-slate-700 dark:text-slate-200">
                Nome da Refeição
              </label>
              <Input
                placeholder="Ex: Café da manhã proteico"
                value={editedMeal.name}
                onChange={(e) => handleMealNameChange(e.target.value)}
                className="h-12 border-slate-300 dark:border-slate-600 focus:border-[#1387ED] focus:ring-[#1387ED] rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm"
              />
            </div>
            <div>
              <label className="text-sm font-semibold mb-3 block text-slate-700 dark:text-slate-200">
                Emoji
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full h-12 flex justify-between items-center text-2xl border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm"
                  >
                    <span>{editedMeal.emoji || '🥗'}</span>
                    <Smile className="h-5 w-5 text-[#1387ED]" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 border-0 shadow-2xl rounded-xl overflow-hidden" align="start">
                  <Picker
                    data={data}
                    onEmojiSelect={handleEmojiSelect}
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
            <label className="text-sm font-semibold mb-3 block text-slate-700 dark:text-slate-200">
              Horário
            </label>
            <Input
              type="time"
              value={editedMeal.time}
              onChange={(e) => handleTimeChange(e.target.value)}
              className="h-12 border-slate-300 dark:border-slate-600 focus:border-[#1387ED] focus:ring-[#1387ED] rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm"
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="text-sm font-semibold mb-3 block text-slate-700 dark:text-slate-200">
              Descrição
            </label>
            <Textarea
              placeholder="Descreva o objetivo desta refeição..."
              value={editedMeal.description}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              rows={3}
              className="border-slate-300 dark:border-slate-600 focus:border-[#1387ED] focus:ring-[#1387ED] rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm resize-none"
            />
          </div>

          <Separator className="bg-slate-300/50 dark:bg-slate-600/50" />

          {/* Alimentos com IA */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3 mb-2">
                  Alimentos
                  <span className="text-xs bg-gradient-to-r from-[#13EDC5] to-[#1387ED] text-white px-3 py-1.5 rounded-full flex items-center gap-1 shadow-md">
                    <Sparkles className="h-3 w-3" />
                    IA Disponível
                  </span>
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {hasEmptyFood 
                    ? "Preencha os alimentos abaixo ou adicione mais" 
                    : "Digite o alimento e quantidade, selecione a unidade e clique em 'Calcular com IA'"}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddFood}
                className="gap-2 border-[#13ED7C] text-[#13ED7C] hover:bg-[#13ED7C] hover:text-white rounded-xl transition-all duration-200 shadow-sm h-11 px-4"
              >
                <Plus className="h-4 w-4" /> 
                <span className="hidden sm:inline">Adicionar</span>
                <span className="sm:hidden">Alimento</span>
              </Button>
            </div>

            <div className="space-y-4">
              {sortedFoods.map((food) => (
                <div key={food.id} className={`p-4 rounded-2xl border ${!food.name.trim() ? 'border-yellow-300/50 dark:border-yellow-500/50 bg-yellow-50/60 dark:bg-yellow-900/20' : 'border-slate-300/50 dark:border-slate-600/50 bg-white/60 dark:bg-slate-800/60'} backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200`}>
                  {!food.name.trim() && (
                    <div className="mb-3 p-2 rounded-lg bg-yellow-100/80 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700">
                      <p className="text-sm text-green-800 dark:text-green-200 flex items-center gap-1">
                        <span className="text-lg">🆕</span>
                        <span className="font-medium">Novo alimento - preencha os dados abaixo</span>
                      </p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3">
                    {/* Nome do alimento */}
                    <div className="lg:col-span-4">
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">
                        Nome do Alimento
                      </label>
                      <Input
                        id={`food-name-${food.id}`}
                        placeholder="Ex: Frango grelhado, Arroz integral, etc."
                        value={food.name}
                        onChange={(e) => handleFoodChange(food.id, 'name', e.target.value)}
                        className="border-slate-300 dark:border-slate-600 focus:border-[#1387ED] focus:ring-[#1387ED] rounded-lg bg-white dark:bg-slate-700"
                      />
                    </div>
                    
                    {/* Quantidade e Unidade */}
                    <div className="lg:col-span-3">
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">
                        Quantidade
                      </label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="Ex: 200"
                          value={food.amount}
                          onChange={(e) => handleFoodChange(food.id, 'amount', e.target.value)}
                          className="border-slate-300 dark:border-slate-600 focus:border-[#1387ED] focus:ring-[#1387ED] rounded-lg bg-white dark:bg-slate-700 flex-1"
                        />
                        <select
                          value={food.unit || 'g'}
                          onChange={(e) => handleFoodChange(food.id, 'unit', e.target.value)}
                          className="border-slate-300 dark:border-slate-600 focus:border-[#1387ED] focus:ring-[#1387ED] rounded-lg bg-white dark:bg-slate-700 px-3 text-sm"
                        >
                          <option value="g">g</option>
                          <option value="ml">ml</option>
                          <option value="unit">unidades</option>
                        </select>
                      </div>
                    </div>

                    {/* Botão de IA */}
                    <div className="lg:col-span-3 flex items-end">
                      <Button
                        type="button"
                        variant="default"
                        size="sm"
                        onClick={() => handleAutoComplete(food.id, food.name, food.amount, food.unit || 'g')}
                        disabled={autoCompleteLoading === food.id || !food.name.trim() || !food.amount || parseFloat(food.amount) <= 0}
                        className="w-full gap-2 bg-gradient-to-r from-[#1387ED] to-[#61D8ED] hover:from-[#1178d4] hover:to-[#4fc8e0] text-white rounded-lg transition-all duration-200 shadow-md h-10"
                      >
                        {autoCompleteLoading === food.id ? (
                          <>
                            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span className="hidden sm:inline">Calculando...</span>
                            <span className="sm:hidden">Calculando</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4" />
                            <span className="hidden sm:inline">Calcular com IA</span>
                            <span className="sm:hidden">Calcular IA</span>
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Proteína */}
                    <div className="lg:col-span-1">
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">
                        Proteína (g)
                      </label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={food.protein?.toString() || '0'}
                        onChange={(e) => handleFoodChange(food.id, 'protein', Number(e.target.value))}
                        step="0.1"
                        className="border-slate-300 dark:border-slate-600 focus:border-[#13ED7C] focus:ring-[#13ED7C] rounded-lg bg-white dark:bg-slate-700"
                      />
                    </div>

                    {/* Calorias */}
                    <div className="lg:col-span-1">
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">
                        Calorias (kcal)
                      </label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={food.calories?.toString() || '0'}
                        onChange={(e) => handleFoodChange(food.id, 'calories', Number(e.target.value))}
                        className="border-slate-300 dark:border-slate-600 focus:border-[#1AEF41] focus:ring-[#1AEF41] rounded-lg bg-white dark:bg-slate-700"
                      />
                    </div>
                  </div>

                  {/* Botão remover */}
                  <div className="flex justify-end mt-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFood(food.id)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Remover
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Totais */}
            {filledFoods.length > 0 && (
              <div className="mt-6 p-5 rounded-2xl border border-slate-300/50 dark:border-slate-600/50 bg-gradient-to-r from-blue-50/50 to-emerald-50/50 dark:from-blue-900/20 dark:to-emerald-900/20 backdrop-blur-sm shadow-md">
                <h4 className="font-bold text-lg mb-4 text-slate-800 dark:text-slate-100 text-center">Totais da Refeição</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="text-center p-4 rounded-xl bg-white/80 dark:bg-slate-800/80 shadow-sm border border-[#13ED7C]/20">
                    <span className="text-sm text-slate-600 dark:text-slate-400 block mb-1">Proteína Total</span>
                    <span className="text-2xl font-bold text-[#13ED7C]">{totals.protein.toFixed(1)}g</span>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-white/80 dark:bg-slate-800/80 shadow-sm border border-[#1AEF41]/20">
                    <span className="text-sm text-slate-600 dark:text-slate-400 block mb-1">Calorias Totais</span>
                    <span className="text-2xl font-bold text-[#1AEF41]">{totals.calories} kcal</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
            
        <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-300/50 dark:border-slate-600/50">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="flex-1 h-12 rounded-xl border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSave}
            disabled={hasEmptyFood || editedMeal.foods.length === 0}
            className="flex-1 h-12 gap-2 bg-gradient-to-r from-[#13ED7C] to-[#1AEF41] hover:from-[#11d46f] hover:to-[#16d43a] text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4" /> 
            Salvar Refeição
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};