import { useMemo, useState } from 'react';
import {
  Bar, BarChart, Line, LineChart, CartesianGrid, ResponsiveContainer,
  Tooltip, XAxis, YAxis, Legend, ReferenceLine,
} from 'recharts';
import { Card, CardBody, ButtonGroup, Button } from '@heroui/react';
import { useApp } from '@/contexts/AppContext';
import { weekDays, shortDayLabel, toDateKey } from '@/lib/dateHelpers';
import { BarChart3, LineChart as LineIcon } from 'lucide-react';

type Mode = 'bar' | 'line';

export function WeeklyChart() {
  const { week, currentDate, goals } = useApp();
  const [mode, setMode] = useState<Mode>('bar');

  const data = useMemo(() => {
    const map = new Map(week.map((r) => [r.data, r]));
    return weekDays(currentDate).map((d) => {
      const k = toDateKey(d);
      const r = map.get(k);
      return {
        day: shortDayLabel(d),
        date: k,
        Calorias: Math.round(r?.calorias ?? 0),
        Proteínas: Math.round(r?.proteinas ?? 0),
        Gorduras: Math.round(r?.gorduras ?? 0),
      };
    });
  }, [week, currentDate]);

  const colors = {
    Calorias: 'hsl(var(--calories))',
    Proteínas: 'hsl(var(--protein))',
    Gorduras: 'hsl(var(--fat))',
  };

  return (
    <Card shadow="sm" className="glass border-0">
      <CardBody className="p-4 sm:p-6 gap-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-base font-bold">Últimos 7 dias</h3>
            <p className="text-xs text-muted-foreground">Calorias, Proteínas e Gorduras diárias</p>
          </div>
          <ButtonGroup size="sm" variant="flat">
            <Button onPress={() => setMode('bar')} color={mode === 'bar' ? 'primary' : 'default'} startContent={<BarChart3 className="size-3.5" />}>
              Barras
            </Button>
            <Button onPress={() => setMode('line')} color={mode === 'line' ? 'primary' : 'default'} startContent={<LineIcon className="size-3.5" />}>
              Linhas
            </Button>
          </ButtonGroup>
        </div>

        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {mode === 'bar' ? (
              <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.5rem',
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <ReferenceLine y={goals.meta_calorias} stroke={colors.Calorias} strokeDasharray="4 4" opacity={0.5} />
                <Bar dataKey="Calorias" fill={colors.Calorias} radius={[6, 6, 0, 0]} />
                <Bar dataKey="Proteínas" fill={colors.Proteínas} radius={[6, 6, 0, 0]} />
                <Bar dataKey="Gorduras" fill={colors.Gorduras} radius={[6, 6, 0, 0]} />
              </BarChart>
            ) : (
              <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.5rem',
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <ReferenceLine y={goals.meta_calorias} stroke={colors.Calorias} strokeDasharray="4 4" opacity={0.5} />
                <Line type="monotone" dataKey="Calorias" stroke={colors.Calorias} strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="Proteínas" stroke={colors.Proteínas} strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="Gorduras" stroke={colors.Gorduras} strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardBody>
    </Card>
  );
}
