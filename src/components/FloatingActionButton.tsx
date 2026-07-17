import { useEffect, useState } from 'react';
import { Button, Tooltip } from '@heroui/react';
import { Plus, Camera, ImageIcon, Type, Mic, History } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export type FabAction = 'camera' | 'gallery' | 'text' | 'voice' | 'repeat';

interface Props {
  onAction: (a: FabAction) => void;
}

const items: { key: FabAction; label: string; icon: typeof Camera; angle: number }[] = [
  { key: 'camera',  label: 'Câmera',  icon: Camera,    angle: 200 },
  { key: 'gallery', label: 'Galeria', icon: ImageIcon, angle: 226 },
  { key: 'text',    label: 'Texto',   icon: Type,      angle: 252 },
  { key: 'voice',   label: 'Voz',     icon: Mic,       angle: 278 },
  { key: 'repeat',  label: 'Repetir', icon: History,   angle: 310 },
];

const RADIUS = 88;

export function FloatingActionButton({ onAction }: Props) {
  const [open, setOpen] = useState(false);
  const [pressTimer, setPressTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  // Atalhos de teclado
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      if (e.key === 'n') { e.preventDefault(); onAction('text'); }
      if (e.key === 'e') { e.preventDefault(); onAction('camera'); }
      if (e.key === 'd') { e.preventDefault(); onAction('voice'); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onAction]);

  const startLongPress = () => {
    const t = setTimeout(() => onAction('camera'), 600);
    setPressTimer(t);
  };
  const cancelLongPress = () => {
    if (pressTimer) clearTimeout(pressTimer);
    setPressTimer(null);
  };

  return (
    <div className="fixed bottom-[84px] left-1/2 z-50 -translate-x-1/2 md:bottom-8 md:left-auto md:right-8 md:translate-x-0">
      <div className="relative">
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.94 }}
              transition={{ type: 'spring', stiffness: 360, damping: 28 }}
              className="absolute bottom-20 left-1/2 -ml-[94px] grid w-[188px] grid-cols-2 gap-2 rounded-2xl border border-border/60 bg-background/95 p-2 shadow-floating backdrop-blur-xl md:hidden"
            >
              {items.map((it) => {
                const Icon = it.icon;
                return (
                  <Button
                    key={it.key}
                    color="primary"
                    variant="flat"
                    onPress={() => { onAction(it.key); setOpen(false); }}
                    aria-label={it.label}
                    className="h-14 min-w-0 flex-col gap-1 rounded-xl px-2 text-[10px] font-semibold"
                  >
                    <Icon className="size-4" />
                    <span className="leading-none">{it.label}</span>
                  </Button>
                );
              })}
            </motion.div>
          )}

          {open && items.map((it, i) => {
            const rad = (it.angle * Math.PI) / 180;
            const x = Math.cos(rad) * RADIUS;
            const y = Math.sin(rad) * RADIUS;
            const Icon = it.icon;
            return (
              <motion.div
                key={it.key}
                initial={{ opacity: 0, x: 0, y: 0, scale: 0.4 }}
                animate={{ opacity: 1, x, y, scale: 1 }}
                exit={{ opacity: 0, x: 0, y: 0, scale: 0.4 }}
                transition={{ delay: i * 0.04, type: 'spring', stiffness: 380, damping: 26 }}
                className="absolute left-1/2 top-1/2 hidden md:block"
              >
                <div className="-translate-x-1/2 -translate-y-1/2">
                  <Tooltip content={it.label} placement="left">
                    <Button
                      isIconOnly
                      radius="full"
                      color="primary"
                      variant="shadow"
                      onPress={() => { onAction(it.key); setOpen(false); }}
                      aria-label={it.label}
                      className="size-12"
                    >
                      <Icon className="size-5" />
                    </Button>
                  </Tooltip>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        <motion.button
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 18, delay: 0.2 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => setOpen((o) => !o)}
          onMouseDown={startLongPress}
          onMouseUp={cancelLongPress}
          onMouseLeave={cancelLongPress}
          onTouchStart={startLongPress}
          onTouchEnd={cancelLongPress}
          aria-label={open ? 'Fechar menu' : 'Adicionar refeição'}
          aria-expanded={open}
          className="relative grid size-14 place-items-center rounded-full bg-gradient-primary text-primary-foreground shadow-floating ring-4 ring-background md:size-16"
        >
          <motion.div animate={{ rotate: open ? 135 : 0 }} transition={{ type: 'spring', stiffness: 320, damping: 22 }}>
            <Plus className="size-6 md:size-7" />
          </motion.div>
        </motion.button>
      </div>
    </div>
  );
}
