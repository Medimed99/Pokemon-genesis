import type { CatalogueCard } from './pokerCatalogue.ts';
import type { HandRank } from './pokerHands.ts';

export interface ScoringCtx {
  handRank: HandRank;
  scoredTypes: string[];      // types of scored cards
  allPlayedTypes: string[];   // types of all played cards
  handsPlayed: number;
  cardsPlayed: number;
  shiniesPlayed: number;
  discardedCount: number;
  legendaryCount: number;     // legendary Pokémon in scored cards
}

function checkCond(cond: string, ctx: ScoringCtx): boolean {
  const c = cond.toLowerCase();
  if (c.includes('≥3 types') || c.includes('3 types')) return ctx.allPlayedTypes.length >= 3;
  if (c.includes('monotype')) return ctx.allPlayedTypes.length === 1;
  if (c === 'shiny') return ctx.shiniesPlayed > 0;
  if (c === 'no_discard') return ctx.discardedCount === 0;
  if (c === 'five_played') return ctx.cardsPlayed >= 5;
  if (c.startsWith('type:')) {
    const types = c.slice(5).split('+');
    return types.every((t) => ctx.allPlayedTypes.some((pt) => pt.toLowerCase() === t.toLowerCase()));
  }
  // "Feu joué", "Eau jouée" etc.
  const types18 = ['feu','eau','plante','électrik','glace','combat','poison','sol','roche',
                    'insecte','spectre','dragon','ténèbres','acier','psy','vol','fée','normal'];
  for (const t of types18) {
    if (c.includes(t) && (c.includes('joué') || c.includes('jouée'))) {
      return ctx.allPlayedTypes.some((pt) => pt.toLowerCase() === t);
    }
  }
  return false;
}

export interface ScoreResult { chips: number; mult: number; log: string[]; }

export function applyJokers(
  chips: number, mult: number,
  jokers: CatalogueCard[], ctx: ScoringCtx,
): ScoreResult {
  let c = chips, m = mult;
  const xMults: { value: number; label: string }[] = [];
  const log: string[] = [];

  for (const joker of jokers) {
    const ef = joker.effect;
    const label = joker.icon + ' ' + joker.name_fr;

    switch (ef.kind) {
      case 'flat_chips':
        c += ef.chips as number;
        log.push(`${label} +${ef.chips as number} Chips`);
        break;
      case 'flat_mult':
        m += ef.mult as number;
        log.push(`${label} +${ef.mult as number} Mult`);
        break;
      case 'flat_both':
        c += ef.chips as number; m += ef.mult as number;
        log.push(`${label} +${ef.chips as number} Chips +${ef.mult as number} Mult`);
        break;
      case 'x_mult': {
        const cond = ef.cond as string;
        if (!cond || checkCond(cond, ctx)) {
          xMults.push({ value: ef.value as number, label });
          log.push(`${label} ×${ef.value as number} Mult`);
        }
        break;
      }
      case 'x_chips': {
        c = Math.floor(c * (ef.value as number));
        log.push(`${label} ×${ef.value as number} Chips`);
        break;
      }
      case 'per_type': {
        const count = ctx.allPlayedTypes.filter(
          (t) => t.toLowerCase() === (ef.poketype as string).toLowerCase()
        ).length;
        if (count > 0) { m += (ef.per_mult as number) * count; log.push(`${label} +${(ef.per_mult as number) * count} Mult`); }
        break;
      }
      case 'per_shiny': {
        const n = Math.min(ctx.shiniesPlayed, (ef.max as number | undefined) ?? 99);
        if (n > 0) { m += (ef.per_mult as number) * n; log.push(`${label} +${(ef.per_mult as number) * n} Mult`); }
        break;
      }
      case 'per_hand':
        m += (ef.per_mult as number) * ctx.handsPlayed;
        log.push(`${label} +${(ef.per_mult as number) * ctx.handsPlayed} Mult`);
        break;
      case 'per_card':
        m += (ef.per_mult as number) * ctx.cardsPlayed;
        log.push(`${label} +${(ef.per_mult as number) * ctx.cardsPlayed} Mult`);
        break;
      case 'per_rare':
        if (ctx.legendaryCount > 0) { m += (ef.per_mult as number) * ctx.legendaryCount; log.push(`${label} +${(ef.per_mult as number) * ctx.legendaryCount} Mult`); }
        break;
      case 'type_cond': {
        const passes = checkCond(ef.cond as string, ctx);
        if (passes) { m += ef.value as number; log.push(`${label} +${ef.value as number} Mult ✓`); }
        break;
      }
      case 'planet': {
        // Planet cards boost a specific hand — applied to hand level in game state, not here
        break;
      }
      case 'extra_hand':
      case 'extra_discard':
        // Applied at round start, not at scoring
        break;
      case 'fallback':
        m += ef.mult as number;
        log.push(`${label} +${ef.mult as number} Mult`);
        break;
    }
  }

  // Apply x_mult after all additive
  for (const xm of xMults) {
    m = Math.floor(m * xm.value);
  }

  return { chips: c, mult: m, log };
}
