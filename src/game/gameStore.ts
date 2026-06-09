import { create } from 'zustand';
import { EconomyStore } from '../engine/economyStore.ts';
import { ModuleRegistry } from '../engine/module.ts';
import type { ResourceId } from '../engine/resources.ts';
import { ALL_MODULES } from './modules.ts';
import { KANTO, type Species } from './kanto.ts';
import { type Phase } from './narrative.ts';
import { drawEncounter, catchChance, BALLS, rarityOf, rarityMult } from './capture.ts';
import { SHOP_ITEMS } from './shopData.ts';
import type { GameSave } from './save/SaveAdapter.ts';

export const economy = new EconomyStore();
const registry = new ModuleRegistry({ economy });
ALL_MODULES.forEach((m) => registry.register(m));
economy.grant({ bandwidth: 3 });

const DAY_MS = 24 * 3600 * 1000;
const POKEBOX_MAX = 5;

const speciesById = (id: number): Species => KANTO.find((s) => s.id === id) ?? KANTO[0];

export interface Worker {
  species: Species;
  level: number;
  shiny: boolean;
}

export function workerPps(w: Worker): number {
  const rarity = rarityMult(rarityOf(w.species));
  const typeMatch = w.species.types.includes('Plante') ? 1.2 : 1;
  const shiny = w.shiny ? 10 : 1;
  return (w.species.bst / 10) * rarity * typeMatch * shiny * w.level;
}

// ── Active effects (berries, charms) ────────────────────────────────────────
interface ActiveEffect {
  id: string;
  expiresAt: number; // 0 = doesn't expire
}

interface GameState {
  // Intro / player
  introCompleted: boolean;
  playerName: string;
  playerAvatar: string;
  // Game
  balances: Record<ResourceId, number>;
  phase: Phase;
  colorsReturned: boolean;
  workers: Worker[];
  clickPower: number;
  items: Record<string, number>;
  pokedex: number[];
  encounter: { species: Species; shiny: boolean } | null;
  lastResult: string | null;
  activeEffects: ActiveEffect[];
  // Actions
  completeIntro: (name: string, avatar: string) => void;
  tapNoyau: () => void;
  tick: (seconds: number) => void;
  // PokéBox (daily, guaranteed new)
  openPokeBox: () => void;
  // Capture (encounter)
  openBlindBox: () => void;
  throwBall: (ballId: string) => void;
  fleeEncounter: () => void;
  // Shop
  buyShopItem: (itemId: string) => void;
  // Daily
  claimDaily: () => void;
  // Utils
  totalPps: () => number;
  ballCount: (ballId: string) => number;
  // Save
  hydrate: (save: GameSave) => void;
  toSave: () => GameSave;
}

