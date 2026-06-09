import type { Species } from './kanto.ts';
import { KANTO } from './kanto.ts';
import { movesFor, type Move } from './moves.ts';
import { getEff } from './typeChart.ts';

// ─── Run Pokémon ───────────────────────────────────────────────────────────────

export interface RunPokemon {
  species: Species;
  level: number;
  moves: Move[];
  maxHp: number;
  currentHp: number;
  fainted: boolean;
}

function effHp(base: number, lv: number): number {
  return Math.floor(2 * base * lv / 100) + lv + 10;
}
function effStat(base: number, lv: number): number {
  return Math.floor(2 * base * lv / 100) + 5;
}

export function createRunPokemon(species: Species, level: number): RunPokemon {
  const maxHp = effHp(species.hp, level);
  return { species, level, moves: movesFor(species), maxHp, currentHp: maxHp, fainted: false };
}

// ─── Artefacts ─────────────────────────────────────────────────────────────────

export interface RunArtefact {
  id: string;
  name: string;
  effect: 'dmg_bonus' | 'def_bonus' | 'heal';
  value: number; // 0.2 = 20 %
}

export const ARTEFACT_POOL: RunArtefact[] = [
  { id:'crystal',  name:'Cristal de Données',       effect:'dmg_bonus', value:0.2  },
  { id:'shield',   name:'Bouclier Octet',            effect:'def_bonus', value:0.2  },
  { id:'regen',    name:'Module de Régénération',    effect:'heal',      value:0.35 },
  { id:'turbo',    name:'Processeur Turbo',          effect:'dmg_bonus', value:0.3  },
  { id:'anchor',   name:'Ancre de Stabilisation',   effect:'def_bonus', value:0.3  },
];

// ─── Battle ────────────────────────────────────────────────────────────────────

export interface BattleState {
  playerTeam: RunPokemon[];
  enemyTeam: RunPokemon[];
  playerActive: number;
  enemyActive: number;
  log: string[];
  outcome: 'ongoing' | 'win' | 'lose';
}

function computeDamage(
  atk: RunPokemon, move: Move, def: RunPokemon,
  artefacts: RunArtefact[], isPlayer: boolean,
): number {
  const offBase = move.category === 'physical' ? atk.species.atk : atk.species.spatk;
  const defBase = move.category === 'physical' ? def.species.def  : def.species.spdef;
  const offStat = effStat(offBase, atk.level);
  const defStat = effStat(defBase, def.level);
  const eff = getEff(move.type, ...def.species.types);
  if (eff === 0) return 0;
  const acc = Math.random() * 100 <= move.accuracy;
  if (!acc) return -1; // miss
  const rand = 0.85 + Math.random() * 0.15;
  let dmg = Math.floor((Math.floor(2 * atk.level / 5 + 2) * move.power * offStat / defStat / 50 + 2) * eff * rand);
  if (isPlayer) {
    const bonus = artefacts.filter((a) => a.effect === 'dmg_bonus').reduce((s, a) => s + a.value, 0);
    dmg = Math.floor(dmg * (1 + bonus));
  } else {
    const red = artefacts.filter((a) => a.effect === 'def_bonus').reduce((s, a) => s + a.value, 0);
    dmg = Math.floor(dmg * (1 - red));
  }
  return Math.max(1, dmg);
}

function aiMove(enemy: RunPokemon): number {
  // Simple AI : picks a random move (could be improved in future).
  const idx = Math.floor(Math.random() * enemy.moves.length);
  return idx;
}

