import { KANTO, ALL_SPECIES, type Species } from './kanto.ts';
import { bestEffMult } from './typeChart.ts';
import { HELD_ITEMS, type RunItem } from './runItems.ts';

const BOSS_IDS = [144, 145, 146, 150]; // légendaires comme boss

// ─── Team Pokémon ────────────────────────────────────────────────────────────

export interface TeamPokemon {
  uid: string;
  species: Species;
  level: number;
  currentHp: number;
  maxHp: number;
  item: RunItem | null;
  fainted: boolean;
}

// Evolution data (hand-coded for Kanta Gen1)
const EVOLUTIONS: Record<number, { into: number; level: number }> = {
  1:{into:2,level:16}, 2:{into:3,level:32},
  4:{into:5,level:16}, 5:{into:6,level:36},
  7:{into:8,level:16}, 8:{into:9,level:36},
  10:{into:11,level:7}, 11:{into:12,level:10},
  13:{into:14,level:7}, 14:{into:15,level:10},
  16:{into:17,level:18}, 17:{into:18,level:36},
  19:{into:20,level:20},
  21:{into:22,level:20},
  23:{into:24,level:22},
  25:{into:26,level:16},
  27:{into:28,level:22},
  29:{into:30,level:16}, 30:{into:31,level:36},
  32:{into:33,level:16}, 33:{into:34,level:36},
  35:{into:36,level:36},
  37:{into:38,level:29},
  39:{into:40,level:36},
  41:{into:42,level:22},
  43:{into:44,level:21}, 44:{into:45,level:36},
  46:{into:47,level:24},
  48:{into:49,level:31},
  50:{into:51,level:26},
  52:{into:53,level:28},
  54:{into:55,level:33},
  56:{into:57,level:28},
  58:{into:59,level:28},
  60:{into:61,level:25}, 61:{into:62,level:36},
  63:{into:64,level:16}, 64:{into:65,level:36},
  66:{into:67,level:28}, 67:{into:68,level:40},
  69:{into:70,level:21}, 70:{into:71,level:34},
  72:{into:73,level:30},
  74:{into:75,level:25}, 75:{into:76,level:36},
  77:{into:78,level:40},
  79:{into:80,level:37},
  81:{into:82,level:30},
  84:{into:85,level:28},
  86:{into:87,level:34},
  88:{into:89,level:38},
  90:{into:91,level:37},
  92:{into:93,level:25}, 93:{into:94,level:36},
  95:{into:96,level:26},  // Onix not Drowzee — fix: 96 is Drowzee
  96:{into:97,level:26},
  98:{into:99,level:28},
  100:{into:101,level:30},
  102:{into:103,level:36},
  104:{into:105,level:28},
  108:{into:113,level:0}, // special
  109:{into:110,level:35},
  111:{into:112,level:42},
  114:{into:0,level:0},  // no evo
  116:{into:117,level:32},
  118:{into:119,level:33},
  120:{into:121,level:0}, // water stone
  122:{into:0,level:0},
  123:{into:0,level:0},
  124:{into:0,level:0},
  126:{into:0,level:0},
  127:{into:0,level:0},
  128:{into:0,level:0},
  129:{into:130,level:20},
  133:{into:134,level:0}, // eevee stones — skip
  137:{into:0,level:0},
  138:{into:139,level:40},
  140:{into:141,level:40},
  142:{into:0,level:0},
  143:{into:0,level:0},
};

export function tryEvolve(p: TeamPokemon): TeamPokemon {
  const evo = EVOLUTIONS[p.species.id];
  if (!evo || evo.into === 0 || p.level < evo.level) return p;
  const nextSpecies = ALL_SPECIES.find((s) => s.id === evo.into);
  if (!nextSpecies) return p;
  const newMax = calcHp(nextSpecies.hp, p.level);
  const hpRatio = p.currentHp / p.maxHp;
  return { ...p, species: nextSpecies, maxHp: newMax, currentHp: Math.max(1, Math.floor(newMax * hpRatio)) };
}

// ─── Stat formulas (Gen 3 simplified) ───────────────────────────────────────

export function calcHp(base: number, lv: number): number {
  return Math.floor(2 * base * lv / 100) + lv + 10;
}
export function calcStat(base: number, lv: number): number {
  return Math.floor(2 * base * lv / 100) + 5;
}

export function makeTeamPokemon(species: Species, level: number, item: RunItem | null = null): TeamPokemon {
  const maxHp = calcHp(species.hp, level);
  return { uid: `${species.id}-${Date.now()}-${Math.random()}`, species, level, currentHp: maxHp, maxHp, item, fainted: false };
}

// ─── Autobattle ──────────────────────────────────────────────────────────────

export interface BattleLog { text: string; color?: 'green' | 'red' | 'yellow' | 'gray'; }

