import { useEffect, useMemo, useState } from 'react';
import {
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
  Button, Spinner, Chip, Accordion, AccordionItem, Input,
} from '@heroui/react';
import { Copy, Plus, Check, X, History as HistoryIcon, Trash2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import { listRecentMeals, addMeal } from '@/lib/db';
import { toDateKey, humanDate, fromDateKey } from '@/lib/dateHelpers';
import { useApp } from '@/contexts/AppContext';
import type { Meal, Food } from '@/types/nutrition';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

type StagedFood = Food & { _key: string };

export function RepeatMealModal({ isOpen, onClose }: Props) {
  const { currentDate, refresh } = useApp();
  const [loading, setLoading] = useState(false);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [staged, setStaged] = useState<StagedFood[]>([]);
  const [nome, setNome] = useState('Refeição repetida');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setStaged([]);
    setNome('Refeição repetida');
    setSavedSuccess(false);
    (async () => {
      setLoading(true);
      try {
        const data = await listRecentMeals(14, currentDate);
        setMeals(data);
      } catch (e: any) {
        toast.error(e.message ?? 'Falha ao carregar histórico');
      } finally {
        setLoading(false);
      }
    })();
  }, [isOpen, currentDate]);

  const grouped = useMemo(() => {
    const map = new Map<string, Meal[]>();
    meals.forEach((m) => {
      const arr = map.get(m.data) ?? [];
      arr.push(m);
      map.set(m.data, arr);
    });
    return Array.from(map.entries());
  }, [meals]);

  const totals = staged.reduce(
    (acc, f) => ({
      calorias: acc.calorias + (f.calories || 0),
      proteinas: acc.proteinas + (f.protein || 0),
      gorduras: acc.gorduras + (f.fat || 0),
      carboidratos: acc.carboidratos + (f.carbs || 0),
    }),
    { calorias: 0, proteinas: 0, gorduras: 0, carboidratos: 0 },
  );

  const addFoodToStage = (food: Food, mealId: string, idx: number) => {
    const key = `${mealId}-${idx}-${Date.now()}`;
    setStaged((s) => [...s, { ...food, _key: key }]);
    toast.success(`${food.name} adicionado`, { duration: 1200 });
  };

  const removeStaged = (key: string) =>
    setStaged((s) => s.filter((f) => f._key !== key));

  const duplicateWholeMeal = async (m: Meal) => {
    setSaving(true);
    try {
      await addMeal({
        data: toDateKey(currentDate),
        horario: new Date().toTimeString().slice(0, 5),
        nome: m.nome,
        emoji: m.emoji,
        alimentos: m.alimentos,
        calorias: m.calorias,
        proteinas: m.proteinas,
        gorduras: m.gorduras,
        carboidratos: m.carboidratos,
        imagem_url: null,
        ai_confianca: null,
      });
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.7 } });
      await refresh();
      toast.success(`${m.emoji} ${m.nome} copiada para ${humanDate(currentDate)}`);
      setSavedSuccess(true);
      setTimeout(() => onClose(), 1200);
    } catch (e: any) {
      toast.error(e.message ?? 'Falha ao copiar');
    } finally {
      setSaving(false);
    }
  };

  const saveStaged = async () => {
    if (!staged.length) return;
    setSaving(true);
    try {
      const foods: Food[] = staged.map(({ _key, ...f }) => f);
      await addMeal({
        data: toDateKey(currentDate),
        horario: new Date().toTimeString().slice(0, 5),
        nome: nome.trim() || 'Refeição repetida',
        emoji: '🔁',
        alimentos: foods,
        calorias: totals.calorias,
        proteinas: totals.proteinas,
        gorduras: totals.gorduras,
        carboidratos: totals.carboidratos,
        imagem_url: null,
        ai_confianca: null,
      });
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      await refresh();
      setSavedSuccess(true);
      setTimeout(() => onClose(), 1200);
    } catch (e: any) {
      toast.error(e.message ?? 'Falha ao salvar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      placement="center"
      size="2xl"
      backdrop="blur"
      scrollBehavior="inside"
      classNames={{
        base: 'glass-strong',
        header: 'border-b border-border/40',
        footer: 'border-t border-border/40',
      }}
    >
      <ModalContent>
        {(close) => (
          <>
            <ModalHeader className="flex items-center gap-2">
              <HistoryIcon className="size-5 text-primary" />
              <div>
                <h2 className="text-lg font-bold">Repetir do histórico</h2>
                <p className="text-[11px] text-muted-foreground">
                  Copie uma refeição inteira ou selecione itens específicos para {humanDate(currentDate).toLowerCase()}
                </p>
              </div>
            </ModalHeader>

            <ModalBody className="gap-3 py-4 relative">
              <AnimatePresence>
                {savedSuccess && (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-background/85 backdrop-blur-md rounded-xl"
                  >
                    <motion.div
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 260, damping: 15 }}
                      className="size-20 rounded-full bg-gradient-to-br from-primary to-secondary grid place-items-center shadow-lg shadow-primary/40"
                    >
                      <Check className="size-11 text-white" strokeWidth={2.5} />
                    </motion.div>
                    <p className="text-lg font-bold">Adicionado com sucesso!</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {loading ? (
                <div className="grid place-items-center py-10"><Spinner color="primary" /></div>
              ) : meals.length === 0 ? (
                <div className="text-center py-10 text-sm text-muted-foreground">
                  Nenhuma refeição nos últimos 14 dias. Registre uma refeição para começar a repetir.
                </div>
              ) : (
                <Accordion
                  variant="splitted"
                  selectionMode="multiple"
                  defaultExpandedKeys={grouped[0] ? [grouped[0][0]] : []}
                  className="px-0"
                >
                  {grouped.map(([dateKey, dayMeals]) => (
                    <AccordionItem
                      key={dateKey}
                      aria-label={dateKey}
                      title={
                        <div className="flex items-center justify-between w-full pr-2">
                          <span className="text-sm font-semibold capitalize">{humanDate(fromDateKey(dateKey))}</span>
                          <Chip size="sm" variant="flat" color="primary">{dayMeals.length} ref.</Chip>
                        </div>
                      }
                      classNames={{ base: 'bg-card/60', title: 'text-sm' }}
                    >
                      <div className="space-y-3 pb-2">
                        {dayMeals.map((m) => (
                          <div key={m.id} className="rounded-xl border border-border/50 bg-background/50 p-3 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="text-sm font-semibold truncate">{m.emoji} {m.nome}</p>
                                <p className="text-[11px] text-muted-foreground">
                                  {m.horario} · {Math.round(m.calorias)} kcal · {Math.round(m.proteinas)}g P · {Math.round(m.gorduras)}g G
                                </p>
                              </div>
                              <Button
                                size="sm" color="primary" variant="flat" radius="full"
                                startContent={<Copy className="size-3.5" />}
                                onPress={() => duplicateWholeMeal(m)}
                                isDisabled={saving}
                                className="shrink-0"
                              >
                                Repetir
                              </Button>
                            </div>
                            <div className="grid gap-1.5">
                              {m.alimentos.map((f, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between gap-2 rounded-lg bg-card/70 px-2.5 py-1.5"
                                >
                                  <div className="min-w-0">
                                    <p className="text-xs font-medium truncate">{f.name}</p>
                                    <p className="text-[10px] text-muted-foreground">
                                      {f.amount} · {Math.round(f.calories)} kcal
                                    </p>
                                  </div>
                                  <Button
                                    isIconOnly size="sm" variant="light" color="primary"
                                    aria-label={`Adicionar ${f.name}`}
                                    onPress={() => addFoodToStage(f, m.id, idx)}
                                  >
                                    <Plus className="size-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </ModalBody>

            <ModalFooter className="flex-col items-stretch gap-2">
              {staged.length > 0 && (
                <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-primary">
                      {staged.length} item{staged.length > 1 ? 's' : ''} selecionado{staged.length > 1 ? 's' : ''} · {Math.round(totals.calorias)} kcal
                    </p>
                    <Button size="sm" variant="light" onPress={() => setStaged([])}>Limpar</Button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {staged.map((f) => (
                      <Chip
                        key={f._key}
                        size="sm"
                        variant="flat"
                        onClose={() => removeStaged(f._key)}
                        endContent={<Trash2 className="size-3" />}
                      >
                        {f.name}
                      </Chip>
                    ))}
                  </div>
                  <Input
                    size="sm"
                    label="Nome da refeição"
                    value={nome}
                    onValueChange={setNome}
                  />
                </div>
              )}
              <div className="flex justify-end gap-2">
                <Button variant="light" onPress={close} startContent={<X className="size-4" />}>Fechar</Button>
                <Button
                  color="primary"
                  className="bg-gradient-primary"
                  onPress={saveStaged}
                  isDisabled={!staged.length || saving}
                  isLoading={saving}
                  startContent={!saving && <Check className="size-4" />}
                >
                  Adicionar ao dia
                </Button>
              </div>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
