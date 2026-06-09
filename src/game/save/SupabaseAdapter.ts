import { createClient } from '@supabase/supabase-js';
import type { SaveAdapter, GameSave } from './SaveAdapter.ts';

// Renvoie un adaptateur Supabase si les variables d'env sont présentes, sinon null.
// (Table attendue : `saves` avec colonnes `id` text, `payload` jsonb.)
export function makeSupabaseAdapter(): SaveAdapter | null {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  const client = createClient(url, key);
  const ROW_ID = 'local-player';

  return {
    async load(): Promise<GameSave | null> {
      const { data } = await client
        .from('saves').select('payload').eq('id', ROW_ID).maybeSingle();
      return (data?.payload as GameSave) ?? null;
    },
    async save(payload: GameSave): Promise<void> {
      await client.from('saves').upsert({ id: ROW_ID, payload });
    },
  };
}
