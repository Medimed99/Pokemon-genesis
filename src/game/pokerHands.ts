import type { PokerCard } from './pokerStore.ts';

export type HandRank =
  | 'signal'       // High Card
  | 'duo'          // Pair
  | 'double'       // Two Pair
  | 'trio'         // Three of a Kind
  | 'sequence'     // Straight
  | 'monotype'     // Flush
  | 'full'         // Full House
  | 'quad'         // Four of a Kind
  | 'combo'        // Straight Flush
  | 'quinte_shiny'; // Royal Flush

export interface HandLevelStats { chips: number; mult: number; }

// Base stats at level 1. Each level adds +15 chips, +1 mult.
export const HAND_BASE: Record<HandRank, HandLevelStats & { label: string }> = {
  signal:       { chips: 5,   mult: 1, label: 'Signal Isolé'      },
  duo:          { chips: 10,  mult: 2, label: 'Duo de Données'    },
  double:       { chips: 20,  mult: 2, label: 'Double Frappe'     },
  trio:         { chips: 30,  mult: 3, label: "Trio d'Évolution"  },
  sequence:     { chips: 30,  mult: 4, label: "Séquence d'Archive"},
  monotype:     { chips: 35,  mult: 4, label: 'Monotype'          },
  full:         { chips: 40,  mult: 4, label: 'Full Génération'   },
  quad:         { chips: 60,  mult: 7, label: 'Quad Légendaire'   },
  combo:        { chips: 100, mult: 8, label: 'Combo Parfait'     },
  quinte_shiny: { chips: 100, mult: 8, label: 'Quinte Shiny'      },
};

export interface EvaluatedHand {
  rank: HandRank;
  label: string;
  baseChips: number;
  baseMult: number;
  scoredIndices: number[]; // indices into the played cards array that "activate"
}

export function effectiveStats(base: HandLevelStats, level: number): HandLevelStats {
  return { chips: base.chips + (level - 1) * 15, mult: base.mult + (level - 1) };
}

export function evaluateHand(cards: PokerCard[], handLevels: Record<HandRank, number>): EvaluatedHand {
  const n = cards.length;
  if (n === 0) return makeResult('signal', [], cards, handLevels);

  const ranks = cards.map((c) => c.deck.rank);
  const suits = cards.map((c) => c.deck.suit);

  // Count occurrences of each rank
  const rankCounts: Record<number, number[]> = {};
  ranks.forEach((r, i) => { (rankCounts[r] ??= []).push(i); });
  const groups = Object.values(rankCounts).sort((a, b) => b.length - a.length);

  const isFlush = n === 5 && suits.every((s) => s === suits[0]);
  const sortedRanks = [...ranks].sort((a, b) => a - b);
  const isStraight = n === 5 && sortedRanks.every((r, i) => i === 0 || r === sortedRanks[i - 1] + 1);
  // Ace-high straight: ranks [1,10,11,12,13]
  const isRoyalStraight = n === 5 && sortedRanks.join() === '1,10,11,12,13';

  const all = cards.map((_, i) => i);

  if (n === 5) {
    if ((isStraight || isRoyalStraight) && isFlush) {
      const rank = isRoyalStraight ? 'quinte_shiny' : 'combo';
      return makeResult(rank, all, cards, handLevels);
    }
    if (isFlush)   return makeResult('monotype', all, cards, handLevels);
    if (isStraight || isRoyalStraight) return makeResult('sequence', all, cards, handLevels);
  }

  if (groups[0].length === 4) return makeResult('quad',   groups[0], cards, handLevels);
  if (groups[0].length === 3 && groups[1]?.length === 2) return makeResult('full', all, cards, handLevels);
  if (groups[0].length === 3) return makeResult('trio',   groups[0], cards, handLevels);
  if (groups[0].length === 2 && groups[1]?.length === 2) return makeResult('double', [...groups[0], ...groups[1]], cards, handLevels);
  if (groups[0].length === 2) return makeResult('duo',    groups[0], cards, handLevels);

  // High card: only the highest rank scores
  const highIdx = ranks.indexOf(Math.max(...ranks));
  return makeResult('signal', [highIdx], cards, handLevels);
}

function makeResult(
  rank: HandRank, scoredIndices: number[],
  _cards: PokerCard[], handLevels: Record<HandRank, number>,
): EvaluatedHand {
  const base = HAND_BASE[rank];
  const level = handLevels[rank] ?? 1;
  const stats = effectiveStats(base, level);
  return { rank, label: base.label, baseChips: stats.chips, baseMult: stats.mult, scoredIndices };
}
