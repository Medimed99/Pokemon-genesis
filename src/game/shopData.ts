export type ShopCurrency = 'coins' | 'eo' | 'luxury_tokens';
export type ShopCategory = 'balls' | 'berries' | 'special';

export interface ShopItem {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: ShopCategory;
  price: number;
  currency: ShopCurrency;
  qty: number; // quantity received per purchase
}

export const SHOP_ITEMS: ShopItem[] = [
  // ── Balls ─────────────────────────────────────────────────────────────────
  {
    id: 'pokeball_5',
    name: 'Poké Ball ×5',
    icon: '⚪',
    description: 'Conteneur v1.0. Algorithme de compression standard.',
    category: 'balls', price: 150, currency: 'coins', qty: 5,
  },
  {
    id: 'superball_3',
    name: 'Super Ball ×3',
    icon: '🔵',
    description: 'Conteneur v2.0. Taux de capture amélioré. Idéal pour les Rares.',
    category: 'balls', price: 400, currency: 'coins', qty: 3,
  },
  {
    id: 'hyperball_1',
    name: 'Hyper Ball ×1',
    icon: '🟡',
    description: 'Qualité militaire. Cryptage renforcé pour les données volatiles.',
    category: 'balls', price: 600, currency: 'coins', qty: 1,
  },
  {
    id: 'masterball_1',
    name: 'Master Ball ×1',
    icon: '🟣',
    description: 'Accès Root. Contourne tous les pare-feux. Capture garantie.',
    category: 'balls', price: 5000, currency: 'coins', qty: 1,
  },

  // ── Berries ───────────────────────────────────────────────────────────────
  {
    id: 'framby_3',
    name: 'Baie Framby ×3',
    icon: '🍓',
    description: 'Leurre. Surcharge le cache du Pokémon — réduit son envie de fuir.',
    category: 'berries', price: 200, currency: 'coins', qty: 3,
  },
  {
    id: 'pinap_3',
    name: 'Baie Pinap ×3',
    icon: '🍍',
    description: 'Duplicateur. Exploite un bug pour doubler l\'EO récupérée.',
    category: 'berries', price: 300, currency: 'coins', qty: 3,
  },
  {
    id: 'ceriz_3',
    name: 'Baie Ceriz ×3',
    icon: '🍒',
    description: 'Ancre de stabilité. Empêche la déconnexion d\'urgence (Fuite garantie bloquée).',
    category: 'berries', price: 350, currency: 'coins', qty: 3,
  },

  // ── Spéciaux ──────────────────────────────────────────────────────────────
  {
    id: 'incense_1',
    name: 'Encens ×1',
    icon: '🕯️',
    description: 'Balise de signal. Attire des Pokémon Rares pendant 30 minutes.',
    category: 'special', price: 800, currency: 'coins', qty: 1,
  },
  {
    id: 'shiny_charm_1',
    name: 'Charm Shiny (24h)',
    icon: '✨',
    description: 'Augmente le taux de Shiny à 5% pour 24 heures.',
    category: 'special', price: 1200, currency: 'coins', qty: 1,
  },
  {
    id: 'legendary_radar_1',
    name: 'Radar Légendaire ×1',
    icon: '📡',
    description: 'Accès VIP. Permet d\'invoquer un Légendaire via la PokéBox (1 usage).',
    category: 'special', price: 5, currency: 'luxury_tokens', qty: 1,
  },
  {
    id: 'pokebox_reset',
    name: 'Recharge PokéBox',
    icon: '🔄',
    description: 'Recharge immédiatement tes 5 ouvertures quotidiennes de PokéBox.',
    category: 'special', price: 3, currency: 'luxury_tokens', qty: 1,
  },
  {
    id: 'coin_charm_1',
    name: 'Charm Pièce (1h)',
    icon: '🪙',
    description: 'Tes captures rapportent +50% de Coins pendant 1 heure.',
    category: 'special', price: 2, currency: 'luxury_tokens', qty: 1,
  },
  {
    id: 'exp_charm_1',
    name: 'Charm EXP (1h)',
    icon: '🥚',
    description: 'Tes ouvriers produisent 2× plus d\'EO pendant 1 heure.',
    category: 'special', price: 2, currency: 'luxury_tokens', qty: 1,
  },
];
