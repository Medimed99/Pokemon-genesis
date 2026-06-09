// Équilibrage tunable — AUCUN nombre magique ne doit vivre ailleurs que dans des fichiers
// de config comme celui-ci (promesse : tuner sans recompiler la logique).

export interface BalanceConfig {
  bandwidth: {
    cap: number;            // réserve maximale de Bande passante
    regenPerSecond: number; // vitesse de régénération
  };
  veilleCoefficient: number; // coeff de production hors-ligne (0.5 → 1.0 via upgrades)
}

export const DEFAULT_CONFIG: BalanceConfig = {
  bandwidth: { cap: 5, regenPerSecond: 1 / (60 * 12) }, // ~1 unité toutes les 12 min
  veilleCoefficient: 0.5,
};
