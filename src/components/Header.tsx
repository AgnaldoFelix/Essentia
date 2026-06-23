import { useState } from 'react';
import {
  Navbar, NavbarBrand, NavbarContent, NavbarItem,
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
    <Navbar
      maxWidth="xl"
      className="glass border-b border-border/40"
      classNames={{
        wrapper: 'px-3 sm:px-6',
      }}
    >
      <NavbarBrand className="gap-2 grow-0">
        <motion.img
          src="/Essentia.png"
          alt="Essentia"
          initial={{ scale: 0.85, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 240, damping: 18 }}
          className="size-7 rounded-lg shadow-md object-cover"
        />
        <div className="block">
          <h1 className="text-sm font-extrabold leading-none">Essentia</h1>
          <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Diário Alimentar</p>
        </div>
      </NavbarBrand>

      <NavbarContent justify="center" className="gap-1 sm:gap-3">
        <NavbarItem>
          <Button isIconOnly size="sm" variant="light" onPress={() => setCurrentDate(subDays(currentDate, 1))} aria-label="Dia anterior">
            <ChevronLeft className="size-4" />
          </Button>
        </NavbarItem>
        <NavbarItem className="px-1 sm:px-3 min-w-[120px] sm:min-w-[170px] text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentDate.toISOString()}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-center gap-2"
            >
              <Calendar className="size-3.5 text-muted-foreground" />
              <span className="text-sm font-semibold capitalize">{humanDate(currentDate)}</span>
            </motion.div>
          </AnimatePresence>
        </NavbarItem>
        <NavbarItem>
          <Button
            isIconOnly
            size="sm"
            variant="light"
            onPress={() => setCurrentDate(addDays(currentDate, 1))}
            aria-label="Próximo dia"
            isDisabled={isToday}
          >
            <ChevronRight className="size-4" />
          </Button>
        </NavbarItem>
      </NavbarContent>

      <NavbarContent justify="end" className="gap-1 sm:gap-2">
        <NavbarItem>
          <Tooltip content={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}>
            <Button isIconOnly size="sm" variant="light" onPress={toggleTheme} aria-label="Alternar tema">
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
        </NavbarItem>
        <NavbarItem>
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
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
}
