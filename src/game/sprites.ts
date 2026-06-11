// Helpers centralisés pour tous les sprites — 100% PokeAPI.
const POKE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';
const ITEM = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items';

export function pokemonSprite(id: number, shiny = false): string {
  return shiny ? `${POKE}/shiny/${id}.png` : `${POKE}/${id}.png`;
}

// Sprite animé (Gen V) si dispo — sinon statique.
export function pokemonSpriteAnimated(id: number, shiny = false): string {
  const base = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated';
  return shiny ? `${base}/shiny/${id}.gif` : `${base}/${id}.gif`;
}

export function itemSprite(name: string): string {
  return `${ITEM}/${name}.png`;
}

// ── Mapping de nos ids internes → noms de sprites PokeAPI ───────────────────
export const BALL_SPRITES: Record<string, string> = {
  pokeball: 'poke-ball',
  superball: 'great-ball',
  hyperball: 'ultra-ball',
  masterball: 'master-ball',
};

export const ITEM_SPRITES: Record<string, string> = {
  // Baies
  framby: 'razz-berry',
  pinap: 'pinap-berry',
  ceriz: 'nanab-berry',
  // Held items run
  belt_combat: 'black-belt',
  mystic_water: 'mystic-water',
  miracle_seed: 'miracle-seed',
  charcoal: 'charcoal',
  magnet: 'magnet',
  quick_claw: 'quick-claw',
  kings_rock: 'kings-rock',
  choice_scarf: 'choice-scarf',
  rare_candy: 'rare-candy',
  lucky_egg: 'lucky-egg',
  leftovers: 'leftovers',
  coin_rune: 'amulet-coin',
  // Spéciaux
  incense: 'sea-incense',
  legendary_radar: 'poke-radar',
};

export function ballSprite(ballId: string): string {
  return itemSprite(BALL_SPRITES[ballId] ?? 'poke-ball');
}

// Nœud de carte → sprite d'item PokeAPI représentatif
export const NODE_ITEM_SPRITE: Record<string, string> = {
  capture: 'poke-ball',
  item: 'rare-candy',
  heal: 'potion',
  tm: 'tm-normal',
};

// ── Icônes UI (remplacent les émojis) — 100% PokeAPI ────────────────────────
export const UI_SPRITES = {
  coins:    itemSprite('relic-gold'),    // Coins (pièce dorée antique)
  eo:       itemSprite('comet-shard'),   // Énergie Onirique (fragment de comète)
  luxury:   itemSprite('coin-case'),     // Jetons de Luxe
  streak:   itemSprite('flame-orb'),     // Streak de capture
  quests:   itemSprite('town-map'),      // Quêtes
  xp:       itemSprite('exp-share'),     // XP
  badge:    itemSprite('star-piece'),    // Badges d'expédition
  pokedex:  itemSprite('poke-ball'),     // Pokédex
  shop:     itemSprite('nugget'),        // Boutique
  stones:   itemSprite('fire-stone'),    // Pierres d'évolution
  expedition: itemSprite('town-map'),    // Porte Expédition
  poker:    itemSprite('up-grade'),      // Porte Poké-Poker (objet Porygon — thème data)
  trophy:   itemSprite('star-piece'),    // Succès
  box:      itemSprite('poke-ball'),     // PokéBox
  hands:    itemSprite('tm-fighting'),   // Mains (poker)
  discards: itemSprite('tm-psychic'),    // Défausses (poker)
} as const;

// Catégories de cartes Poké-Poker → sprite représentatif
export const POKER_CARD_SPRITES: Record<string, string> = {
  joker:    itemSprite('dubious-disc'),
  arcana:   itemSprite('spell-tag'),
  planet:   itemSprite('comet-shard'),
  spectral: itemSprite('reaper-cloth'),
};
