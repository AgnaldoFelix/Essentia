import { useMemo } from 'react';
import { Card, CardBody } from '@heroui/react';
import { useApp } from '@/contexts/AppContext';
import { Cloud } from 'lucide-react';

export function FoodCloud() {
  const { meals } = useApp();

  const cloud = useMemo(() => {
    const counts = new Map<string, number>();
    meals.forEach((m) => m.alimentos.forEach((a) => {
      const key = a.name.trim().toLowerCase();
      if (!key) return;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }));
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([name, count], idx) => ({
        name,
        count,
        size: 0.85 + Math.min(0.8, count * 0.15) + (idx < 3 ? 0.2 : 0),
      }));
  }, [meals]);

  if (!cloud.length) return null;

  return (
    <Card shadow="sm" className="glass border-0">
      <CardBody className="p-4 sm:p-6 gap-3">
        <div className="flex items-center gap-2">
          <Cloud className="size-4 text-primary" />
          <h3 className="text-base font-bold">Mais consumidos</h3>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {cloud.map((t, i) => (
            <span
              key={t.name}
              className="capitalize px-3 py-1 rounded-full bg-primary/10 text-primary font-medium leading-none animate-fade-in"
              style={{
                fontSize: `${t.size}rem`,
                animationDelay: `${i * 30}ms`,
              }}
            >
              {t.name}
            </span>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
