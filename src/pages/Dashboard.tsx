import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rings } from '@/components/Rings';
import { MacroCards } from '@/components/MacroCards';
import { WeeklyChart } from '@/components/WeeklyChart';
import { MealTimeline } from '@/components/MealTimeline';
import { AIInsights } from '@/components/AIInsights';
import { FoodCloud } from '@/components/FoodCloud';
import { useApp } from '@/contexts/AppContext';
import type { Meal } from '@/types/nutrition';
import { Spinner } from '@heroui/react';

interface Props {
  onEditMeal: (m: Meal) => void;
  onSeeAll: () => void;
}

export function Dashboard({ onEditMeal, onSeeAll }: Props) {
  const { loading, currentDate } = useApp();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentDate.toISOString()}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.3 }}
        className="space-y-6 pb-32 md:pb-12"
      >
        {/* Anéis em destaque */}
        <section className="glass rounded-2xl p-4 sm:p-6">
          <div className="text-center mb-2">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Resumo do dia</h2>
          </div>
          {loading ? (
            <div className="grid place-items-center py-10"><Spinner color="primary" /></div>
          ) : (
            <Rings />
          )}
        </section>

        {/* 4 macros */}
        <MacroCards />

        {/* Gráfico semanal */}
        <WeeklyChart />

        {/* Timeline */}
        <MealTimeline onEdit={onEditMeal} limit={5} onSeeAll={onSeeAll} />

        {/* IA Insights + Food cloud */}
        <div className="grid lg:grid-cols-2 gap-4">
          <AIInsights />
          <FoodCloud />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
