import { useState } from 'react';
import { Toaster } from 'sonner';
import { AnimatePresence, motion } from 'framer-motion';
import { AppProvider } from '@/contexts/AppContext';
import { Header } from '@/components/Header';
import { BottomNav, Sidebar, type TabKey } from '@/components/Navigation';
import { FloatingActionButton, type FabAction } from '@/components/FloatingActionButton';
import { MealEntryModal } from '@/components/MealEntryModal';
import { RepeatMealModal } from '@/components/RepeatMealModal';
import { ExportModal } from '@/components/ExportModal';
import { Dashboard } from '@/pages/Dashboard';
import { History } from '@/pages/History';
import { ChatPage } from '@/pages/ChatPage';
import { Profile } from '@/pages/Profile';
import type { Meal } from '@/types/nutrition';

function Shell() {
  const [tab, setTab] = useState<TabKey>('dashboard');
  const [mealModalOpen, setMealModalOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [fabAction, setFabAction] = useState<FabAction>('text');
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);

  const openCreate = (a: FabAction) => {
    setEditingMeal(null);
    setFabAction(a);
    setMealModalOpen(true);
  };
  const openEdit = (m: Meal) => {
    setEditingMeal(m);
    setFabAction('text');
    setMealModalOpen(true);
  };

  const goHistory = () => setTab('history');
  const goProfile = () => setTab('profile');

  return (
    <div className="min-h-screen flex flex-col">
      <Header onOpenProfile={goProfile} onOpenExport={() => setExportOpen(true)} />

      <div className="flex-1 container max-w-6xl mx-auto px-3 sm:px-6 pt-6">
        <div className="flex gap-6">
          <Sidebar active={tab} onChange={setTab} />
          <main className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                {tab === 'dashboard' && <Dashboard onEditMeal={openEdit} onSeeAll={goHistory} />}
                {tab === 'history' && <History onEditMeal={openEdit} />}
                {tab === 'chat' && <ChatPage />}
                {tab === 'profile' && <Profile />}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>

      <FloatingActionButton onAction={openCreate} />
      <BottomNav active={tab} onChange={setTab} />

      <MealEntryModal
        isOpen={mealModalOpen}
        onClose={() => setMealModalOpen(false)}
        initialTab={fabAction}
        editing={editingMeal}
      />
      <ExportModal isOpen={exportOpen} onClose={() => setExportOpen(false)} />
      <Toaster position="top-center" richColors closeButton />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
