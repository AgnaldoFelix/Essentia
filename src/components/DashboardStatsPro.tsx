import { 
  Card, 
  CardHeader, 
  CardBody, 
  CardFooter, 
  Chip, 
  Progress, 
  Tabs, 
  Tab, 
  Divider,
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell
} from '@heroui/react';
import { Beef, Flame, TrendingUp, CheckCircle2, Clock } from 'lucide-react';
import { Meal } from '@/types/nutrition';

interface DashboardStatsProProps {
  currentProtein: number;
  currentCalories: number;
  proteinGoal: number;
  caloriesGoal: number;
  meals: Meal[];
  selectedPlanId: string;
}

export const DashboardStatsPro = ({
  currentProtein,
  currentCalories,
  proteinGoal,
  caloriesGoal,
  meals,
  selectedPlanId
}: DashboardStatsProProps) => {
  const proteinPercentage = Math.min((currentProtein / proteinGoal) * 100, 100);
  const caloriesPercentage = Math.min((currentCalories / caloriesGoal) * 100, 100);
  
  const proteinRemaining = Math.max(proteinGoal - currentProtein, 0);
  const caloriesRemaining = Math.max(caloriesGoal - currentCalories, 0);

  // Ordenar refeições por horário
  const sortedMeals = [...meals].sort((a, b) => {
    const timeA = new Date(`1970/01/01 ${a.time}`).getTime();
    const timeB = new Date(`1970/01/01 ${b.time}`).getTime();
    return timeA - timeB;
  });

  return (
    <div className="flex w-full flex-col gap-6">
      <Tabs aria-label="Metas Nutricionais">
        <Tab 
          key="proteina" 
          title={
            <div className="flex items-center gap-2">
              <Beef className="h-4 w-4" />
              <span>Proteína</span>
            </div>
          }
        >
          <Card className="w-full">
            <CardHeader className="flex gap-3 border-b p-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Beef className="h-6 w-6 text-primary" />
              </div>
              <div className="flex flex-col">
                <p className="text-md font-semibold">Meta de Proteína</p>
                <p className="text-small text-default-500">
                  {proteinPercentage >= 100 ? 'Meta atingida! 🎉' : `Faltam ${proteinRemaining}g`}
                </p>
              </div>
              {proteinPercentage >= 100 && (
                <Chip color="success" className="ml-auto">
                  Completo
                </Chip>
              )}
            </CardHeader>
            <CardBody className="p-6 space-y-6">
              <div className="flex justify-between items-baseline">
                <div className="space-y-1">
                  <p className="text-4xl font-bold text-primary">{currentProtein}g</p>
                  <p className="text-small text-default-500">consumido</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-semibold">{proteinGoal}g</p>
                  <p className="text-small text-default-500">meta diária</p>
                </div>
              </div>

              <div className="space-y-2">
                <Progress
                  aria-label="Progresso de proteína"
                  className="w-full"
                  color={proteinPercentage >= 100 ? 'success' : 'primary'}
                  showValueLabel={true}
                  size="lg"
                  value={proteinPercentage}
                />
                <p className="text-small text-default-500 text-center">
                  {proteinPercentage.toFixed(1)}% da meta diária
                </p>
              </div>
            </CardBody>
          </Card>
        </Tab>
        <Tab 
          key="calorias" 
          title={
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4" />
              <span>Calorias</span>
            </div>
          }
        >
          <Card className="w-full">
            <CardHeader className="flex gap-3 border-b p-4">
              <div className="p-2 bg-warning/10 rounded-lg">
                <Flame className="h-6 w-6 text-warning" />
              </div>
              <div className="flex flex-col">
                <p className="text-md font-semibold">Meta de Calorias</p>
                <p className="text-small text-default-500">
                  {caloriesPercentage >= 100 ? 'Meta atingida! 🎉' : `Faltam ${caloriesRemaining} kcal`}
                </p>
              </div>
              {caloriesPercentage >= 100 && (
                <Chip color="success" className="ml-auto">
                  Completo
                </Chip>
              )}
            </CardHeader>
            <CardBody className="p-6 space-y-6">
              <div className="flex justify-between items-baseline">
                <div className="space-y-1">
                  <p className="text-4xl font-bold text-warning">{currentCalories}</p>
                  <p className="text-small text-default-500">consumido</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-semibold">{caloriesGoal} kcal</p>
                  <p className="text-small text-default-500">meta diária</p>
                </div>
              </div>

              <div className="space-y-2">
                <Progress
                  aria-label="Progresso de calorias"
                  className="w-full"
                  color={caloriesPercentage >= 100 ? 'success' : 'warning'}
                  showValueLabel={true}
                  size="lg"
                  value={caloriesPercentage}
                />
                <p className="text-small text-default-500 text-center">
                  {caloriesPercentage.toFixed(1)}% da meta diária
                </p>
              </div>
            </CardBody>
          </Card>
        </Tab>
        <Tab 
          key="refeicoes" 
          title={
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Refeições</span>
            </div>
          }
        >
          <Card className="w-full">
            <CardHeader className="flex gap-3 border-b p-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div className="flex flex-col">
                <p className="text-md font-semibold">Refeições do Dia</p>
                <p className="text-small text-default-500">
                  {selectedPlanId === 'plan-15h' ? 'Plano até 15h' : 'Plano até 18h'}
                </p>
              </div>
              <Chip color="primary" variant="flat" className="ml-auto">
                {meals.length} refeições
              </Chip>
            </CardHeader>
            <CardBody className="p-0">
              <Table>
                <TableHeader>
                  <TableColumn>HORÁRIO</TableColumn>
                  <TableColumn>REFEIÇÃO</TableColumn>
                  <TableColumn>ALIMENTOS</TableColumn>
                  <TableColumn>PROTEÍNA</TableColumn>
                  <TableColumn>CALORIAS</TableColumn>
                </TableHeader>
                <TableBody>
                  <>
                  {sortedMeals.map((meal) => (
                    <TableRow key={meal.id}>
                      <TableCell>{meal.time}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{meal.emoji}</span>
                          <span>{meal.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {meal.foods.map((food: { name: string; quantity?: number }, index) => (
                            <Chip 
                              key={index} 
                              size="sm" 
                              variant="flat" 
                              color="default"
                            >
                              {food.quantity ? `${food.name} (${food.quantity}g)` : food.name}
                            </Chip>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Chip color="primary" variant="flat">
                          {meal.protein}g
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <Chip color="warning" variant="flat">
                          {meal.calories}
                        </Chip>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={3} className="text-right font-bold">
                      Total do Dia
                    </TableCell>
                    <TableCell>
                      <Chip color="primary" variant="solid">
                        {currentProtein}g
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <Chip color="warning" variant="solid">
                        {currentCalories}
                      </Chip>
                    </TableCell>
                  </TableRow>
                  </>
                </TableBody>
              </Table>
            </CardBody>
          </Card>
        </Tab>
      </Tabs>
    </div>
  );
};