export const useGame = create<GameState>((set, get) => ({
  introCompleted: false,
  playerName: '',
  playerAvatar: 'dev',
  balances: economy.snapshot(),
  phase: 'tap',
  colorsReturned: false,
  workers: [],
  clickPower: 1,
  items: { pokeball: 20 },
  pokedex: [],
  encounter: null,
  lastResult: null,
  activeEffects: [],

  totalPps: () => get().workers.reduce((acc, w) => acc + workerPps(w), 0),
  ballCount: (ballId) => ballId === 'masterball' ? economy.getBalance('master_balls') : (get().items[ballId] ?? 0),

  completeIntro: (name, avatar) => {
    set({ introCompleted: true, playerName: name, playerAvatar: avatar, phase: 'tap' });
  },

  tapNoyau: () => {
    economy.grant({ eo: get().clickPower });
    if (get().phase === 'tap' && economy.getBalance('eo') >= 10) set({ phase: 'worker' });
  },

  tick: (seconds) => {
    economy.tick(seconds);
    // Check expired effects
    const now = Date.now();
    const effects = get().activeEffects.filter((e) => e.expiresAt === 0 || e.expiresAt > now);
    const expBoost = effects.some((e) => e.id === 'exp_charm');
    const gain = get().totalPps() * seconds * (expBoost ? 2 : 1);
    if (gain > 0) economy.grant({ eo: gain });
    if (effects.length !== get().activeEffects.length) set({ activeEffects: effects });
  },

  // ── PokéBox (daily, guaranteed new non-legendary) ───────────────────────
  openPokeBox: () => {
    const { items, pokedex, phase } = get();
    if (phase !== 'worker' && phase !== 'free') return;
    const now = Date.now();
    const used: number = (items.pokebox_used as number) ?? 0;
    const reset: number = (items.pokebox_reset as number) ?? 0;
    const isReset = now - reset >= DAY_MS;
    const effectiveUsed = isReset ? 0 : used;
    if (effectiveUsed >= POKEBOX_MAX) return;

    // Draw a Pokémon the player doesn't have yet (no legendaries)
    const owned = new Set(pokedex);
    const pool = KANTO.filter((s) => !s.legendary && !owned.has(s.id));
    if (pool.length === 0) { set({ lastResult: 'Pokédex Kanta complet (hors légendaires) !' }); return; }

    // Has legendary radar? Can draw legendary
    const radarCount: number = (items.legendary_radar as number) ?? 0;
    let species: Species;
    const shiny = (() => {
      const hasCharm = get().activeEffects.some((e) => e.id === 'shiny_charm');
      return Math.random() < (hasCharm ? 0.05 : 0.02);
    })();
    if (radarCount > 0 && Math.random() < 0.3) {
      const legPool = KANTO.filter((s) => s.legendary && !owned.has(s.id));
      species = legPool.length > 0 ? legPool[Math.floor(Math.random() * legPool.length)] : pool[Math.floor(Math.random() * pool.length)];
      set((s) => ({ items: { ...s.items, legendary_radar: Math.max(0, radarCount - 1) } }));
    } else {
      species = pool[Math.floor(Math.random() * pool.length)];
    }

    // Auto-capture for PokéBox (guaranteed)
    const newPokedex = [...pokedex, species.id];
    const newWorkers = [...get().workers, { species, level: 1, shiny }];
    const newUsed = effectiveUsed + 1;
    const newPhase = newPokedex.length >= 3 ? 'free' : get().phase;
    const colorsReturned = newPokedex.length >= 3;

    set((s) => ({
      pokedex: newPokedex,
      workers: newWorkers,
      phase: newPhase,
      colorsReturned: colorsReturned || s.colorsReturned,
      lastResult: `${species.name}${shiny ? ' ✦ SHINY' : ''} archivé dans le Pokédex !`,
      encounter: { species, shiny },
      items: {
        ...s.items,
        pokebox_used: newUsed,
        pokebox_reset: isReset ? now : reset,
      },
    }));

    setTimeout(() => set({ encounter: null }), 2000);
  },

  // ── Capture (encounter-based, uses balls) ───────────────────────────────
  openBlindBox: () => {
    if (get().encounter) return;
    const { pokedex } = get();
    // First 3 captures: only common Pokémon for easy onboarding
    if (pokedex.length < 3) {
      const common = KANTO.filter((s) => !s.legendary && s.bst < 400);
      set({ encounter: { species: common[Math.floor(Math.random() * common.length)], shiny: false }, lastResult: null });
    } else {
      set({ encounter: drawEncounter(), lastResult: null });
    }
  },

  throwBall: (ballId) => {
    const { encounter, items, pokedex } = get();
    const ball = BALLS[ballId];
    if (!encounter || !ball) return;
    if (get().ballCount(ballId) < 1) { set({ lastResult: `Plus de ${ball.label}.` }); return; }

    // Consume ball
    if (ballId === 'masterball') economy.spend({ master_balls: 1 });
    else set((s) => ({ items: { ...s.items, [ballId]: (s.items[ballId] ?? 0) - 1 } }));

    // Ceriz Berry: prevent flee (always succeed if ceriz active)
    const ceriz = (items.ceriz as number ?? 0) > 0;
    const modBall = ceriz ? { ...ball, catchMult: ball.catchMult + 999 } : ball;
    if (ceriz) set((s) => ({ items: { ...s.items, ceriz: Math.max(0, (s.items.ceriz as number ?? 0) - 1) } }));

    const success = Math.random() < catchChance(encounter.species, modBall);
    // First 3 captures: always succeed
    const earlySuccess = pokedex.length < 3 || success;

    if (earlySuccess) {
      const id = encounter.species.id;
      const isDuplicate = pokedex.includes(id);

      // Pinap Berry: EO bonus on capture
      const pinap = (items.pinap as number ?? 0) > 0;
      if (pinap) {
        economy.grant({ eo: Math.floor(encounter.species.bst * 2) });
        set((s) => ({ items: { ...s.items, pinap: Math.max(0, (s.items.pinap as number ?? 0) - 1) } }));
      }

      if (isDuplicate) {
        set((s) => ({
          workers: s.workers.map((w) => w.species.id === id ? { ...w, level: w.level + 1 } : w),
          lastResult: `${encounter.species.name} fusionné (niveau +1) !`,
          encounter: null,
        }));
      } else {
        const newPokedex = [...pokedex, id];
        const colorsReturned = newPokedex.length >= 3;
        const newPhase: Phase = newPokedex.length >= 3 ? 'free' : get().phase;
        set((s) => ({
          workers: [...s.workers, { species: encounter.species, level: 1, shiny: encounter.shiny }],
          pokedex: newPokedex,
          phase: newPhase,
          colorsReturned: colorsReturned || s.colorsReturned,
          lastResult: `${encounter.species.name}${encounter.shiny ? ' ✦ SHINY' : ''} capturé !`,
          encounter: null,
        }));
      }
    } else {
      set({ lastResult: `${encounter.species.name} s'est enfui…`, encounter: null });
    }
  },

  fleeEncounter: () => set({ encounter: null }),

  // ── Shop ─────────────────────────────────────────────────────────────────
  buyShopItem: (itemId) => {
    const item = SHOP_ITEMS.find((i) => i.id === itemId);
    if (!item) return;
    const bal = item.currency === 'eo' ? economy.getBalance('eo') : economy.getBalance('luxury_tokens');
    if (bal < item.price) return;
    if (item.currency === 'eo') economy.spend({ eo: item.price });
    else economy.spend({ luxury_tokens: item.price });

    const s = get();
    // Handle special effects
    if (item.id === 'masterball_1') {
      economy.grant({ master_balls: 1 }); return;
    }
    if (item.id === 'pokebox_reset') {
      set((st) => ({ items: { ...st.items, pokebox_used: 0, pokebox_reset: 0 } })); return;
    }
    if (item.id === 'shiny_charm_1') {
      set((st) => ({ activeEffects: [...st.activeEffects, { id: 'shiny_charm', expiresAt: Date.now() + DAY_MS }] })); return;
    }
    if (item.id === 'exp_charm_1') {
      set((st) => ({ activeEffects: [...st.activeEffects, { id: 'exp_charm', expiresAt: Date.now() + 3600_000 }] })); return;
    }
    if (item.id === 'incense_1') {
      set((st) => ({ items: { ...st.items, incense: (st.items.incense ?? 0) + 1 } })); return;
    }
    if (item.id === 'legendary_radar_1') {
      set((st) => ({ items: { ...st.items, legendary_radar: (st.items.legendary_radar ?? 0) + 1 } })); return;
    }

    // Map item id to inventory key
    const keyMap: Record<string, string> = {
      pokeball_5: 'pokeball', superball_3: 'superball', hyperball_1: 'hyperball',
      framby_3: 'framby', pinap_3: 'pinap', ceriz_3: 'ceriz',
    };
    const key = keyMap[item.id];
    if (key) {
      set((st) => ({ items: { ...st.items, [key]: (st.items[key] ?? 0) + item.qty } }));
    }
    void s; // suppress unused
  },

  claimDaily: () => {
    const key = 'daily_reset';
    const lastReset: number = (get().items[key] as number) ?? 0;
    if (Date.now() - lastReset < DAY_MS) { set({ lastResult: 'Récolte déjà prise.' }); return; }
    set((s) => ({ items: { ...s.items, pokeball: (s.items.pokeball ?? 0) + 10, [key]: Date.now() }, lastResult: '+10 Poké Balls !' }));
  },

  hydrate: (save) => {
    economy.load(save.economy);
    const workers: Worker[] = (save.workers ?? []).map((w) => ({ species: speciesById(w.speciesId), level: w.level, shiny: w.shiny }));
    set({
      introCompleted: save.introCompleted ?? false,
      playerName: save.playerName ?? '',
      playerAvatar: save.playerAvatar ?? 'dev',
      workers, phase: (save.phase as Phase) ?? 'tap',
      colorsReturned: save.colorsReturned,
      items: save.items ?? { pokeball: 20 },
      pokedex: save.pokedex ?? [],
      activeEffects: save.activeEffects ?? [],
    });
  },

  toSave: () => ({
    economy: economy.serialize(),
    workers: get().workers.map((w) => ({ speciesId: w.species.id, level: w.level, shiny: w.shiny })),
    phase: get().phase,
    colorsReturned: get().colorsReturned,
    items: get().items,
    pokedex: get().pokedex,
    lastDaily: (get().items.daily_reset as number) ?? 0,
    introCompleted: get().introCompleted,
    playerName: get().playerName,
    playerAvatar: get().playerAvatar,
    activeEffects: get().activeEffects,
  }),
}));

economy.subscribe((balances) => useGame.setState({ balances: { ...balances } }));
