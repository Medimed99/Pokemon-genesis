import type { Species } from './kanto.ts';

export interface Move {
  id: string;
  name: string;
  type: string;
  power: number;
  accuracy: number;
  category: 'physical' | 'special';
}

export const MOVES: Move[] = [
  // Normal
  { id:'tackle',       name:'Charge Rapide', type:'Normal',   power:40,  accuracy:100, category:'physical' },
  { id:'slash',        name:'Tranche',       type:'Normal',   power:70,  accuracy:100, category:'physical' },
  { id:'body-slam',    name:'Plaquage',      type:'Normal',   power:85,  accuracy:100, category:'physical' },
  // Feu
  { id:'ember',        name:'Flammèche',     type:'Feu',      power:40,  accuracy:100, category:'special'  },
  { id:'flamethrower', name:'Lance-Flamme',  type:'Feu',      power:90,  accuracy:100, category:'special'  },
  { id:'fire-blast',   name:'Déflagration',  type:'Feu',      power:110, accuracy:85,  category:'special'  },
  // Eau
  { id:'water-gun',    name:'Pistolet à O',  type:'Eau',      power:40,  accuracy:100, category:'special'  },
  { id:'surf',         name:'Surf',          type:'Eau',      power:90,  accuracy:100, category:'special'  },
  { id:'hydro-pump',   name:'Hydrocanon',    type:'Eau',      power:110, accuracy:80,  category:'special'  },
  // Plante
  { id:'vine-whip',    name:'Fouet Lianes',  type:'Plante',   power:45,  accuracy:100, category:'physical' },
  { id:'razor-leaf',   name:'Tranche-Herbe', type:'Plante',   power:55,  accuracy:95,  category:'physical' },
  { id:'solar-beam',   name:'Lance-Soleil',  type:'Plante',   power:120, accuracy:100, category:'special'  },
  // Électrik
  { id:'thunder-shock',name:'Éclair',        type:'Électrik', power:40,  accuracy:100, category:'special'  },
  { id:'thunderbolt',  name:'Tonnerre',      type:'Électrik', power:90,  accuracy:100, category:'special'  },
  { id:'thunder',      name:'Fatal-Foudre',  type:'Électrik', power:110, accuracy:70,  category:'special'  },
  // Psy
  { id:'confusion',    name:'Choc Mental',   type:'Psy',      power:50,  accuracy:100, category:'special'  },
  { id:'psychic-m',    name:'Psyko',         type:'Psy',      power:90,  accuracy:100, category:'special'  },
  // Glace
  { id:'ice-shard',    name:'Dard-Glace',    type:'Glace',    power:40,  accuracy:100, category:'physical' },
  { id:'ice-beam',     name:'Blizzard',      type:'Glace',    power:90,  accuracy:100, category:'special'  },
  { id:'blizzard',     name:'Tempête-Givre', type:'Glace',    power:110, accuracy:70,  category:'special'  },
  // Combat
  { id:'low-kick',     name:'Basse-Pogne',   type:'Combat',   power:60,  accuracy:100, category:'physical' },
  { id:'close-combat', name:'Close Combat',  type:'Combat',   power:120, accuracy:100, category:'physical' },
  // Poison
  { id:'poison-sting', name:'Dard-Venin',    type:'Poison',   power:15,  accuracy:100, category:'physical' },
  { id:'sludge-bomb',  name:'Bomb-Beurk',    type:'Poison',   power:90,  accuracy:100, category:'special'  },
  // Sol
  { id:'mud-shot',     name:'Boue-Bombe',    type:'Sol',      power:55,  accuracy:95,  category:'special'  },
  { id:'earthquake',   name:'Séisme',        type:'Sol',      power:100, accuracy:100, category:'physical' },
  // Roche
  { id:'rock-throw',   name:'Jet-Pierres',   type:'Roche',    power:50,  accuracy:90,  category:'physical' },
  { id:'rock-slide',   name:'Éboulement',    type:'Roche',    power:75,  accuracy:90,  category:'physical' },
  // Insecte
  { id:'bug-bite',     name:'Piqûre',        type:'Insecte',  power:60,  accuracy:100, category:'physical' },
  { id:'signal-beam',  name:'Signal-Bombe',  type:'Insecte',  power:75,  accuracy:100, category:'special'  },
  // Spectre
  { id:'lick',         name:'Léchouille',    type:'Spectre',  power:30,  accuracy:100, category:'physical' },
  { id:'shadow-ball',  name:'Boule-Ombre',   type:'Spectre',  power:80,  accuracy:100, category:'special'  },
  // Dragon
  { id:'dragon-rage',  name:'Draco-Rage',    type:'Dragon',   power:40,  accuracy:100, category:'special'  },
  { id:'dragon-pulse', name:'Dracochoc',     type:'Dragon',   power:85,  accuracy:100, category:'special'  },
  // Ténèbres
  { id:'bite',         name:'Morsure',       type:'Ténèbres', power:60,  accuracy:100, category:'physical' },
  { id:'crunch',       name:'Frénésie',      type:'Ténèbres', power:80,  accuracy:100, category:'physical' },
  // Acier
  { id:'steel-wing',   name:'Aile-Acier',    type:'Acier',    power:70,  accuracy:90,  category:'physical' },
  { id:'iron-head',    name:'Bélier-Métal',  type:'Acier',    power:80,  accuracy:100, category:'physical' },
  // Vol
  { id:'gust',         name:'Rafale',        type:'Vol',      power:40,  accuracy:100, category:'special'  },
  { id:'wing-attack',  name:"Coup-d'Aile",   type:'Vol',      power:60,  accuracy:100, category:'physical' },
  { id:'air-slash',    name:'Tranche-Air',   type:'Vol',      power:75,  accuracy:95,  category:'special'  },
  // Fée
  { id:'fairy-wind',   name:'Vent-Féérique', type:'Fée',      power:40,  accuracy:100, category:'special'  },
  { id:'moonblast',    name:'Éclat-Lunaire', type:'Fée',      power:95,  accuracy:100, category:'special'  },
];

const BY_TYPE: Record<string, Move[]> = {};
for (const m of MOVES) { (BY_TYPE[m.type] ??= []).push(m); }
const TACKLE = MOVES.find((m) => m.id === 'tackle')!;

export function movesFor(species: Species): Move[] {
  const seen = new Set<string>();
  const result: Move[] = [TACKLE];
  seen.add('tackle');
  // Picks strongest first (highest power) by type
  for (const type of species.types) {
    const pool = (BY_TYPE[type] ?? []).slice().sort((a, b) => b.power - a.power);
    for (const m of pool) {
      if (!seen.has(m.id) && result.length < 4) { result.push(m); seen.add(m.id); }
    }
  }
  return result;
}
