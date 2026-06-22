import { format, parseISO, subDays, startOfWeek, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const toDateKey = (d: Date): string => format(d, 'yyyy-MM-dd');
export const fromDateKey = (s: string): Date => parseISO(s);

export const humanDate = (d: Date): string => {
  const today = new Date();
  const todayKey = toDateKey(today);
  const yesterdayKey = toDateKey(subDays(today, 1));
  const k = toDateKey(d);
  if (k === todayKey) return 'Hoje';
  if (k === yesterdayKey) return 'Ontem';
  return format(d, "EEE, dd 'de' MMM", { locale: ptBR });
};

export const weekDays = (anchor: Date): Date[] => {
  const start = startOfWeek(anchor, { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
};

export const shortDayLabel = (d: Date) => format(d, 'EEE', { locale: ptBR });
