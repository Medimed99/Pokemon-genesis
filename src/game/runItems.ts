export type ItemEffect =
  | { kind: 'type_dmg'; typeName: string; mult: number }     // +50% dmg of type
  | { kind: 'speed_boost'; chance: number }                  // Vive Griffe: % chance to go first
  | { kind: 'flinch'; chance: number }                       // Roche Royale: % chance to flinch enemy
  | { kind: 'rare_candy'; levels: number }                   // +N levels on pickup
  | { kind: 'exp_boost'; mult: number }                      // Lucky Egg: more EXP
  | { kind: 'hp_regen'; pct: number }                        // Restes: regen % HP per round
  | { kind: 'choice_scarf'; speedMult: number }              // +50% speed
  | { kind: 'coin_rune'; durationH: number };                // Pièce Rune: ×2 coins capture

export interface RunItem {
  id: string;
  name: string;
  icon: string;
  effect: ItemEffect;
  description: string;
}

export const HELD_ITEMS: RunItem[] = [
  // Offensifs par type
  { id:'belt_combat',   name:'Ceinture Noire',   icon:'black-belt', description:'+50% dégâts Combat',    effect:{ kind:'type_dmg', typeName:'Combat',   mult:1.5 } },
  { id:'mystic_water',  name:'Eau Mystique',      icon:'mystic-water', description:'+50% dégâts Eau',       effect:{ kind:'type_dmg', typeName:'Eau',      mult:1.5 } },
  { id:'miracle_seed',  name:'Graine Miracle',    icon:'miracle-seed', description:'+50% dégâts Plante',    effect:{ kind:'type_dmg', typeName:'Plante',   mult:1.5 } },
  { id:'silk_scarf',    name:'Mouchoir Soie',     icon:'silk-scarf', description:'+50% dégâts Normal',    effect:{ kind:'type_dmg', typeName:'Normal',   mult:1.5 } },
  { id:'charcoal',      name:'Charbon',           icon:'charcoal', description:'+50% dégâts Feu',       effect:{ kind:'type_dmg', typeName:'Feu',      mult:1.5 } },
  { id:'magnet',        name:'Aimant',            icon:'magnet', description:'+50% dégâts Électrik',  effect:{ kind:'type_dmg', typeName:'Électrik', mult:1.5 } },
  { id:'nevermeltice',  name:'Glace Éternelle',   icon:'never-melt-ice', description:'+50% dégâts Glace',     effect:{ kind:'type_dmg', typeName:'Glace',    mult:1.5 } },
  { id:'spell_tag',     name:'Tag Mystère',       icon:'spell-tag', description:'+50% dégâts Spectre',   effect:{ kind:'type_dmg', typeName:'Spectre',  mult:1.5 } },
  { id:'dragon_fang',   name:'Croc Dragon',       icon:'dragon-fang', description:'+50% dégâts Dragon',    effect:{ kind:'type_dmg', typeName:'Dragon',   mult:1.5 } },
  { id:'soft_sand',     name:'Sable Fin',         icon:'soft-sand', description:'+50% dégâts Sol',       effect:{ kind:'type_dmg', typeName:'Sol',      mult:1.5 } },
  { id:'sharp_beak',    name:'Bec Pointu',        icon:'sharp-beak', description:'+50% dégâts Vol',       effect:{ kind:'type_dmg', typeName:'Vol',      mult:1.5 } },
  { id:'poison_barb',   name:'Dard Vénin',        icon:'poison-barb', description:'+50% dégâts Poison',    effect:{ kind:'type_dmg', typeName:'Poison',   mult:1.5 } },
  { id:'hard_stone',    name:'Pierre Dure',       icon:'hard-stone', description:'+50% dégâts Roche',     effect:{ kind:'type_dmg', typeName:'Roche',    mult:1.5 } },
  { id:'silver_powder', name:'Poudre Argent',     icon:'silver-powder', description:'+50% dégâts Insecte',   effect:{ kind:'type_dmg', typeName:'Insecte',  mult:1.5 } },
  { id:'twisted_spoon', name:'Cuillère Tordue',   icon:'twisted-spoon', description:'+50% dégâts Psy',       effect:{ kind:'type_dmg', typeName:'Psy',      mult:1.5 } },
  { id:'black_belt',    name:'Métal Coat',        icon:'metal-coat', description:'+50% dégâts Acier',     effect:{ kind:'type_dmg', typeName:'Acier',    mult:1.5 } },
  { id:'black_glasses', name:'Lunettes Noires',   icon:'black-glasses', description:'+50% dégâts Ténèbres',  effect:{ kind:'type_dmg', typeName:'Ténèbres', mult:1.5 } },
  { id:'fairy_feather', name:'Plume Fée',         icon:'pixie-plate', description:'+50% dégâts Fée',       effect:{ kind:'type_dmg', typeName:'Fée',      mult:1.5 } },
  // Utilitaires
  { id:'quick_claw',    name:'Vive Griffe',       icon:'quick-claw', description:'50% de chance d\'agir en premier', effect:{ kind:'speed_boost', chance:0.5 } },
  { id:'kings_rock',    name:'Roche Royale',      icon:'kings-rock', description:'30% de chance de faire reculer l\'ennemi', effect:{ kind:'flinch', chance:0.3 } },
  { id:'choice_scarf',  name:'Mouchoir Choix',    icon:'choice-scarf', description:'+50% vitesse',           effect:{ kind:'choice_scarf', speedMult:1.5 } },
  { id:'rare_candy',    name:'Super Bonbon',      icon:'rare-candy', description:'+2 niveaux à la capture', effect:{ kind:'rare_candy', levels:2 } },
  { id:'lucky_egg',     name:'Œuf Chance',        icon:'lucky-egg', description:'+50% EXP gagné',         effect:{ kind:'exp_boost', mult:1.5 } },
  { id:'leftovers',     name:'Restes',            icon:'leftovers', description:'Régénère 10% PV par combat', effect:{ kind:'hp_regen', pct:0.1 } },
  { id:'coin_rune',     name:'Pièce Rune',        icon:'amulet-coin', description:'×2 Coins en capture pendant 1h (récupéré à la fin de la run)', effect:{ kind:'coin_rune', durationH:1 } },
];
