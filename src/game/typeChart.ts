const CHART: Record<string, Record<string, number>> = {
  Normal:   { Roche:0.5, Acier:0.5, Spectre:0 },
  Feu:      { Feu:0.5, Eau:0.5, Roche:0.5, Dragon:0.5, Plante:2, Insecte:2, Glace:2, Acier:2 },
  Eau:      { Feu:2, Eau:0.5, Plante:0.5, Dragon:0.5, Roche:2, Sol:2 },
  Plante:   { Feu:0.5, Eau:2, Plante:0.5, Poison:0.5, Sol:2, Vol:0.5, Insecte:0.5, Dragon:0.5, Acier:0.5, Roche:2 },
  Électrik: { Eau:2, Électrik:0.5, Vol:2, Sol:0, Dragon:0.5, Acier:0.5, Plante:0.5 },
  Glace:    { Feu:0.5, Eau:0.5, Plante:2, Glace:0.5, Sol:2, Vol:2, Dragon:2, Acier:0.5 },
  Combat:   { Normal:2, Glace:2, Roche:2, Acier:2, Ténèbres:2, Poison:0.5, Insecte:0.5, Vol:0.5, Psy:0.5, Fée:0.5, Spectre:0 },
  Poison:   { Plante:2, Fée:2, Poison:0.5, Sol:0.5, Roche:0.5, Spectre:0.5, Acier:0 },
  Sol:      { Feu:2, Électrik:2, Poison:2, Roche:2, Acier:2, Plante:0.5, Insecte:0.5, Vol:0 },
  Roche:    { Feu:2, Glace:2, Vol:2, Insecte:2, Combat:0.5, Sol:0.5, Acier:0.5 },
  Insecte:  { Plante:2, Psy:2, Ténèbres:2, Feu:0.5, Combat:0.5, Vol:0.5, Spectre:0.5, Acier:0.5, Fée:0.5 },
  Spectre:  { Psy:2, Spectre:2, Normal:0, Ténèbres:0.5 },
  Dragon:   { Dragon:2, Acier:0.5, Fée:0 },
  Ténèbres: { Psy:2, Spectre:2, Combat:0.5, Ténèbres:0.5, Fée:0.5 },
  Acier:    { Glace:2, Roche:2, Fée:2, Feu:0.5, Eau:0.5, Électrik:0.5, Acier:0.5 },
  Psy:      { Combat:2, Poison:2, Psy:0.5, Acier:0.5, Ténèbres:0 },
  Vol:      { Combat:2, Insecte:2, Plante:2, Électrik:0.5, Roche:0.5, Acier:0.5 },
  Fée:      { Combat:2, Dragon:2, Ténèbres:2, Feu:0.5, Poison:0.5, Acier:0.5 },
};

export function getEff(atkType: string, ...defTypes: string[]): number {
  return defTypes.reduce((acc, def) => acc * (CHART[atkType]?.[def] ?? 1), 1);
}

export function bestEffMult(attackerTypes: string[], defenderTypes: string[]): number {
  return Math.max(...attackerTypes.map((a) => getEff(a, ...defenderTypes)));
}
