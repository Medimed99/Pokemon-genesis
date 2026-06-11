// ── Système de succès & déblocables cosmétiques ─────────────────────────────
// Chaque succès peut débloquer : un TITRE, un CADRE d'avatar, un FOND de profil,
// ou un EFFET de barre d'XP. Certains sont cachés (hidden) — révélés au déblocage.

export type RewardKind = 'title' | 'frame' | 'background' | 'xpfx';

export interface CosmeticReward {
  kind: RewardKind;
  id: string;
  name: string;
}

export type AchievementStat =
  | 'captures' | 'shinies' | 'legendaries' | 'flees_streak' | 'best_streak'
  | 'pokedex' | 'shiny_dex' | 'expeditions' | 'poker_wins' | 'pokebox_opened'
  | 'regions_unlocked' | 'level' | 'coins_total';

export interface Achievement {
  id: string;
  name: string;
  desc: string;
  icon: string;
  stat: AchievementStat;
  target: number;
  hidden: boolean;
  reward: CosmeticReward;
}

export const ACHIEVEMENTS: Achievement[] = [
  // ── Visibles ───────────────────────────────────────────────────────────────
  { id: 'first_steps', name: 'Premiers Pas', desc: 'Capture ton premier Pokémon', icon: 'poke-ball', stat: 'captures', target: 1, hidden: false,
    reward: { kind: 'title', id: 't_novice', name: 'Novice' } },
  { id: 'collector_50', name: 'Collectionneur', desc: 'Capture 50 Pokémon', icon: 'great-ball', stat: 'captures', target: 50, hidden: false,
    reward: { kind: 'title', id: 't_collector', name: 'Collectionneur' } },
  { id: 'collector_200', name: 'Archiviste Confirmé', desc: 'Capture 200 Pokémon', icon: 'ultra-ball', stat: 'captures', target: 200, hidden: false,
    reward: { kind: 'frame', id: 'f_silver', name: 'Cadre Argent' } },
  { id: 'kanto_done', name: 'Maître de Kanto', desc: 'Complète le Pokédex Kanto (151)', icon: 'star-piece', stat: 'pokedex', target: 151, hidden: false,
    reward: { kind: 'title', id: 't_kanto_master', name: 'Maître de Kanto' } },
  { id: 'shiny_first', name: 'Anomalie Dorée', desc: 'Capture ton premier Shiny', icon: 'shiny-stone', stat: 'shinies', target: 1, hidden: false,
    reward: { kind: 'background', id: 'bg_shiny', name: 'Fond Doré' } },
  { id: 'shiny_10', name: 'Chasseur de Shiny', desc: 'Capture 10 Shiny', icon: 'dawn-stone', stat: 'shinies', target: 10, hidden: false,
    reward: { kind: 'xpfx', id: 'fx_shimmer', name: 'Barre Scintillante' } },
  { id: 'streak_25', name: 'Sur une Lancée', desc: 'Atteins une streak de 25', icon: 'flame-orb', stat: 'best_streak', target: 25, hidden: false,
    reward: { kind: 'frame', id: 'f_flame', name: 'Cadre Flamme' } },
  { id: 'expedition_10', name: 'Explorateur Aguerri', desc: 'Termine 10 Expéditions', icon: 'town-map', stat: 'expeditions', target: 10, hidden: false,
    reward: { kind: 'xpfx', id: 'fx_glow', name: 'Barre Brillante' } },
  { id: 'poker_5', name: 'Beau Joueur', desc: 'Gagne 5 parties de Poké-Poker', icon: 'up-grade', stat: 'poker_wins', target: 5, hidden: false,
    reward: { kind: 'background', id: 'bg_casino', name: 'Fond Casino' } },
  { id: 'level_25', name: 'Vétéran', desc: 'Atteins le niveau 25', icon: 'exp-share', stat: 'level', target: 25, hidden: false,
    reward: { kind: 'frame', id: 'f_gold', name: 'Cadre Or' } },
  { id: 'legendary_3', name: 'Touché par les Étoiles', desc: 'Capture 3 Légendaires', icon: 'comet-shard', stat: 'legendaries', target: 3, hidden: false,
    reward: { kind: 'title', id: 't_star', name: 'Élu des Étoiles' } },

  // ── Cachés ───────────────────────────────────────────────────────────────
  { id: 'unlucky', name: 'Gros Poissard', desc: '5 Pokémon t\'ont fui d\'affilée', icon: 'rare-bone', stat: 'flees_streak', target: 5, hidden: true,
    reward: { kind: 'title', id: 't_unlucky', name: 'Gros Poissard' } },
  { id: 'shiny_dex_50', name: 'Perfectionniste', desc: 'Obtiens 50 Shiny différents', icon: 'big-pearl', stat: 'shiny_dex', target: 50, hidden: true,
    reward: { kind: 'background', id: 'bg_prism', name: 'Fond Prismatique' } },
  { id: 'whale', name: 'Baleine', desc: 'Cumule 1 000 000 de Coins', icon: 'big-nugget', stat: 'coins_total', target: 1_000_000, hidden: true,
    reward: { kind: 'title', id: 't_whale', name: 'Baleine' } },
  { id: 'three_regions', name: 'Tour du Monde', desc: 'Débloque les 3 régions', icon: 'town-map', stat: 'regions_unlocked', target: 3, hidden: true,
    reward: { kind: 'frame', id: 'f_world', name: 'Cadre Mondial' } },
  { id: 'pokebox_addict', name: 'Accro à la Box', desc: 'Ouvre 100 PokéBox', icon: 'master-ball', stat: 'pokebox_opened', target: 100, hidden: true,
    reward: { kind: 'xpfx', id: 'fx_rainbow', name: 'Barre Arc-en-ciel' } },
];

// ── Cosmétiques par défaut + déblocables ────────────────────────────────────
export const TITLES: Record<string, string> = {
  t_default: 'Archiviste',
  t_novice: 'Novice',
  t_collector: 'Collectionneur',
  t_kanto_master: 'Maître de Kanto',
  t_star: 'Élu des Étoiles',
  t_unlucky: 'Gros Poissard',
  t_whale: 'Baleine',
};

export const FRAMES: Record<string, { name: string; css: string }> = {
  f_default: { name: 'Aucun', css: 'frame-default' },
  f_silver:  { name: 'Argent', css: 'frame-silver' },
  f_gold:    { name: 'Or', css: 'frame-gold' },
  f_flame:   { name: 'Flamme', css: 'frame-flame' },
  f_world:   { name: 'Mondial', css: 'frame-world' },
};

export const BACKGROUNDS: Record<string, { name: string; css: string }> = {
  bg_default: { name: 'Standard', css: 'bg-default' },
  bg_shiny:   { name: 'Doré', css: 'bg-shiny' },
  bg_casino:  { name: 'Casino', css: 'bg-casino' },
  bg_prism:   { name: 'Prismatique', css: 'bg-prism' },
};

export const XP_EFFECTS: Record<string, { name: string; css: string }> = {
  fx_default: { name: 'Standard', css: 'xpfx-default' },
  fx_glow:    { name: 'Brillante', css: 'xpfx-glow' },
  fx_shimmer: { name: 'Scintillante', css: 'xpfx-shimmer' },
  fx_rainbow: { name: 'Arc-en-ciel', css: 'xpfx-rainbow' },
};
