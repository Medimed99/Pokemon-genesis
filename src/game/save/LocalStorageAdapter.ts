import type { SaveAdapter, GameSave } from './SaveAdapter.ts';

const KEY = 'genesis_save_v1';

export class LocalStorageAdapter implements SaveAdapter {
  async load(): Promise<GameSave | null> {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as GameSave) : null;
  }
  async save(data: GameSave): Promise<void> {
    localStorage.setItem(KEY, JSON.stringify(data));
  }
}
