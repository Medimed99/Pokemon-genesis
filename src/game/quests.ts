export type QuestTrack =
  | 'captures' | 'shinies' | 'rare_captures' | 'coins_earned'
  | 'flees' | 'streak' | 'pokebox' | 'expedition' | 'poker';

export interface QuestReward {
  coins?: number;
  xp?: number;
  items?: Record<string, number>;
  luxury_tokens?: number;
}

export interface QuestDef {
  id: string;
  name: string;
  desc: string;
  target: number;
  track: QuestTrack;
  icon: string;
  reward: QuestReward;
}

// Pools inspirés de la V1
export const QUEST_POOLS: Record<'easy' | 'medium' | 'hard', QuestDef[]> = {
  easy: [
    { id: 'q_cap5',   name: 'Stabilisation Réseau', desc: 'Capture 5 Pokémon', target: 5, track: 'captures', icon: 'poke-ball', reward: { coins: 300, xp: 80, items: { framby: 1 } } },
    { id: 'q_cap10',  name: 'Archivage Initial',    desc: 'Capture 10 Pokémon', target: 10, track: 'captures', icon: 'poke-ball', reward: { coins: 500, xp: 120, items: { pinap: 1 } } },
    { id: 'q_coins500', name: 'Collecte de Données', desc: 'Gagne 500 Coins en capture', target: 500, track: 'coins_earned', icon: 'relic-gold', reward: { coins: 300, xp: 80, items: { pokeball: 5 } } },
    { id: 'q_flee5',  name: 'Pertes Acceptables',   desc: 'Subis 5 fuites', target: 5, track: 'flees', icon: 'escape-rope', reward: { coins: 250, xp: 60, items: { ceriz: 1 } } },
  ],
  medium: [
    { id: 'q_cap20',  name: 'Compilation Massive',  desc: 'Capture 20 Pokémon', target: 20, track: 'captures', icon: 'great-ball', reward: { coins: 900, xp: 200, items: { superball: 3 } } },
    { id: 'q_shiny1', name: 'Anomalie Dorée',       desc: 'Capture 1 Shiny', target: 1, track: 'shinies', icon: 'star-piece', reward: { coins: 1200, xp: 300, items: { ceriz: 1 } } },
    { id: 'q_rare2',  name: 'Chasseur de Rareté',   desc: 'Capture 2 Rares ou mieux', target: 2, track: 'rare_captures', icon: 'comet-shard', reward: { coins: 800, xp: 180, items: { hyperball: 1 } } },
    { id: 'q_streak10', name: 'Série Ininterrompue', desc: 'Atteins une streak de 10', target: 10, track: 'streak', icon: 'flame-orb', reward: { coins: 1000, xp: 220, items: { pinap: 2 } } },
    { id: 'q_pokebox3', name: 'Décompression',      desc: 'Ouvre 3 PokéBox', target: 3, track: 'pokebox', icon: 'ultra-ball', reward: { coins: 700, xp: 150, items: { framby: 2 } } },
  ],
  hard: [
    { id: 'q_cap30',  name: 'Restauration Lourde',  desc: 'Capture 30 Pokémon', target: 30, track: 'captures', icon: 'great-ball', reward: { coins: 1800, xp: 350, items: { hyperball: 2 } } },
    { id: 'q_exped1', name: 'Explorateur',          desc: 'Termine 1 Expédition', target: 1, track: 'expedition', icon: 'town-map', reward: { coins: 1500, xp: 300, luxury_tokens: 2 } } ,
    { id: 'q_coins5k', name: 'Magnat des Données',  desc: 'Gagne 5000 Coins', target: 5000, track: 'coins_earned', icon: 'relic-gold', reward: { coins: 2000, xp: 400, items: { superball: 5 } } },
    { id: 'q_streak25', name: 'Combo Légendaire',   desc: 'Atteins une streak de 25', target: 25, track: 'streak', icon: 'flame-orb', reward: { coins: 2500, xp: 500, items: { exp_charm: 1 } } },
    { id: 'q_poker1', name: 'Décrypteur',           desc: 'Gagne 1 partie de Poké-Poker', target: 1, track: 'poker', icon: 'up-grade', reward: { coins: 1500, xp: 300, luxury_tokens: 2 } },
  ],
};

export interface ActiveQuest extends QuestDef {
  progress: number;
  claimed: boolean;
}

// Tire 3 quêtes (1 easy, 1 medium, 1 hard) — déterministe par jour.
export function rollDailyQuests(seed: number): ActiveQuest[] {
  const pick = (pool: QuestDef[], offset: number): QuestDef => pool[(seed + offset) % pool.length];
  return [
    { ...pick(QUEST_POOLS.easy, 0),   progress: 0, claimed: false },
    { ...pick(QUEST_POOLS.medium, 1), progress: 0, claimed: false },
    { ...pick(QUEST_POOLS.hard, 2),   progress: 0, claimed: false },
  ];
}

export function daySeed(): number {
  return Math.floor(Date.now() / (24 * 3600 * 1000));
}
