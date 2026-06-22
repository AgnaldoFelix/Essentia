const KEY = 'meu-diario-user-id';

/**
 * Gera/recupera um ID anônimo persistido em localStorage.
 * Permite uso multi-dispositivo sem auth nesta versão.
 */
export function getLocalUserId(): string {
  if (typeof window === 'undefined') return '00000000-0000-0000-0000-000000000000';
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(KEY, id);
  }
  return id;
}
