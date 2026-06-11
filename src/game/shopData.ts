export type ShopCurrency = 'coins' | 'eo' | 'luxury_tokens';
export type ShopCategory = 'balls' | 'berries' | 'items' | 'lootboxes';

export interface ShopItem {
  id: string;
  name: string;
  itemSpriteName?: string;   // nom du sprite PokeAPI items/
  pokeId?: number;           // sprite Pokémon (pour pierres, visuels spéciaux)
  description: string;
  category: ShopCategory;
  price: number;
  currency: ShopCurrency;
  qty: number;
  badge?: string;            // "NOUVEAU", "RARE", etc.
}

export const SHOP_ITEMS: ShopItem[] = [
  // ── BALLS ─────────────────────────────────────────────────────────────────
  { id:'pokeball_10',   name:'Poké Ball ×10',   itemSpriteName:'poke-ball',   description:'Ball de base. Taux de capture standard.',                                   category:'balls',    price:500,   currency:'coins', qty:10 },
  { id:'superball_5',   name:'Super Ball ×5',   itemSpriteName:'great-ball',  description:'Ball améliorée ×1.5. Idéale pour les Rares.',                              category:'balls',    price:1000,  currency:'coins', qty:5  },
  { id:'hyperball_5',   name:'Hyper Ball ×5',   itemSpriteName:'ultra-ball',  description:'Ball puissante ×2.0. Quasi garantie sur les communs.',                     category:'balls',    price:2400,  currency:'coins', qty:5  },
  { id:'masterball_1',  name:'Master Ball ×1',  itemSpriteName:'master-ball', description:'Capture garantie à 100 %. Réservée aux légendaires.',                      category:'balls',    price:10000, currency:'coins', qty:1,  badge:'RARE' },
  { id:'scubaball_5',   name:'Scuba Ball ×5',   itemSpriteName:'dive-ball',   description:'Super Ball ×1.5 + bonus ×1.5 sur les Pokémon Eau.',                        category:'balls',    price:500,   currency:'coins', qty:5  },

  // ── BAIES ─────────────────────────────────────────────────────────────────
  { id:'framby_5',      name:'Baie Framby ×5',  itemSpriteName:'razz-berry',  description:'+50% chances de capture à chaque lancer.',                                 category:'berries',  price:1000,  currency:'coins', qty:5  },
  { id:'pinap_5',       name:'Baie Pinap ×5',   itemSpriteName:'pinap-berry', description:'×2 Coins si la capture réussit (ne modifie pas le taux).',                 category:'berries',  price:600,   currency:'coins', qty:5  },
  { id:'ceriz_3',       name:'Baie Ceriz ×3',   itemSpriteName:'nanab-berry', description:'Sur un Pokémon Shiny : taux de capture porté à 100 %.',                    category:'berries',  price:2000,  currency:'coins', qty:3,  badge:'RARE' },

  // ── OBJETS & BOOSTS ────────────────────────────────────────────────────────
  { id:'incense_1',     name:'Encens Mystique',  itemSpriteName:'sea-incense',  description:'+20% chances de rencontrer des Rares. Actif 10 min.',                    category:'items',    price:2000,  currency:'coins', qty:1  },
  { id:'bait_1',        name:'Appât Marin',      itemSpriteName:'lure-ball',    description:'×2 rencontres Pokémon Eau. Actif 10 min.',                               category:'items',    price:1200,  currency:'coins', qty:1  },
  { id:'exp_charm_1',   name:'Amulette Exp',     itemSpriteName:'exp-share',    description:'+25% XP sur toutes les captures. Actif 15 min.',                         category:'items',    price:1500,  currency:'coins', qty:1  },
  { id:'lucky_charm_1', name:'Talisman Chanceux',itemSpriteName:'lucky-egg',    description:'+0.5% chance Shiny. Actif 30 min.',                                      category:'items',    price:3500,  currency:'coins', qty:1  },
  { id:'charm_col_1',   name:'Charm Collection', itemSpriteName:'amulet-coin',  description:'+10% chance de rencontrer un Pokémon non capturé. Actif 20 min.',        category:'items',    price:4000,  currency:'coins', qty:1  },
  { id:'coin_charm_1',  name:'Charm Pièce (1h)', itemSpriteName:'amulet-coin',  description:'×1.5 Coins sur toutes les captures pendant 1 heure.',                   category:'items',    price:2,     currency:'luxury_tokens', qty:1 },
  // Pierres d'évolution
  { id:'fire_stone',    name:'Pierre Feu',       itemSpriteName:'fire-stone',   description:'Fait évoluer Goupix, Caninos, Évoli (Pyroli).',                          category:'items',    price:2500,  currency:'coins', qty:1  },
  { id:'water_stone',   name:'Pierre Eau',       itemSpriteName:'water-stone',  description:'Fait évoluer Évoli (Aquali), Stari (Staross).',                          category:'items',    price:2500,  currency:'coins', qty:1  },
  { id:'thunder_stone', name:'Pierre Foudre',    itemSpriteName:'thunder-stone',description:'Fait évoluer Pikachu (Raichu), Évoli (Voltali).',                        category:'items',    price:2500,  currency:'coins', qty:1  },
  { id:'moon_stone',    name:'Pierre Lune',      itemSpriteName:'moon-stone',   description:'Fait évoluer Mélofée (Mélodelfe), Osselait (Ossatueur).',               category:'items',    price:2500,  currency:'coins', qty:1  },
  { id:'leaf_stone',    name:'Pierre Plante',    itemSpriteName:'leaf-stone',   description:'Fait évoluer Bulbizarre (Herbizarre), Mystherbe (Ortide).',              category:'items',    price:2500,  currency:'coins', qty:1  },
  // Radar Légendaire
  { id:'legendary_radar_1', name:'Radar Légendaire', itemSpriteName:'poke-radar', description:'Permet d\'invoquer un Légendaire via la PokéBox (1 usage).',           category:'items',    price:5,     currency:'luxury_tokens', qty:1, badge:'RARE' },
  { id:'pokebox_reset', name:'Recharge PokéBox', itemSpriteName:'full-restore',description:'Recharge immédiatement tes 5 ouvertures quotidiennes.',                   category:'items',    price:3,     currency:'luxury_tokens', qty:1 },

  // ── LOOTBOXES ─────────────────────────────────────────────────────────────
  { id:'lootbox',       name:'Lootbox',          itemSpriteName:'poke-ball',    description:'2–4 objets aléatoires. 100–500 Coins garantis. Jackpots possibles.',     category:'lootboxes',price:800,   currency:'coins', qty:1  },
  { id:'rarebox',       name:'Rare Box',         itemSpriteName:'great-ball',   description:'3–5 objets + 1 Shard commun. 500–2 000 Coins. Pierres (5 %).',           category:'lootboxes',price:3000,  currency:'coins', qty:1,  badge:'RARE'  },
  { id:'superrarebox',  name:'Super Rare Box',   itemSpriteName:'ultra-ball',   description:'4–6 objets + 1 Shard rare + 2 Shiny Tokens. Master Ball (2 %).',         category:'lootboxes',price:8000,  currency:'coins', qty:1,  badge:'EPIC'  },
  { id:'masterbox',     name:'Masterbox',        itemSpriteName:'master-ball',  description:'5–8 objets + Shard légendaire + 5 Shiny Tokens. Radar 50 %.',            category:'lootboxes',price:20000, currency:'coins', qty:1,  badge:'LÉGENDAIRE' },
];
