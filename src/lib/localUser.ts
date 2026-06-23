import { supabase } from '@/integrations/supabase/client';

let cachedId: string | null = null;
let pending: Promise<string> | null = null;

/**
 * Garante uma sessão Supabase anônima e retorna o user id autenticado.
 * Usado para que as políticas RLS (auth.uid() = user_id) funcionem.
 */
export async function ensureUserId(): Promise<string> {
  if (cachedId) return cachedId;
  if (pending) return pending;

  pending = (async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    let userId = sessionData.session?.user?.id;
    if (!userId) {
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) throw error;
      userId = data.user?.id;
    }
    if (!userId) throw new Error('Não foi possível iniciar sessão');
    cachedId = userId;
    return userId;
  })();

  try {
    return await pending;
  } finally {
    pending = null;
  }
}

/** Sincronizamente retorna o id em cache (ou string vazia se ainda não inicializado). */
export function getCachedUserId(): string {
  return cachedId ?? '';
}
