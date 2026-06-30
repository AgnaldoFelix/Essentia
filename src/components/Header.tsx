import { useState } from 'react';
import {
  Button, Avatar, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem,
  Tooltip,
} from '@heroui/react';
import { Moon, Sun, ChevronLeft, ChevronRight, Calendar, LogOut, Target, Download } from 'lucide-react';
import { addDays, subDays, isSameDay } from 'date-fns';
import { useApp } from '@/contexts/AppContext';
import { humanDate } from '@/lib/dateHelpers';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  onOpenProfile: () => void;
  onOpenExport: () => void;
}

export function Header({ onOpenProfile, onOpenExport }: Props) {
  const { currentDate, setCurrentDate, theme, toggleTheme } = useApp();
  const [resetDate] = useState(new Date());
  const isToday = isSameDay(currentDate, resetDate);

  return (
    <header className="sticky top-0 z-40 glass border-b border-border/40 px-3 pb-2 pt-[calc(env(safe-area-inset-top)+0.375rem)] sm:px-6 md:py-3">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2 gap-y-1.5 md:grid-cols-[1fr_auto_1fr]">
        <div className="flex min-w-0 items-center gap-2">
          <motion.img
            src="/Essentia.png"
            alt="Essentia"
            initial={{ scale: 0.85, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 240, damping: 18 }}
            className="size-7 shrink-0 rounded-lg object-cover shadow-md md:size-9"
          />
          <div className="min-w-0">
            <h1 className="truncate text-sm font-extrabold leading-none md:text-base">Essentia</h1>
            <p className="truncate text-[10px] font-semibold uppercase leading-4 text-muted-foreground md:text-[11px]">
              Diário Alimentar
            </p>
          </div>
        </div>

        <div className="col-span-2 row-start-2 flex h-10 items-center justify-between rounded-full border border-border/50 bg-muted/50 p-1 md:col-span-1 md:col-start-2 md:row-start-1 md:h-11 md:min-w-[260px] md:bg-background/40">
          <Button
            isIconOnly
            size="sm"
            variant="light"
            onPress={() => setCurrentDate(subDays(currentDate, 1))}
            aria-label="Dia anterior"
            className="h-8 min-w-8 shrink-0 md:h-9 md:min-w-9"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <div className="min-w-0 flex-1 px-2 text-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentDate.toISOString()}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="flex min-w-0 items-center justify-center gap-1.5"
              >
                <Calendar className="size-3.5 shrink-0 text-muted-foreground" />
                <span className="truncate text-sm font-semibold capitalize">{humanDate(currentDate)}</span>
              </motion.div>
            </AnimatePresence>
          </div>
          <Button
            isIconOnly
            size="sm"
            variant="light"
            onPress={() => setCurrentDate(addDays(currentDate, 1))}
            aria-label="Próximo dia"
            isDisabled={isToday}
            className="h-8 min-w-8 shrink-0 md:h-9 md:min-w-9"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>

        <div className="col-start-2 row-start-1 flex items-center justify-end gap-1 md:col-start-3">
          <Tooltip content={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}>
            <Button isIconOnly size="sm" variant="light" onPress={toggleTheme} aria-label="Alternar tema" className="h-8 min-w-8 md:h-9 md:min-w-9">
              <AnimatePresence mode="wait">
                <motion.div
                  key={theme}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
                </motion.div>
              </AnimatePresence>
            </Button>
          </Tooltip>
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Avatar
                size="sm"
                isBordered
                color="primary"
                className="cursor-pointer"
                name="Você"
                src=""
              />
            </DropdownTrigger>
            <DropdownMenu aria-label="Menu do usuário">
              <DropdownItem key="profile" startContent={<Target className="size-4" />} onPress={onOpenProfile}>
                Perfil & Metas
              </DropdownItem>
              <DropdownItem key="export" startContent={<Download className="size-4" />} onPress={onOpenExport}>
                Exportar relatório
              </DropdownItem>
              <DropdownItem key="logout" className="text-danger" color="danger" startContent={<LogOut className="size-4" />}>
                Sair (em breve)
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>
    </header>
  );
}
