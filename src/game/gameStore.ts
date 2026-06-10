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
    if (fx.some((e) => e.id === 'rune_coin')) mult *= 2;     // Pièce Rune (Expédition)
    if (fx.some((e) => e.id === 'coin_charm')) mult *= 1.5;  // bonus temporaire boutique
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
    const expBoost = effects.some((e) => e.id === 'exp_charm');
    const gain = get().totalPps() * seconds * (expBoost ? 2 : 1);
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
        encounter: { species: target, shiny: true },
        items: { ...s.items, pokebox_used: effectiveUsed + 1, pokebox_reset: isReset ? now : reset },
      }));
      get().trackQuest('pokebox', 1);
      set((st) => ({ pokeboxOpened: st.pokeboxOpened + 1 }));
      get().checkAchievements();
      setTimeout(() => set({ encounter: null }), 2000);
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
    const xp = captureXp(species, shiny);
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
      encounter: { species, shiny },
      items: { ...s.items, pokebox_used: effectiveUsed + 1, pokebox_reset: isReset ? now : reset },
    }));
    // Quests
    get().trackQuest('pokebox', 1);
    get().trackQuest('captures', 1);
    get().trackQuest('coins_earned', coins);
    if (shiny) get().trackQuest('shinies', 1);
    if (isRarePlus(species)) get().trackQuest('rare_captures', 1);
    get().checkAchievements();
    setTimeout(() => set({ encounter: null }), 2000);
  },

  // ── Encounter ──────────────────────────────────────────────────────────────
  openBlindBox: () => {
    if (get().encounter) return;
    const { pokedex } = get();
    if (pokedex.length < 3) {
      const common = KANTO.filter((s) => !s.legendary && s.bst < 400);
      set({ encounter: { species: common[Math.floor(Math.random() * common.length)], shiny: false }, lastResult: null });
    } else {
      const pool = availablePool(pokedex);
      const species = pool[Math.floor(Math.random() * pool.length)];
      const charm = get().activeEffects.some((e) => e.id === 'shiny_charm');
      const shiny = Math.random() < shinyChance(get().streak, charm);
      set({ encounter: { species, shiny }, lastResult: null });
    }
  },

  throwBall: (ballId) => {
    const { encounter, items, pokedex } = get();
    const ball = BALLS[ballId];
    if (!encounter || !ball) return;
    if (get().ballCount(ballId) < 1) { set({ lastResult: `Plus de ${ball.label}.` }); return; }

    if (ballId === 'masterball') economy.spend({ master_balls: 1 });
    else set((s) => ({ items: { ...s.items, [ballId]: (s.items[ballId] ?? 0) - 1 } }));

    const ceriz = (items.ceriz as number ?? 0) > 0;
    const modBall = ceriz ? { ...ball, catchMult: ball.catchMult + 999 } : ball;
    if (ceriz) set((s) => ({ items: { ...s.items, ceriz: Math.max(0, (s.items.ceriz as number ?? 0) - 1) } }));

    const success = Math.random() < catchChance(encounter.species, modBall);
    const earlySuccess = pokedex.length < 3 || success;

    if (earlySuccess) {
      const id = encounter.species.id;
      const isDuplicate = pokedex.includes(id);

      // Pinap: bonus EO (kept from before)
      const pinap = (items.pinap as number ?? 0) > 0;
      if (pinap) {
        economy.grant({ eo: Math.floor(encounter.species.bst * 2) });
        set((s) => ({ items: { ...s.items, pinap: Math.max(0, (s.items.pinap as number ?? 0) - 1) } }));
      }

      // Coins + XP + streak
      const coins = captureCoins(encounter.species, encounter.shiny, get().coinMultiplier());
      const xp = captureXp(encounter.species, encounter.shiny);
      economy.grant({ coins });
      const newStreak = get().streak + 1;
      set((s) => ({ totalCoinsEarned: s.totalCoinsEarned + coins, fleeStreak: 0 }));

      if (isDuplicate) {
        set((s) => ({
          workers: s.workers.map((w) => w.species.id === id ? { ...w, level: w.level + 1, shiny: w.shiny || encounter.shiny } : w),
          shinyDex: encounter.shiny && !s.shinyDex.includes(id) ? [...s.shinyDex, id] : s.shinyDex,
          totalXp: s.totalXp + xp,
          streak: newStreak,
          bestStreak: Math.max(s.bestStreak, newStreak),
          lastResult: `${encounter.species.name}${encounter.shiny ? ' ✦ SHINY' : ''} fusionné ! +${coins} Coins  🔥${newStreak}`,
          encounter: null,
        }));
      } else {
        const newPokedex = [...pokedex, id];
        const colorsReturned = newPokedex.length >= 3;
        const newPhase: Phase = newPokedex.length >= 3 ? 'free' : get().phase;
        set((s) => ({
          workers: [...s.workers, { species: encounter.species, level: 1, shiny: encounter.shiny }],
          pokedex: newPokedex,
          shinyDex: encounter.shiny ? [...s.shinyDex, id] : s.shinyDex,
          totalXp: s.totalXp + xp,
          streak: newStreak,
          bestStreak: Math.max(s.bestStreak, newStreak),
          phase: newPhase,
          colorsReturned: colorsReturned || s.colorsReturned,
          lastResult: `${encounter.species.name}${encounter.shiny ? ' ✦ SHINY' : ''} capturé ! +${coins} Coins  🔥${newStreak}`,
          encounter: null,
        }));
      }
      // Quests
      get().trackQuest('captures', 1);
      get().trackQuest('coins_earned', coins);
      get().trackQuest('streak', get().streak, true);
      if (encounter.shiny) get().trackQuest('shinies', 1);
      if (isRarePlus(encounter.species)) get().trackQuest('rare_captures', 1);
      get().checkAchievements();
    } else {
      // Flee → streak reset
      const lostStreak = get().streak;
      set((s) => ({
        lastResult: `${encounter.species.name} s'est enfui…${lostStreak >= 10 ? ` Streak 🔥${lostStreak} perdue !` : ''}`,
        encounter: null,
        streak: 0,
        fleeStreak: s.fleeStreak + 1,
      }));
      get().trackQuest('flees', 1);
      get().checkAchievements();
    }
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

    if (item.id === 'masterball_1') { economy.grant({ master_balls: 1 }); return; }
    if (item.id === 'pokebox_reset') { set((st) => ({ items: { ...st.items, pokebox_used: 0, pokebox_reset: 0 } })); return; }
    if (item.id === 'shiny_charm_1') { set((st) => ({ activeEffects: [...st.activeEffects, { id: 'shiny_charm', expiresAt: Date.now() + DAY_MS }] })); return; }
    if (item.id === 'exp_charm_1') { set((st) => ({ activeEffects: [...st.activeEffects, { id: 'exp_charm', expiresAt: Date.now() + 3600_000 }] })); return; }
    if (item.id === 'coin_charm_1') { set((st) => ({ activeEffects: [...st.activeEffects, { id: 'coin_charm', expiresAt: Date.now() + 3600_000 }] })); return; }
    if (item.id === 'incense_1') { set((st) => ({ items: { ...st.items, incense: (st.items.incense ?? 0) + 1 } })); return; }
    if (item.id === 'legendary_radar_1') { set((st) => ({ items: { ...st.items, legendary_radar: (st.items.legendary_radar ?? 0) + 1 } })); return; }

    const keyMap: Record<string, string> = {
      pokeball_5: 'pokeball', superball_3: 'superball', hyperball_1: 'hyperball',
      framby_3: 'framby', pinap_3: 'pinap', ceriz_3: 'ceriz',
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
