import { create } from 'zustand';
import { economy, useGame } from './gameStore.ts';

import {
  generateMap, generateWildEncounter, generateTrainerTeam, generateBossTeam,
  generateCaptureEncounter, generateItemReward,
  makeTeamPokemon, autoBattle, tryEvolve, calcHp,
  type MapNode, type TeamPokemon, type AutoBattleResult,
} from './expedition.ts';
import type { RunItem } from './runItems.ts';
import type { Worker } from './gameStore.ts';

const BANDWIDTH_COST = 1;

type RunPhase =
  | 'gate'          // pre-run buddy selection
  | 'map'           // viewing the map / choosing next node
  | 'battle_result' // showing autobattle result
  | 'capture'       // choosing whether to capture a Pokémon
  | 'capture_anim'  // capture ball animation
  | 'item'          // showing item reward
  | 'heal'          // showing heal node
  | 'victory'       // run complete
  | 'defeat';       // run lost

interface ExpState {
  // Gate
  showGate: boolean;
  openGate: () => void;
  closeGate: () => void;

  // Run
  phase: RunPhase;
  team: TeamPokemon[];
  badges: number;
  mapNodes: MapNode[];
  currentNodeId: string | null;
  lastBattle: AutoBattleResult | null;
  captureTarget: TeamPokemon | null;
  captureSuccess: boolean | null;
  itemReward: RunItem | null;
  pendingEvolutions: string[]; // UIDs of evolved Pokémon

  // Actions
  startRun: (buddy: Worker) => void;
  chooseNode: (nodeId: string) => void;
  acknowledgeResult: () => void;
  attemptCapture: () => void;
  skipCapture: () => void;
  skipItem: () => void;
  closeRun: () => void;

  // Utils
  get active(): boolean;
}

function applyExpAndEvolve(team: TeamPokemon[], expGained: number, withLuckyEgg: boolean): { team: TeamPokemon[]; evolved: string[] } {
  const mult = withLuckyEgg ? 1.5 : 1;
  const evolved: string[] = [];
  const updated = team.map((p) => {
    if (p.fainted) return p;
    const exp = Math.floor((expGained / team.filter((t) => !t.fainted).length) * mult);
    const expToLevel = p.level * 20;
    if (exp < expToLevel) return p;
    const levelsGained = Math.floor(exp / expToLevel);
    let np = { ...p, level: Math.min(100, p.level + levelsGained) };
    np = { ...np, maxHp: calcHp(np.species.hp, np.level), currentHp: Math.min(np.currentHp + Math.floor(calcHp(np.species.hp, np.level) * 0.2), calcHp(np.species.hp, np.level)) };
    const evolvedP = tryEvolve(np);
    if (evolvedP.species.id !== np.species.id) { evolved.push(np.uid); }
    return evolvedP;
  });
  return { team: updated, evolved };
}

function markReachable(nodes: MapNode[], clearedId: string): MapNode[] {
  const cleared = nodes.find((n) => n.id === clearedId);
  if (!cleared) return nodes;
  const nextIds = new Set(cleared.connections);
  return nodes.map((n) => ({
    ...n,
    reachable: nextIds.has(n.id) ? true : n.reachable,
    cleared: n.id === clearedId ? true : n.cleared,
  }));
}

