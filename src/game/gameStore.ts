import { create } from 'zustand';
import { EconomyStore } from '../engine/economyStore.ts';
import { ModuleRegistry } from '../engine/module.ts';
import type { ResourceId } from '../engine/resources.ts';
import { ALL_MODULES } from './modules.ts';
import { KANTO, ALL_SPECIES, type Species } from './kanto.ts';
import { availablePool, activeRegion, unlockedRegions } from './progression.ts';
import { type Phase } from './narrative.ts';
import { catchChance, BALLS, rarityOf, rarityMult, type Rarity } from './capture.ts';
import { captureCoins, captureXp, levelFromXp, shinyChance } from './captureEconomy.ts';
import { rollDailyQuests, daySeed, type ActiveQuest, type QuestTrack } from './quests.ts';
import { ACHIEVEMENTS, type AchievementStat } from './achievements.ts';
import { SHOP_ITEMS } from './shopData.ts';
import { getStoneEvolution } from './stoneEvolutions.ts';
import type { GameSave } from './save/SaveAdapter.ts';

export const economy = new EconomyStore();
const registry = new ModuleRegistry({ economy });
ALL_MODULES.forEach((m) => registry.register(m));
economy.grant({ bandwidth: 3, coins: 200 });

const DAY_MS = 24 * 3600 * 1000;
const POKEBOX_MAX = 5;

const speciesById = (id: number): Species => ALL_SPECIES.find((s) => s.id === id) ?? ALL_SPECIES[0];
const isRarePlus = (s: Species): boolean => { const r = rarityOf(s); return r !== 'Commun'; };

export interface Worker { species: Species; level: number; shiny: boolean; }

export function workerPps(w: Worker): number {
  const rarity = rarityMult(rarityOf(w.species));
  const typeMatch = w.species.types.includes('Plante') ? 1.2 : 1;
  const shiny = w.shiny ? 10 : 1;
  return (w.species.bst / 10) * rarity * typeMatch * shiny * w.level;
}

interface ActiveEffect { id: string; expiresAt: number; }

interface GameState {
  introCompleted: boolean;
  playerName: string;
  playerAvatar: string;
  balances: Record<ResourceId, number>;
  phase: Phase;
  colorsReturned: boolean;
  workers: Worker[];
  clickPower: number;
  items: Record<string, number>;
  pokedex: number[];
  shinyDex: number[];
  encounter: { species: Species; shiny: boolean } | null;
  pokeboxReveal: { species: Species; shiny: boolean } | null;
  captureAnim: 'idle' | 'throwing' | 'shaking' | 'caught' | 'fled';
  lastResult: string | null;
  activeEffects: ActiveEffect[];
  // Streak / XP / Quests
  streak: number;
  bestStreak: number;
  fleeStreak: number;
  totalCoinsEarned: number;
  expeditionsDone: number;
  pokerWins: number;
  pokeboxOpened: number;
  totalXp: number;
  quests: ActiveQuest[];
  questDay: number;
  // Achievements & cosmetics
  unlockedAchievements: string[];
  newlyUnlocked: string[];
  equipped: { title: string; frame: string; background: string; xpfx: string };
  unlockedCosmetics: string[];
  // Actions
  completeIntro: (name: string, avatar: string) => void;
  tapNoyau: () => void;
  tick: (seconds: number) => void;
  openPokeBox: () => void;
  openBlindBox: () => void;
  throwBall: (ballId: string) => void;
  fleeEncounter: () => void;
  buyShopItem: (itemId: string) => void;
  claimDaily: () => void;
  claimQuest: (questId: string) => void;
  useStone: (stoneId: string, workerIdx: number) => void;
  trackQuest: (track: QuestTrack, amount: number, absolute?: boolean) => void;
  checkAchievements: () => void;
  equipCosmetic: (kind: 'title'|'frame'|'background'|'xpfx', id: string) => void;
  dismissUnlock: (id: string) => void;
  trackExpedition: () => void;
  trackPokerWin: () => void;
  // Getters
  totalPps: () => number;
  currentRegion: () => string;
  coinMultiplier: () => number;
  ballCount: (ballId: string) => number;
  levelInfo: () => { level: number; current: number; needed: number };
  // Save
  hydrate: (save: GameSave) => void;
  toSave: () => GameSave;
}

