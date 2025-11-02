import { Card, CardBody, Progress, Chip } from '@nextui-org/react';
import { Beef, Flame, TrendingUp, CheckCircle2 } from 'lucide-react';

interface DashboardStatsProProps {
  currentProtein: number;
  currentCalories: number;
  proteinGoal: number;
  caloriesGoal: number;
}

export const DashboardStatsPro = ({
  currentProtein,
  currentCalories,
  proteinGoal,
  caloriesGoal
}: DashboardStatsProProps) => {
  const proteinPercentage = Math.min((currentProtein / proteinGoal) * 100, 100);
  const caloriesPercentage = Math.min((currentCalories / caloriesGoal) * 100, 100);
  
  const proteinRemaining = Math.max(proteinGoal - currentProtein, 0);
  const caloriesRemaining = Math.max(caloriesGoal - currentCalories, 0);

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Proteína Card */}
      <Card className="border-none bg-gradient-to-br from-primary-50 to-primary-100/50 dark:from-primary-900/20 dark:to-primary-800/10">
        <CardBody className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-primary/10">
                <Beef className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Proteína</h3>
                <p className="text-sm text-default-500">Meta diária</p>
              </div>
            </div>
            {proteinPercentage >= 100 && (
              <Chip 
                startContent={<CheckCircle2 className="h-4 w-4" />}
                color="success" 
                variant="flat"
                size="sm"
              >
                Completo
              </Chip>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-primary">{currentProtein}g</span>
              <span className="text-lg text-default-500">/ {proteinGoal}g</span>
            </div>

            <Progress 
              value={proteinPercentage}
              color="primary"
              size="lg"
              classNames={{
                indicator: "bg-gradient-to-r from-primary to-secondary"
              }}
            />

            <div className="flex items-center gap-2 text-sm">
              {proteinPercentage >= 100 ? (
                <span className="text-success flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" />
                  Meta atingida! 🎉
                </span>
              ) : (
                <span className="text-default-600 flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  Faltam {proteinRemaining}g para a meta
                </span>
              )}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Calorias Card */}
      <Card className="border-none bg-gradient-to-br from-warning-50 to-warning-100/50 dark:from-warning-900/20 dark:to-warning-800/10">
        <CardBody className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-warning/10">
                <Flame className="h-6 w-6 text-warning" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Calorias</h3>
                <p className="text-sm text-default-500">Meta diária</p>
              </div>
            </div>
            {caloriesPercentage >= 100 && (
              <Chip 
                startContent={<CheckCircle2 className="h-4 w-4" />}
                color="success" 
                variant="flat"
                size="sm"
              >
                Completo
              </Chip>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-warning">{currentCalories}</span>
              <span className="text-lg text-default-500">/ {caloriesGoal} kcal</span>
            </div>

            <Progress 
              value={caloriesPercentage}
              color="warning"
              size="lg"
              classNames={{
                indicator: "bg-gradient-to-r from-warning to-danger"
              }}
            />

            <div className="flex items-center gap-2 text-sm">
              {caloriesPercentage >= 100 ? (
                <span className="text-success flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" />
                  Meta atingida! 🎉
                </span>
              ) : (
                <span className="text-default-600 flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  Faltam {caloriesRemaining} kcal para a meta
                </span>
              )}
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
