import { Home, History, MessageSquare, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export type TabKey = 'dashboard' | 'history' | 'chat' | 'profile';

const tabs: { key: TabKey; label: string; icon: typeof Home }[] = [
  { key: 'dashboard', label: 'Início', icon: Home },
  { key: 'history',   label: 'Histórico', icon: History },
  { key: 'chat',      label: 'Chat IA', icon: MessageSquare },
  { key: 'profile',   label: 'Perfil', icon: Target },
];

interface Props {
  active: TabKey;
  onChange: (k: TabKey) => void;
}

export function BottomNav({ active, onChange }: Props) {
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass border-t border-border/40 pb-[env(safe-area-inset-bottom)]"
      role="navigation"
      aria-label="Navegação principal"
    >
      <ul className="flex items-stretch justify-around px-2">
        {tabs.map((t) => {
          const isActive = active === t.key;
          const Icon = t.icon;
          return (
            <li key={t.key} className="flex-1">
              <button
                onClick={() => onChange(t.key)}
                className={cn(
                  'relative w-full flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground',
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                {isActive && (
                  <motion.span
                    layoutId="bottom-pill"
                    className="absolute inset-x-3 top-1 h-1 rounded-full bg-primary"
                    transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                  />
                )}
                <Icon className="size-5" />
                <span>{t.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function Sidebar({ active, onChange }: Props) {
  return (
    <aside className="hidden md:flex md:flex-col w-[220px] shrink-0 sticky top-[72px] self-start h-[calc(100vh-88px)] gap-1 px-3">
      {tabs.map((t) => {
        const isActive = active === t.key;
        const Icon = t.icon;
        return (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            className={cn(
              'relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
              isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
            aria-current={isActive ? 'page' : undefined}
          >
            {isActive && (
              <motion.span
                layoutId="side-pill"
                className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-primary"
                transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              />
            )}
            <Icon className="size-4" />
            <span>{t.label}</span>
          </button>
        );
      })}

      <div className="mt-auto p-3 rounded-xl glass text-[11px] text-muted-foreground">
        Os anéis e gráficos atualizam automaticamente conforme você registra refeições.
      </div>
    </aside>
  );
}
