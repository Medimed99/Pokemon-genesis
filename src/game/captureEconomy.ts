import type { Species } from './kanto.ts';
import { rarityOf, type Rarity } from './capture.ts';

// ── Coins par capture (équilibré) ───────────────────────────────────────────
const COIN_BY_RARITY: Record<Rarity, number> = {
  'Commun': 15,
  'Rare': 50,
  'Ultra-Rare': 150,
  'Légendaire': 500,
};

export function captureCoins(species: Species, shiny: boolean, coinMult: number): number {
  const base = COIN_BY_RARITY[rarityOf(species)];
  const shinyBonus = shiny ? 3 : 1;
  return Math.floor(base * shinyBonus * coinMult);
}

// ── XP par capture ───────────────────────────────────────────────────────────
const XP_BY_RARITY: Record<Rarity, number> = {
  'Commun': 10,
  'Rare': 30,
  'Ultra-Rare': 80,
  'Légendaire': 200,
};

export function captureXp(species: Species, shiny: boolean): number {
  return XP_BY_RARITY[rarityOf(species)] * (shiny ? 2 : 1);
}

// Niveau Archiviste : courbe d'XP cumulée.
export function xpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.5));
}

export function levelFromXp(totalXp: number): { level: number; current: number; needed: number } {
  let level = 1;
  let remaining = totalXp;
  while (remaining >= xpForLevel(level)) {
    remaining -= xpForLevel(level);
    level += 1;
  }
  return { level, current: remaining, needed: xpForLevel(level) };
}

// ── Streak → bonus shiny ─────────────────────────────────────────────────────
// +0.5% par palier de 10 (🔥). Cassée si un Pokémon fuit.
export function streakShinyBonus(streak: number): number {
  return Math.floor(streak / 10) * 0.005;
}

export const BASE_SHINY_CHANCE = 0.02;

// Calcule la chance de shiny finale (base + charm + streak).
export function shinyChance(streak: number, hasCharm: boolean): number {
  const base = hasCharm ? 0.05 : BASE_SHINY_CHANCE;
  return Math.min(0.5, base + streakShinyBonus(streak));
}
