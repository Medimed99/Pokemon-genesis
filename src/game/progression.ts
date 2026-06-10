import { ALL_SPECIES, REGIONS, REGION_RANGES, type Region } from './kanto.ts';

export interface RegionProgress {
  region: Region;
  caught: number;
  total: number;
  shiny: number;
  pctCaught: number;
  complete: boolean;       // 100% caught
  shinyComplete: boolean;  // 100% shiny
  unlocked: boolean;
}

// Compute progress for every region given the pokedex (caught ids) and shiny ids.
export function computeProgress(pokedex: number[], shinyDex: number[]): RegionProgress[] {
  const caughtSet = new Set(pokedex);
  const shinySet = new Set(shinyDex);

  const result: RegionProgress[] = [];
  let prevComplete = true; // Kanto always unlocked

  for (const region of REGIONS) {
    const range = REGION_RANGES[region];
    const speciesInRegion = ALL_SPECIES.filter((s) => s.region === region);
    const caught = speciesInRegion.filter((s) => caughtSet.has(s.id)).length;
    const shiny = speciesInRegion.filter((s) => shinySet.has(s.id)).length;
    const total = range.count;
    const complete = caught >= total;
    const unlocked = prevComplete;

    result.push({
      region, caught, total, shiny,
      pctCaught: Math.floor((caught / total) * 100),
      complete,
      shinyComplete: shiny >= total,
      unlocked,
    });

    prevComplete = complete; // next region unlocks only if this one is 100%
  }

  return result;
}

// Which regions are currently unlocked (for spawning).
export function unlockedRegions(pokedex: number[]): Region[] {
  const progress = computeProgress(pokedex, []);
  return progress.filter((p) => p.unlocked).map((p) => p.region);
}

// The "active" region = the highest unlocked region not yet complete (where the player is working).
export function activeRegion(pokedex: number[]): Region {
  const progress = computeProgress(pokedex, []);
  for (const p of progress) {
    if (p.unlocked && !p.complete) return p.region;
  }
  return 'Hoenn';
}

// Species pool available for PokéBox / encounters (only unlocked regions, non-legendary).
export function availablePool(pokedex: number[]): typeof ALL_SPECIES {
  const regions = new Set(unlockedRegions(pokedex));
  return ALL_SPECIES.filter((s) => regions.has(s.region) && !s.legendary);
}
