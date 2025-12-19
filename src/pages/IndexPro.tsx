// pages/IndexPro.tsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
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
  Trash2,
  Layers,
  Target,
  TrendingUp,
  Droplets,
} from "lucide-react";
import { MealCardPro } from "@/components/MealCardPro";
import { DashboardStatsPro } from "@/components/DashboardStatsPro";
import { ChatInterfacePro } from "@/components/ChatInterfacePro";
import { EditMealDialogPro } from "@/components/EditMealDialogPro";
import { ManagePlansDialog } from "@/components/ManagePlansDialog";
import { useMealPlans } from "@/hooks/useMealPlans";
import { storage } from "@/lib/localStorage";
import { Meal } from "@/types/nutrition";
import { MonthlyProgressChart } from "@/components/MonthlyProgressChart";
import { ProfilePage } from "@/components/ProfilePage";
import { UserProfile } from "@/types/gamification";
import { WaterTracker } from "@/components/WaterTracker";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";

const IndexPro = () => {
  const {
    plans,
    selectedPlan,
    selectedPlanId,
    updateMeal,
    addMeal,
    deleteMeal,
    selectPlan,
    createNewPlan,
    updatePlan,
    deletePlan,
    duplicatePlan,
    resetToDefault,
  } = useMealPlans();

  // Estados para gamificação
  const [medals, setMedals] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: "1",
    name: "Usuário",
    nickname: "user",
    age: 25,
    gender: "other",
    weight: 70,
    height: 170,
    initialWeight: 70,
    weightGoal: 75,
    activityLevel: "moderate",
    objective: "maintain",
    dailyProteinGoal: 150,
    dailyCaloriesGoal: 2000,
    avatar: "",
    createdAt: new Date(),
    bmi: 24.2,
  });

  const [activeTab, setActiveTab] = useState("home");
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [mealToDelete, setMealToDelete] = useState<string | null>(null);
  const [dayProgress, setDayProgress] = useState(0);
  const [managePlansOpen, setManagePlansOpen] = useState(false);

  const { toast } = useToast();

  // Carregar perfil do usuário
  useEffect(() => {
    const savedProfile = storage.getUserProfile();
    if (savedProfile) {
      setUserProfile(savedProfile);
    }
  }, []);

  // Funções de gamificação
  const addMedal = useCallback((medal: any) => {
    const newMedal = {
      ...medal,
      id: `medal-${Date.now()}`,
    };
    setMedals((prev) => [newMedal, ...prev]);
  }, []);

  const updateProfile = useCallback((profile: UserProfile) => {
    setUserProfile(profile);
    storage.saveUserProfile(profile);
  }, []);

  // Calcular progresso do dia com useMemo
  const dayProgressCalculation = useMemo(() => {
    const calculateDayProgress = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTimeInMinutes = currentHour * 60 + currentMinute;

      // Horário de início (7h00)
      const startTime = 7 * 60;

      // Horário final - usa o último horário do plano selecionado
      const mealTimes = (selectedPlan?.meals || []).map((meal) => {
        const [hours, minutes] = meal.time.split(":").map(Number);
        return hours * 60 + minutes;
      });
      const endTime = Math.max(...mealTimes) || 18 * 60;

      // Calcular progresso
      const totalMinutes = endTime - startTime;
      const elapsedMinutes = Math.max(0, currentTimeInMinutes - startTime);
      const progress = Math.min(100, (elapsedMinutes / totalMinutes) * 100);

      return progress;
    };

    return calculateDayProgress();
  }, [selectedPlan?.meals]);

  useEffect(() => {
    setDayProgress(dayProgressCalculation);
    const interval = setInterval(() => {
      const newProgress = dayProgressCalculation;
      setDayProgress(newProgress);
    }, 60000);

    return () => clearInterval(interval);
  }, [dayProgressCalculation]);

  // Nav items memoizado
  const navItems = useMemo(() => [
    { icon: Home, label: "Início", value: "home" },
    { icon: Droplets, label: "Água", value: "water" },
    { icon: Calendar, label: "Planejamento", value: "plan" },
    { icon: MessageSquare, label: "Chat IA", value: "chat" },
    { icon: BarChart3, label: "Gráficos", value: "stats" },
    { icon: Settings, label: "Perfil", value: "profile" },
  ], []);

  const handleEditMeal = useCallback((meal: Meal) => {
    setEditingMeal(meal);
    setIsEditOpen(true);
  }, []);

  const handleSaveMeal = useCallback((updatedMeal: Meal) => {
    updateMeal(selectedPlanId, updatedMeal.id, updatedMeal);
    toast({
      title: "Refeição atualizada",
      description: "A refeição foi atualizada com sucesso",
    });
  }, [selectedPlanId, updateMeal, toast]);

  const handleAddNewMeal = useCallback(() => {
    const newMeal: Meal = {
      id: `meal-${Date.now()}`,
      time: "12:00",
      name: "Nova Refeição",
      emoji: "🍽️",
      protein: 0,
      calories: 0,
      description: "Adicione uma descrição para esta refeição",
      foods: [],
    };

    setEditingMeal(newMeal);
    setIsEditOpen(true);
  }, []);

  const handleDeleteClick = useCallback((mealId: string) => {
    setMealToDelete(mealId);
    setIsDeleteOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (mealToDelete) {
      deleteMeal(selectedPlanId, mealToDelete);
      toast({
        title: "Refeição removida",
        description: "A refeição foi removida com sucesso",
      });
    }
    setIsDeleteOpen(false);
    setMealToDelete(null);
  }, [mealToDelete, selectedPlanId, deleteMeal, toast]);

  const handleResetPlan = useCallback(() => {
    resetToDefault();
    toast({
      title: "Plano resetado",
      description: "O planejamento foi restaurado aos valores padrão",
    });
  }, [resetToDefault, toast]);

  const handleEditClose = useCallback(() => {
    if (editingMeal) {
      const existingMeal = (selectedPlan?.meals || []).find(
        (m) => m.id === editingMeal.id
      );
      if (!existingMeal && editingMeal.foods.length > 0) {
        addMeal(selectedPlanId, editingMeal);
      }
    }
    setIsEditOpen(false);
    setEditingMeal(null);
  }, [editingMeal, selectedPlan?.meals, selectedPlanId, addMeal]);

  const handleSelectPlan = useCallback((planId: string) => {
    selectPlan(planId);
  }, [selectPlan]);

  // Memoizar plan buttons
  const planButtons = useMemo(() => [
    {
      label: "Modelos",
      icon: Layers,
      onClick: () => setManagePlansOpen(true),
      variant: "outline" as const,
    },
  ], []);

  // Memoizar dashboard stats
  const dashboardStatsProps = useMemo(() => ({
    currentProtein: selectedPlan?.totalProtein || 0,
    currentCalories: selectedPlan?.totalCalories || 0,
    meals: selectedPlan?.meals || [],
    selectedPlan: selectedPlan || null,
    onMedalEarned: addMedal,
  }), [selectedPlan, addMedal]);

  // Memoizar meal cards para cada plano
  const mealCards = useMemo(() => {
    const meals = selectedPlan?.meals || [];
    return meals.map((meal) => (
      <MealCardPro
        key={meal.id}
        meal={meal}
        onEdit={() => handleEditMeal(meal)}
        onDelete={() => handleDeleteClick(meal.id)}
      />
    ));
  }, [selectedPlan?.meals, handleEditMeal, handleDeleteClick]);

  // Memoizar cards de planos
  const planCards = useMemo(() => 
    plans.map((plan) => (
      <Card
        key={plan.id}
        className={`cursor-pointer transition-all hover:bg-accent ${
          selectedPlanId === plan.id
            ? "border-2 border-primary bg-primary/5"
            : ""
        }`}
        onClick={() => handleSelectPlan(plan.id)}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-lg font-bold">{plan.name}</h3>
            {selectedPlanId === plan.id && (
              <Badge variant="secondary" className="text-xs">
                Ativo
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs">
              🍗 {plan.meals.length} refeições
            </Badge>
            <Badge variant="secondary" className="text-xs">
              💪 {plan.totalProtein}g
            </Badge>
            <Badge variant="secondary" className="text-xs">
              🔥 {plan.totalCalories}kcal
            </Badge>
          </div>
        </CardContent>
      </Card>
    )), [plans, selectedPlanId, handleSelectPlan]);

  // Memoizar estatísticas de gráficos
  const statsCards = useMemo(() => [
    {
      title: "Tendência da Semana",
      icon: TrendingUp,
      iconColor: "text-green-600",
      description: `Seu progresso está ${Math.random() > 0.5 ? "melhorando" : "estável"} esta semana.`,
      badges: [
        { text: "+5% proteína", className: "bg-green-50 text-green-700" },
        { text: "+2% consistência", className: "bg-blue-50 text-blue-700" },
      ],
    },
    {
      title: "Próximas Metas",
      icon: Target,
      iconColor: "text-purple-600",
      description: "Mantenha a consistência para alcançar suas metas.",
      items: [
        { label: "Dias consecutivos na meta:", value: "3", badgeVariant: "default" as const },
        { label: "Meta do mês:", value: "22/30 dias", badgeVariant: "secondary" as const },
      ],
    },
  ], []);

  // Memoizar conteúdo das tabs
  const tabContent = useMemo(() => ({
    home: {
      title: "Dashboard",
      description: "Resumo do seu dia nutricional",
    },
    plan: {
      title: "Planejamento Alimentar",
      description: "Visualize e ajuste seu plano nutricional",
    },
    water: {
      title: "Contador de Água",
      description: "Acompanhe sua hidratação diária",
    },
    chat: {
      title: "Chat com IA",
      description: "Tire suas dúvidas sobre nutrição e planejamento",
    },
    stats: {
      title: "Estatísticas e Gráficos",
      description: "Acompanhe seu progresso mensal",
    },
    profile: {
      title: "Perfil",
      description: "Suas metas e configurações",
    },
  }), []);

  // Memoizar badges de data
  const dateBadge = useMemo(() => {
    const currentDate = new Date();
    return (
      <Badge variant="outline" className="gap-2">
        <Calendar className="h-3 w-3" />
        {currentDate.toLocaleDateString("pt-BR", {
          month: "long",
          year: "numeric",
        })}
      </Badge>
    );
  }, []);

  // Memoizar o componente de edit meal dialog
  const editMealDialog = useMemo(() => {
    if (!editingMeal) return null;
    
    return (
      <EditMealDialogPro
        meal={editingMeal}
        isOpen={isEditOpen}
        onOpenChange={(open) => {
          setIsEditOpen(open);
          if (!open) handleEditClose();
        }}
        onSave={handleSaveMeal}
      />
    );
  }, [editingMeal, isEditOpen, handleEditClose, handleSaveMeal]);

  // Memoizar delete dialog
  const deleteDialog = useMemo(() => (
    <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar exclusão</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir esta refeição? Esta ação não pode
            ser desfeita.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteConfirm}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Excluir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ), [isDeleteOpen, handleDeleteConfirm]);

  // Memoizar manage plans dialog
  const managePlansDialog = useMemo(() => (
    <ManagePlansDialog
      isOpen={managePlansOpen}
      onOpenChange={setManagePlansOpen}
      plans={plans}
      selectedPlanId={selectedPlanId}
      onSelectPlan={selectPlan}
      onCreatePlan={createNewPlan}
      onUpdatePlan={updatePlan}
      onDeletePlan={deletePlan}
      onDuplicatePlan={duplicatePlan}
    />
  ), [managePlansOpen, plans, selectedPlanId, selectPlan, createNewPlan, updatePlan, deletePlan, duplicatePlan]);

  // Memoizar navigation buttons para desktop
  const desktopNavButtons = useMemo(() => 
    navItems.map(({ icon: Icon, label, value }) => (
      <Button
        key={value}
        variant={activeTab === value ? "default" : "ghost"}
        size="sm"
        onClick={() => setActiveTab(value)}
        className={`gap-2 ${
          activeTab === value
            ? "bg-primary text-primary-foreground hover:bg-primary/90"
            : ""
        }`}
      >
        <Icon className="h-4 w-4" />
        {label}
      </Button>
    )), [navItems, activeTab]);

  // Memoizar mobile navigation
  const mobileNavButtons = useMemo(() => 
    navItems.map(({ icon: Icon, value }) => (
      <Button
        key={value}
        variant="ghost"
        size="icon"
        onClick={() => setActiveTab(value)}
        className={
          activeTab === value ? "text-primary" : "text-muted-foreground"
        }
      >
        <Icon className="h-5 w-5" />
      </Button>
    )), [navItems, activeTab]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-divider bg-background/70 backdrop-blur-lg">
        <div className="container max-w-7xl mx-auto flex h-20 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">

                <img src="/Essentia.png" alt="Logo" className="w-12 h-12" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-background"></div>
            </div>

            <div className="flex flex-col gap-1.5">
              <h1 className="text-xl font-bold">Essentia</h1>
              <p className="text-xs text-default-500">
                Seu planejamento nutricional profissional
              </p>
            </div>
          </div>

          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>

          <nav className="hidden md:flex gap-2">
            {desktopNavButtons}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-7xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="hidden">
            {navItems.map(({ value, label }) => (
              <TabsTrigger key={value} value={value}>{label}</TabsTrigger>
            ))}
          </TabsList>

          {/* Dashboard */}
          <TabsContent value="home">
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-3xl font-bold">{tabContent.home.title}</h2>
                  <p className="text-default-500">
                    {tabContent.home.description}
                  </p>
                </div>
                <div className="flex gap-2">
                  {planButtons.map((button, index) => (
                    <Button
                      key={index}
                      onClick={button.onClick}
                      variant={button.variant}
                      className="gap-2"
                    >
                      <button.icon className="h-4 w-4" />
                      {button.label}
                    </Button>
                  ))}
                </div>
              </div>

              <DashboardStatsPro {...dashboardStatsProps} />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">
                    Refeições de Hoje - {selectedPlan?.name || "Plano"}
                  </h3>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleAddNewMeal}
                      size="sm"
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Nova Refeição
                    </Button>
                  </div>
                </div>
                <div className="grid gap-4">
                  {mealCards}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Planejamento */}
          <TabsContent value="plan">
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-3xl font-bold">{tabContent.plan.title}</h2>
                  <p className="text-muted-foreground">
                    {tabContent.plan.description}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setManagePlansOpen(true)}
                    variant="outline"
                    className="gap-2"
                  >
                    <Layers className="h-4 w-4" />
                    Gerenciar Modelos
                  </Button>
                  <Button
                    onClick={handleResetPlan}
                    variant="outline"
                    className="gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Restaurar Padrão
                  </Button>
                </div>
              </div>

              {/* Seleção de Planos */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {planCards}
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">
                    Refeições - {selectedPlan?.name || "Plano"}
                  </h3>
                  <Button
                    onClick={handleAddNewMeal}
                    size="sm"
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Nova Refeição
                  </Button>
                </div>
                <div className="grid gap-4">
                  {mealCards}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="water">
            <div className="space-y-6 mb-8 animate-fade-in">
              <div>
                <h2 className="text-3xl font-bold">{tabContent.water.title}</h2>
                <p className="text-muted-foreground">
                  {tabContent.water.description}
                </p>
              </div>
              <WaterTracker onMedalEarned={addMedal} />
            </div>
          </TabsContent>

          {/* Chat IA */}
          <TabsContent value="chat">
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-3xl font-bold">{tabContent.chat.title}</h2>
                <p className="text-muted-foreground">
                  {tabContent.chat.description}
                </p>
              </div>
              <ChatInterfacePro />
            </div>
          </TabsContent>

          {/* Gráficos */}
          <TabsContent value="stats">
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-3xl font-bold">
                    {tabContent.stats.title}
                  </h2>
                  <p className="text-muted-foreground">
                    {tabContent.stats.description}
                  </p>
                </div>
                <div className="flex gap-2">
                  {dateBadge}
                </div>
              </div>

              <MonthlyProgressChart
                proteinGoal={
                  selectedPlan?.proteinGoal || userProfile.dailyProteinGoal
                }
                caloriesGoal={
                  selectedPlan?.caloriesGoal || userProfile.dailyCaloriesGoal
                }
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {statsCards.map((card, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <card.icon className={`h-5 w-5 ${card.iconColor}`} />
                        {card.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">
                        {card.description}
                      </p>
                      {card.badges ? (
                        <div className="flex gap-2">
                          {card.badges.map((badge, badgeIndex) => (
                            <Badge
                              key={badgeIndex}
                              variant="outline"
                              className={badge.className}
                            >
                              {badge.text}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {card.items?.map((item, itemIndex) => (
                            <div key={itemIndex} className="flex justify-between items-center">
                              <span className="text-sm">{item.label}</span>
                              <Badge variant={item.badgeVariant}>
                                {item.value}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Perfil */}
          <TabsContent value="profile">
            <ProfilePage
              profile={userProfile}
              onProfileUpdate={updateProfile}
              medals={medals}
            />
          </TabsContent>
        </Tabs>

        {/* Modais e Dialogs */}
        {editMealDialog}
        {deleteDialog}
        {managePlansDialog}

        {/* Mobile Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background/70 backdrop-blur-lg border-t px-4 py-2">
          <div className="flex justify-around">
            {mobileNavButtons}
          </div>
        </nav>

        <PWAInstallPrompt />
      </main>
    </div>
  );
};

export default IndexPro;