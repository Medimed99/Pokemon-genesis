// Acte I — script narratif (termes canon : Zéro-Glitch, Omni-Archive, Porygon-Z).
// Voix diégétique « terminal/data », reprise de l'esprit de la bible de l'ancien repo.

export type Phase = 'intro' | 'tap' | 'worker' | 'free';

export interface Line {
  text: string;
  glitch?: boolean;
}

// Séquence d'introduction (cliquer pour avancer).
export const INTRO: Line[] = [
  { text: 'SÉQUENCE_DÉMARRAGE…', glitch: true },
  { text: 'CHARGEMENT OMNI-ARCHIVE… ÉCHEC CRITIQUE.', glitch: true },
  { text: 'ZÉRO-GLITCH DÉTECTÉ. WORLD_RENDERER introuvable.', glitch: true },
  { text: 'recherche d’un administrateur… signal trouvé.' },
  { text: 'Toi… tu m’entends ? Ma fréquence est instable.', glitch: true },
  { text: 'Je suis Porygon-Z. Enfin, ce qu’il en reste.' },
  { text: 'Le Zéro-Glitch a tout verrouillé. Plus de formes, plus de couleurs.' },
  { text: 'Mais tu as une Pokéball. C’est notre seul espoir. Donne-moi du jus !' },
];

// Indices affichés selon la phase de jeu.
export const HINTS: Record<Exclude<Phase, 'intro'>, Line> = {
  tap: { text: 'Appuie sur le Noyau. Chaque impulsion réveille l’Archive.' },
  worker: { text: 'De l’EO ! Ouvre une Blind Box et capture ton premier ouvrier pour la Forêt de Jade.' },
  free: { text: 'Les couleurs reviennent. Continue à remplir le Pokédex, Archiviste — Kanto se défragmente.' },
};
