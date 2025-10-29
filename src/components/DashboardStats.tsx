import { Card } from '@/components/ui/card';
import { Beef, Flame, TrendingUp, Target } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface StatsProps {
  currentProtein: number;
  currentCalories: number;
  proteinGoal: number;
  caloriesGoal: number;
}

export const DashboardStats = ({ 
  currentProtein, 
  currentCalories, 
  proteinGoal, 
  caloriesGoal 
}: StatsProps) => {
  const proteinPercent = (currentProtein / proteinGoal) * 100;
  const caloriesPercent = (currentCalories / caloriesGoal) * 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="p-6 shadow-card border-border/50 bg-gradient-to-br from-primary/10 to-primary/5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/20">
              <Beef className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Proteína Hoje</p>
              <p className="text-3xl font-bold text-foreground">
                {currentProtein}g
                <span className="text-base font-normal text-muted-foreground ml-2">
                  / {proteinGoal}g
                </span>
              </p>
            </div>
          </div>
          <Target className="h-8 w-8 text-primary/40" />
        </div>
        <Progress value={proteinPercent} className="h-3" />
        <p className="text-xs text-muted-foreground mt-2">
          {proteinPercent >= 100 ? '✅ Meta atingida!' : `${(100 - proteinPercent).toFixed(0)}% restante`}
        </p>
      </Card>

      <Card className="p-6 shadow-card border-border/50 bg-gradient-to-br from-accent/10 to-accent/5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-accent/20">
              <Flame className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Calorias Hoje</p>
              <p className="text-3xl font-bold text-foreground">
                {currentCalories}
                <span className="text-base font-normal text-muted-foreground ml-2">
                  / {caloriesGoal}
                </span>
              </p>
            </div>
          </div>
          <TrendingUp className="h-8 w-8 text-accent/40" />
        </div>
        <Progress value={caloriesPercent} className="h-3" />
        <p className="text-xs text-muted-foreground mt-2">
          {caloriesPercent >= 100 ? '✅ Meta atingida!' : `${(100 - caloriesPercent).toFixed(0)}% restante`}
        </p>
      </Card>
    </div>
  );
};