function ensureQuests(state: { quests: ActiveQuest[]; questDay: number }): { quests: ActiveQuest[]; questDay: number } {
  const today = daySeed();
  if (state.questDay !== today || state.quests.length === 0) {
    return { quests: rollDailyQuests(today), questDay: today };
  }
  return state;
}


// ── Lootbox resolver ─────────────────────────────────────────────────────────
function openLootbox(
  tier: 'lootbox' | 'rarebox' | 'superrarebox' | 'masterbox',
  set: (partial: Record<string, unknown>) => void,
  get: () => { items: Record<string, number> },
): void {
  const rng = Math.random;
  const items: Record<string, number> = { ...get().items };
  let coinsBonus = 0;
  let ltBonus = 0;

  if (tier === 'lootbox') {
    items.pokeball  = (items.pokeball  ?? 0) + (rng() < 0.5 ? 3 : 0);
    items.superball = (items.superball ?? 0) + (rng() < 0.3 ? 1 : 0);
    items.framby    = (items.framby    ?? 0) + (rng() < 0.5 ? 2 : 0);
    items.pinap     = (items.pinap     ?? 0) + (rng() < 0.5 ? 2 : 0);
    coinsBonus = 100 + Math.floor(rng() * 400);
    if (rng() < 0.1)  { items.scubaball = (items.scubaball ?? 0) + 5; }
    if (rng() < 0.01) { coinsBonus += 5000; }
  } else if (tier === 'rarebox') {
    items.superball = (items.superball ?? 0) + 2;
    items.hyperball = (items.hyperball ?? 0) + (rng() < 0.5 ? 1 : 0);
    items.framby    = (items.framby    ?? 0) + 2;
    items.pinap     = (items.pinap     ?? 0) + 2;
    coinsBonus = 500 + Math.floor(rng() * 1500);
    ltBonus = 1;
    if (rng() < 0.05) { items.fire_stone = (items.fire_stone ?? 0) + 1; }
    if (rng() < 0.05) { ltBonus += 1; }
  } else if (tier === 'superrarebox') {
    items.hyperball = (items.hyperball ?? 0) + 2;
    items.scubaball = (items.scubaball ?? 0) + 2;
    items.ceriz     = (items.ceriz     ?? 0) + 1;
    coinsBonus = 2000 + Math.floor(rng() * 8000);
    ltBonus = 2;
    if (rng() < 0.02) { economy.grant({ master_balls: 1 }); }
    if (rng() < 0.05) { coinsBonus += 25000; }
  } else {
    items.hyperball  = (items.hyperball  ?? 0) + 3;
    items.ceriz      = (items.ceriz      ?? 0) + 2;
    coinsBonus = 2500 + Math.floor(rng() * 7500);
    ltBonus = 5;
    if (rng() < 0.5) { items.legendary_radar = (items.legendary_radar ?? 0) + 1; }
    if (rng() < 0.1) { economy.grant({ master_balls: 2 }); }
    if (rng() < 0.01) { coinsBonus += 50000; }
  }
  economy.grant({ coins: coinsBonus });
  if (ltBonus > 0) economy.grant({ luxury_tokens: ltBonus });
  set({ items, lastResult: `Lootbox ouverte ! +${coinsBonus.toLocaleString()} Coins${ltBonus ? ` +${ltBonus} JL` : ''}` } as Record<string, unknown>);
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
  shinyDex: [],
  encounter: null,
  pokeboxReveal: null,
  captureAnim: 'idle',
  lastResult: null,
  activeEffects: [],
  streak: 0,
  bestStreak: 0,
  fleeStreak: 0,
  totalCoinsEarned: 0,
  expeditionsDone: 0,
  pokerWins: 0,
  pokeboxOpened: 0,
  totalXp: 0,
  quests: rollDailyQuests(daySeed()),
  questDay: daySeed(),
  unlockedAchievements: [],
  newlyUnlocked: [],
  equipped: { title: 't_default', frame: 'f_default', background: 'bg_default', xpfx: 'fx_default' },
  unlockedCosmetics: ['t_default', 'f_default', 'bg_default', 'fx_default'],

  totalPps: () => get().workers.reduce((acc, w) => acc + workerPps(w), 0),
  currentRegion: () => activeRegion(get().pokedex),
  coinMultiplier: () => {
    let mult = 1;
    const fx = get().activeEffects;
    if (fx.some((e) => e.id === 'rune_coin'))  mult *= 2;    // Pièce Rune (Expédition) ×2
    if (fx.some((e) => e.id === 'coin_charm')) mult *= 1.5;  // Charm Pièce boutique ×1.5
    return mult;
  },
  ballCount: (ballId) => ballId === 'masterball' ? economy.getBalance('master_balls') : (get().items[ballId] ?? 0),
  levelInfo: () => levelFromXp(get().totalXp),

  completeIntro: (name, avatar) => set({ introCompleted: true, playerName: name, playerAvatar: avatar, phase: 'tap' }),

  tapNoyau: () => {
    economy.grant({ eo: get().clickPower });
    if (get().phase === 'tap' && economy.getBalance('eo') >= 10) set({ phase: 'worker' });
  },

  tick: (seconds) => {
    economy.tick(seconds);
    const now = Date.now();
    const effects = get().activeEffects.filter((e) => e.expiresAt === 0 || e.expiresAt > now);
    const gain = get().totalPps() * seconds;
    if (gain > 0) economy.grant({ eo: gain });
    if (effects.length !== get().activeEffects.length) set({ activeEffects: effects });
  },

  // ── Quest tracking ────────────────────────────────────────────────────────
  trackQuest: (track, amount, absolute = false) => {
    set((s) => {
      const fixed = ensureQuests(s);
      const quests = fixed.quests.map((q) => {
        if (q.track !== track || q.claimed) return q;
        const progress = absolute ? Math.max(q.progress, amount) : Math.min(q.target, q.progress + amount);
        return { ...q, progress };
      });
      return { quests, questDay: fixed.questDay };
    });
  },

  claimQuest: (questId) => {
    const quest = get().quests.find((q) => q.id === questId);
    if (!quest || quest.claimed || quest.progress < quest.target) return;
    const r = quest.reward;
    if (r.coins) economy.grant({ coins: r.coins });
    if (r.luxury_tokens) economy.grant({ luxury_tokens: r.luxury_tokens });
    if (r.xp) set((s) => ({ totalXp: s.totalXp + (r.xp ?? 0) }));
    if (r.items) {
      set((s) => {
        const items = { ...s.items };
        for (const [k, v] of Object.entries(r.items!)) items[k] = (items[k] ?? 0) + v;
        return { items };
      });
    }
    set((s) => ({
      quests: s.quests.map((q) => q.id === questId ? { ...q, claimed: true } : q),
      lastResult: `Quête « ${quest.name} » accomplie ! +${r.coins ?? 0} Coins`,
    }));
  },

  // ── PokéBox (daily, guaranteed new) ────────────────────────────────────────
  openPokeBox: () => {
    const { items, pokedex, phase } = get();
    if (phase !== 'worker' && phase !== 'free') return;
    const now = Date.now();
    const used: number = (items.pokebox_used as number) ?? 0;
    const reset: number = (items.pokebox_reset as number) ?? 0;
    const isReset = now - reset >= DAY_MS;
    const effectiveUsed = isReset ? 0 : used;
    if (effectiveUsed >= POKEBOX_MAX) return;

    const owned = new Set(pokedex);
    const regionPool = availablePool(pokedex);
    const pool = regionPool.filter((s) => !owned.has(s.id));
    const charm = get().activeEffects.some((e) => e.id === 'shiny_charm');

    if (pool.length === 0) {
      const shinyOwned = new Set(get().shinyDex);
      const shinyTargets = regionPool.filter((s) => !shinyOwned.has(s.id));
      if (shinyTargets.length === 0) { set({ lastResult: 'Région complétée — capturé + shiny à 100% !' }); return; }
      const target = shinyTargets[Math.floor(Math.random() * shinyTargets.length)];
      set((s) => ({
        shinyDex: [...s.shinyDex, target.id],
        lastResult: `${target.name} ✦ SHINY archivé !`,
        pokeboxReveal: { species: target, shiny: true },
        items: { ...s.items, pokebox_used: effectiveUsed + 1, pokebox_reset: isReset ? now : reset },
      }));
      get().trackQuest('pokebox', 1);
      set((st) => ({ pokeboxOpened: st.pokeboxOpened + 1 }));
      get().checkAchievements();
      setTimeout(() => set({ pokeboxReveal: null }), 2200);
      return;
    }

    const radarCount: number = (items.legendary_radar as number) ?? 0;
    const shiny = Math.random() < shinyChance(get().streak, charm);
    let species: Species;
    if (radarCount > 0 && Math.random() < 0.3) {
      const legPool = ALL_SPECIES.filter((s) => s.legendary && !owned.has(s.id));
      species = legPool.length > 0 ? legPool[Math.floor(Math.random() * legPool.length)] : pool[Math.floor(Math.random() * pool.length)];
      set((s) => ({ items: { ...s.items, legendary_radar: Math.max(0, radarCount - 1) } }));
    } else {
      species = pool[Math.floor(Math.random() * pool.length)];
    }

    const coins = captureCoins(species, shiny, get().coinMultiplier());
    const expBoost = get().activeEffects.some((e) => e.id === 'exp_charm');
    const xp = Math.floor(captureXp(species, shiny) * (expBoost ? 1.25 : 1));
    economy.grant({ coins });

    set((s) => ({ totalCoinsEarned: s.totalCoinsEarned + coins, pokeboxOpened: s.pokeboxOpened + 1, fleeStreak: 0 }));
    const newPokedex = [...pokedex, species.id];
    const newPhase = newPokedex.length >= 3 ? 'free' : get().phase;
    const colorsReturned = newPokedex.length >= 3;

    set((s) => ({
      pokedex: newPokedex,
      shinyDex: shiny ? [...s.shinyDex, species.id] : s.shinyDex,
      workers: [...s.workers, { species, level: 1, shiny }],
      totalXp: s.totalXp + xp,
      phase: newPhase,
      colorsReturned: colorsReturned || s.colorsReturned,
      lastResult: `${species.name}${shiny ? ' ✦ SHINY' : ''} archivé ! +${coins} Coins`,
      pokeboxReveal: { species, shiny },
      items: { ...s.items, pokebox_used: effectiveUsed + 1, pokebox_reset: isReset ? now : reset },
    }));
    // Quests
    get().trackQuest('pokebox', 1);
    get().trackQuest('captures', 1);
    get().trackQuest('coins_earned', coins);
    if (shiny) get().trackQuest('shinies', 1);
    if (isRarePlus(species)) get().trackQuest('rare_captures', 1);
    get().checkAchievements();
    setTimeout(() => set({ pokeboxReveal: null }), 2200);
  },

  // ── Encounter ──────────────────────────────────────────────────────────────
  openBlindBox: () => {
    if (get().encounter) return;
    const { pokedex } = get();
    const fx = get().activeEffects;
    const hasIncense  = fx.some((e) => e.id === 'incense');
    const hasWaterBait= fx.some((e) => e.id === 'water_bait');
    const hasColCharm = fx.some((e) => e.id === 'col_charm');

    if (pokedex.length < 3) {
      const common = KANTO.filter((s) => !s.legendary && s.bst < 400);
      set({ encounter: { species: common[Math.floor(Math.random() * common.length)], shiny: false }, lastResult: null });
    } else {
      let pool = availablePool(pokedex);
      // Incense : augmente la probabilité de tirer un Rare+
      if (hasIncense) {
        const rarePlus = pool.filter((s) => s.bst >= 400);
        if (rarePlus.length > 0) pool = [...pool, ...rarePlus, ...rarePlus]; // 3× plus de chance
      }
      // Water Bait : multiplie les Pokémon Eau dans le pool
      if (hasWaterBait) {
        const waterPoke = pool.filter((s) => s.types.includes('Eau'));
        if (waterPoke.length > 0) pool = [...pool, ...waterPoke, ...waterPoke];
      }
      // Col Charm : +10% chance de tirer un Pokémon non capturé (déjà garanti dans encounter, bonus mineur sur pool)
      if (hasColCharm) {
        const unseen = pool.filter((s) => !get().pokedex.includes(s.id));
        if (unseen.length > 0) pool = [...pool, ...unseen];
      }
      const species = pool[Math.floor(Math.random() * pool.length)];
      const charm = get().activeEffects.some((e) => e.id === 'shiny_charm');
      const shiny = Math.random() < shinyChance(get().streak, charm);
      set({ encounter: { species, shiny }, lastResult: null });
    }
  },

  throwBall: (ballId) => {
    const { encounter, items, pokedex, captureAnim } = get();
    const ball = BALLS[ballId];
    if (!encounter || !ball) return;
    if (captureAnim !== 'idle') return;
    if (get().ballCount(ballId) < 1) { set({ lastResult: `Plus de ${ball.label}.` }); return; }

    if (ballId === 'masterball') economy.spend({ master_balls: 1 });
    else set((s) => ({ items: { ...s.items, [ballId]: (s.items[ballId] ?? 0) - 1 } }));

    // Baie Framby : +50% catchMult (consommée)
    const framby = (items.framby as number ?? 0) > 0;
    if (framby) set((s) => ({ items: { ...s.items, framby: Math.max(0, (s.items.framby as number ?? 0) - 1) } }));

    // Baie Ceriz : 100% capture sur Shiny UNIQUEMENT (V1)
    const ceriz = (items.ceriz as number ?? 0) > 0 && encounter.shiny;
    if (ceriz) set((s) => ({ items: { ...s.items, ceriz: Math.max(0, (s.items.ceriz as number ?? 0) - 1) } }));

    const baseMult = ball.catchMult * (framby ? 1.5 : 1);
    const modBall = ceriz ? { ...ball, catchMult: baseMult + 999 } : { ...ball, catchMult: baseMult };

    const success = Math.random() < catchChance(encounter.species, modBall);
    const earlySuccess = pokedex.length < 3 || success;
    const target = encounter;

    // Animation séquencée : lancer → secousses → capturé/fui → résolution
    set({ captureAnim: 'throwing' });
    setTimeout(() => set({ captureAnim: 'shaking' }), 450);
    setTimeout(() => {
      set({ captureAnim: earlySuccess ? 'caught' : 'fled' });
      const id = target.species.id;
      const isDuplicate = get().pokedex.includes(id);

      if (earlySuccess) {
        const pinap = (get().items.pinap as number ?? 0) > 0;
        if (pinap) {
          economy.grant({ eo: Math.floor(target.species.bst * 2) });
          set((s) => ({ items: { ...s.items, pinap: Math.max(0, (s.items.pinap as number ?? 0) - 1) } }));
        }
        const coins = captureCoins(target.species, target.shiny, get().coinMultiplier());
        const expBoost2 = get().activeEffects.some((e) => e.id === 'exp_charm');
        const xp = Math.floor(captureXp(target.species, target.shiny) * (expBoost2 ? 1.25 : 1));
        economy.grant({ coins });
        const newStreak = get().streak + 1;
        set((s) => ({ totalCoinsEarned: s.totalCoinsEarned + coins, fleeStreak: 0 }));

        if (isDuplicate) {
          set((s) => ({
            workers: s.workers.map((w) => w.species.id === id ? { ...w, level: w.level + 1, shiny: w.shiny || target.shiny } : w),
            shinyDex: target.shiny && !s.shinyDex.includes(id) ? [...s.shinyDex, id] : s.shinyDex,
            totalXp: s.totalXp + xp, streak: newStreak, bestStreak: Math.max(s.bestStreak, newStreak),
<<<<<<< HEAD
            lastResult: `${target.species.name}${target.shiny ? ' ✦ SHINY' : ''} fusionné ! +${coins} Coins · Streak ${newStreak}`,
=======
            lastResult: `${target.species.name}${target.shiny ? ' ✦ SHINY' : ''} fusionné ! +${coins} Coins  🔥${newStreak}`,
>>>>>>> 144165047627239bd21da23e25f46140ab9d66d6
          }));
        } else {
          const newPokedex = [...get().pokedex, id];
          const colorsReturned = newPokedex.length >= 3;
          const newPhase: Phase = newPokedex.length >= 3 ? 'free' : get().phase;
          set((s) => ({
            workers: [...s.workers, { species: target.species, level: 1, shiny: target.shiny }],
            pokedex: newPokedex,
            shinyDex: target.shiny ? [...s.shinyDex, id] : s.shinyDex,
            totalXp: s.totalXp + xp, streak: newStreak, bestStreak: Math.max(s.bestStreak, newStreak),
            phase: newPhase, colorsReturned: colorsReturned || s.colorsReturned,
<<<<<<< HEAD
            lastResult: `${target.species.name}${target.shiny ? ' ✦ SHINY' : ''} capturé ! +${coins} Coins · Streak ${newStreak}`,
=======
            lastResult: `${target.species.name}${target.shiny ? ' ✦ SHINY' : ''} capturé ! +${coins} Coins  🔥${newStreak}`,
>>>>>>> 144165047627239bd21da23e25f46140ab9d66d6
          }));
        }
        get().trackQuest('captures', 1);
        get().trackQuest('coins_earned', coins);
        get().trackQuest('streak', get().streak, true);
        if (target.shiny) get().trackQuest('shinies', 1);
        if (isRarePlus(target.species)) get().trackQuest('rare_captures', 1);
        get().checkAchievements();
      } else {
        const lostStreak = get().streak;
        set((s) => ({
<<<<<<< HEAD
          lastResult: `${target.species.name} s'est enfui…${lostStreak >= 10 ? ` Streak ${lostStreak} perdue !` : ''}`,
=======
          lastResult: `${target.species.name} s'est enfui…${lostStreak >= 10 ? ` Streak 🔥${lostStreak} perdue !` : ''}`,
>>>>>>> 144165047627239bd21da23e25f46140ab9d66d6
          streak: 0, fleeStreak: s.fleeStreak + 1,
        }));
        get().trackQuest('flees', 1);
        get().checkAchievements();
      }
    }, 1500);
    setTimeout(() => set({ captureAnim: 'idle', encounter: null }), 2600);
  },

    fleeEncounter: () => set({ encounter: null }),

  // ── Shop ─────────────────────────────────────────────────────────────────
  buyShopItem: (itemId) => {
    const item = SHOP_ITEMS.find((i) => i.id === itemId);
    if (!item) return;
    const balMap: Record<string, number> = {
      coins: economy.getBalance('coins'),
      eo: economy.getBalance('eo'),
      luxury_tokens: economy.getBalance('luxury_tokens'),
    };
    if (balMap[item.currency] < item.price) return;
    economy.spend({ [item.currency]: item.price } as Record<ResourceId, number>);

    // Effets spéciaux
    const now = Date.now();
    switch (item.id) {
      case 'masterball_1': economy.grant({ master_balls: 1 }); return;
      case 'pokebox_reset': set((st) => ({ items: { ...st.items, pokebox_used: 0, pokebox_reset: 0 } })); return;
      case 'exp_charm_1':   set((st) => ({ activeEffects: [...st.activeEffects, { id: 'exp_charm',    expiresAt: now + 15 * 60_000 }] })); return;
      case 'lucky_charm_1': set((st) => ({ activeEffects: [...st.activeEffects, { id: 'shiny_charm',  expiresAt: now + 30 * 60_000 }] })); return;
      case 'coin_charm_1':  set((st) => ({ activeEffects: [...st.activeEffects, { id: 'coin_charm',   expiresAt: now + 60 * 60_000 }] })); return;
      case 'charm_col_1':   set((st) => ({ activeEffects: [...st.activeEffects, { id: 'col_charm',    expiresAt: now + 20 * 60_000 }] })); return;
      case 'incense_1':     set((st) => ({ activeEffects: [...st.activeEffects, { id: 'incense',      expiresAt: now + 10 * 60_000 }] })); return;
      case 'bait_1':        set((st) => ({ activeEffects: [...st.activeEffects, { id: 'water_bait',   expiresAt: now + 10 * 60_000 }] })); return;
      case 'legendary_radar_1': set((st) => ({ items: { ...st.items, legendary_radar: (st.items.legendary_radar ?? 0) + 1 } })); return;
      // Pierres d'évolution
      case 'fire_stone':    set((st) => ({ items: { ...st.items, fire_stone:    (st.items.fire_stone    ?? 0) + 1 } })); return;
      case 'water_stone':   set((st) => ({ items: { ...st.items, water_stone:   (st.items.water_stone   ?? 0) + 1 } })); return;
      case 'thunder_stone': set((st) => ({ items: { ...st.items, thunder_stone: (st.items.thunder_stone ?? 0) + 1 } })); return;
      case 'moon_stone':    set((st) => ({ items: { ...st.items, moon_stone:    (st.items.moon_stone    ?? 0) + 1 } })); return;
      case 'leaf_stone':    set((st) => ({ items: { ...st.items, leaf_stone:    (st.items.leaf_stone    ?? 0) + 1 } })); return;
      // Lootboxes → résolution immédiate
      case 'lootbox':      openLootbox('lootbox', set, get); return;
      case 'rarebox':      openLootbox('rarebox', set, get); return;
      case 'superrarebox': openLootbox('superrarebox', set, get); return;
      case 'masterbox':    openLootbox('masterbox', set, get); return;
    }
    // Balls et baies : mapping direct
    const keyMap: Record<string, string> = {
      pokeball_10: 'pokeball', superball_5: 'superball', hyperball_5: 'hyperball', scubaball_5: 'scubaball',
      framby_5: 'framby', pinap_5: 'pinap', ceriz_3: 'ceriz',
    };
    const key = keyMap[item.id];
    if (key) set((st) => ({ items: { ...st.items, [key]: (st.items[key] ?? 0) + item.qty } }));
  },

  claimDaily: () => {
    const key = 'daily_reset';
    const lastReset: number = (get().items[key] as number) ?? 0;
    if (Date.now() - lastReset < DAY_MS) { set({ lastResult: 'Récolte déjà prise.' }); return; }
    economy.grant({ coins: 300 });
    set((s) => ({ items: { ...s.items, pokeball: (s.items.pokeball ?? 0) + 10, [key]: Date.now() }, lastResult: '+10 Poké Balls +300 Coins !' }));
  },

  checkAchievements: () => {
    const s = get();
    const level = levelFromXp(s.totalXp).level;
    const regions = unlockedRegions(s.pokedex).length;
    const statValue: Record<AchievementStat, number> = {
      captures: s.workers.length,
      shinies: s.shinyDex.length,
      legendaries: s.pokedex.filter((id) => ALL_SPECIES.find((sp) => sp.id === id)?.legendary).length,
      flees_streak: s.fleeStreak,
      best_streak: s.bestStreak,
      pokedex: s.pokedex.length,
      shiny_dex: s.shinyDex.length,
      expeditions: s.expeditionsDone,
      poker_wins: s.pokerWins,
      pokebox_opened: s.pokeboxOpened,
      regions_unlocked: regions,
      level,
      coins_total: s.totalCoinsEarned,
    };
    const newly: string[] = [];
    const cosmetics: string[] = [];
    for (const a of ACHIEVEMENTS) {
      if (s.unlockedAchievements.includes(a.id)) continue;
      if (statValue[a.stat] >= a.target) {
        newly.push(a.id);
        cosmetics.push(a.reward.id);
      }
    }
    if (newly.length > 0) {
      set((st) => ({
        unlockedAchievements: [...st.unlockedAchievements, ...newly],
        newlyUnlocked: [...st.newlyUnlocked, ...newly],
        unlockedCosmetics: [...new Set([...st.unlockedCosmetics, ...cosmetics])],
      }));
    }
  },

  equipCosmetic: (kind, id) => {
    if (!get().unlockedCosmetics.includes(id)) return;
    set((s) => ({ equipped: { ...s.equipped, [kind]: id } }));
  },

  dismissUnlock: (id) => set((s) => ({ newlyUnlocked: s.newlyUnlocked.filter((x) => x !== id) })),

  trackExpedition: () => { set((s) => ({ expeditionsDone: s.expeditionsDone + 1 })); get().checkAchievements(); },
  trackPokerWin: () => { set((s) => ({ pokerWins: s.pokerWins + 1 })); get().checkAchievements(); },

  useStone: (stoneId, workerIdx) => {
    const { items, workers } = get();
    const stoneCount = (items[stoneId] as number ?? 0);
    if (stoneCount < 1) { set({ lastResult: 'Aucune pierre disponible.' }); return; }
    const worker = workers[workerIdx];
    if (!worker) return;
    const newId = getStoneEvolution(stoneId, worker.species.id);
    const newSpecies = newId ? ALL_SPECIES.find((s) => s.id === newId) : null;
    if (!newSpecies) { set({ lastResult: `${worker.species.name} ne peut pas évoluer avec cette pierre.` }); return; }
    set((s) => ({
      workers: s.workers.map((w, i) => i === workerIdx ? { ...w, species: newSpecies } : w),
      pokedex: s.pokedex.includes(newId!) ? s.pokedex : [...s.pokedex, newId!],
      items: { ...s.items, [stoneId]: stoneCount - 1 },
      lastResult: `${worker.species.name} → ${newSpecies.name} ! Évolution réussie !`,
    }));
  },

  hydrate: (save) => {
    economy.load(save.economy);
    const workers: Worker[] = (save.workers ?? []).map((w) => ({ species: speciesById(w.speciesId), level: w.level, shiny: w.shiny }));
    const qstate = ensureQuests({ quests: save.quests ?? [], questDay: save.questDay ?? 0 });
    set({
      introCompleted: save.introCompleted ?? false,
      playerName: save.playerName ?? '',
      playerAvatar: save.playerAvatar ?? 'dev',
      workers, phase: (save.phase as Phase) ?? 'tap',
      colorsReturned: save.colorsReturned,
      items: save.items ?? { pokeball: 20 },
      pokedex: save.pokedex ?? [],
      shinyDex: save.shinyDex ?? [],
      activeEffects: save.activeEffects ?? [],
      streak: save.streak ?? 0,
      bestStreak: save.bestStreak ?? 0,
      fleeStreak: save.fleeStreak ?? 0,
      totalCoinsEarned: save.totalCoinsEarned ?? 0,
      expeditionsDone: save.expeditionsDone ?? 0,
      pokerWins: save.pokerWins ?? 0,
      pokeboxOpened: save.pokeboxOpened ?? 0,
      totalXp: save.totalXp ?? 0,
      quests: qstate.quests,
      questDay: qstate.questDay,
      unlockedAchievements: save.unlockedAchievements ?? [],
      newlyUnlocked: [],
      equipped: save.equipped ?? { title: 't_default', frame: 'f_default', background: 'bg_default', xpfx: 'fx_default' },
      unlockedCosmetics: save.unlockedCosmetics ?? ['t_default', 'f_default', 'bg_default', 'fx_default'],
    });
  },

  toSave: () => ({
    economy: economy.serialize(),
    workers: get().workers.map((w) => ({ speciesId: w.species.id, level: w.level, shiny: w.shiny })),
    phase: get().phase,
    colorsReturned: get().colorsReturned,
    items: get().items,
    pokedex: get().pokedex,
    shinyDex: get().shinyDex,
    lastDaily: (get().items.daily_reset as number) ?? 0,
    introCompleted: get().introCompleted,
    playerName: get().playerName,
    playerAvatar: get().playerAvatar,
    activeEffects: get().activeEffects,
    streak: get().streak,
    bestStreak: get().bestStreak,
    fleeStreak: get().fleeStreak,
    totalCoinsEarned: get().totalCoinsEarned,
    expeditionsDone: get().expeditionsDone,
    pokerWins: get().pokerWins,
    pokeboxOpened: get().pokeboxOpened,
    totalXp: get().totalXp,
    quests: get().quests,
    questDay: get().questDay,
    unlockedAchievements: get().unlockedAchievements,
    equipped: get().equipped,
    unlockedCosmetics: get().unlockedCosmetics,
  }),
}));

economy.subscribe((balances) => useGame.setState({ balances: { ...balances } }));

// Used by capture.ts compat (Rarity type re-export)
export type { Rarity };
