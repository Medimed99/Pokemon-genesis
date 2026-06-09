import type { GameModule } from '../engine/module.ts';

export const NOYAU_IDLE: GameModule = {
  id: 'noyau-idle', label: 'Noyau Genesis',
  consumes: ['eo', 'plans'], produces: ['eo'],
};

export const EXPEDITION: GameModule = {
  id: 'expedition-arcanes', label: 'Expédition Arcanes',
  consumes: ['bandwidth'], produces: ['plans', 'artifacts'],
};

export const POKE_POKER: GameModule = {
  id: 'poke-poker', label: 'Poké-Poker',
  consumes: ['bandwidth'], produces: ['luxury_tokens'],
};

export const ALL_MODULES: GameModule[] = [NOYAU_IDLE, EXPEDITION, POKE_POKER];
