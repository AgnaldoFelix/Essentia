import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Home, 
  Calendar, 
  MessageSquare, 
  BarChart3, 
  Settings,
  Menu,
  Clock
} from 'lucide-react';
import { MealCard } from '@/components/MealCard';
import { DashboardStats } from '@/components/DashboardStats';
import { ChatInterface } from '@/components/ChatInterface';
import { mealPlans } from '@/data/mealPlans';
import { storage } from '@/lib/localStorage';
import { DailyPlan } from '@/types/nutrition';

const Index = () => {
  const [selectedPlan, setSelectedPlan] = useState<DailyPlan>(mealPlans[0]);
  const [activeTab, setActiveTab] = useState('home');

  useEffect(() => {
    const savedPlanId = storage.getSelectedPlan();
    const plan = mealPlans.find(p => p.id === savedPlanId) || mealPlans[0];
    setSelectedPlan(plan);
  }, []);

  const handlePlanChange = (planId: string) => {
    const plan = mealPlans.find(p => p.id === planId);
    if (plan) {
      setSelectedPlan(plan);
      storage.saveSelectedPlan(planId);
    }
  };

  const profile = storage.getUserProfile();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🥗</div>
            <div>
              <h1 className="text-xl font-bold gradient-primary bg-clip-text text-transparent">NutriTrack</h1>
              <p className="text-xs text-muted-foreground">Seu planejamento nutricional</p>
            </div>
          </div>
          
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>

          <nav className="hidden md:flex gap-2">
            {[
              { icon: Home, label: 'Início', value: 'home' },
              { icon: Calendar, label: 'Planejamento', value: 'plan' },
              { icon: MessageSquare, label: 'Chat IA', value: 'chat' },
              { icon: BarChart3, label: 'Gráficos', value: 'stats' },
              { icon: Settings, label: 'Perfil', value: 'settings' }
            ].map(({ icon: Icon, label, value }) => (
              <Button
                key={value}
                variant={activeTab === value ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab(value)}
                className={activeTab === value ? 'bg-gradient-primary' : ''}
              >
                <Icon className="h-4 w-4 mr-2" />
                {label}
              </Button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 py-8 animate-fade-in">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Dashboard */}
          <TabsContent value="home" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold">Dashboard</h2>
                <p className="text-muted-foreground">Resumo do seu dia nutricional</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={selectedPlan.id === 'plan-15h' ? 'default' : 'outline'}
                  onClick={() => handlePlanChange('plan-15h')}
                  className={selectedPlan.id === 'plan-15h' ? 'bg-gradient-primary' : ''}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Até 15h
                </Button>
                <Button
                  variant={selectedPlan.id === 'plan-18h' ? 'default' : 'outline'}
                  onClick={() => handlePlanChange('plan-18h')}
                  className={selectedPlan.id === 'plan-18h' ? 'bg-gradient-primary' : ''}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Até 18h
                </Button>
              </div>
            </div>

            <DashboardStats
              currentProtein={selectedPlan.totalProtein}
              currentCalories={selectedPlan.totalCalories}
              proteinGoal={profile.dailyProteinGoal}
              caloriesGoal={profile.dailyCaloriesGoal}
            />

            <div>
              <h3 className="text-xl font-bold mb-4">Refeições de Hoje - {selectedPlan.name}</h3>
              <div className="grid gap-4">
                {selectedPlan.meals.map((meal) => (
                  <MealCard key={meal.id} meal={meal} />
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Planejamento */}
          <TabsContent value="plan" className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold">Planejamento Alimentar</h2>
              <p className="text-muted-foreground">Visualize e ajuste seu plano nutricional</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {mealPlans.map((plan) => (
                <Card 
                  key={plan.id}
                  className={`p-6 cursor-pointer transition-all shadow-card hover:shadow-hover ${
                    selectedPlan.id === plan.id ? 'border-primary border-2' : 'border-border/50'
                  }`}
                  onClick={() => handlePlanChange(plan.id)}
                >
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>🍗 {plan.meals.length} refeições</p>
                    <p>💪 {plan.totalProtein}g de proteína</p>
                    <p>🔥 {plan.totalCalories} calorias</p>
                  </div>
                </Card>
              ))}
            </div>

            <div className="grid gap-4">
              {selectedPlan.meals.map((meal) => (
                <MealCard key={meal.id} meal={meal} />
              ))}
            </div>
          </TabsContent>

          {/* Chat IA */}
          <TabsContent value="chat" className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold">Chat com IA</h2>
              <p className="text-muted-foreground">Tire suas dúvidas sobre nutrição e planejamento</p>
            </div>
            <ChatInterface />
          </TabsContent>

          {/* Gráficos */}
          <TabsContent value="stats" className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold">Estatísticas</h2>
              <p className="text-muted-foreground">Acompanhe seu progresso</p>
            </div>
            <Card className="p-8 text-center shadow-card">
              <BarChart3 className="h-16 w-16 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-bold mb-2">Em breve</h3>
              <p className="text-muted-foreground">Gráficos de acompanhamento serão adicionados em breve</p>
            </Card>
          </TabsContent>

          {/* Perfil */}
          <TabsContent value="settings" className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold">Perfil</h2>
              <p className="text-muted-foreground">Suas metas e configurações</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6 shadow-card border-border/50">
                <h3 className="text-lg font-bold mb-4">Metas Diárias</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Proteína</span>
                    <span className="font-bold">{profile.dailyProteinGoal}g</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Calorias</span>
                    <span className="font-bold">{profile.dailyCaloriesGoal} kcal</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6 shadow-card border-border/50">
                <h3 className="text-lg font-bold mb-4">Informações</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Peso Atual</span>
                    <span className="font-bold">{profile.weight || '-'} kg</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Meta de Peso</span>
                    <span className="font-bold">{profile.weightGoal || '-'} kg</span>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Mobile Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border/50 px-4 py-2">
          <div className="flex justify-around">
            {[
              { icon: Home, value: 'home' },
              { icon: Calendar, value: 'plan' },
              { icon: MessageSquare, value: 'chat' },
              { icon: BarChart3, value: 'stats' },
              { icon: Settings, value: 'settings' }
            ].map(({ icon: Icon, value }) => (
              <Button
                key={value}
                variant="ghost"
                size="icon"
                onClick={() => setActiveTab(value)}
                className={activeTab === value ? 'text-primary' : 'text-muted-foreground'}
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

export default Index;