export interface AutoBattleResult {
  playerWon: boolean;
  log: BattleLog[];
  updatedTeam: TeamPokemon[];
  expGained: number;
}

function effectiveSpeed(p: TeamPokemon): number {
  let spd = calcStat(p.species.spe, p.level);
  if (p.item?.effect.kind === 'choice_scarf') spd = Math.floor(spd * p.item.effect.speedMult);
  if (p.item?.effect.kind === 'speed_boost' && Math.random() < p.item.effect.chance) spd = 999;
  return spd;
}

function attackDamage(attacker: TeamPokemon, defender: TeamPokemon): { dmg: number; eff: number } {
  const offBase = attacker.species.atk >= attacker.species.spatk ? attacker.species.atk : attacker.species.spatk;
  const defBase = attacker.species.atk >= attacker.species.spatk ? defender.species.def : defender.species.spdef;
  let offStat = calcStat(offBase, attacker.level);
  let defStat = calcStat(defBase, defender.level);
  const eff = bestEffMult(attacker.species.types, defender.species.types);

  // Held item type bonus
  if (attacker.item?.effect.kind === 'type_dmg') {
    if (attacker.species.types.includes(attacker.item.effect.typeName)) {
      offStat = Math.floor(offStat * attacker.item.effect.mult);
    }
  }

  const rand = 0.85 + Math.random() * 0.15;
  const dmg = Math.max(1, Math.floor((Math.floor(2 * attacker.level / 5 + 2) * 50 * offStat / defStat / 50 + 2) * eff * rand));
  return { dmg, eff };
}

export function autoBattle(playerTeam: TeamPokemon[], enemyTeam: TeamPokemon[]): AutoBattleResult {
  const log: BattleLog[] = [];
  const pTeam = playerTeam.map((p) => ({ ...p }));
  const eTeam = enemyTeam.map((e) => ({ ...e }));

  let pIdx = 0, eIdx = 0;

  const nextP = () => { while (pIdx < pTeam.length && pTeam[pIdx].fainted) pIdx++; };
  const nextE = () => { while (eIdx < eTeam.length && eTeam[eIdx].fainted) eIdx++; };

  nextP(); nextE();
  let rounds = 0;

  while (pIdx < pTeam.length && eIdx < eTeam.length && rounds < 40) {
    rounds++;
    const p = pTeam[pIdx];
    const e = eTeam[eIdx];

    log.push({ text: `⚔ ${p.species.name} (Nv${p.level}) vs ${e.species.name} (Nv${e.level})`, color: 'gray' });

    const pFirst = effectiveSpeed(p) >= effectiveSpeed(e);
    const order: [TeamPokemon, TeamPokemon, boolean][] = pFirst
      ? [[p, e, true], [e, p, false]]
      : [[e, p, false], [p, e, true]];

    for (const [att, def, isPlayer] of order) {
      if (att.fainted || def.fainted) continue;

      // Flinch check (defender's item)
      if (!isPlayer && att.item?.effect.kind === 'flinch' && Math.random() < att.item.effect.chance) {
        log.push({ text: `${def.species.name} recule !`, color: 'yellow' });
        continue;
      }

      const { dmg, eff } = attackDamage(att, def);
      def.currentHp = Math.max(0, def.currentHp - dmg);

      const effStr = eff >= 2 ? ' Super efficace !' : eff === 0 ? ' Immunité.' : eff < 1 ? ' Peu efficace…' : '';
      log.push({
        text: `${att.species.name} → ${dmg} dégâts sur ${def.species.name}.${effStr}`,
        color: isPlayer ? 'green' : 'red',
      });

      if (def.currentHp === 0) {
        def.fainted = true;
        log.push({ text: `${def.species.name} est K.O. !`, color: isPlayer ? 'green' : 'red' });
        if (isPlayer) { nextE(); } else { nextP(); }
        break;
      }
    }

    // HP regen from Leftovers/hp_regen
    for (const pk of [p, e]) {
      if (!pk.fainted && pk.item?.effect.kind === 'hp_regen') {
        const regen = Math.floor(pk.maxHp * pk.item.effect.pct);
        pk.currentHp = Math.min(pk.maxHp, pk.currentHp + regen);
      }
    }
  }

  const playerWon = pIdx < pTeam.length;
  const expGained = eTeam.reduce((acc, e) => acc + Math.floor(e.species.bst * e.level / 20), 0);
  log.push({ text: playerWon ? '✓ Victoire !' : '✗ Défaite.', color: playerWon ? 'green' : 'red' });

  return { playerWon, log, updatedTeam: pTeam, expGained };
}

// ─── Map generation ──────────────────────────────────────────────────────────

export type NodeType = 'battle_wild' | 'battle_trainer' | 'capture' | 'item' | 'heal' | 'boss' | 'start';