export function applyTurn(
  state: BattleState, playerMoveIdx: number, artefacts: RunArtefact[],
): BattleState {
  const log = [...state.log];
  const pTeam = state.playerTeam.map((p) => ({ ...p }));
  const eTeam = state.enemyTeam.map((e) => ({ ...e }));
  let pAct = state.playerActive;
  let eAct = state.enemyActive;

  const player = pTeam[pAct];
  const enemy = eTeam[eAct];
  const playerMove = player.moves[playerMoveIdx] ?? player.moves[0];
  const enemyMoveIdx = aiMove(enemy);
  const enemyMove = enemy.moves[enemyMoveIdx];

  // Speed order
  const pFirst = effStat(player.species.spe, player.level) >= effStat(enemy.species.spe, enemy.level);

  const doAttack = (attacker: RunPokemon, defender: RunPokemon, move: Move, isPlayer: boolean) => {
    const dmg = computeDamage(attacker, move, defender, artefacts, isPlayer);
    if (dmg === -1) { log.push(`${attacker.species.name} rate sa ${move.name} !`); return false; }
    defender.currentHp = Math.max(0, defender.currentHp - dmg);
    const eff = getEff(move.type, ...defender.species.types);
    const effStr = eff >= 2 ? " C'est super efficace !" : eff === 0 ? " Ça n'affecte pas…" : eff < 1 ? ' Pas très efficace…' : '';
    log.push(`${attacker.species.name} utilise ${move.name} → ${dmg} dégâts.${effStr}`);
    if (defender.currentHp === 0) { defender.fainted = true; log.push(`${defender.species.name} est K.O. !`); return true; }
    return false;
  };

  let outcome: BattleState['outcome'] = 'ongoing';

  const firstPair:  [RunPokemon, RunPokemon, Move, boolean] = pFirst ? [player, enemy, playerMove, true]  : [enemy, player, enemyMove, false];
  const secondPair: [RunPokemon, RunPokemon, Move, boolean] = pFirst ? [enemy, player, enemyMove, false] : [player, enemy, playerMove, true];

  for (const [att, def, mv, isP] of [firstPair, secondPair]) {
    if (att.fainted) continue;
    doAttack(att, def, mv, isP);
    if (def.fainted) {
      if (!isP) {
        // enemy fainted
        const nextEnemy = eTeam.findIndex((e, i) => i > eAct && !e.fainted);
        if (nextEnemy === -1) { outcome = 'win'; break; }
        eAct = nextEnemy; log.push(`${eTeam[eAct].species.name} entre en combat !`);
      } else {
        // player fainted
        const nextPlayer = pTeam.findIndex((p, i) => i > pAct && !p.fainted);
        if (nextPlayer === -1) { outcome = 'lose'; break; }
        pAct = nextPlayer; log.push(`${pTeam[pAct].species.name} entre en combat !`);
      }
    }
  }

  return { playerTeam: pTeam, enemyTeam: eTeam, playerActive: pAct, enemyActive: eAct, log: log.slice(-6), outcome };
}

// ─── Enemy generation ──────────────────────────────────────────────────────────

const BOSS_SPECIES = KANTO.find((s) => s.id === 150) ?? KANTO[KANTO.length - 1]; // Mewtwo

function randomKanto(exclude: Set<number>): Species {
  const pool = KANTO.filter((s) => !s.legendary && !exclude.has(s.id));
  return pool[Math.floor(Math.random() * pool.length)];
}

export function generateEnemyTeam(secteur: number): RunPokemon[] {
  if (secteur === 8) {
    // Boss : Lieutenant Team Null avec Mewtwo + 2 renforts
    const level = 55;
    const support1 = randomKanto(new Set([150]));
    const support2 = randomKanto(new Set([150, support1.id]));
    return [createRunPokemon(support1, level), createRunPokemon(support2, level), createRunPokemon(BOSS_SPECIES, level)];
  }
  const level = 15 + secteur * 5;
  const count = secteur < 3 ? 1 : secteur < 6 ? 2 : 3;
  const used = new Set<number>();
  const team: RunPokemon[] = [];
  for (let i = 0; i < count; i++) { const s = randomKanto(used); used.add(s.id); team.push(createRunPokemon(s, level)); }
  return team;
}

// ─── Draft ─────────────────────────────────────────────────────────────────────

export type DraftOption =
  | { type: 'pokemon'; pokemon: RunPokemon }
  | { type: 'artefact'; artefact: RunArtefact };

export function generateDraft(teamIds: Set<number>, secteur: number): DraftOption[] {
  const level = 15 + secteur * 5;
  const used = new Set([...teamIds]);
  const a = randomKanto(used); used.add(a.id);
  const b = randomKanto(used);
  const artefactIdx = Math.floor(Math.random() * ARTEFACT_POOL.length);
  return [
    { type: 'pokemon', pokemon: createRunPokemon(a, level) },
    { type: 'pokemon', pokemon: createRunPokemon(b, level) },
    { type: 'artefact', artefact: ARTEFACT_POOL[artefactIdx] },
  ];
}