export const useExp = create<ExpState>((set, get) => ({
  showGate: false,
  phase: 'gate',
  team: [], badges: 0,
  mapNodes: [], currentNodeId: null,
  lastBattle: null, captureTarget: null, captureSuccess: null,
  itemReward: null, pendingEvolutions: [],

  get active() { return get().phase !== 'gate' && get().showGate === false && get().phase !== 'gate'; },

  openGate:  () => set({ showGate: true }),
  closeGate: () => set({ showGate: false }),

  startRun: (buddy) => {
    if (!economy.canAfford({ bandwidth: BANDWIDTH_COST })) return;
    economy.spend({ bandwidth: BANDWIDTH_COST });
    const startPokemon = makeTeamPokemon(buddy.species, Math.max(10, buddy.level * 8), buddy.species ? null : null);
    const map = generateMap(0);
    set({ showGate: false, phase: 'map', team: [startPokemon], badges: 0, mapNodes: map, currentNodeId: map[0].id, lastBattle: null, captureTarget: null, captureSuccess: null, itemReward: null, pendingEvolutions: [] });
  },

  chooseNode: (nodeId) => {
    const { mapNodes, team, badges } = get();
    const node = mapNodes.find((n) => n.id === nodeId);
    if (!node || !node.reachable || node.cleared) return;

    set({ currentNodeId: nodeId });

    if (node.type === 'battle_wild' || node.type === 'battle_trainer') {
      const enemies = node.type === 'battle_wild'
        ? [generateWildEncounter(badges)]
        : generateTrainerTeam(badges);
      const result = autoBattle(team, enemies);
      if (result.playerWon) {
        const hasLucky = team.some((p) => p.item?.effect.kind === 'exp_boost');
        const { team: updatedTeam, evolved } = applyExpAndEvolve(result.updatedTeam, result.expGained, hasLucky);
        const newNodes = markReachable(mapNodes, nodeId);
        set({ phase: 'battle_result', lastBattle: { ...result, updatedTeam }, team: updatedTeam, mapNodes: newNodes, pendingEvolutions: evolved });
      } else {
        set({ phase: 'defeat', lastBattle: result, team: result.updatedTeam });
        economy.grant({ plans: Math.floor(badges / 2) });
      }
    } else if (node.type === 'boss') {
      const enemies = generateBossTeam(badges);
      const result = autoBattle(team, enemies);
      if (result.playerWon) {
        economy.grant({ plans: 3, artifacts: 2 });
        // Pièce Rune : si un membre l'a équipée, on accorde le buff ×2 coins
        const hasRune = get().team.some((p) => p.item?.effect.kind === 'coin_rune');
        if (hasRune) {
          useGame.setState((s) => ({ activeEffects: [...s.activeEffects, { id: 'rune_coin', expiresAt: Date.now() + 3600_000 }] }));
        }
        useGame.getState().trackQuest('expedition', 1);
        useGame.getState().trackExpedition();
        const newNodes = markReachable(mapNodes, nodeId);
        set({ phase: 'victory', lastBattle: result, mapNodes: newNodes, badges: badges + 1 });
      } else {
        set({ phase: 'defeat', lastBattle: result });
        economy.grant({ plans: 1 });
      }
    } else if (node.type === 'capture') {
      const target = generateCaptureEncounter(badges);
      const newNodes = markReachable(mapNodes, nodeId);
      set({ phase: 'capture', captureTarget: target, captureSuccess: null, mapNodes: newNodes });
    } else if (node.type === 'item') {
      const item = generateItemReward();
      const newNodes = markReachable(mapNodes, nodeId);
      set({ phase: 'item', itemReward: item, mapNodes: newNodes });
    } else if (node.type === 'heal') {
      const healed = team.map((p) => ({ ...p, currentHp: p.maxHp, fainted: false }));
      const newNodes = markReachable(mapNodes, nodeId);
      set({ phase: 'heal', team: healed, mapNodes: newNodes });
    }
  },

  acknowledgeResult: () => {
    const { mapNodes, badges, currentNodeId } = get();
    // Check if boss was cleared → new map
    const currentNode = mapNodes.find((n) => n.id === currentNodeId);
    if (currentNode?.type === 'boss') {
      const newMap = generateMap(badges);
      set({ phase: 'map', mapNodes: newMap, currentNodeId: newMap[0].id, lastBattle: null, pendingEvolutions: [] });
    } else {
      set({ phase: 'map', lastBattle: null, pendingEvolutions: [] });
    }
  },

  attemptCapture: () => {
    const { captureTarget, team } = get();
    if (!captureTarget) return;
    // Catch rate: base 60% for common, scales with rarity via BST
    const baseChance = Math.max(0.25, 0.75 - captureTarget.species.bst / 1500);
    const success = Math.random() < baseChance;
    set({ phase: 'capture_anim', captureSuccess: success });
    setTimeout(() => {
      if (success && team.length < 6) {
        const newMember = { ...captureTarget };
        // Apply rare candy if buddy has it
        const newTeam = [...team, newMember];
        set({ team: newTeam, phase: 'map', captureTarget: null });
      } else {
        set({ phase: 'map', captureTarget: null, captureSuccess: null });
      }
    }, 1800);
  },

  skipCapture: () => set({ phase: 'map', captureTarget: null, captureSuccess: null }),

  skipItem: () => set({ phase: 'map', itemReward: null }),

  closeRun: () => set({
    showGate: false, phase: 'gate', team: [], badges: 0,
    mapNodes: [], currentNodeId: null, lastBattle: null,
    captureTarget: null, captureSuccess: null, itemReward: null, pendingEvolutions: [],
  }),
}));

// Assign item to a team member
export function assignItem(uid: string, item: RunItem): void {
  useExp.setState((s) => ({
    team: s.team.map((p) => p.uid === uid ? { ...p, item } : p),
    itemReward: null, phase: 'map',
  }));
}

// Reorder team
export function reorderTeam(fromIdx: number, toIdx: number): void {
  useExp.setState((s) => {
    const t = [...s.team];
    const [moved] = t.splice(fromIdx, 1);
    t.splice(toIdx, 0, moved);
    return { team: t };
  });
}

// Expose for legacy compat
export type { TeamPokemon };
