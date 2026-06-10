import { create } from 'zustand';
import { economy, useGame } from './gameStore.ts';
import { BASE_DECK, type DeckCard } from './pokerDeck.ts';
import { CATALOGUE, type CatalogueCard } from './pokerCatalogue.ts';
import { evaluateHand, HAND_BASE, type HandRank, type EvaluatedHand } from './pokerHands.ts';
import { applyJokers, type ScoringCtx } from './pokerJokers.ts';
import { ALL_SPECIES as KANTO } from './kanto.ts';

const BANDWIDTH_COST = 1;
const HAND_SIZE = 7;
const MAX_HANDS = 4;
const MAX_DISCARDS = 3;
const MAX_JOKERS = 5;

export interface PokerCard {
  uid: number;      // unique instance id
  deck: DeckCard;
  selected: boolean;
  scored: boolean;  // highlight after play
}

type GamePhase = 'gate' | 'playing' | 'shop' | 'result';

interface ShopItem { card: CatalogueCard; price: number; }

interface PokerState {
  phase: GamePhase;
  ante: number;
  blindIndex: 0 | 1 | 2;
  score: number;
  target: number;
  handsLeft: number;
  discardsLeft: number;
  gold: number;
  deck: PokerCard[];
  hand: PokerCard[];
  jokers: CatalogueCard[];
  handLevels: Record<HandRank, number>;
  lastHand: EvaluatedHand | null;
  lastScore: number;
  scoreLog: string[];
  handsPlayedThisRound: number;
  cardsPlayedThisRound: number;
  discardedThisRound: number;
  shopItems: ShopItem[];

  // actions
  startGame: () => void;
  toggleSelect: (uid: number) => void;
  playHand: () => void;
  discard: () => void;
  buyShopItem: (idx: number) => void;
  nextBlind: () => void;
  closeGame: () => void;
}

let uidCounter = 0;

