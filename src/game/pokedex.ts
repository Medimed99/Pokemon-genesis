// Helper de sprites (PokeAPI) + ré-export du type Species depuis les données Kanto.
export type { Species } from './kanto.ts';

export function spriteUrl(id: number, shiny = false): string {
  const base = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';
  return shiny ? `${base}/shiny/${id}.png` : `${base}/${id}.png`;
}
