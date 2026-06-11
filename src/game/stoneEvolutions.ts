// Évolutions par pierre en Kanta (Gen 1) — mappées sur les ids PokeAPI
export const STONE_EVOLUTIONS: Record<string, { from: number; to: number }[]> = {
  fire_stone: [
    { from: 37, to: 38 },   // Goupix → Feunard
    { from: 58, to: 59 },   // Caninos → Arcanin
    { from: 133, to: 136 }, // Évoli → Pyroli
  ],
  water_stone: [
    { from: 86, to: 87 },   // Otaria → Lamantine
    { from: 120, to: 121 }, // Stari → Staross
    { from: 133, to: 134 }, // Évoli → Aquali
  ],
  thunder_stone: [
    { from: 25, to: 26 },   // Pikachu → Raichu
    { from: 133, to: 135 }, // Évoli → Voltali
  ],
  moon_stone: [
    { from: 35, to: 36 },   // Mélofée → Mélodelfe
    { from: 39, to: 40 },   // Rondoudou → Grodoudou
    { from: 33, to: 34 },   // Nidoran♂ → Nidorino → via pierre (Nidoking=34 depuis Nidorino)
    { from: 30, to: 31 },   // Nidoran♀ → Nidorina → Nidoqueen
  ],
  leaf_stone: [
    { from: 70, to: 71 },   // Chétiflor → Empiflor
    { from: 44, to: 45 },   // Noeunoeuf → Rafflésia
    { from: 102, to: 103 }, // Noeuf → Noadkoko
    { from: 133, to: 470 }, // Évoli → Phyllali (Gen 4, skip si absent)
  ],
};

// Retourne l'id du Pokémon évolué, ou null si impossible
export function getStoneEvolution(stoneId: string, speciesId: number): number | null {
  const evos = STONE_EVOLUTIONS[stoneId];
  if (!evos) return null;
  const match = evos.find((e) => e.from === speciesId);
  return match?.to ?? null;
}

// Liste les pierres qui peuvent s'appliquer à un Pokémon donné
export function applicableStones(speciesId: number): string[] {
  return Object.entries(STONE_EVOLUTIONS)
    .filter(([, evos]) => evos.some((e) => e.from === speciesId))
    .map(([stone]) => stone);
}
