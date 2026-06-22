import { useMemo } from 'react';
import { Card, CardBody, Chip } from '@heroui/react';
import { Sparkles } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { pct } from '@/lib/macros';

interface Insight {
  type: 'success' | 'warning' | 'info';
  text: string;
}

export function AIInsights() {
  const { daily, goals, meals } = useApp();

  const insights = useMemo<Insight[]>(() => {
    const list: Insight[] = [];
    const calP = pct(daily.calorias, goals.meta_calorias);
    const proP = pct(daily.proteinas, goals.meta_proteinas);
    const fatP = pct(daily.gorduras, goals.meta_gorduras);

    if (proP < 60) list.push({
      type: 'warning',
      text: `Você está em ${Math.round(proP)}% da meta de proteína. Adicione uma fonte proteica como ovos, frango ou whey.`,
    });
    if (calP > 100) list.push({
      type: 'warning',
      text: `Superávit calórico de ${Math.round(daily.calorias - goals.meta_calorias)} kcal. Considere uma refeição mais leve.`,
    });
    if (proP >= 80 && calP <= 100) list.push({
      type: 'success',
      text: 'Excelente equilíbrio! Você está mantendo proteína alta e calorias dentro da meta.',
    });
    if (fatP > 110) list.push({
      type: 'info',
      text: 'Gorduras acima do alvo. Prefira fontes magras nas próximas refeições.',
    });
    if (!meals.length) list.push({
      type: 'info',
      text: 'Comece o dia registrando seu café da manhã para acompanhar o progresso.',
    });
    if (meals.length >= 4) list.push({
      type: 'success',
      text: `Ótimo! ${meals.length} refeições registradas mantêm o metabolismo ativo.`,
    });

    return list.slice(0, 3);
  }, [daily, goals, meals]);

  if (!insights.length) return null;

  return (
    <Card shadow="sm" className="glass border-0 bg-gradient-to-br from-primary/5 to-accent/5">
      <CardBody className="p-4 sm:p-6 gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-primary" />
          <h3 className="text-base font-bold">Insights da IA</h3>
        </div>
        <div className="space-y-2">
          {insights.map((ins, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              <Chip
                size="sm"
                color={ins.type === 'success' ? 'success' : ins.type === 'warning' ? 'warning' : 'primary'}
                variant="flat"
                className="shrink-0"
              >
                {ins.type === 'success' ? '✓' : ins.type === 'warning' ? '!' : 'i'}
              </Chip>
              <span className="text-foreground/90">{ins.text}</span>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
