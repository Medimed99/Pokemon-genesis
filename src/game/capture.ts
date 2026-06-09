import { KANTO, type Species } from './kanto.ts';

export type Rarity = 'Commun' | 'Rare' | 'Ultra-Rare' | 'Légendaire';

export interface Ball {
  id: string;
  label: string;
  catchMult: number;
  guaranteed?: boolean;
}

export const BALLS: Record<string, Ball> = {
  pokeball: { id: 'pokeball', label: 'Poké Ball', catchMult: 1 },
  superball: { id: 'superball', label: 'Super Ball', catchMult: 1.5 },
  hyperball: { id: 'hyperball', label: 'Hyper Ball', catchMult: 2 },
  masterball: { id: 'masterball', label: 'Master Ball', catchMult: 1, guaranteed: true },
};

export function rarityOf(s: Species): Rarity {
  if (s.legendary) return 'Légendaire';
  if (s.bst >= 500) return 'Ultra-Rare';
  if (s.bst >= 400) return 'Rare';
  return 'Commun';
}

// Multiplicateur de production (GDD §4.2).
export function rarityMult(r: Rarity): number {
  return r === 'Légendaire' ? 5 : r === 'Ultra-Rare' ? 2.5 : r === 'Rare' ? 1.5 : 1;
}

const CATCH_BASE: Record<Rarity, number> = {
  Commun: 0.7, Rare: 0.45, 'Ultra-Rare': 0.25, 'Légendaire': 0.08,
};

export function catchChance(s: Species, ball: Ball): number {
  if (ball.guaranteed) return 1;
  return Math.min(0.98, CATCH_BASE[rarityOf(s)] * ball.catchMult);
}

// Poids de tirage : les communs sortent bien plus souvent que les légendaires.
const DRAW_WEIGHT: Record<Rarity, number> = {
  Commun: 60, Rare: 28, 'Ultra-Rare': 10, 'Légendaire': 2,
};

export const SHINY_CHANCE = 0.02;

export function drawEncounter(): { species: Species; shiny: boolean } {
  const total = KANTO.reduce((acc, s) => acc + DRAW_WEIGHT[rarityOf(s)], 0);
  let roll = Math.random() * total;
  let pick = KANTO[0];
  for (const s of KANTO) {
    roll -= DRAW_WEIGHT[rarityOf(s)];
    if (roll <= 0) { pick = s; break; }
  }
  return { species: pick, shiny: Math.random() < SHINY_CHANCE };
}
