// Avatars du joueur — Pokémon partenaires emblématiques (source unique).
export interface AvatarDef { id: string; pokeId: number; label: string; color: string; }

export const AVATARS: AvatarDef[] = [
  { id: 'pika',  pokeId: 25,  label: 'Pikachu',    color: '#d9a441' },
  { id: 'bulba', pokeId: 1,   label: 'Bulbizarre', color: '#5cb85c' },
  { id: 'char',  pokeId: 4,   label: 'Salamèche',  color: '#e8473f' },
  { id: 'squir', pokeId: 7,   label: 'Carapuce',   color: '#4fa8d0' },
  { id: 'eevee', pokeId: 133, label: 'Évoli',      color: '#c0a060' },
  { id: 'gengar',pokeId: 94,  label: 'Ectoplasma', color: '#9060d0' },
  { id: 'dragon',pokeId: 149, label: 'Dracolosse', color: '#f0a020' },
  { id: 'mewtwo',pokeId: 150, label: 'Mewtwo',     color: '#b060d8' },
];

// Rétrocompat : anciens ids (dev, hacker…) → Pikachu par défaut.
export function avatarPokeId(avatarId: string): number {
  return AVATARS.find((a) => a.id === avatarId)?.pokeId ?? 25;
}
