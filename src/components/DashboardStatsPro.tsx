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
  TableCell,
  Spinner,
  Tooltip,
} from "@heroui/react";
import { Beef, Flame, TrendingUp, CheckCircle2, Clock, Target } from "lucide-react";
import { Meal, DailyPlan } from "@/types/nutrition";

import React from "react";

interface DashboardStatsProProps {
  currentProtein: number;
  currentCalories: number;
  meals: Meal[];
  selectedPlan: DailyPlan | null;
}

export const DashboardStatsPro = ({
  currentProtein,
  currentCalories,
  meals,
  selectedPlan,
}: DashboardStatsProProps) => {
  // SEMPRE usar as metas do plano selecionado - ESSENCIAL!
  const proteinGoal = selectedPlan?.proteinGoal || 150;
  const caloriesGoal = selectedPlan?.caloriesGoal || 2000;

  console.log('🔍 Dashboard Debug:', {
    planName: selectedPlan?.name,
    proteinGoal,
    caloriesGoal,
    currentProtein,
    currentCalories
  });

  const proteinPercentage = Math.min((currentProtein / proteinGoal) * 100, 100);
  const caloriesPercentage = Math.min(
    (currentCalories / caloriesGoal) * 100,
    100
  );

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
                  {proteinPercentage >= 100
                    ? "Meta atingida! 🎉"
                    : `Faltam ${proteinRemaining}g`}
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
                  <p className="text-4xl font-bold text-primary">
                    {currentProtein}g
                  </p>
                  <p className="text-small text-default-500">consumido</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 justify-end">
                    <Target className="h-4 w-4 text-primary" />
                    <p className="text-xl font-semibold">{proteinGoal}g</p>
                  </div>
                  <p className="text-small text-default-500">meta diária</p>
                </div>
              </div>

              <div className="space-y-2">
                <Progress
                  aria-label="Progresso de proteína"
                  className="w-full"
                  color={proteinPercentage >= 100 ? "success" : "primary"}
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
                  {caloriesPercentage >= 100
                    ? "Meta atingida! 🎉"
                    : `Faltam ${caloriesRemaining} kcal`}
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
                  <p className="text-4xl font-bold text-warning">
                    {currentCalories}
                  </p>
                  <p className="text-small text-default-500">consumido</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 justify-end">
                    <Target className="h-4 w-4 text-warning" />
                    <p className="text-xl font-semibold">{caloriesGoal} kcal</p>
                  </div>
                  <p className="text-small text-default-500">meta diária</p>
                </div>
              </div>

              <div className="space-y-2">
                <Progress
                  aria-label="Progresso de calorias"
                  className="w-full"
                  color={caloriesPercentage >= 100 ? "success" : "warning"}
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
                  {selectedPlan?.name || "Plano atual"}
                </p>
              </div>
              <Chip color="primary" variant="flat" className="ml-auto">
                {meals.length} refeições
              </Chip>
            </CardHeader>
            <CardBody className="p-0">
              <div className="w-full">
                {/* Header Mobile */}
                <div className="block md:hidden bg-default-100 p-4 rounded-t-2xl border-b border-default-200">
                  <div className="flex justify-between items-center mb-3">
                    <h2 className="text-lg font-bold text-default-800">
                      Plano Alimentar
                    </h2>
                    <Chip color="primary" variant="flat" size="sm">
                      {new Date().toLocaleDateString("pt-BR")}
                    </Chip>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-default-600">
                      {sortedMeals.length} refeições
                    </span>
                    <div className="flex gap-2">
                      <Chip
                        color="primary"
                        variant="flat"
                        size="sm"
                        startContent={<span className="text-xs">🎯</span>}
                      >
                        {proteinGoal}g
                      </Chip>
                      <Chip
                        color="warning"
                        variant="flat"
                        size="sm"
                        startContent={<span className="text-xs">🎯</span>}
                      >
                        {caloriesGoal}
                      </Chip>
                    </div>
                  </div>
                </div>

                {/* Table - Desktop */}
                <div className="hidden md:block">
                  <Table
                    aria-label="Plano alimentar diário"
                    isStriped
                    isHeaderSticky
                    selectionMode="none"
                    className="min-w-full"
                    classNames={{
                      base: "shadow-lg rounded-2xl border border-default-200",
                      table: "min-w-full",
                      thead: "[&>tr]:first:rounded-lg",
                      th: "bg-default-100 text-default-700 font-bold text-sm py-4",
                      td: "py-3 border-b border-default-100",
                      tr: "hover:bg-default-50 transition-colors",
                    }}
                    topContent={
                      <div className="flex justify-between items-center p-4">
                        <h2 className="text-xl font-bold text-default-800">
                          Plano Alimentar - {selectedPlan?.name || "Plano atual"}
                        </h2>
                        <Chip color="primary" variant="flat" size="sm">
                          {new Date().toLocaleDateString("pt-BR")}
                        </Chip>
                      </div>
                    }
                    bottomContent={
                      <div className="p-4 bg-default-50 border-t border-default-200">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-default-600">
                            {sortedMeals.length} refeições programadas
                          </span>
                          <div className="flex gap-3">
                            <Tooltip content={`Meta de proteína diária: ${proteinGoal}g`}>
                              <Chip
                                color="primary"
                                variant="flat"
                                startContent={
                                  <span className="text-xs">🎯</span>
                                }
                              >
                                Meta: {proteinGoal}g
                              </Chip>
                            </Tooltip>
                            <Tooltip content={`Meta calórica diária: ${caloriesGoal} kcal`}>
                              <Chip
                                color="warning"
                                variant="flat"
                                startContent={
                                  <span className="text-xs">🎯</span>
                                }
                              >
                                Meta: {caloriesGoal} kcal
                              </Chip>
                            </Tooltip>
                          </div>
                        </div>
                      </div>
                    }
                  >
                    <TableHeader>
                      <TableColumn className="w-24 text-center">
                        HORÁRIO
                      </TableColumn>
                      <TableColumn className="min-w-32">REFEIÇÃO</TableColumn>
                      <TableColumn className="min-w-48">ALIMENTOS</TableColumn>
                      <TableColumn className="w-28 text-center">
                        PROTEÍNA
                      </TableColumn>
                      <TableColumn className="w-28 text-center">
                        CALORIAS
                      </TableColumn>
                    </TableHeader>
                    <TableBody
                      emptyContent={
                        <div className="text-center py-8">
                          <div className="text-4xl mb-2">🍽️</div>
                          <p className="text-default-500">
                            Nenhuma refeição cadastrada
                          </p>
                        </div>
                      }
                    >
                     {sortedMeals.map((meal, index) => (
                        <React.Fragment key={meal.id}>
                        <TableRow
                          key={meal.id}
                          className="group"
                        >
                          <TableCell>
                            <div className="flex flex-col items-center">
                              <Chip
                                size="sm"
                                variant="flat"
                                color="secondary"
                                className="font-mono text-xs"
                              >
                                {meal.time}
                              </Chip>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="flex-shrink-0 w-8 h-8 bg-default-100 rounded-lg flex items-center justify-center">
                                <span className="text-sm">{meal.emoji}</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="font-medium text-default-800">
                                  {meal.name}
                                </span>
                                {meal.description && (
                                  <span className="text-xs text-default-500">
                                    {meal.description}
                                  </span>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-2">
                              {meal.foods.map(
                                (
                                  food: { name: string; amount?: string },
                                  index
                                ) => (
                                  <Tooltip
                                    key={index}
                                    content={`${food.name}${
                                      food.amount
                                        ? ` - ${food.amount}`
                                        : ""
                                    }`}
                                  >
                                    <Chip
                                      size="sm"
                                      variant="flat"
                                      color="default"
                                      className="max-w-32 truncate transition-all hover:scale-105"
                                    >
                                      {food.amount
                                        ? `${food.name} (${food.amount})`
                                        : food.name}
                                    </Chip>
                                  </Tooltip>
                                )
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-center">
                              <Chip
                                color="primary"
                                variant="flat"
                                size="sm"
                                startContent={
                                  <span className="text-xs">🥩</span>
                                }
                                className="font-semibold"
                              >
                                {meal.protein}g
                              </Chip>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-center">
                              <Chip
                                color="warning"
                                variant="flat"
                                size="sm"
                                startContent={
                                  <span className="text-xs">🔥</span>
                                }
                                className="font-semibold"
                              >
                                {meal.calories}
                              </Chip>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))

                      <TableRow className="bg-default-100 border-t-2 border-default-300">
                        <TableCell
                          colSpan={3}
                          className="text-right font-bold py-4"
                        >
                          <div className="flex items-center justify-end gap-2">
                            <span>Total do Dia</span>
                            <Progress
                              size="sm"
                              value={proteinPercentage}
                              className="max-w-24"
                              color="primary"
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center">
                            <Chip
                              color="primary"
                              variant="solid"
                              startContent={
                                <span className="text-xs">📊</span>
                              }
                              className="font-bold shadow-md"
                            >
                              {currentProtein}g
                            </Chip>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center">
                            <Chip
                              color="warning"
                              variant="solid"
                              startContent={
                                <span className="text-xs">📊</span>
                              }
                              className="font-bold shadow-md"
                            >
                              {currentCalories}
                            </Chip>
                          </div>
                        </TableCell>
                      </TableRow>
                       </React.Fragment>
                      ))}
                    </TableBody>
                   
                  </Table>
                </div>

                {/* Mobile Cards */}
                <div className="block md:hidden space-y-3 p-4 bg-white rounded-b-2xl shadow-lg border border-t-0 border-default-200">
                  {sortedMeals.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-2">🍽️</div>
                      <p className="text-default-500">
                        Nenhuma refeição cadastrada
                      </p>
                    </div>
                  ) : (
                    <>
                      {sortedMeals.map((meal) => (
                        <div
                          key={meal.id}
                          className="bg-white rounded-xl border border-default-200 p-4 shadow-sm hover:shadow-md transition-shadow"
                        >
                          {/* Header do Card */}
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                              <div className="flex-shrink-0 w-10 h-10 bg-default-100 rounded-lg flex items-center justify-center">
                                <span className="text-base">{meal.emoji}</span>
                              </div>
                              <div>
                                <h3 className="font-semibold text-default-800">
                                  {meal.name}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <Chip
                                    size="sm"
                                    variant="flat"
                                    color="secondary"
                                    className="font-mono text-xs"
                                  >
                                    {meal.time}
                                  </Chip>
                                  {meal.description && (
                                    <span className="text-xs text-default-500">
                                      {meal.description}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Alimentos */}
                          <div className="mb-3">
                            <p className="text-xs font-medium text-default-600 mb-2">
                              ALIMENTOS:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {meal.foods.map(
                                (
                                  food: { name: string; amount?: string },
                                  index
                                ) => (
                                  <Chip
                                    key={index}
                                    size="sm"
                                    variant="flat"
                                    color="default"
                                    className="text-xs max-w-28 truncate"
                                  >
                                    {food.amount
                                      ? `${food.name} (${food.amount})`
                                      : food.name}
                                  </Chip>
                                )
                              )}
                            </div>
                          </div>

                          {/* Métricas */}
                          <div className="flex justify-between items-center pt-2 border-t border-default-100">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-primary rounded-full"></div>
                              <span className="text-xs text-default-600">
                                Proteína
                              </span>
                              <Chip
                                color="primary"
                                variant="flat"
                                size="sm"
                                className="font-semibold text-xs"
                              >
                                {meal.protein}g
                              </Chip>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-warning rounded-full"></div>
                              <span className="text-xs text-default-600">
                                Calorias
                              </span>
                              <Chip
                                color="warning"
                                variant="flat"
                                size="sm"
                                className="font-semibold text-xs"
                              >
                                {meal.calories}
                              </Chip>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Total do Dia - Mobile */}
                      <div className="bg-default-100 rounded-xl p-4 border border-default-200 mt-4">
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-bold text-default-800">
                            Total do Dia
                          </span>
                          <div className="flex gap-2">
                            <Chip
                              color="primary"
                              variant="solid"
                              size="sm"
                              startContent={<span className="text-xs">📊</span>}
                              className="font-bold"
                            >
                              {currentProtein}g
                            </Chip>
                            <Chip
                              color="warning"
                              variant="solid"
                              size="sm"
                              startContent={<span className="text-xs">📊</span>}
                              className="font-bold"
                            >
                              {currentCalories}
                            </Chip>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-default-600">
                              Progresso de Proteína
                            </span>
                            <span className="font-medium">
                              {currentProtein}/{proteinGoal}g
                            </span>
                          </div>
                          <Progress
                            size="sm"
                            value={proteinPercentage}
                            color="primary"
                            className="w-full"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>
        </Tab>
      </Tabs>
    </div>
  );
};