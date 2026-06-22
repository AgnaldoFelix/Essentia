import { Card, CardBody, Progress } from '@heroui/react';
import { fmtNumber, pct, macroLabels, macroUnits, macroEmojis } from '@/lib/macros';
import type { MacroKey } from '@/types/nutrition';
import { useApp } from '@/contexts/AppContext';

const macroOrder: MacroKey[] = ['calories', 'protein', 'fat', 'carbs'];

const heroColor: Record<MacroKey, 'danger' | 'success' | 'warning' | 'primary'> = {
  calories: 'danger',
  protein: 'success',
  fat: 'warning',
  carbs: 'primary',
};

export function MacroCards() {
  const { daily, goals } = useApp();
  const map = {
    calories: { current: daily.calorias, goal: goals.meta_calorias },
    protein:  { current: daily.proteinas, goal: goals.meta_proteinas },
    fat:      { current: daily.gorduras, goal: goals.meta_gorduras },
    carbs:    { current: daily.carboidratos, goal: goals.meta_carboidratos },
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {macroOrder.map((m) => {
        const { current, goal } = map[m];
        const p = pct(current, goal);
        return (
          <Card key={m} shadow="sm" className="glass border-0 hover:scale-[1.02] transition-transform">
            <CardBody className="p-4 gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {macroLabels[m]}
                </span>
                <span className="text-lg">{macroEmojis[m]}</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-mono font-bold text-2xl tabular-nums">{fmtNumber(current)}</span>
                <span className="text-xs text-muted-foreground">/ {fmtNumber(goal)} {macroUnits[m]}</span>
              </div>
              <Progress
                aria-label={macroLabels[m]}
                value={p}
                size="sm"
                color={heroColor[m]}
                className="mt-1"
              />
              <span className="text-[10px] text-muted-foreground">{Math.round(p)}% da meta</span>
            </CardBody>
          </Card>
        );
      })}
    </div>
  );
}