function buildDeck(): PokerCard[] {
  return BASE_DECK.map((d) => ({ uid: uidCounter++, deck: d, selected: false, scored: false }));
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function blindTarget(ante: number, blindIdx: number): number {
  const bases = [300, 450, 600];
  return Math.floor(bases[blindIdx] * Math.pow(2.5, ante - 1));
}

function goldReward(ante: number): number {
  return 4 + ante;
}

function generateShop(jokers: CatalogueCard[]): ShopItem[] {
  const jokerIds = new Set(jokers.map((j) => j.id));
  const available = CATALOGUE.filter((c) =>
    c.category === 'joker' && !jokerIds.has(c.id) && jokers.length < MAX_JOKERS
  );
  const planets = CATALOGUE.filter((c) => c.category === 'planet');
  const pool = [...shuffle(available).slice(0, 3), shuffle(planets)[0]].filter(Boolean);
  const rarityPrice: Record<string, number> = { common: 3, uncommon: 4, rare: 5, legendary: 7, planet: 4, arcana: 3, spectral: 5 };
  return pool.map((card) => ({ card, price: rarityPrice[card.rarity] ?? 4 }));
}

const initLevels = (): Record<HandRank, number> => {
  const out = {} as Record<HandRank, number>;
  (Object.keys(HAND_BASE) as HandRank[]).forEach((k) => { out[k] = 1; });
  return out;
};

export const usePoker = create<PokerState>((set, get) => ({
  phase: 'gate',
  ante: 1, blindIndex: 0, score: 0, target: 300,
  handsLeft: MAX_HANDS, discardsLeft: MAX_DISCARDS,
  gold: 4, deck: [], hand: [], jokers: [],
  handLevels: initLevels(),
  lastHand: null, lastScore: 0, scoreLog: [],
  handsPlayedThisRound: 0, cardsPlayedThisRound: 0, discardedThisRound: 0,
  shopItems: [],

  startGame: () => {
    if (!economy.canAfford({ bandwidth: BANDWIDTH_COST })) return;
    economy.spend({ bandwidth: BANDWIDTH_COST });
    const deck = shuffle(buildDeck());
    const hand = deck.slice(0, HAND_SIZE);
    const rest = deck.slice(HAND_SIZE);
    // Apply extra_hand / extra_discard jokers (none yet)
    set({ phase: 'playing', ante: 1, blindIndex: 0, score: 0, target: 300,
      handsLeft: MAX_HANDS, discardsLeft: MAX_DISCARDS, gold: 4,
      deck: rest, hand, jokers: [], handLevels: initLevels(),
      lastHand: null, lastScore: 0, scoreLog: [],
      handsPlayedThisRound: 0, cardsPlayedThisRound: 0, discardedThisRound: 0,
      shopItems: [],
    });
  },

  toggleSelect: (uid) => {
    const selected = get().hand.filter((c) => c.selected).length;
    set((s) => ({
      hand: s.hand.map((c) =>
        c.uid === uid
          ? (!c.selected && selected >= 5 ? c : { ...c, selected: !c.selected })
          : c
      ),
    }));
  },

  playHand: () => {
    const { hand, deck, jokers, handLevels, score, handsLeft,
            handsPlayedThisRound, cardsPlayedThisRound, discardedThisRound } = get();
    const played = hand.filter((c) => c.selected);
    if (played.length === 0 || handsLeft === 0) return;

    const evaluated = evaluateHand(played, handLevels);

    // Card chips from scored cards
    const scoredCards = evaluated.scoredIndices.map((i) => played[i]);
    const cardChips = scoredCards.reduce((acc, c) => acc + c.deck.chipValue, 0);
    let chips = evaluated.baseChips + cardChips;
    let mult = evaluated.baseMult;

    // Types for context
    const allPlayedTypes = [...new Set(played.flatMap((c) => {
      const sp = KANTO.find((s) => s.id === c.deck.speciesId);
      return sp ? sp.types : [c.deck.suit];
    }))];
    const scoredTypes = [...new Set(scoredCards.flatMap((c) => {
      const sp = KANTO.find((s) => s.id === c.deck.speciesId);
      return sp ? sp.types : [c.deck.suit];
    }))];
    const legendaryCount = scoredCards.filter((c) => KANTO.find((s) => s.id === c.deck.speciesId)?.legendary).length;

    const ctx: ScoringCtx = {
      handRank: evaluated.rank,
      scoredTypes, allPlayedTypes,
      handsPlayed: handsPlayedThisRound + 1,
      cardsPlayed: cardsPlayedThisRound + played.length,
      shiniesPlayed: 0,
      discardedCount: discardedThisRound,
      legendaryCount,
    };

    const jokerResult = applyJokers(chips, mult, jokers, ctx);
    chips = jokerResult.chips; mult = jokerResult.mult;
    const gained = chips * mult;
    const newScore = score + gained;

    // Refill hand
    const remaining = hand.filter((c) => !c.selected);
    const need = HAND_SIZE - remaining.length;
    const drawn = deck.slice(0, need);
    const newDeck = deck.slice(need);

    const newHandsLeft = handsLeft - 1;
    const newHand = [...remaining, ...drawn].map((c) => ({ ...c, selected: false, scored: false }));

    const target = get().target;
    const newLog = [`${evaluated.label}: ${chips} × ${mult} = ${gained.toLocaleString()}`, ...jokerResult.log];

    set({
      score: newScore, hand: newHand, deck: newDeck,
      lastHand: evaluated, lastScore: gained,
      scoreLog: newLog.slice(0, 6),
      handsLeft: newHandsLeft,
      handsPlayedThisRound: handsPlayedThisRound + 1,
      cardsPlayedThisRound: cardsPlayedThisRound + played.length,
    });

    // Check win
    if (newScore >= target) {
      const gold = get().gold + goldReward(get().ante);
      const shopItems = generateShop(get().jokers);
      economy.grant({ luxury_tokens: 4 + get().ante });
      if (get().ante >= 4) { useGame.getState().trackQuest('poker', 1); useGame.getState().trackPokerWin(); }
      set({ phase: 'shop', gold, shopItems });
      return;
    }
    // Check loss
    if (newHandsLeft === 0) {
      set({ phase: 'result' });
    }
  },

  discard: () => {
    const { hand, deck, discardsLeft } = get();
    const toDiscard = hand.filter((c) => c.selected);
    if (toDiscard.length === 0 || discardsLeft === 0) return;
    const remaining = hand.filter((c) => !c.selected);
    const drawn = deck.slice(0, toDiscard.length);
    const newDeck = deck.slice(toDiscard.length);
    set((s) => ({
      hand: [...remaining, ...drawn].map((c) => ({ ...c, selected: false })),
      deck: newDeck,
      discardsLeft: discardsLeft - 1,
      discardedThisRound: s.discardedThisRound + 1,
    }));
  },

  buyShopItem: (idx) => {
    const { shopItems, gold, jokers } = get();
    const item = shopItems[idx];
    if (!item || gold < item.price) return;
    if (item.card.category === 'planet') {
      // Upgrade the hand level
      const handName = (item.card.effect as { hand?: string }).hand ?? '';
      const rankMap: Record<string, HandRank> = {
        'Paire': 'duo', 'Brelan': 'trio', 'Suite': 'sequence',
        'Couleur': 'monotype', 'Full': 'full', 'Carré': 'quad',
        'Quinte Flush': 'combo', 'Quinte Flush Royale': 'quinte_shiny',
        'Double Paire': 'double', 'Carte Haute': 'signal',
      };
      const rank = rankMap[handName];
      if (rank) {
        set((s) => ({
          handLevels: { ...s.handLevels, [rank]: (s.handLevels[rank] ?? 1) + 1 },
          gold: s.gold - item.price,
          shopItems: s.shopItems.filter((_, i) => i !== idx),
        }));
        return;
      }
    }
    if (jokers.length < MAX_JOKERS) {
      set((s) => ({
        jokers: [...s.jokers, item.card],
        gold: s.gold - item.price,
        shopItems: s.shopItems.filter((_, i) => i !== idx),
      }));
    }
  },

  nextBlind: () => {
    const { ante, blindIndex } = get();
    let newAnte = ante, newBlindIdx = (blindIndex + 1) as 0 | 1 | 2;
    if (newBlindIdx > 2) { newBlindIdx = 0; newAnte = ante + 1; }
    if (newAnte > 4) { set({ phase: 'result' }); return; }
    const target = blindTarget(newAnte, newBlindIdx);
    const deck = shuffle(buildDeck());
    const hand = deck.slice(0, HAND_SIZE);
    const rest = deck.slice(HAND_SIZE);
    // Apply extra_hand / extra_discard from active jokers
    const extraHands = get().jokers.reduce((acc, j) => acc + (j.effect.kind === 'extra_hand' ? (j.effect.count as number) : 0), 0);
    const extraDiscards = get().jokers.reduce((acc, j) => acc + (j.effect.kind === 'extra_discard' ? (j.effect.count as number) : 0), 0);
    set({
      phase: 'playing', ante: newAnte, blindIndex: newBlindIdx, score: 0, target,
      handsLeft: MAX_HANDS + extraHands, discardsLeft: MAX_DISCARDS + extraDiscards,
      deck: rest, hand,
      lastHand: null, lastScore: 0, scoreLog: [],
      handsPlayedThisRound: 0, cardsPlayedThisRound: 0, discardedThisRound: 0,
    });
  },

  closeGame: () => set({ phase: 'gate', deck: [], hand: [], jokers: [], scoreLog: [] }),
}));
