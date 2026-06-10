import type { EconomySave } from '../../engine/economyStore.ts';

export interface WorkerSave {
  speciesId: number;
  level: number;
  shiny: boolean;
}

export interface ActiveEffectSave {
  id: string;
  expiresAt: number;
}

export interface GameSave {
  economy: EconomySave;
  workers: WorkerSave[];
  phase: string;
  colorsReturned: boolean;
  items: Record<string, number>;
  pokedex: number[];
  shinyDex: number[];
  lastDaily: number;
  introCompleted: boolean;
  playerName: string;
  playerAvatar: string;
  activeEffects: ActiveEffectSave[];
  streak: number;
  bestStreak: number;
  totalXp: number;
  quests: import('../quests.ts').ActiveQuest[];
  questDay: number;
  fleeStreak: number;
  totalCoinsEarned: number;
  expeditionsDone: number;
  pokerWins: number;
  pokeboxOpened: number;
  unlockedAchievements: string[];
  equipped: { title: string; frame: string; background: string; xpfx: string };
  unlockedCosmetics: string[];
}

export interface SaveAdapter {
  load(): Promise<GameSave | null>;
  save(data: GameSave): Promise<void>;
}
