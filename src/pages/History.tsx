import { MealTimeline } from '@/components/MealTimeline';
import { WeeklyChart } from '@/components/WeeklyChart';
import { Card, CardBody } from '@heroui/react';
import { useApp } from '@/contexts/AppContext';
import { fmtNumber } from '@/lib/macros';
import type { Meal } from '@/types/nutrition';

interface Props { onEditMeal: (m: Meal) => void }

export function History({ onEditMeal }: Props) {
  const { week } = useApp();
  const avg = week.length
    ? {
        cal: week.reduce((a, r) => a + Number(r.calorias), 0) / week.length,
        prot: week.reduce((a, r) => a + Number(r.proteinas), 0) / week.length,
        fat: week.reduce((a, r) => a + Number(r.gorduras), 0) / week.length,
      }
    : { cal: 0, prot: 0, fat: 0 };

  return (
    <div className="space-y-6 pb-32 md:pb-12">
      <h2 className="text-2xl font-bold">Histórico</h2>

      <div className="grid grid-cols-3 gap-3">
        {([['Calorias', avg.cal, 'kcal', 'calories'], ['Proteína', avg.prot, 'g', 'protein'], ['Gordura', avg.fat, 'g', 'fat']] as const).map(([label, v, u, key]) => (
          <Card key={label} className="glass border-0" shadow="sm">
            <CardBody className="p-4">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Média 7d</p>
              <p className={`mono font-bold text-2xl text-${key}`}>{fmtNumber(Number(v))}</p>
              <p className="text-xs text-muted-foreground">{label} ({u})</p>
            </CardBody>
          </Card>
        ))}
      </div>

      <WeeklyChart />

      <MealTimeline onEdit={onEditMeal} />
    </div>
  );
}
