import { useState } from 'react';
import { Card, CardBody, Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/react';
import { MoreVertical, Pencil, Trash2, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Meal } from '@/types/nutrition';
import { useApp } from '@/contexts/AppContext';
import { deleteMeal } from '@/lib/db';
import { toast } from 'sonner';

interface Props {
  onEdit: (meal: Meal) => void;
  limit?: number;
  onSeeAll?: () => void;
}

export function MealTimeline({ onEdit, limit, onSeeAll }: Props) {
  const { meals, refresh } = useApp();
  const list = typeof limit === 'number' ? meals.slice(0, limit) : meals;
  const [busyId, setBusyId] = useState<string | null>(null);

  const handleDelete = async (m: Meal) => {
    if (!confirm(`Excluir "${m.nome}"?`)) return;
    setBusyId(m.id);
    try {
      await deleteMeal(m.id);
      toast.success('Refeição removida');
      await refresh();
    } catch (e: any) {
      toast.error(e.message ?? 'Falha ao excluir');
    } finally {
      setBusyId(null);
    }
  };

  if (!meals.length) {
    return (
      <Card shadow="sm" className="glass border-0">
        <CardBody className="p-8 text-center">
          <div className="text-4xl mb-2">🍽️</div>
          <p className="text-sm text-muted-foreground">Nenhuma refeição registrada neste dia.</p>
          <p className="text-xs text-muted-foreground mt-1">Toque no botão <strong>+</strong> para começar.</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card shadow="sm" className="glass border-0">
      <CardBody className="p-4 sm:p-6 gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold">Refeições do dia</h3>
          {limit && meals.length > limit && onSeeAll && (
            <Button size="sm" variant="light" color="primary" onPress={onSeeAll}>
              Ver todas ({meals.length})
            </Button>
          )}
        </div>

        <div className="relative space-y-3">
          <AnimatePresence initial={false}>
            {list.map((m, i) => (
              <motion.div
                key={m.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: i * 0.04 }}
                className="flex gap-3 items-start p-3 rounded-xl bg-card/60 hover:bg-card transition-colors border border-border/50"
              >
                <div className="text-3xl shrink-0">{m.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="size-3" />
                    <span className="mono">{m.horario}</span>
                  </div>
                  <div className="font-semibold truncate">{m.nome}</div>
                  <div className="flex flex-wrap gap-3 mt-1 text-[11px]">
                    <span className="text-calories font-medium">🔥 {Math.round(m.calorias)} kcal</span>
                    <span className="text-protein font-medium">💪 {Math.round(m.proteinas)}g</span>
                    <span className="text-fat font-medium">🥑 {Math.round(m.gorduras)}g</span>
                  </div>
                  {!!m.alimentos?.length && (
                    <div className="text-xs text-muted-foreground mt-1 truncate">
                      {m.alimentos.map((a) => a.name).join(' • ')}
                    </div>
                  )}
                </div>
                <Dropdown placement="bottom-end">
                  <DropdownTrigger>
                    <Button isIconOnly size="sm" variant="light" isLoading={busyId === m.id}>
                      <MoreVertical className="size-4" />
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu aria-label="Ações">
                    <DropdownItem key="edit" startContent={<Pencil className="size-3.5" />} onPress={() => onEdit(m)}>
                      Editar
                    </DropdownItem>
                    <DropdownItem
                      key="delete"
                      color="danger"
                      className="text-danger"
                      startContent={<Trash2 className="size-3.5" />}
                      onPress={() => handleDelete(m)}
                    >
                      Excluir
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </CardBody>
    </Card>
  );
}