export interface MapNode {
  id: string;
  row: number;       // 0 = start (bottom), higher = closer to boss
  col: number;       // 0 or 1 (two columns in the diamond layout)
  type: NodeType;
  cleared: boolean;
  reachable: boolean;
  connections: string[]; // ids of next nodes this connects to
  previewId: number;     // Pokémon id to preview on the node (wild/trainer/boss/capture)
}

const NODE_TYPE_WEIGHTS: NodeType[] = [
  'battle_wild','battle_wild','battle_wild',
  'battle_trainer','battle_trainer',
  'capture','capture',
  'item',
  'heal',
];

function randomNodeType(): NodeType {
  return NODE_TYPE_WEIGHTS[Math.floor(Math.random() * NODE_TYPE_WEIGHTS.length)];
}

function randPreview(): number {
  const nonLeg = KANTO.filter((s) => !s.legendary);
  return nonLeg[Math.floor(Math.random() * nonLeg.length)].id;
}

export function generateMap(badgeCount: number): MapNode[] {
  // Structure: rows of 2 nodes connected in a diamond pattern, 4 rows deep + boss
  const ROWS = 4;
  const nodes: MapNode[] = [];
  let idCounter = 0;
  const makeId = () => `n${idCounter++}`;

  // Start node
  const startNode: MapNode = { id: makeId(), row: 0, col: 0, type: 'start', cleared: true, reachable: false, connections: [], previewId: 0 };
  nodes.push(startNode);

  // Generate row pairs
  const rowNodes: MapNode[][] = [[startNode]];
  for (let r = 1; r <= ROWS; r++) {
    const left:  MapNode = { id: makeId(), row: r, col: 0, type: r === ROWS ? 'battle_trainer' : randomNodeType(), cleared: false, reachable: false, connections: [], previewId: randPreview() };
    const right: MapNode = { id: makeId(), row: r, col: 1, type: r === ROWS ? 'capture' : randomNodeType(), cleared: false, reachable: false, connections: [], previewId: randPreview() };
    nodes.push(left, right);
    rowNodes.push([left, right]);
  }

  // Boss node
  const bossNode: MapNode = { id: makeId(), row: ROWS + 1, col: 0, type: 'boss', cleared: false, reachable: false, connections: [], previewId: BOSS_IDS[Math.min(badgeCount, BOSS_IDS.length - 1)] };
  nodes.push(bossNode);
  rowNodes.push([bossNode]);

  // Connect: each node connects to both nodes of the next row (diamond)
  for (let r = 0; r < rowNodes.length - 1; r++) {
    const curr = rowNodes[r];
    const next = rowNodes[r + 1];
    for (const c of curr) {
      c.connections = next.map((n) => n.id);
    }
  }

  // Ensure at least one heal per 2 rows
  for (let r = 1; r <= ROWS; r += 2) {
    if (!rowNodes[r].some((n) => n.type === 'heal')) {
      rowNodes[r][Math.floor(Math.random() * 2)].type = 'heal';
    }
  }

  // Make row-1 nodes reachable from start
  for (const n of rowNodes[1]) n.reachable = true;

  // Difficulty scaling per badge
  void badgeCount; // used for future difficulty scaling

  return nodes;
}

// ─── Enemy generation ────────────────────────────────────────────────────────


export function generateWildEncounter(badgeCount: number): TeamPokemon {
  const level = 5 + badgeCount * 6 + Math.floor(Math.random() * 5);
  const nonLeg = KANTO.filter((s) => !s.legendary);
  const species = nonLeg[Math.floor(Math.random() * nonLeg.length)];
  return makeTeamPokemon(species, level);
}

export function generateTrainerTeam(badgeCount: number): TeamPokemon[] {
  const count = Math.min(3, 1 + Math.floor(badgeCount / 2));
  const level = 8 + badgeCount * 6 + Math.floor(Math.random() * 4);
  const used = new Set<number>();
  const team: TeamPokemon[] = [];
  for (let i = 0; i < count; i++) {
    let species: Species;
    do { species = KANTO[Math.floor(Math.random() * KANTO.length)]; }
    while (used.has(species.id) || species.legendary);
    used.add(species.id);
    team.push(makeTeamPokemon(species, level));
  }
  return team;
}

export function generateBossTeam(badgeCount: number): TeamPokemon[] {
  const bossId = BOSS_IDS[Math.min(badgeCount, BOSS_IDS.length - 1)];
  const bossSpecies = KANTO.find((s) => s.id === bossId) ?? KANTO[149];
  const level = 30 + badgeCount * 8;
  const support = generateTrainerTeam(badgeCount);
  return [...support, makeTeamPokemon(bossSpecies, level)];
}

export function generateCaptureEncounter(badgeCount: number): TeamPokemon {
  return generateWildEncounter(badgeCount);
}

export function generateItemReward(): RunItem {
  return HELD_ITEMS[Math.floor(Math.random() * HELD_ITEMS.length)];
}
