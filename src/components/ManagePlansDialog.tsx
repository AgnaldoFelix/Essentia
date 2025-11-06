import { useState } from 'react';
import { DailyPlan } from '@/types/nutrition';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Copy, Trash2, Edit, Check, X, Target, Flame } from 'lucide-react';

interface ManagePlansDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  plans: DailyPlan[];
  selectedPlanId: string;
  onSelectPlan: (planId: string) => void;
  onCreatePlan: (name: string, basePlan?: DailyPlan) => string;
  onUpdatePlan: (planId: string, updates: Partial<DailyPlan>) => void;
  onDeletePlan: (planId: string) => void;
  onDuplicatePlan: (planId: string, newName: string) => string;
}

export const ManagePlansDialog = ({
  isOpen,
  onOpenChange,
  plans,
  selectedPlanId,
  onSelectPlan,
  onCreatePlan,
  onUpdatePlan,
  onDeletePlan,
  onDuplicatePlan
}: ManagePlansDialogProps) => {
  const [newPlanName, setNewPlanName] = useState('');
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [editPlanName, setEditPlanName] = useState('');
  const [editProteinGoal, setEditProteinGoal] = useState(150);
  const [editCaloriesGoal, setEditCaloriesGoal] = useState(2000);
  const { toast } = useToast();

  const handleCreatePlan = () => {
    if (!newPlanName.trim()) {
      toast({
        title: "Nome inválido",
        description: "Digite um nome para o novo plano",
        variant: "destructive"
      });
      return;
    }

    // Criar plano com metas padrão
    const newPlanId = onCreatePlan(newPlanName.trim());
    setNewPlanName('');
    
    toast({
      title: "Plano criado",
      description: `Plano "${newPlanName}" criado com sucesso`,
    });

    onSelectPlan(newPlanId);
  };

  const handleStartEdit = (plan: DailyPlan) => {
    setEditingPlanId(plan.id);
    setEditPlanName(plan.name);
    setEditProteinGoal(plan.proteinGoal || 150);
    setEditCaloriesGoal(plan.caloriesGoal || 2000);
  };

  const handleSaveEdit = (planId: string) => {
    if (!editPlanName.trim()) {
      toast({
        title: "Nome inválido",
        description: "Digite um nome válido para o plano",
        variant: "destructive"
      });
      return;
    }

    if (editProteinGoal <= 0 || editCaloriesGoal <= 0) {
      toast({
        title: "Metas inválidas",
        description: "As metas de proteína e calorias devem ser maiores que zero",
        variant: "destructive"
      });
      return;
    }

    onUpdatePlan(planId, { 
      name: editPlanName.trim(),
      proteinGoal: editProteinGoal,
      caloriesGoal: editCaloriesGoal
    });
    setEditingPlanId(null);
    setEditPlanName('');
    
    toast({
      title: "Plano atualizado",
      description: "Metas atualizadas com sucesso",
    });
  };

  const handleCancelEdit = () => {
    setEditingPlanId(null);
    setEditPlanName('');
    setEditProteinGoal(150);
    setEditCaloriesGoal(2000);
  };

  const handleDuplicatePlan = (plan: DailyPlan) => {
    const newName = `${plan.name} (Cópia)`;
    const newPlanId = onDuplicatePlan(plan.id, newName);
    
    toast({
      title: "Plano duplicado",
      description: `Plano "${newName}" criado com sucesso`,
    });

    onSelectPlan(newPlanId);
  };

  const handleDeletePlan = (plan: DailyPlan) => {
    if (plans.length <= 1) {
      toast({
        title: "Não é possível excluir",
        description: "Você precisa ter pelo menos um plano",
        variant: "destructive"
      });
      return;
    }

    try {
      onDeletePlan(plan.id);
      toast({
        title: "Plano excluído",
        description: `Plano "${plan.name}" foi excluído`,
      });
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: error instanceof Error ? error.message : "Não foi possível excluir o plano",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Gerenciar Modelos</DialogTitle>
          <DialogDescription>
            Crie, edite e exclua seus planos alimentares personalizados
          </DialogDescription>
        </DialogHeader>

        {/* Criar novo plano */}
        <div className="flex gap-2 mb-6">
          <Input
            placeholder="Nome do novo plano..."
            value={newPlanName}
            onChange={(e) => setNewPlanName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleCreatePlan()}
          />
          <Button onClick={handleCreatePlan} className="gap-2">
            <Plus className="h-4 w-4" />
            Criar
          </Button>
        </div>

        {/* Lista de planos */}
        <div className="flex-1 overflow-y-auto space-y-4">
          {plans.map((plan) => (
            <Card 
              key={plan.id}
              className={`transition-all ${
                selectedPlanId === plan.id 
                  ? 'border-2 border-primary bg-primary/5' 
                  : 'hover:bg-accent/50'
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    {editingPlanId === plan.id ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Input
                            value={editPlanName}
                            onChange={(e) => setEditPlanName(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit(plan.id)}
                            className="flex-1"
                            autoFocus
                          />
                          <Button 
                            size="sm" 
                            onClick={() => handleSaveEdit(plan.id)}
                            variant="ghost"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={handleCancelEdit}
                            variant="ghost"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        {/* Metas de proteína e calorias */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                              <Target className="h-4 w-4 text-blue-500" />
                              Meta de Proteína (g)
                            </label>
                            <Input
                              type="number"
                              value={editProteinGoal}
                              onChange={(e) => setEditProteinGoal(Number(e.target.value))}
                              min="1"
                              className="w-full"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                              <Flame className="h-4 w-4 text-orange-500" />
                              Meta de Calorias (kcal)
                            </label>
                            <Input
                              type="number"
                              value={editCaloriesGoal}
                              onChange={(e) => setEditCaloriesGoal(Number(e.target.value))}
                              min="1"
                              className="w-full"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">{plan.name}</h3>
                          {selectedPlanId === plan.id && (
                            <Badge variant="secondary">Selecionado</Badge>
                          )}
                        </div>
                        
                        {/* Metas atuais */}
                        <div className="flex flex-wrap gap-3">
                          <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full">
                            <Target className="h-3 w-3 text-blue-500" />
                            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                              Meta: {plan.proteinGoal || 150}g proteína
                            </span>
                          </div>
                          <div className="flex items-center gap-2 bg-orange-50 dark:bg-orange-900/20 px-3 py-1 rounded-full">
                            <Flame className="h-3 w-3 text-orange-500" />
                            <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
                              Meta: {plan.caloriesGoal || 2000} kcal
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">
                            🍗 {plan.meals.length} refeições
                          </Badge>
                          <Badge variant="secondary">
                            💪 {plan.totalProtein}g proteína
                          </Badge>
                          <Badge variant="secondary">
                            🔥 {plan.totalCalories} kcal
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>

                  {editingPlanId !== plan.id && (
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleStartEdit(plan)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDuplicatePlan(plan)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeletePlan(plan)}
                        disabled={plans.length <= 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};