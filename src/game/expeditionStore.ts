import { create } from 'zustand';
import type { Worker } from './gameStore.ts';
import { economy } from './gameStore.ts';
import {
  createRunPokemon, applyTurn, generateEnemyTeam, generateDraft,
  type BattleState, type DraftOption, type RunArtefact, type RunPokemon,
} from './expedition.ts';

const BANDWIDTH_COST = 1;
const MAX_LOG = 6;

interface ExpState {
  active: boolean;
  showGate: boolean;
  buddy: Worker | null;
  secteur: number;
  badges: number;
  team: RunPokemon[];
  activeIdx: number;
  artefacts: RunArtefact[];
  battle: BattleState | null;
  draft: DraftOption[] | null;
  result: 'ongoing' | 'victory' | 'defeat' | null;

  openGate: () => void;
  closeGate: () => void;
  startRun: (buddy: Worker) => void;
  playerAttack: (moveIdx: number) => void;
  chooseDraft: (idx: number) => void;
  retreatRun: () => void;
  closeRun: () => void;
}

function triggerBattle(secteur: number, team: RunPokemon[], activeIdx: number): BattleState {
  const enemyTeam = generateEnemyTeam(secteur);
  const label = secteur === 8 ? '⚠ Le Lieutenant de la Team Null apparaît !' : `Secteur ${secteur + 1}/8 — Combat !`;
  return { playerTeam: team.map((p) => ({ ...p })), enemyTeam, playerActive: activeIdx, enemyActive: 0, log: [label], outcome: 'ongoing' };
}

export const useExp = create<ExpState>((set, get) => ({
  active: false, showGate: false, buddy: null, secteur: 0, badges: 0,
  team: [], activeIdx: 0, artefacts: [], battle: null, draft: null, result: null,

  openGate: () => set({ showGate: true }),
  closeGate: () => set({ showGate: false }),
  startRun: (buddy) => {
    if (!economy.canAfford({ bandwidth: BANDWIDTH_COST })) return;
    economy.spend({ bandwidth: BANDWIDTH_COST });
    const startPokemon = createRunPokemon(buddy.species, Math.max(10, buddy.level * 8));
    const team = [startPokemon];
    const battle = triggerBattle(0, team, 0);
    set({ active: true, buddy, secteur: 0, badges: 0, team, activeIdx: 0, artefacts: [], battle, draft: null, result: 'ongoing' });
  },

  playerAttack: (moveIdx) => {
    const { battle, artefacts, secteur, badges } = get();
    if (!battle || battle.outcome !== 'ongoing') return;

    const next = applyTurn(battle, moveIdx, artefacts);
    const team = next.playerTeam;
    const newLog = next.log.slice(-MAX_LOG);

    if (next.outcome === 'lose') {
      set({ battle: { ...next, log: newLog }, result: 'defeat', team });
      // Minimal reward : 1 Plan per 2 badges.
      economy.grant({ plans: Math.floor(badges / 2) });
      return;
    }

    if (next.outcome === 'win') {
      const newBadges = badges + 1;
      if (secteur === 8) {
        // Victory
        economy.grant({ plans: 3, artifacts: 2 });
        set({ battle: { ...next, log: [...newLog, '✦ Secteur Kanto libéré !'] }, result: 'victory', badges: newBadges, team });
        return;
      }
      // Prepare draft or go straight to boss
      const nextSecteur = secteur + 1;
      const teamIds = new Set(team.map((p) => p.species.id));
      const draft = generateDraft(teamIds, nextSecteur);
      set({ battle: { ...next, log: newLog }, badges: newBadges, secteur: nextSecteur, draft, team });
      return;
    }

    // Ongoing
    const alive = next.playerTeam.findIndex((p) => !p.fainted);
    set({ battle: { ...next, log: newLog }, activeIdx: alive === -1 ? 0 : alive, team });
  },

  chooseDraft: (idx) => {
    const { draft, team, artefacts, secteur } = get();
    if (!draft) return;
    const option = draft[idx];
    let newTeam = [...team];
    let newArtefacts = [...artefacts];

    if (option.type === 'pokemon' && team.length < 6) {
      newTeam = [...team, option.pokemon];
    } else if (option.type === 'artefact') {
      if (option.artefact.effect === 'heal') {
        newTeam = team.map((p) => p.fainted ? p : ({ ...p, currentHp: Math.min(p.maxHp, Math.floor(p.maxHp * (1 + option.artefact.value))) }));
      } else {
        newArtefacts = [...artefacts, option.artefact];
      }
    }

    const activeIdx = newTeam.findIndex((p) => !p.fainted);
    const battle = triggerBattle(secteur, newTeam, activeIdx === -1 ? 0 : activeIdx);
    set({ draft: null, team: newTeam, artefacts: newArtefacts, battle, activeIdx: activeIdx === -1 ? 0 : activeIdx });
  },

  retreatRun: () => {
    set({ result: 'defeat', battle: null, draft: null });
    economy.grant({ plans: Math.floor(get().badges / 3) });
  },

  closeRun: () => {
    set({ active: false, showGate: false, buddy: null, secteur: 0, badges: 0, team: [], activeIdx: 0, artefacts: [], battle: null, draft: null, result: null });
  },
}));
