import type { EconomySave } from '../../engine/economyStore.ts';

export interface WorkerSave {
  speciesId: number;
  level: number;
  shiny: boolean;
}

export interface GameSave {
  economy: EconomySave;
  workers: WorkerSave[];
  phase: string;
  colorsReturned: boolean;
  items: Record<string, number>;
  pokedex: number[];
  lastDaily: number;
}

export interface SaveAdapter {
  load(): Promise<GameSave | null>;
  save(data: GameSave): Promise<void>;
}
