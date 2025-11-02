import { useState, useEffect } from 'react';
import { 
  Button, 
  Tabs, 
  Tab,
  Card,
  CardBody,
  Chip,
  Progress,
  useDisclosure
} from '@nextui-org/react';
import { 
  Home, 
  Calendar, 
  MessageSquare, 
  BarChart3, 
  Settings,
  Menu,
  Clock,
  Plus,
  RotateCcw,
  Trash2
} from 'lucide-react';
import { MealCardPro } from '@/components/MealCardPro';
import { DashboardStatsPro } from '@/components/DashboardStatsPro';
import { ChatInterfacePro } from '@/components/ChatInterfacePro';
import { EditMealDialogPro } from '@/components/EditMealDialogPro';
import { useMealPlans } from '@/hooks/useMealPlans';
import { storage } from '@/lib/localStorage';
import { Meal } from '@/types/nutrition';
import { toast } from '@/hooks/use-toast';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/react";

const IndexPro = () => {
  const { 
    plans, 
    selectedPlan, 
    selectedPlanId, 
    updateMeal, 
    addMeal,
    deleteMeal,
    selectPlan,
    resetToDefault 
  } = useMealPlans();
  
  const [activeTab, setActiveTab] = useState('home');
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose, onOpenChange: onEditOpenChange } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose, onOpenChange: onDeleteOpenChange } = useDisclosure();
  const [mealToDelete, setMealToDelete] = useState<string | null>(null);
  const [dayProgress, setDayProgress] = useState(0);

  const profile = storage.getUserProfile();

  // Calcular progresso do dia
  useEffect(() => {
    const calculateDayProgress = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTimeInMinutes = currentHour * 60 + currentMinute;
      
      // Horário de início (7h00)
      const startTime = 7 * 60; // 7:00 em minutos
      
      // Horário final depende do plano escolhido
      const endTime = selectedPlanId === 'plan-15h' ? 15 * 60 : 18 * 60;
      
      // Calcular progresso
      const totalMinutes = endTime - startTime;
      const elapsedMinutes = Math.max(0, currentTimeInMinutes - startTime);
      const progress = Math.min(100, (elapsedMinutes / totalMinutes) * 100);
      
      setDayProgress(progress);
    };

    calculateDayProgress();
    const interval = setInterval(calculateDayProgress, 60000); // Atualizar a cada minuto
    
    return () => clearInterval(interval);
  }, [selectedPlanId]);

  const navItems = [
    { icon: Home, label: 'Início', value: 'home' },
    { icon: Calendar, label: 'Planejamento', value: 'plan' },
    { icon: MessageSquare, label: 'Chat IA', value: 'chat' },
    { icon: BarChart3, label: 'Gráficos', value: 'stats' },
    { icon: Settings, label: 'Perfil', value: 'settings' }
  ];

  const handleEditMeal = (meal: Meal) => {
    setEditingMeal(meal);
    onEditOpen();
  };

  const handleSaveMeal = (updatedMeal: Meal) => {
    updateMeal(selectedPlanId, updatedMeal.id, updatedMeal);
  };

  const handleAddNewMeal = () => {
    const newMeal: Meal = {
      id: `meal-${Date.now()}`,
      time: '12:00',
      name: 'Nova Refeição',
      emoji: '🍽️',
      protein: 0,
      calories: 0,
      description: 'Adicione uma descrição para esta refeição',
      foods: []
    };
    
    setEditingMeal(newMeal);
    onEditOpen();
  };

  const handleDeleteClick = (mealId: string) => {
    setMealToDelete(mealId);
    onDeleteOpen();
  };

  const handleDeleteConfirm = () => {
    if (mealToDelete) {
      deleteMeal(selectedPlanId, mealToDelete);
      toast({
        title: "Refeição removida",
        description: "A refeição foi removida com sucesso",
      });
    }
    onDeleteClose();
    setMealToDelete(null);
  };

  const handleResetPlan = () => {
    resetToDefault();
    toast({
      title: "Plano resetado",
      description: "O planejamento foi restaurado aos valores padrão",
    });
  };

  const handleEditClose = () => {
    if (editingMeal) {
      const existingMeal = selectedPlan.meals.find(m => m.id === editingMeal.id);
      if (!existingMeal && editingMeal.foods.length > 0) {
        addMeal(selectedPlanId, editingMeal);
      }
    }
    onEditClose();
    setEditingMeal(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-divider bg-background/70 backdrop-blur-lg">
        <div className="container max-w-7xl mx-auto flex h-20 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            {/* Logo melhorada */}
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                <span className="text-2xl">🥗</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-background"></div>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <h1 className="text-xl font-bold gradient-primary bg-clip-text text-transparent">
                NutriTrack Pro
              </h1>
              
              {/* Barra de progresso do dia */}
              <div className="w-48 flex flex-col gap-1">
                <Progress 
                  size="sm"
                  value={dayProgress}
                  color="primary"
                  classNames={{
                    indicator: "bg-gradient-to-r from-primary to-secondary"
                  }}
                />
                <p className="text-xs text-default-500">
                  Seu planejamento nutricional profissional
                </p>
              </div>
            </div>
          </div>
          
          <Button isIconOnly variant="light" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>

          <nav className="hidden md:flex gap-1">
            {navItems.map(({ icon: Icon, label, value }) => (
              <Button
                key={value}
                variant={activeTab === value ? 'solid' : 'light'}
                color={activeTab === value ? 'primary' : 'default'}
                size="sm"
                onPress={() => setActiveTab(value)}
                startContent={<Icon className="h-4 w-4" />}
                className={activeTab === value ? 'bg-gradient-primary' : ''}
              >
                {label}
              </Button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-7xl mx-auto px-4 py-8">
        <Tabs 
          selectedKey={activeTab} 
          onSelectionChange={(key) => setActiveTab(key as string)}
          color="primary"
          variant="underlined"
          classNames={{
            tabList: "hidden",
            panel: "pt-6"
          }}
        >
          {/* Dashboard */}
          <Tab key="home" title="Início">
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-3xl font-bold">Dashboard</h2>
                  <p className="text-default-500">Resumo do seu dia nutricional</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={selectedPlanId === 'plan-15h' ? 'solid' : 'bordered'}
                    color={selectedPlanId === 'plan-15h' ? 'primary' : 'default'}
                    onPress={() => selectPlan('plan-15h')}
                    startContent={<Clock className="h-4 w-4" />}
                    className={selectedPlanId === 'plan-15h' ? 'bg-gradient-primary' : ''}
                  >
                    Até 15h
                  </Button>
                  <Button
                    variant={selectedPlanId === 'plan-18h' ? 'solid' : 'bordered'}
                    color={selectedPlanId === 'plan-18h' ? 'primary' : 'default'}
                    onPress={() => selectPlan('plan-18h')}
                    startContent={<Clock className="h-4 w-4" />}
                    className={selectedPlanId === 'plan-18h' ? 'bg-gradient-primary' : ''}
                  >
                    Até 18h
                  </Button>
                </div>
              </div>

              <DashboardStatsPro
                currentProtein={selectedPlan.totalProtein}
                currentCalories={selectedPlan.totalCalories}
                proteinGoal={profile.dailyProteinGoal}
                caloriesGoal={profile.dailyCaloriesGoal}
              />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">Refeições de Hoje - {selectedPlan.name}</h3>
                  <Button
                    onPress={handleAddNewMeal}
                    color="primary"
                    size="sm"
                    startContent={<Plus className="h-4 w-4" />}
                    className="bg-gradient-primary"
                  >
                    Nova Refeição
                  </Button>
                </div>
                <div className="grid gap-4">
                  {selectedPlan.meals.map((meal) => (
                    <MealCardPro 
                      key={meal.id} 
                      meal={meal}
                      onEdit={() => handleEditMeal(meal)}
                      onDelete={() => handleDeleteClick(meal.id)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </Tab>

          {/* Planejamento */}
          <Tab key="plan" title="Planejamento">
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold">Planejamento Alimentar</h2>
                  <p className="text-default-500">Visualize e ajuste seu plano nutricional</p>
                </div>
                <Button
                  onPress={handleResetPlan}
                  variant="bordered"
                  startContent={<RotateCcw className="h-4 w-4" />}
                >
                  Restaurar Padrão
                </Button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {plans.map((plan) => (
                  <Card 
                    key={plan.id}
                    isPressable
                    onPress={() => selectPlan(plan.id)}
                    className={`border-2 ${
                      selectedPlanId === plan.id 
                        ? 'border-primary bg-primary-50 dark:bg-primary-900/20' 
                        : 'border-transparent'
                    }`}
                  >
                    <CardBody className="p-6">
                      <h3 className="text-xl font-bold mb-3">{plan.name}</h3>
                      <div className="flex flex-wrap gap-2">
                        <Chip variant="flat" color="default">
                          🍗 {plan.meals.length} refeições
                        </Chip>
                        <Chip variant="flat" color="primary">
                          💪 {plan.totalProtein}g proteína
                        </Chip>
                        <Chip variant="flat" color="warning">
                          🔥 {plan.totalCalories} kcal
                        </Chip>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">Refeições - {selectedPlan.name}</h3>
                  <Button
                    onPress={handleAddNewMeal}
                    color="primary"
                    size="sm"
                    startContent={<Plus className="h-4 w-4" />}
                    className="bg-gradient-primary"
                  >
                    Nova Refeição
                  </Button>
                </div>
                <div className="grid gap-4">
                  {selectedPlan.meals.map((meal) => (
                    <MealCardPro 
                      key={meal.id} 
                      meal={meal}
                      onEdit={() => handleEditMeal(meal)}
                      onDelete={() => handleDeleteClick(meal.id)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </Tab>

          {/* Chat IA */}
          <Tab key="chat" title="Chat">
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-3xl font-bold">Chat com IA</h2>
                <p className="text-default-500">Tire suas dúvidas sobre nutrição e planejamento</p>
              </div>
              <ChatInterfacePro />
            </div>
          </Tab>

          {/* Gráficos */}
          <Tab key="stats" title="Estatísticas">
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-3xl font-bold">Estatísticas</h2>
                <p className="text-default-500">Acompanhe seu progresso</p>
              </div>
              <Card className="border-none">
                <CardBody className="p-12 text-center">
                  <BarChart3 className="h-16 w-16 mx-auto mb-4 text-primary" />
                  <h3 className="text-xl font-bold mb-2">Em breve</h3>
                  <p className="text-default-500">Gráficos de acompanhamento serão adicionados em breve</p>
                </CardBody>
              </Card>
            </div>
          </Tab>

          {/* Perfil */}
          <Tab key="settings" title="Perfil">
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-3xl font-bold">Perfil</h2>
                <p className="text-default-500">Suas metas e configurações</p>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardBody className="p-6">
                    <h3 className="text-lg font-bold mb-4">Metas Diárias</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-default-500">Proteína</span>
                        <Chip color="primary" variant="flat">{profile.dailyProteinGoal}g</Chip>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-default-500">Calorias</span>
                        <Chip color="warning" variant="flat">{profile.dailyCaloriesGoal} kcal</Chip>
                      </div>
                    </div>
                  </CardBody>
                </Card>

                <Card>
                  <CardBody className="p-6">
                    <h3 className="text-lg font-bold mb-4">Informações</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-default-500">Peso Atual</span>
                        <span className="font-bold">{profile.weight || '-'} kg</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-default-500">Meta de Peso</span>
                        <span className="font-bold">{profile.weightGoal || '-'} kg</span>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </div>
            </div>
          </Tab>
        </Tabs>

        {/* Edit Meal Modal */}
        {editingMeal && (
          <EditMealDialogPro
            meal={editingMeal}
            isOpen={isEditOpen}
            onOpenChange={(open) => {
              onEditOpenChange();
              if (!open) handleEditClose();
            }}
            onSave={handleSaveMeal}
          />
        )}

        {/* Delete Confirmation Modal */}
        <Modal isOpen={isDeleteOpen} onOpenChange={onDeleteOpenChange}>
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader>Confirmar exclusão</ModalHeader>
                <ModalBody>
                  <p>Tem certeza que deseja excluir esta refeição? Esta ação não pode ser desfeita.</p>
                </ModalBody>
                <ModalFooter>
                  <Button variant="light" onPress={onClose}>
                    Cancelar
                  </Button>
                  <Button 
                    color="danger" 
                    onPress={handleDeleteConfirm}
                    startContent={<Trash2 className="h-4 w-4" />}
                  >
                    Excluir
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>

        {/* Mobile Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background/70 backdrop-blur-lg border-t border-divider px-4 py-2">
          <div className="flex justify-around">
            {navItems.map(({ icon: Icon, value }) => (
              <Button
                key={value}
                isIconOnly
                variant="light"
                onPress={() => setActiveTab(value)}
                className={activeTab === value ? 'text-primary' : 'text-default-500'}
              >
                <Icon className="h-5 w-5" />
              </Button>
            ))}
          </div>
        </nav>
      </main>
    </div>
  );
};

export default IndexPro;
