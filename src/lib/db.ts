import { supabase } from '@/integrations/supabase/client';
import { ensureUserId } from './localUser';
import type { Meal, DailyRecord, Goals, Food } from '@/types/nutrition';
import { toDateKey } from './dateHelpers';
import { subDays } from 'date-fns';

/* ---------- Refeições ---------- */

export async function listMealsByDate(date: Date): Promise<Meal[]> {
  const uid = await ensureUserId();
  const { data, error } = await supabase
    .from('refeicoes')
    .select('*')
    .eq('user_id', uid)
    .eq('data', toDateKey(date))
    .order('horario', { ascending: true });
  if (error) throw error;
  return ((data || []) as any).map(mapMeal);
}

export async function listRecentMeals(days = 14, excludeDate?: Date): Promise<Meal[]> {
  const uid = await ensureUserId();
  const end = new Date();
  const start = subDays(end, days);
  let q = supabase
    .from('refeicoes')
    .select('*')
    .eq('user_id', uid)
    .gte('data', toDateKey(start))
    .lte('data', toDateKey(end))
    .order('data', { ascending: false })
    .order('horario', { ascending: true });
  if (excludeDate) q = q.neq('data', toDateKey(excludeDate));
  const { data, error } = await q;
  if (error) throw error;
  return ((data || []) as any).map(mapMeal);
}

export async function addMeal(payload: Omit<Meal, 'id' | 'user_id' | 'created_at'>): Promise<Meal> {
  const uid = await ensureUserId();
  const insert = {
    user_id: uid,
    data: payload.data,
    horario: payload.horario,
    nome: payload.nome,
    emoji: payload.emoji,
    alimentos: payload.alimentos as unknown as any,
    calorias: payload.calorias,
    proteinas: payload.proteinas,
    gorduras: payload.gorduras,
    carboidratos: payload.carboidratos,
    imagem_url: payload.imagem_url ?? null,
    ai_confianca: payload.ai_confianca ?? null,
  };
  const { data, error } = await supabase
    .from('refeicoes')
    .insert(insert)
    .select()
    .single();
  if (error) throw error;
  return mapMeal(data as any);
}

export async function updateMeal(id: string, payload: Partial<Meal>): Promise<Meal> {
  const uid = await ensureUserId();
  const { data, error } = await supabase
    .from('refeicoes')
    .update({
      ...(payload.nome !== undefined && { nome: payload.nome }),
      ...(payload.emoji !== undefined && { emoji: payload.emoji }),
      ...(payload.horario !== undefined && { horario: payload.horario }),
      ...(payload.alimentos !== undefined && { alimentos: payload.alimentos as unknown as any }),
      ...(payload.calorias !== undefined && { calorias: payload.calorias }),
      ...(payload.proteinas !== undefined && { proteinas: payload.proteinas }),
      ...(payload.gorduras !== undefined && { gorduras: payload.gorduras }),
      ...(payload.carboidratos !== undefined && { carboidratos: payload.carboidratos }),
    })
    .eq('id', id)
    .eq('user_id', uid)
    .select()
    .single();
  if (error) throw error;
  return mapMeal(data as any);
}

export async function deleteMeal(id: string): Promise<void> {
  const uid = await ensureUserId();
  const { error } = await supabase.from('refeicoes').delete().eq('id', id).eq('user_id', uid);
  if (error) throw error;
}

/* ---------- Registros diários ---------- */

export async function getDailyRecord(date: Date): Promise<DailyRecord> {
  const uid = await ensureUserId();
  const key = toDateKey(date);
  const { data, error } = await supabase
    .from('registro_diario')
    .select('*')
    .eq('user_id', uid)
    .eq('data', key)
    .maybeSingle();
  if (error) throw error;
  return (data as any) ?? {
    user_id: uid, data: key, calorias: 0, proteinas: 0, gorduras: 0, carboidratos: 0,
  };
}

export async function getWeekRecords(anchor: Date): Promise<DailyRecord[]> {
  const uid = await ensureUserId();
  const end = anchor;
  const start = subDays(anchor, 6);
  const { data, error } = await supabase
    .from('registro_diario')
    .select('*')
    .eq('user_id', uid)
    .gte('data', toDateKey(start))
    .lte('data', toDateKey(end))
    .order('data', { ascending: true });
  if (error) throw error;
  return (data as any) || [];
}

/* ---------- Metas ---------- */

const DEFAULT_GOALS: Goals = {
  meta_calorias: 2200,
  meta_proteinas: 150,
  meta_gorduras: 70,
  meta_carboidratos: 250,
};

export async function getGoals(): Promise<Goals> {
  const uid = await ensureUserId();
  const { data, error } = await supabase
    .from('metas_usuario')
    .select('*')
    .eq('user_id', uid)
    .maybeSingle();
  if (error) throw error;
  if (!data) return DEFAULT_GOALS;
  return {
    meta_calorias: Number((data as any).meta_calorias),
    meta_proteinas: Number((data as any).meta_proteinas),
    meta_gorduras: Number((data as any).meta_gorduras),
    meta_carboidratos: Number((data as any).meta_carboidratos),
  };
}

export async function saveGoals(goals: Goals): Promise<void> {
  const uid = await ensureUserId();
  const { error } = await supabase
    .from('metas_usuario')
    .upsert({ user_id: uid, ...goals, updated_at: new Date().toISOString() });
  if (error) throw error;
}

/* ---------- Mapper ---------- */

function mapMeal(row: any): Meal {
  return {
    id: row.id,
    user_id: row.user_id,
    data: row.data,
    horario: typeof row.horario === 'string' ? row.horario.slice(0, 5) : row.horario,
    nome: row.nome,
    emoji: row.emoji || '🍽️',
    alimentos: (row.alimentos as Food[]) || [],
    calorias: Number(row.calorias),
    proteinas: Number(row.proteinas),
    gorduras: Number(row.gorduras),
    carboidratos: Number(row.carboidratos),
    imagem_url: row.imagem_url,
    ai_confianca: row.ai_confianca ? Number(row.ai_confianca) : null,
    created_at: row.created_at,
  };
}
