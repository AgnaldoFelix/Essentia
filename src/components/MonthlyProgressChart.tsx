import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Beef, Flame, Calendar, Target, TrendingUp, TrendingDown } from 'lucide-react';
import { storage } from '@/lib/localStorage';
import { MealLog } from '@/types/nutrition';

interface MonthlyData {
  date: string;
  protein: number;
  calories: number;
  proteinGoal: number;
  caloriesGoal: number;
  proteinPercentage: number;
  caloriesPercentage: number;
  dayOfWeek: string;
}

interface MonthlyProgressChartProps {
  proteinGoal: number;
  caloriesGoal: number;
}

export const MonthlyProgressChart = ({ proteinGoal, caloriesGoal }: MonthlyProgressChartProps) => {
  // Gerar dados do mês atual baseado nos logs de refeições
  const generateMonthlyData = (): MonthlyData[] => {
    const mealLogs = storage.getMealLogs();
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    const monthlyData: MonthlyData[] = [];

    // Agrupar logs por dia
    const logsByDate: { [key: string]: MealLog[] } = {};
    mealLogs.forEach(log => {
      const logDate = new Date(log.date);
      if (logDate.getMonth() === currentMonth && logDate.getFullYear() === currentYear) {
        const dateKey = logDate.toISOString().split('T')[0];
        if (!logsByDate[dateKey]) {
          logsByDate[dateKey] = [];
        }
        logsByDate[dateKey].push(log);
      }
    });

    // Gerar dados para cada dia do mês
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dateKey = date.toISOString().split('T')[0];
      const dayLogs = logsByDate[dateKey] || [];
      
      // Calcular totais do dia
      const totalProtein = dayLogs.reduce((sum, log) => sum + log.totalProtein, 0);
      const totalCalories = dayLogs.reduce((sum, log) => sum + log.totalCalories, 0);
      
      // Calcular porcentagens
      const proteinPercentage = Math.min((totalProtein / proteinGoal) * 100, 100);
      const caloriesPercentage = Math.min((totalCalories / caloriesGoal) * 100, 100);

      monthlyData.push({
        date: dateKey,
        protein: totalProtein,
        calories: totalCalories,
        proteinGoal,
        caloriesGoal,
        proteinPercentage,
        caloriesPercentage,
        dayOfWeek: date.toLocaleDateString('pt-BR', { weekday: 'short' })
      });
    }

    return monthlyData;
  };

  const monthlyData = generateMonthlyData();
  const today = new Date().toISOString().split('T')[0];

  // Calcular estatísticas
  const daysWithData = monthlyData.filter(day => day.protein > 0 || day.calories > 0);
  const averageProtein = daysWithData.length > 0 
    ? daysWithData.reduce((sum, day) => sum + day.protein, 0) / daysWithData.length 
    : 0;
  const averageCalories = daysWithData.length > 0 
    ? daysWithData.reduce((sum, day) => sum + day.calories, 0) / daysWithData.length 
    : 0;
  const daysGoalReached = daysWithData.filter(day => 
    day.proteinPercentage >= 100 && day.caloriesPercentage >= 100
  ).length;

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 80) return 'bg-yellow-500';
    if (percentage >= 50) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getDayColor = (date: string, protein: number, calories: number) => {
    if (date === today) return 'ring-2 ring-primary ring-offset-2';
    if (protein === 0 && calories === 0) return 'opacity-30';
    return '';
  };

  return (
    <div className="space-y-6">
      {/* Estatísticas do Mês */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Beef className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Média de Proteína</p>
                <p className="text-2xl font-bold">{averageProtein.toFixed(1)}g</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Flame className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Média de Calorias</p>
                <p className="text-2xl font-bold">{averageCalories.toFixed(0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Target className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Dias na Meta</p>
                <p className="text-2xl font-bold">{daysGoalReached}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grade do Mês */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Progresso Mensal - {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {/* Cabeçalho dos dias da semana */}
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}

            {/* Dias do mês */}
            {monthlyData.map((dayData, index) => (
              <div
                key={dayData.date}
                className={`p-2 rounded-lg border bg-card hover:bg-accent/50 transition-colors ${getDayColor(dayData.date, dayData.protein, dayData.calories)}`}
              >
                <div className="flex flex-col gap-1">
                  {/* Data */}
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-medium ${
                      dayData.date === today ? 'text-primary font-bold' : 'text-muted-foreground'
                    }`}>
                      {new Date(dayData.date).getDate()}
                    </span>
                    {dayData.proteinPercentage >= 100 && dayData.caloriesPercentage >= 100 && (
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                    )}
                  </div>

                  {/* Barras de progresso */}
                  {dayData.protein > 0 && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-blue-600">P</span>
                        <span className="text-[10px] text-muted-foreground">
                          {dayData.protein}g
                        </span>
                      </div>
                      <Progress 
                        value={dayData.proteinPercentage} 
                        className="h-1"
                        indicatorClassName={getProgressColor(dayData.proteinPercentage)}
                      />
                    </div>
                  )}

                  {dayData.calories > 0 && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-orange-600">C</span>
                        <span className="text-[10px] text-muted-foreground">
                          {dayData.calories}
                        </span>
                      </div>
                      <Progress 
                        value={dayData.caloriesPercentage} 
                        className="h-1"
                        indicatorClassName={getProgressColor(dayData.caloriesPercentage)}
                      />
                    </div>
                  )}

                  {/* Dia sem dados */}
                  {dayData.protein === 0 && dayData.calories === 0 && (
                    <div className="text-center">
                      <span className="text-[10px] text-muted-foreground">-</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Legenda */}
          <div className="mt-6 flex flex-wrap gap-4 justify-center text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Meta Atingida (100%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span>Quase lá (80-99%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded"></div>
              <span>Na metade (50-79%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>Abaixo da meta (&lt;50%)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo de Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Resumo de Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <Beef className="h-4 w-4 text-blue-600" />
                Proteína
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Melhor dia:</span>
                  <Badge variant="secondary">
                    {Math.max(...monthlyData.map(d => d.protein))}g
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Dias na meta:</span>
                  <Badge variant="secondary">
                    {monthlyData.filter(d => d.proteinPercentage >= 100).length}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Consistência:</span>
                  <Badge variant="secondary">
                    {((monthlyData.filter(d => d.proteinPercentage >= 80).length / monthlyData.length) * 100).toFixed(0)}%
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-600" />
                Calorias
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Melhor dia:</span>
                  <Badge variant="secondary">
                    {Math.max(...monthlyData.map(d => d.calories))}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Dias na meta:</span>
                  <Badge variant="secondary">
                    {monthlyData.filter(d => d.caloriesPercentage >= 100).length}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Consistência:</span>
                  <Badge variant="secondary">
                    {((monthlyData.filter(d => d.caloriesPercentage >= 80).length / monthlyData.length) * 100).toFixed(0)}%
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};