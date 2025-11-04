import { useState } from 'react';
import { DailyPlan } from '@/types/nutrition';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Copy, Trash2, Edit, Check, X } from 'lucide-react';

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

    onUpdatePlan(planId, { name: editPlanName.trim() });
    setEditingPlanId(null);
    setEditPlanName('');
    
    toast({
      title: "Plano atualizado",
      description: "Nome do plano atualizado com sucesso",
    });
  };

  const handleCancelEdit = () => {
    setEditingPlanId(null);
    setEditPlanName('');
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
                    ) : (
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg">{plan.name}</h3>
                        {selectedPlanId === plan.id && (
                          <Badge variant="secondary">Selecionado</Badge>
                        )}
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-2 mt-2">
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