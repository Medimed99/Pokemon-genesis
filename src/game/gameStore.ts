import { create } from 'zustand';
import { EconomyStore } from '../engine/economyStore.ts';
import { ModuleRegistry } from '../engine/module.ts';
import type { ResourceId } from '../engine/resources.ts';
import { ALL_MODULES } from './modules.ts';
import { KANTO, type Species } from './kanto.ts';
import { INTRO, type Phase } from './narrative.ts';
import { BALLS, drawEncounter, catchChance, rarityOf, rarityMult } from './capture.ts';
import type { GameSave } from './save/SaveAdapter.ts';

// Singletons découplés de React : le moteur vit ici, l'UI ne fait que le refléter.
export const economy = new EconomyStore();
const registry = new ModuleRegistry({ economy });
ALL_MODULES.forEach((m) => registry.register(m));
economy.grant({ bandwidth: 3 }); // Bande passante initiale pour une nouvelle partie.

const DAY_MS = 20 * 3600 * 1000;
const BALL_COST_EO = 50;
const speciesById = (id: number): Species => KANTO.find((s) => s.id === id) ?? KANTO[0];

export interface Worker {
  species: Species;
  level: number;
  shiny: boolean;
}

// PPS = (BST/10) × rareté × bonus de type × shiny × niveau  (GDD §4.2)
export function workerPps(w: Worker): number {
  const rarity = rarityMult(rarityOf(w.species));
  const typeMatch = w.species.types.includes('Plante') ? 1.2 : 1; // Forêt de Jade = Plante
  const shiny = w.shiny ? 10 : 1;
  return (w.species.bst / 10) * rarity * typeMatch * shiny * w.level;
}

interface GameState {
  balances: Record<ResourceId, number>;
  phase: Phase;
  introIndex: number;
  colorsReturned: boolean;
  workers: Worker[];
  clickPower: number;
  items: Record<string, number>;
  pokedex: number[];
  encounter: { species: Species; shiny: boolean } | null;
  lastResult: string | null;
  lastDaily: number;

  totalPps: () => number;
  ballCount: (ballId: string) => number;

  nextIntro: () => void;
  tapNoyau: () => void;
  tick: (seconds: number) => void;

  openBlindBox: () => void;
  throwBall: (ballId: string) => void;
  fleeEncounter: () => void;
  buyBall: () => void;
  claimDaily: () => void;

  hydrate: (save: GameSave) => void;
  toSave: () => GameSave;
}

export const useGame = create<GameState>((set, get) => ({
  balances: economy.snapshot(),
  phase: 'intro',
  introIndex: 0,
  colorsReturned: false,
  workers: [],
  clickPower: 1,
  items: { pokeball: 15 },
  pokedex: [],
  encounter: null,
  lastResult: null,
  lastDaily: 0,

  totalPps: () => get().workers.reduce((acc, w) => acc + workerPps(w), 0),
  ballCount: (ballId) => (ballId === 'masterball' ? economy.getBalance('master_balls') : get().items[ballId] ?? 0),

  nextIntro: () => {
    const { introIndex } = get();
    if (introIndex < INTRO.length - 1) set({ introIndex: introIndex + 1 });
    else set({ phase: 'tap' });
  },

  tapNoyau: () => {
    economy.grant({ eo: get().clickPower });
    if (get().phase === 'tap' && economy.getBalance('eo') >= 10) set({ phase: 'worker' });
  },

  tick: (seconds) => {
    economy.tick(seconds);
    const gain = get().totalPps() * seconds;
    if (gain > 0) economy.grant({ eo: gain });
  },

  openBlindBox: () => {
    if (get().encounter) return;
    set({ encounter: drawEncounter(), lastResult: null });
  },

  throwBall: (ballId) => {
    const enc = get().encounter;
    const ball = BALLS[ballId];
    if (!enc || !ball) return;
    if (get().ballCount(ballId) < 1) { set({ lastResult: `Plus de ${ball.label}.` }); return; }

    // Consomme la ball.
    if (ballId === 'masterball') economy.spend({ master_balls: 1 });
    else set((s) => ({ items: { ...s.items, [ballId]: (s.items[ballId] ?? 0) - 1 } }));

    const success = Math.random() < catchChance(enc.species, ball);
    if (success) {
      const id = enc.species.id;
      if (get().pokedex.includes(id)) {
        // Doublon → fusion (montée de niveau).
        set((s) => ({
          workers: s.workers.map((w) =>
            w.species.id === id ? { ...w, level: w.level + 1, shiny: w.shiny || enc.shiny } : w),
          lastResult: `${enc.species.name} fusionné (niveau +1).`,
        }));
      } else {
        set((s) => ({
          workers: [...s.workers, { species: enc.species, level: 1, shiny: enc.shiny }],
          pokedex: [...s.pokedex, id],
          lastResult: `${enc.species.name}${enc.shiny ? ' ✦ SHINY' : ''} capturé !`,
        }));
      }
      if (!get().colorsReturned) set({ colorsReturned: true, phase: 'free' });
    } else {
      set({ lastResult: `${enc.species.name} s'est enfui…` });
    }
    set({ encounter: null });
  },

  fleeEncounter: () => set({ encounter: null }),

  buyBall: () => {
    if (economy.spend({ eo: BALL_COST_EO })) {
      set((s) => ({ items: { ...s.items, pokeball: (s.items.pokeball ?? 0) + 1 }, lastResult: '+1 Poké Ball.' }));
    } else {
      set({ lastResult: 'EO insuffisante.' });
    }
  },

  claimDaily: () => {
    if (Date.now() - get().lastDaily >= DAY_MS) {
      set((s) => ({ items: { ...s.items, pokeball: (s.items.pokeball ?? 0) + 10 }, lastDaily: Date.now(), lastResult: '+10 Poké Balls (récolte quotidienne).' }));
    } else {
      set({ lastResult: 'Récolte quotidienne déjà prise.' });
    }
  },

  hydrate: (save) => {
    economy.load(save.economy);
    const workers: Worker[] = save.workers.map((w) => ({
      species: speciesById(w.speciesId), level: w.level, shiny: w.shiny,
    }));
    set({
      workers,
      phase: (save.phase as Phase) ?? 'intro',
      colorsReturned: save.colorsReturned,
      items: save.items ?? { pokeball: 0 },
      pokedex: save.pokedex ?? workers.map((w) => w.species.id),
      lastDaily: save.lastDaily ?? 0,
    });
  },

  toSave: () => ({
    economy: economy.serialize(),
    workers: get().workers.map((w) => ({ speciesId: w.species.id, level: w.level, shiny: w.shiny })),
    phase: get().phase,
    colorsReturned: get().colorsReturned,
    items: get().items,
    pokedex: get().pokedex,
    lastDaily: get().lastDaily,
  }),
}));

// Refléter chaque changement de l'économie dans le store React.
economy.subscribe((balances) => useGame.setState({ balances: { ...balances } }));
